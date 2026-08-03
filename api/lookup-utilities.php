<?php
// Mission Pure - Utility lookup proxy
// Uses public sources to map a ZIP code to Texas public water system service areas.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$zip = isset($_GET['zip']) ? preg_replace('/\D/', '', $_GET['zip']) : '';
$zip = substr($zip, 0, 5);
$debug = isset($_GET['debug']) && $_GET['debug'] === '1';

if (!preg_match('/^\d{5}$/', $zip)) {
  http_response_code(400);
  echo json_encode([
    'ok' => false,
    'error' => 'invalid_zip',
    'utilities' => []
  ]);
  exit;
}

function twdb_features_for_point($lat, $lon, $distancesMeters, &$debugInfo) {
  $twdbBase = 'https://services.twdb.texas.gov/arcgis/rest/services/PWS/Public_Water_Service_Areas/FeatureServer/0/query';
  $features = [];

  foreach ($distancesMeters as $distance) {
    $query = [
      'f' => 'json',
      'where' => '1=1',
      'geometry' => $lon . ',' . $lat,
      'geometryType' => 'esriGeometryPoint',
      'inSR' => '4326',
      'spatialRel' => 'esriSpatialRelIntersects',
      'outFields' => 'pwsName,PWSCode',
      'returnGeometry' => 'false',
      'resultRecordCount' => '10'
    ];

    if ($distance > 0) {
      $query['distance'] = strval($distance);
      $query['units'] = 'esriSRUnit_Meter';
    }

    $params = http_build_query($query);
    $twdb = http_get_json($twdbBase . '?' . $params);
    $features = ($twdb && isset($twdb['features']) && is_array($twdb['features'])) ? $twdb['features'] : [];

    if (is_array($debugInfo)) {
      $debugInfo[] = [
        'source' => 'twdb',
        'distance_m' => $distance,
        'features' => count($features)
      ];
    }

    if (count($features) > 0) break;
  }

  return $features;
}

// Lightweight file cache to avoid hammering public endpoints.
$cacheDir = __DIR__ . DIRECTORY_SEPARATOR . 'cache';
$cacheVersion = 'v5';
$cacheFile = $cacheDir . DIRECTORY_SEPARATOR . 'zip_' . $zip . '_' . $cacheVersion . '.json';
$ttlSeconds = 60 * 60 * 24 * 7; // 7 days

if (!is_dir($cacheDir)) {
  @mkdir($cacheDir, 0755, true);
}

if (is_file($cacheFile)) {
  $age = time() - filemtime($cacheFile);
  if ($age >= 0 && $age < $ttlSeconds) {
    $cached = @file_get_contents($cacheFile);
    if ($cached !== false) {
      echo $cached;
      exit;
    }
  }
}

// Deterministic overrides for DFW ZIPs that can be missed by boundary lookups.
// (This ensures critical metro ZIPs like Grapevine always populate a utility.)
$zipOverrides = [
  '76051' => [
    [
      'id' => 'tx-override-grapevine',
      'name' => 'City of Grapevine Water Utilities',
      'region' => 'TX'
    ]
  ],
  '76092' => [
    [
      'id' => 'tx-override-grapevine',
      'name' => 'City of Grapevine Water Utilities',
      'region' => 'TX'
    ]
  ]
];

if (isset($zipOverrides[$zip]) && is_array($zipOverrides[$zip]) && count($zipOverrides[$zip]) > 0) {
  $out = json_encode([
    'ok' => true,
    'zip' => $zip,
    'utilities' => $zipOverrides[$zip]
  ]);
  @file_put_contents($cacheFile, $out);
  echo $out;
  exit;
}

function http_get_json($url) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
  curl_setopt($ch, CURLOPT_TIMEOUT, 12);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
  ]);

  $body = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($body === false || $code < 200 || $code >= 300) {
    return null;
  }

  $json = json_decode($body, true);
  if (!is_array($json)) return null;
  return $json;
}

// 1) ZIP -> lat/lng and state
$geo = http_get_json('https://api.zippopotam.us/us/' . urlencode($zip));
if (!$geo || !isset($geo['places'][0])) {
  http_response_code(200);
  $out = json_encode([
    'ok' => true,
    'zip' => $zip,
    'utilities' => []
  ]);
  @file_put_contents($cacheFile, $out);
  echo $out;
  exit;
}

$place = $geo['places'][0];
$state = isset($place['state abbreviation']) ? $place['state abbreviation'] : '';
$lat = isset($place['latitude']) ? floatval($place['latitude']) : null;
$lon = isset($place['longitude']) ? floatval($place['longitude']) : null;

if ($state !== 'TX' || $lat === null || $lon === null) {
  http_response_code(200);
  $out = json_encode([
    'ok' => true,
    'zip' => $zip,
    'utilities' => []
  ]);
  @file_put_contents($cacheFile, $out);
  echo $out;
  exit;
}

// 2) lat/lng -> TWDB service area polygon(s)
// Some ZIP centroids can fall just outside service polygons. Retry with a larger buffer.
$debugInfo = $debug ? [] : null;
$distancesMeters = [0, 500, 2000, 10000, 25000, 50000, 100000];
$features = twdb_features_for_point($lat, $lon, $distancesMeters, $debugInfo);

// If still nothing, try an alternate ZIP geocoder (ArcGIS World Geocoding) and retry TWDB.
if (count($features) === 0) {
  $arcParams = http_build_query([
    'f' => 'json',
    'singleLine' => $zip . ' TX',
    'countryCode' => 'USA',
    'maxLocations' => '1'
  ]);
  $arc = http_get_json('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?' . $arcParams);
  $candidates = ($arc && isset($arc['candidates']) && is_array($arc['candidates'])) ? $arc['candidates'] : [];
  $best = count($candidates) > 0 ? $candidates[0] : null;
  $loc = ($best && isset($best['location']) && is_array($best['location'])) ? $best['location'] : null;
  $arcLon = ($loc && isset($loc['x'])) ? floatval($loc['x']) : null;
  $arcLat = ($loc && isset($loc['y'])) ? floatval($loc['y']) : null;

  if ($debug && is_array($debugInfo)) {
    $debugInfo[] = [
      'source' => 'arcgis_geocode',
      'ok' => ($arcLat !== null && $arcLon !== null)
    ];
  }

  if ($arcLat !== null && $arcLon !== null) {
    $features = twdb_features_for_point($arcLat, $arcLon, $distancesMeters, $debugInfo);
  }
}

$utilities = [];
$seen = [];
$firstAttrs = null;
foreach ($features as $f) {
  if (!isset($f['attributes'])) continue;
  $a = $f['attributes'];
  if ($debug && $firstAttrs === null && is_array($a)) {
    $firstAttrs = $a;
  }

  // TWDB field casing can vary depending on service/layer settings.
  $code = $a['PWSCode'] ?? $a['PWSCODE'] ?? $a['pwsCode'] ?? $a['pwscode'] ?? null;
  $name = $a['pwsName'] ?? $a['PWSName'] ?? $a['PWSNAME'] ?? $a['pwsname'] ?? null;
  if (!$code || !$name) continue;

  $id = 'tx-pws-' . strval($code);
  if (isset($seen[$id])) continue;
  $seen[$id] = true;

  $utilities[] = [
    'id' => $id,
    'name' => strval($name),
    'region' => 'TX'
  ];
}

$out = json_encode([
  'ok' => true,
  'zip' => $zip,
  'utilities' => $utilities,
  'debug' => $debug ? [
    'steps' => $debugInfo,
    'first_feature_attributes' => $firstAttrs
  ] : null
]);

@file_put_contents($cacheFile, $out);

echo $out;
