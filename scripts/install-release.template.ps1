[CmdletBinding(PositionalBinding=$false)]
param(
  [ValidateSet('current','lts')][string]$Channel = 'current',
  [string]$CacheRoot,
  [string]$ArchivePath,
  [Parameter(ValueFromRemainingArguments=$true)][string[]]$WizardArgs
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# These values are injected and signed by the tagged GitHub release workflow.
$repository = '__GITHUB_REPOSITORY__'
$releaseTag = '__RELEASE_TAG__'
$expectedSha256 = '__ARCHIVE_SHA256__'
$archiveName = '__ARCHIVE_NAME__'
$packageDirectory = '__PACKAGE_DIRECTORY__'
if ($repository.StartsWith('__') -or $expectedSha256.StartsWith('__')) {
  throw 'This is a release template. Download install-agent-ready.ps1 from a published GitHub Release.'
}
if (!$CacheRoot) {
  $localData = [Environment]::GetFolderPath('LocalApplicationData')
  if (!$localData) { throw 'LOCALAPPDATA is unavailable; pass -CacheRoot explicitly.' }
  $CacheRoot = Join-Path $localData 'AgentReadyStarter'
}
$cacheRootFull = [IO.Path]::GetFullPath($CacheRoot)
$versionRoot = Join-Path $cacheRootFull (Join-Path 'versions' "$releaseTag-$($expectedSha256.Substring(0,12))")
$bootstrap = Join-Path $versionRoot 'bootstrap.ps1'

if (!(Test-Path -LiteralPath $bootstrap -PathType Leaf)) {
  $downloadRoot = Join-Path $cacheRootFull (Join-Path 'downloads' ([Guid]::NewGuid().ToString('N')))
  $download = Join-Path $downloadRoot $archiveName
  $expanded = Join-Path $downloadRoot 'expanded'
  New-Item -ItemType Directory -Force -Path $downloadRoot | Out-Null
  try {
    if ($ArchivePath) {
      $sourceArchive = [IO.Path]::GetFullPath($ArchivePath)
      if (!(Test-Path -LiteralPath $sourceArchive -PathType Leaf)) { throw "Archive not found: $sourceArchive" }
      Copy-Item -LiteralPath $sourceArchive -Destination $download
    } else {
      $url = "https://github.com/$repository/releases/download/$releaseTag/$archiveName"
      Write-Host "Downloading Agent Ready Starter $releaseTag from $repository"
      Invoke-WebRequest -Uri $url -OutFile $download -UseBasicParsing
    }
    $actualSha256 = (Get-FileHash -LiteralPath $download -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualSha256 -ne $expectedSha256.ToLowerInvariant()) {
      throw 'Starter checksum mismatch. The archive was not installed.'
    }
    Expand-Archive -LiteralPath $download -DestinationPath $expanded
    $package = Join-Path $expanded $packageDirectory
    $releaseManifest = Join-Path $package 'release.json'
    if (!(Test-Path -LiteralPath (Join-Path $package 'bootstrap.ps1') -PathType Leaf) -or
        !(Test-Path -LiteralPath (Join-Path $package 'bin/create.mjs') -PathType Leaf) -or
        !(Test-Path -LiteralPath $releaseManifest -PathType Leaf)) {
      throw 'Release archive structure is invalid.'
    }
    $metadata = Get-Content -LiteralPath $releaseManifest -Raw | ConvertFrom-Json
    if ("v$($metadata.version)" -ne $releaseTag -or $metadata.format -ne 1) {
      throw 'Release metadata does not match the requested version.'
    }
    New-Item -ItemType Directory -Force -Path (Split-Path $versionRoot) | Out-Null
    if (Test-Path -LiteralPath $versionRoot) {
      $resolvedVersions = [IO.Path]::GetFullPath((Join-Path $cacheRootFull 'versions'))
      $resolvedTarget = [IO.Path]::GetFullPath($versionRoot)
      if (!$resolvedTarget.StartsWith($resolvedVersions + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Refusing to replace a cache path outside the version cache.'
      }
      $existing = Get-Item -LiteralPath $versionRoot -Force
      if (($existing.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw 'Refusing to replace a cache path that is a link or junction.'
      }
      Remove-Item -LiteralPath $versionRoot -Recurse -Force
    }
    Move-Item -LiteralPath $package -Destination $versionRoot
  } finally {
    if (Test-Path -LiteralPath $downloadRoot) {
      Remove-Item -LiteralPath $downloadRoot -Recurse -Force
    }
  }
}

Write-Host "Starter ready: $releaseTag (cached in $versionRoot)"
& $bootstrap -Channel $Channel @WizardArgs
exit $LASTEXITCODE
