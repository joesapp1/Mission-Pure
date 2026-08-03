param(
    [int]$Port = 4173,
    [string]$RootPath = (Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent)
)

if (-not [System.IO.Directory]::Exists($RootPath)) {
    throw "Root path '$RootPath' was not found."
}

$listenerPrefix = "http://127.0.0.1:{0}/" -f $Port
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($listenerPrefix)
$listener.Start()

Write-Output "Serving $RootPath on $listenerPrefix (Ctrl+C to stop)"

$mimeMap = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.css'  = 'text/css'
    '.js'   = 'application/javascript'
    '.json' = 'application/json'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.txt'  = 'text/plain; charset=utf-8'
}

function Get-ContentType {
    param($path)
    $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
    if ($mimeMap.ContainsKey($ext)) { return $mimeMap[$ext] }
    return 'application/octet-stream'
}

$rootFullPath = [System.IO.Path]::GetFullPath($RootPath)

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $relativePath = $request.Url.AbsolutePath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($relativePath)) {
                $relativePath = 'index.html'
            }
            $relativePath = $relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar
            $targetPath = [System.IO.Path]::GetFullPath((Join-Path $rootFullPath $relativePath))

            if (-not $targetPath.StartsWith($rootFullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
                $response.StatusCode = 403
                $response.Close()
                continue
            }

            if ([System.IO.Directory]::Exists($targetPath)) {
                $targetPath = Join-Path $targetPath 'index.html'
            }

            if (-not [System.IO.File]::Exists($targetPath)) {
                $response.StatusCode = 404
                $response.Close()
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($targetPath)
            $response.StatusCode = 200
            $response.ContentType = Get-ContentType $targetPath
            $response.ContentLength64 = $bytes.LongLength
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Flush()
            $response.Close()
        }
        catch {
            $response.StatusCode = 500
            $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($_.Exception.Message)
            $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
            $response.Close()
        }
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}
