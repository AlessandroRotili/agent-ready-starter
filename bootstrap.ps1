[CmdletBinding(PositionalBinding=$false)]
param(
  [ValidateSet('current','lts')][string]$Channel = 'current',
  [switch]$RuntimeOnly,
  [Parameter(ValueFromRemainingArguments=$true)][string[]]$WizardArgs
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$runtimeRoot = Join-Path $PSScriptRoot '.runtime'
$architecture = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }
$releases = Invoke-RestMethod 'https://nodejs.org/dist/index.json'
$release = $releases | Where-Object { ($Channel -eq 'current' -or $_.lts) -and $_.files -contains "win-$architecture-zip" } | Select-Object -First 1
if (!$release -or $release.version -notmatch '^v\d+\.\d+\.\d+$') { throw 'Cannot resolve a supported Node release.' }
$archiveName = "node-$($release.version)-win-$architecture.zip"
$nodeRoot = Join-Path $runtimeRoot "node-$($release.version)-win-$architecture"
$nodeExe = Join-Path $nodeRoot 'node.exe'
New-Item -ItemType Directory -Force -Path $runtimeRoot | Out-Null
if (!(Test-Path -LiteralPath $nodeExe)) {
  $archive = Join-Path $runtimeRoot $archiveName
  Write-Host "Installing Node $($release.version) in $runtimeRoot"
  Invoke-WebRequest "https://nodejs.org/dist/$($release.version)/$archiveName" -OutFile $archive -UseBasicParsing
  $checksums = (Invoke-WebRequest "https://nodejs.org/dist/$($release.version)/SHASUMS256.txt" -UseBasicParsing).Content
  $line = $checksums -split "`n" | Where-Object { $_.Trim().EndsWith(" $archiveName") } | Select-Object -First 1
  if (!$line) { throw 'Checksum missing.' }
  $expected = ($line.Trim() -split '\s+')[0]
  if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected.ToLowerInvariant()) { throw 'Node checksum mismatch. Download was not executed.' }
  Expand-Archive -LiteralPath $archive -DestinationPath $runtimeRoot -Force
}
$npmVersion = (Invoke-RestMethod 'https://registry.npmjs.org/npm/latest').version
if ($npmVersion -notmatch '^\d+\.\d+\.\d+$') { throw 'Invalid npm release.' }
$npmRoot = Join-Path $runtimeRoot "npm-$npmVersion"
$npmCli = Join-Path $npmRoot 'node_modules/npm/bin/npm-cli.js'
$env:PATH = "$nodeRoot;$env:PATH"
if (!(Test-Path -LiteralPath $npmCli)) {
  & $nodeExe (Join-Path $nodeRoot 'node_modules/npm/bin/npm-cli.js') install --global --prefix $npmRoot "npm@$npmVersion" --no-fund --no-audit
  if ($LASTEXITCODE -ne 0) { throw 'npm installation failed.' }
}
$env:npm_execpath = $npmCli
$env:PATH = "$npmRoot;$env:PATH"
@{ node = $nodeExe; npm = $npmCli; channel = $Channel } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runtimeRoot 'toolchain.json') -Encoding UTF8
Write-Host "Toolchain ready: Node $($release.version), npm $npmVersion. System installations unchanged."
if (!$RuntimeOnly) {
  & $nodeExe (Join-Path $PSScriptRoot 'bin/create.mjs') @WizardArgs
  exit $LASTEXITCODE
}
