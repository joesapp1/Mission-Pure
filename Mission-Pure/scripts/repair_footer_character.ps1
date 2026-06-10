$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$files = Get-ChildItem -Path $root -Filter *.html -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $content = $content -replace '\u00a0', ' '
    $content = $content -replace 'â\u0098\u0085', '&#9733;'
    $content = $content -replace 'â˜…', '&#9733;'
    $content = $content -replace '★★★★★', '&#9733;&#9733;&#9733;&#9733;&#9733;'
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Output "Repaired $($file.Name)"
}
