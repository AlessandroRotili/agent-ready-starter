param([Parameter(ValueFromRemainingArguments=$true)][string[]]$TaskArgs)
$ErrorActionPreference = 'Stop'
if (!$TaskArgs) { $TaskArgs = @('dev') }
$dockerStart = Join-Path $PSScriptRoot 'docker-start.ps1'
if ($TaskArgs[0] -eq 'dev' -and (Test-Path -LiteralPath $dockerStart)) {
  if ($TaskArgs.Count -ne 1) { throw 'For Docker dev, set APP_PORT for a preferred starting port; extra dev arguments are not supported.' }
  & $dockerStart
  exit 0
}
$npmArgs = @('--prefix', $PSScriptRoot, 'run', $TaskArgs[0])
$remaining = @($TaskArgs | Select-Object -Skip 1)
if ($remaining.Count -gt 0 -and $remaining[0] -eq '--') { $remaining = @($remaining | Select-Object -Skip 1) }
if ($remaining.Count -gt 0) { $npmArgs += '--'; $npmArgs += $remaining }
$configPath = Join-Path $PSScriptRoot '.toolchain.json'
if (Test-Path -LiteralPath $configPath) {
  $toolchain = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
  if (!(Test-Path -LiteralPath $toolchain.node) -or !(Test-Path -LiteralPath $toolchain.npm)) { throw 'Managed toolchain moved. Re-run the starter bootstrap or install Node/npm and use npm run.' }
  $npmBin = Split-Path (Split-Path (Split-Path (Split-Path $toolchain.npm)))
  $env:PATH = "$npmBin;$(Split-Path $toolchain.node);$env:PATH"
  & $toolchain.node $toolchain.npm @npmArgs
} else { npm @npmArgs }
exit $LASTEXITCODE
