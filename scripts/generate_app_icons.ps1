Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\Code Ahumada\.gemini\antigravity\brain\3b6cc951-7a4b-4b39-9d54-679170582570\habitflow_app_icon_1790274366838.jpg'
if (-not (Test-Path $sourcePath)) {
    Write-Host "Source image not found: $sourcePath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-AndSave($img, $width, $height, $destPath) {
    $parent = Split-Path -Parent $destPath
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $destBmp = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($destBmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($img, 0, 0, $width, $height)
    $graphics.Dispose()

    $destBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()
    Write-Host "OK: $destPath"
}

# 1. Iconos Web / PWA
Resize-AndSave $srcImg 192 192 "icons/icon-192.png"
Resize-AndSave $srcImg 512 512 "icons/icon-512.png"
Resize-AndSave $srcImg 512 512 "icons/icon-maskable-512.png"
Resize-AndSave $srcImg 512 512 "icons/app-logo.png"

# 2. Iconos Android Mipmap
$resDir = "android/app/src/main/res"

Resize-AndSave $srcImg 48 48 "$resDir/mipmap-mdpi/ic_launcher.png"
Resize-AndSave $srcImg 48 48 "$resDir/mipmap-mdpi/ic_launcher_round.png"
Resize-AndSave $srcImg 108 108 "$resDir/mipmap-mdpi/ic_launcher_foreground.png"

Resize-AndSave $srcImg 72 72 "$resDir/mipmap-hdpi/ic_launcher.png"
Resize-AndSave $srcImg 72 72 "$resDir/mipmap-hdpi/ic_launcher_round.png"
Resize-AndSave $srcImg 162 162 "$resDir/mipmap-hdpi/ic_launcher_foreground.png"

Resize-AndSave $srcImg 96 96 "$resDir/mipmap-xhdpi/ic_launcher.png"
Resize-AndSave $srcImg 96 96 "$resDir/mipmap-xhdpi/ic_launcher_round.png"
Resize-AndSave $srcImg 216 216 "$resDir/mipmap-xhdpi/ic_launcher_foreground.png"

Resize-AndSave $srcImg 144 144 "$resDir/mipmap-xxhdpi/ic_launcher.png"
Resize-AndSave $srcImg 144 144 "$resDir/mipmap-xxhdpi/ic_launcher_round.png"
Resize-AndSave $srcImg 324 324 "$resDir/mipmap-xxhdpi/ic_launcher_foreground.png"

Resize-AndSave $srcImg 192 192 "$resDir/mipmap-xxxhdpi/ic_launcher.png"
Resize-AndSave $srcImg 192 192 "$resDir/mipmap-xxxhdpi/ic_launcher_round.png"
Resize-AndSave $srcImg 432 432 "$resDir/mipmap-xxxhdpi/ic_launcher_foreground.png"

$srcImg.Dispose()

Write-Host "DONE: All Android and PWA icons generated!"
