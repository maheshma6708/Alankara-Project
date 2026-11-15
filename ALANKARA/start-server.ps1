<#
  ALANKARA LUXURY JEWELLERY WEB SERVER
  Lightweight pure PowerShell local web server (zero extra dependencies required)
#>

$port = 8080
$url = "http://localhost:$port/"
$root = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "👑 ALANKARA JEWELLERY STORE - LOCAL SERVER STARTING 👑" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "Storefront Website: $url" -ForegroundColor Green
Write-Host "Admin Vault Portal: ${url}admin.html" -ForegroundColor Green
Write-Host "Root Directory:     $root" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to terminate the server at any time." -ForegroundColor DarkGray
Write-Host "----------------------------------------------------------"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
  $listener.Start()
  Start-Process $url

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($path) -or $path -eq '/') {
      $path = 'index.html'
    }

    $filePath = Join-Path $root $path

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $mime = switch ($ext) {
        '.html' { 'text/html; charset=utf-8' }
        '.htm'  { 'text/html; charset=utf-8' }
        '.css'  { 'text/css; charset=utf-8' }
        '.js'   { 'application/javascript; charset=utf-8' }
        '.json' { 'application/json; charset=utf-8' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.svg'  { 'image/svg+xml' }
        '.ico'  { 'image/x-icon' }
        Default { 'application/octet-stream' }
      }

      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentType = $mime
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
      $response.OutputStream.Write($msg, 0, $msg.Length)
    }

    $response.OutputStream.Close()
    $response.Close()
  }
} catch {
  Write-Host "Server halted or port in use: $_" -ForegroundColor Red
} finally {
  $listener.Stop()
}
