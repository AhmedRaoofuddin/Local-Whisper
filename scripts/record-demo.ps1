# Inferix AI Demo Recording Script
# Records app demo and converts to GIF
# Requirements: ADB, FFmpeg

param(
    [int]$Duration = 60,
    [string]$OutputDir = "docs/images"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Inferix AI - Demo Recording Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Check ADB
Write-Host "`n[1/6] Checking ADB..." -ForegroundColor Yellow
$adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"
if (-not (Test-Path $adbPath)) {
    $adbPath = "adb"
}
try {
    & $adbPath devices | Out-Null
    Write-Host "  [OK] ADB is available" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] ADB not found. Please install Android SDK." -ForegroundColor Red
    exit 1
}

# Check FFmpeg
Write-Host "`n[2/6] Checking FFmpeg..." -ForegroundColor Yellow
try {
    & ffmpeg -version | Out-Null
    Write-Host "  [OK] FFmpeg is available" -ForegroundColor Green
} catch {
    Write-Host "  [WARNING] FFmpeg not found. Installing via winget..." -ForegroundColor Yellow
    try {
        winget install Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
    } catch {
        Write-Host "  [ERROR] Could not install FFmpeg. Please install manually." -ForegroundColor Red
        Write-Host "  Download from: https://ffmpeg.org/download.html" -ForegroundColor Yellow
        exit 1
    }
}

# Create output directory
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not $ProjectRoot) { $ProjectRoot = (Get-Location).Path }
$OutputPath = Join-Path $ProjectRoot $OutputDir
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$VideoFile = Join-Path $OutputPath "demo_recording.mp4"
$GifFile = Join-Path $OutputPath "demo.gif"
$DeviceVideo = "/sdcard/demo_recording.mp4"

# Check device
Write-Host "`n[3/6] Checking connected device..." -ForegroundColor Yellow
$devices = & $adbPath devices | Select-String -Pattern "device$"
if (-not $devices) {
    Write-Host "  [ERROR] No Android device/emulator connected." -ForegroundColor Red
    Write-Host "  Please start the emulator or connect a device." -ForegroundColor Yellow
    exit 1
}
Write-Host "  [OK] Device connected" -ForegroundColor Green

# Launch app
Write-Host "`n[4/6] Launching Inferix AI..." -ForegroundColor Yellow
& $adbPath shell am force-stop com.pocketwisdom 2>$null
Start-Sleep -Seconds 1
& $adbPath shell monkey -p com.pocketwisdom -c android.intent.category.LAUNCHER 1 2>$null
Start-Sleep -Seconds 3
Write-Host "  [OK] App launched" -ForegroundColor Green

# Record screen
Write-Host "`n[5/6] Recording screen (${Duration}s max, press Ctrl+C to stop early)..." -ForegroundColor Yellow
Write-Host "  >> Navigate through the app to demonstrate features" -ForegroundColor Cyan
Write-Host "  >> Suggested flow:" -ForegroundColor Cyan
Write-Host "     1. Show chat interface" -ForegroundColor Gray
Write-Host "     2. Open sidebar menu" -ForegroundColor Gray
Write-Host "     3. Browse Models screen" -ForegroundColor Gray
Write-Host "     4. Show Settings" -ForegroundColor Gray
Write-Host "     5. Return to chat and type a message" -ForegroundColor Gray

# Remove old recording if exists
& $adbPath shell rm -f $DeviceVideo 2>$null

# Start recording (limited to duration)
$recordJob = Start-Job -ScriptBlock {
    param($adb, $device, $time)
    & $adb shell screenrecord --time-limit $time $device 2>&1
} -ArgumentList $adbPath, $DeviceVideo, $Duration

Write-Host "`n  Recording started. Press Enter when done (or wait ${Duration}s)..." -ForegroundColor Yellow

# Wait for user input or timeout
$timeout = [DateTime]::Now.AddSeconds($Duration)
while (([DateTime]::Now -lt $timeout) -and ($recordJob.State -eq "Running")) {
    if ([Console]::KeyAvailable) {
        $key = [Console]::ReadKey($true)
        if ($key.Key -eq "Enter") {
            Write-Host "  Stopping recording..." -ForegroundColor Yellow
            & $adbPath shell pkill -SIGINT screenrecord 2>$null
            break
        }
    }
    Start-Sleep -Milliseconds 100
}

# Wait for job to complete
Wait-Job $recordJob -Timeout 5 | Out-Null
Stop-Job $recordJob 2>$null
Remove-Job $recordJob 2>$null

Start-Sleep -Seconds 2
Write-Host "  [OK] Recording complete" -ForegroundColor Green

# Pull video
Write-Host "`n[6/6] Converting to GIF..." -ForegroundColor Yellow
& $adbPath pull $DeviceVideo $VideoFile 2>$null
if (-not (Test-Path $VideoFile)) {
    Write-Host "  [ERROR] Could not retrieve video from device." -ForegroundColor Red
    exit 1
}

# Convert to GIF (optimized)
Write-Host "  Converting video to optimized GIF..." -ForegroundColor Gray
$palettePath = Join-Path $OutputPath "palette.png"

# Generate palette for better colors
& ffmpeg -y -i $VideoFile -vf "fps=10,scale=360:-1:flags=lanczos,palettegen=stats_mode=diff" $palettePath 2>$null

# Create GIF using palette
& ffmpeg -y -i $VideoFile -i $palettePath -lavfi "fps=10,scale=360:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -loop 0 $GifFile 2>$null

# Cleanup
Remove-Item $palettePath -Force -ErrorAction SilentlyContinue
Remove-Item $VideoFile -Force -ErrorAction SilentlyContinue
& $adbPath shell rm -f $DeviceVideo 2>$null

if (Test-Path $GifFile) {
    $size = [math]::Round((Get-Item $GifFile).Length / 1MB, 2)
    Write-Host "  [OK] GIF created: $GifFile ($size MB)" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Failed to create GIF" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Demo recording complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "`nGIF saved to: $GifFile" -ForegroundColor White

