$ErrorActionPreference = 'Stop'

# Keep emulator downloads, CLI preferences and logs away from real Firebase credentials.
$taskRuntimeDir = Join-Path ([System.IO.Path]::GetTempPath()) 'segreclaim-demo-runtime'
New-Item -ItemType Directory -Force -Path $taskRuntimeDir | Out-Null
$env:XDG_CONFIG_HOME = Join-Path $taskRuntimeDir 'config'
$env:FIREBASE_EMULATORS_PATH = Join-Path $taskRuntimeDir 'emulators'
$env:CI = 'true'

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    $javaCandidates = @()
    if ($env:JAVA_HOME) { $javaCandidates += (Join-Path $env:JAVA_HOME 'bin') }
    $jetBrainsRoot = Join-Path $env:ProgramFiles 'JetBrains'
    if (Test-Path -LiteralPath $jetBrainsRoot) {
        $javaCandidates += Get-ChildItem -LiteralPath $jetBrainsRoot -Directory |
            ForEach-Object { Join-Path $_.FullName 'jbr\bin' }
    }
    $javaBin = $javaCandidates | Where-Object { Test-Path -LiteralPath (Join-Path $_ 'java.exe') } |
        Select-Object -First 1
    if ($javaBin) { $env:PATH = $javaBin + ';' + $env:PATH }
}
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    throw 'Firebase Firestore emulator requires Java 21+. Install Java or set JAVA_HOME.'
}

$backendRoot = Join-Path $PSScriptRoot '..\..\SegReClaim-web'
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'firebase.demo.json') -Destination (Join-Path $taskRuntimeDir 'firebase.json') -Force
Copy-Item -LiteralPath (Join-Path $backendRoot 'firestore.rules') -Destination (Join-Path $taskRuntimeDir 'firestore.rules') -Force
Copy-Item -LiteralPath (Join-Path $backendRoot 'firestore.indexes.json') -Destination (Join-Path $taskRuntimeDir 'firestore.indexes.json') -Force

Push-Location -LiteralPath $taskRuntimeDir
try {
    & firebase emulators:start --project demo-segreclaim --config (Join-Path $taskRuntimeDir 'firebase.json') --only 'auth,firestore'
    if ($LASTEXITCODE -ne 0) { throw "Firebase emulators exited with code $LASTEXITCODE" }
} finally {
    Pop-Location
}
