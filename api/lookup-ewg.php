<?php
// Mission Pure - EWG chemical data proxy
// Fetches EWG Tap Water Database system page and extracts contaminant cards

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$pws = isset($_GET['pws']) ? strtoupper(preg_replace('/[^A-Z0-9]/', '', $_GET['pws'])) : '';

if ($pws === '') {
  http_response_code(400);
  echo json_encode([
    'ok' => false,
    'error' => 'missing_pws',
    'chemicals' => []
  ]);
  exit;
}

// Normalize common inputs:
// - "TX0570050" (already ok)
// - "0570050" -> "TX0570050"
// - "tx-pws-0570050" will have been stripped before reaching here (client should send code only)
if (!preg_match('/^TX\d{7}$/', $pws)) {
  if (preg_match('/^\d{7}$/', $pws)) {
    $pws = 'TX' . $pws;
  }
}

if (!preg_match('/^TX\d{7}$/', $pws)) {
  http_response_code(400);
  echo json_encode([
    'ok' => false,
    'error' => 'invalid_pws',
    'chemicals' => []
  ]);
  exit;
}

$cacheDir = __DIR__ . DIRECTORY_SEPARATOR . 'cache';
$cacheVersion = 'v1';
$cacheFile = $cacheDir . DIRECTORY_SEPARATOR . 'ewg_' . $pws . '_' . $cacheVersion . '.json';
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

function http_get_html($url) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
  curl_setopt($ch, CURLOPT_TIMEOUT, 15);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: text/html',
    'User-Agent: Mozilla/5.0'
  ]);

  $body = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($body === false || $code < 200 || $code >= 300) {
    return null;
  }

  return $body;
}

function normalize_whitespace($s) {
  $s = preg_replace('/\s+/u', ' ', $s);
  return trim($s);
}

function parse_ewg_chemicals($html) {
  // EWG cards contain text like:
  // "Chloroform Potential Effect: Cancer This Utility: 10.4 ppb No Legal Limit 26x EWG's Health Guideline: 0.4 ppb"
  // We'll scrape those blocks from the HTML text.

  $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
  $text = normalize_whitespace($text);

  $chemicals = [];
  $seen = [];

  $pattern = '/([A-Z][A-Za-z0-9 \-()\",\/]+?)\s+Potential Effect:\s*(.*?)\s*This Utility:\s*([0-9]*\.?[0-9]+)\s*([a-zA-Zµ]+)\s*(?:No Legal Limit|Legal Limit:\s*[^\n]+)?\s*([0-9]*\.?[0-9]+)x\s*EWG\x27s Health Guideline:\s*([0-9]*\.?[0-9]+)\s*([a-zA-Zµ]+)/u';

  if (preg_match_all($pattern, $text, $matches, PREG_SET_ORDER)) {
    foreach ($matches as $m) {
      $name = normalize_whitespace($m[1]);
      $concerns = normalize_whitespace($m[2]);
      $utilVal = floatval($m[3]);
      $unit = normalize_whitespace($m[4]);
      $mult = floatval($m[5]);
      $guideVal = floatval($m[6]);
      $guideUnit = normalize_whitespace($m[7]);

      if ($name === '' || $unit === '' || $guideUnit === '') continue;
      if (strcasecmp($unit, $guideUnit) !== 0) continue;

      $key = strtolower($name);
      if (isset($seen[$key])) continue;
      $seen[$key] = true;

      $chemicals[] = [
        'name' => $name,
        'concerns' => $concerns,
        'thisUtilityValue' => $utilVal,
        'guidelineValue' => $guideVal,
        'unit' => $unit,
        'multiplier' => $mult
      ];
    }
  }

  return $chemicals;
}

$url = 'https://www.ewg.org/tapwater/system.php?pws=' . urlencode($pws);
$html = http_get_html($url);

if ($html === null) {
  http_response_code(200);
  $out = json_encode([
    'ok' => true,
    'pws' => $pws,
    'chemicals' => []
  ]);
  @file_put_contents($cacheFile, $out);
  echo $out;
  exit;
}

$chemicals = parse_ewg_chemicals($html);

$out = json_encode([
  'ok' => true,
  'pws' => $pws,
  'chemicals' => $chemicals
]);

@file_put_contents($cacheFile, $out);

echo $out;
