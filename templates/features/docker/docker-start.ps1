param()
$ErrorActionPreference = 'Stop'
$port = 3000
if ($env:APP_PORT) {
  if ($env:APP_PORT -notmatch '^\d+$' -or ![int]::TryParse($env:APP_PORT, [ref]$port) -or $port -lt 1 -or $port -gt 65535) {
    throw 'APP_PORT must be a port number from 1 to 65535.'
  }
}
$lastPort = [Math]::Min($port + 999, 65535)
$previousPort = $env:APP_PORT
$previousUrl = $env:DOCKER_SITE_URL

function Invoke-ComposeCapture([string[]]$ComposeArgs) {
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $output = & docker compose --project-directory $PSScriptRoot @ComposeArgs 2>&1
    return @{ Code = $LASTEXITCODE; Output = ($output | Out-String).Trim() }
  } finally { $ErrorActionPreference = $previousPreference }
}

function Show-AppUrl {
  $binding = Invoke-ComposeCapture -ComposeArgs @('port', 'app', '3000')
  if ($binding.Code -ne 0 -or $binding.Output -notmatch '^127\.0\.0\.1:(\d+)$') {
    throw "Cannot determine the app port: $($binding.Output)"
  }
  Write-Host "Open http://localhost:$($Matches[1])"
  Write-Host 'Logs: docker compose logs -f app | Stop: docker compose stop app'
}

try {
  $running = Invoke-ComposeCapture -ComposeArgs @('ps', '--status', 'running', '--quiet', 'app')
  if ($running.Code -ne 0) { throw $running.Output }
  if ($running.Output) { Show-AppUrl; return }

  & docker compose --project-directory $PSScriptRoot build app
  if ($LASTEXITCODE -ne 0) { throw 'Docker build failed. Fix the reported error and retry.' }

  for (; $port -le $lastPort; $port++) {
    $env:APP_PORT = [string]$port
    $env:DOCKER_SITE_URL = "http://localhost:$port"
    $attempt = Invoke-ComposeCapture -ComposeArgs @('up', '--no-build', '-d', 'app')
    if ($attempt.Code -eq 0) { Show-AppUrl; return }
    if ($attempt.Output -notmatch '(?i)port is already allocated|address already in use|only one usage of each socket address|socket in a way forbidden by its access permissions') {
      throw $attempt.Output
    }
    Write-Host "Port $port unavailable; trying the next port."
  }
  throw "No available Docker port in the requested range (ending at $lastPort)."
} finally {
  $env:APP_PORT = $previousPort
  $env:DOCKER_SITE_URL = $previousUrl
}
