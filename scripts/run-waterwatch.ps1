param()

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $projectRoot
try {
    Set-ExecutionPolicy Bypass -Scope Process -Force | Out-Null
    npm run waterwatch:refresh
}
finally {
    Pop-Location
}
