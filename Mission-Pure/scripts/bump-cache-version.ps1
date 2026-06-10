param(
  [string]$Version = (Get-Date -Format "yyyyMMdd-HHmm")
)

$files = @("index.html", "contact.html", "service-areas.html", "whole-home-water-filtration.html", "app.js")

function Update-VersionedUrl {
  param([string]$Value)
  return ($Value -replace '(\.(?:json|jpeg|css|js|jpg|png|svg))(?:\?v=[^"''`)\s]+)?', "`$1?v=$Version")
}

foreach ($file in $files) {
  $original = Get-Content -Raw -Path $file
  $next = $original

  if ($file -like "*.html") {
    $next = [regex]::Replace($next, '\b(href|src)=("|'')([^"'']+)(\2)', {
      param($match)
      $attr = $match.Groups[1].Value
      $quote = $match.Groups[2].Value
      $url = $match.Groups[3].Value

      if ($url -match '^(?:https?:|mailto:|tel:|#)') {
        return $match.Value
      }

      return "$attr=$quote$(Update-VersionedUrl $url)$quote"
    })
  }

  if ($file -eq "app.js") {
    $next = $next -replace 'const APP_BUILD = "[^"]+";', "const APP_BUILD = `"$Version`";"
    $next = [regex]::Replace($next, '(const (?:DATASET_URL|DFW_ZIP_MAP_URL|CHEM_INFO_URL) = ")([^"]+)(";)', {
      param($match)
      return $match.Groups[1].Value + (Update-VersionedUrl $match.Groups[2].Value) + $match.Groups[3].Value
    })
  }

  if ($next -ne $original) {
    Set-Content -Path $file -Value $next -NoNewline
    Write-Host "Updated $file"
  } else {
    Write-Host "No changes needed in $file"
  }
}

Write-Host "Cache-bust version: $Version"
