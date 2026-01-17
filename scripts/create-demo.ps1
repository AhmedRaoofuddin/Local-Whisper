# Script to create a comprehensive demo GIF of On-Device Sage
# This will capture all major features of the app

param(
    [int]$Duration = 60,
    [string]$OutputDir = "docs/images"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== On-Device Sage Demo Recording ===" -ForegroundColor Cyan
Write-Host "This will record a demo showing all app features`n" -ForegroundColor Yellow

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Set up Android environment
$env:ANDROID_HOME = "C:\Users\zalin\AppData\Local\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:PATH"

# Check if device is connected
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
$devices = adb devices | Select-String "device$"
if ($devices.Count -eq 0) {
    Write-Host "ERROR: No Android device/emulator found!" -ForegroundColor Red
    exit 1
}

Write-Host "Device found! Starting demo recording...`n" -ForegroundColor Green

# Start screen recording
Write-Host "[1/8] Starting screen recording..." -ForegroundColor Cyan
adb shell screenrecord --bit-rate 6000000 /sdcard/demo_raw.mp4 &
$recordPid = $!
Start-Sleep -Seconds 2

# Launch app
Write-Host "[2/8] Launching On-Device Sage..." -ForegroundColor Cyan
adb shell am start -n com.pocketwisdom/com.pocketpal.MainActivity
Start-Sleep -Seconds 5

# Show sidebar
Write-Host "[3/8] Showing navigation..." -ForegroundColor Cyan
adb shell input tap 50 90  # Open sidebar
Start-Sleep -Seconds 2

# Navigate to Chat
adb shell input tap 140 97  # Chat
Start-Sleep -Seconds 2

# Show chat interface
Write-Host "[4/8] Demonstrating chat..." -ForegroundColor Cyan
adb shell input tap 350 1450  # Tap input field
Start-Sleep -Seconds 1
adb shell input text "What%sis%san%sintegral%sin%scalculus?"
Start-Sleep -Seconds 2

# Go to Models
Write-Host "[5/8] Showing models..." -ForegroundColor Cyan
adb shell input tap 50 90  # Open sidebar
Start-Sleep -Seconds 2
adb shell input tap 150 193  # Models
Start-Sleep -Seconds 3

# Scroll through models
adb shell input swipe 350 800 350 400 500
Start-Sleep -Seconds 2

# Go to Settings
Write-Host "[6/8] Showing settings..." -ForegroundColor Cyan
adb shell input tap 50 90  # Open sidebar
Start-Sleep -Seconds 2
adb shell input tap 156 289  # Settings
Start-Sleep -Seconds 3

# Toggle dark mode
adb shell input tap 350 1120  # Dark mode toggle
Start-Sleep -Seconds 2

# Show advanced settings
adb shell input tap 350 501  # Advanced Settings dropdown
Start-Sleep -Seconds 2

# Scroll settings
adb shell input swipe 350 800 350 400 500
Start-Sleep -Seconds 2

# Go to About
Write-Host "[7/8] Showing about page..." -ForegroundColor Cyan
adb shell input tap 50 90  # Open sidebar
Start-Sleep -Seconds 2
adb shell input tap 144 385  # About
Start-Sleep -Seconds 3

# Back to home
adb shell input keyevent 4
Start-Sleep -Seconds 2

Write-Host "[8/8] Stopping recording..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# Stop recording
adb shell pkill -SIGINT screenrecord
Start-Sleep -Seconds 3

# Pull the video
Write-Host "`nPulling recording from device..." -ForegroundColor Yellow
adb pull /sdcard/demo_raw.mp4 "$OutputDir/demo_raw.mp4"
adb shell rm /sdcard/demo_raw.mp4

Write-Host "`n=== Recording Complete! ===" -ForegroundColor Green
Write-Host "Raw video saved to: $OutputDir/demo_raw.mp4" -ForegroundColor Cyan
Write-Host "`nTo convert to GIF, use:" -ForegroundColor Yellow
Write-Host "  ffmpeg -i $OutputDir/demo_raw.mp4 -vf `"fps=15,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`" -loop 0 $OutputDir/demo.gif" -ForegroundColor Gray

Write-Host "`nOr use an online converter like:" -ForegroundColor Yellow
Write-Host "  - https://ezgif.com/video-to-gif" -ForegroundColor Gray
Write-Host "  - https://cloudconvert.com/mp4-to-gif" -ForegroundColor Gray

