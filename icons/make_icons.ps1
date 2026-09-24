Add-Type -AssemblyName System.Drawing

function Create-AppIcon([int]$dim, [string]$target, [bool]$maskable = $false) {
    $bmp = New-Object System.Drawing.Bitmap($dim, $dim, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background gradient
    $pt1 = New-Object System.Drawing.Point(0, 0)
    $pt2 = New-Object System.Drawing.Point($dim, $dim)
    $c1 = [System.Drawing.Color]::FromArgb(255, 11, 19, 41)
    $c2 = [System.Drawing.Color]::FromArgb(255, 3, 105, 161)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, $c1, $c2)

    if ($maskable) {
        $gfx.FillRectangle($bgBrush, 0, 0, $dim, $dim)
    } else {
        $radius = [float]($dim * 0.22)
        $pathBg = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = [float]($radius * 2)
        $pathBg.AddArc(0.0, 0.0, $d, $d, 180.0, 90.0)
        $pathBg.AddArc([float]($dim - $d), 0.0, $d, $d, 270.0, 90.0)
        $pathBg.AddArc([float]($dim - $d), [float]($dim - $d), $d, $d, 0.0, 90.0)
        $pathBg.AddArc(0.0, [float]($dim - $d), $d, $d, 90.0, 90.0)
        $pathBg.CloseFigure()
        $gfx.FillPath($bgBrush, $pathBg)
    }

    # Outer glow ring
    $ringMargin = if ($maskable) { [float]($dim * 0.16) } else { [float]($dim * 0.08) }
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 56, 189, 248), [Math]::Max(2.0, [float]($dim * 0.01)))
    $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $gfx.DrawEllipse($pen, $ringMargin, $ringMargin, [float]($dim - 2 * $ringMargin), [float]($dim - 2 * $ringMargin))

    # Water drop geometry
    $scale = if ($maskable) { 0.68 } else { 0.82 }
    $cx = [float]($dim / 2.0)
    $cy = [float]($dim / 2.0)
    $w = [float]($dim * $scale * 0.54)
    $h = [float]($dim * $scale * 0.74)

    $dropTop = [float]($cy - $h * 0.46)
    $dropBot = [float]($cy + $h * 0.46)
    $leftX   = [float]($cx - $w * 0.5)
    $rightX  = [float]($cx + $w * 0.5)

    $pDrop = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pts = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF($cx, $dropTop)),
        (New-Object System.Drawing.PointF([float]($cx + $w * 0.28), [float]($cy - $h * 0.15))),
        (New-Object System.Drawing.PointF($rightX, [float]($cy + $h * 0.15))),
        (New-Object System.Drawing.PointF([float]($cx + $w * 0.32), [float]($dropBot - $h * 0.05))),
        (New-Object System.Drawing.PointF($cx, $dropBot)),
        (New-Object System.Drawing.PointF([float]($cx - $w * 0.32), [float]($dropBot - $h * 0.05))),
        (New-Object System.Drawing.PointF($leftX, [float]($cy + $h * 0.15))),
        (New-Object System.Drawing.PointF([float]($cx - $w * 0.28), [float]($cy - $h * 0.15)))
    )
    $pDrop.AddClosedCurve($pts, 0.5)

    $dropGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF($cx, $dropTop)),
        (New-Object System.Drawing.PointF($cx, $dropBot)),
        [System.Drawing.Color]::FromArgb(255, 56, 189, 248),
        [System.Drawing.Color]::FromArgb(255, 2, 132, 199)
    )
    $gfx.FillPath($dropGrad, $pDrop)

    # Wave path in lower part
    $pWave = New-Object System.Drawing.Drawing2D.GraphicsPath
    $wavePts = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF([float]($leftX * 1.01), [float]($cy + $h * 0.12))),
        (New-Object System.Drawing.PointF([float]($cx - $w * 0.2), [float]($cy + $h * 0.05))),
        (New-Object System.Drawing.PointF([float]($cx + $w * 0.15), [float]($cy + $h * 0.18))),
        (New-Object System.Drawing.PointF([float]($rightX * 0.99), [float]($cy + $h * 0.12))),
        (New-Object System.Drawing.PointF([float]($cx + $w * 0.32), [float]($dropBot - $h * 0.05))),
        (New-Object System.Drawing.PointF($cx, $dropBot)),
        (New-Object System.Drawing.PointF([float]($cx - $w * 0.32), [float]($dropBot - $h * 0.05)))
    )
    $pWave.AddClosedCurve($wavePts, 0.5)

    $waveGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF($cx, [float]($cy + $h * 0.05))),
        (New-Object System.Drawing.PointF($cx, $dropBot)),
        [System.Drawing.Color]::FromArgb(235, 6, 182, 212),
        [System.Drawing.Color]::FromArgb(245, 2, 132, 199)
    )
    $gfx.FillPath($waveGrad, $pWave)

    # Highlight glare
    $glareBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 255, 255, 255))
    $gfx.FillEllipse($glareBrush, [float]($cx - $w * 0.26), [float]($cy - $h * 0.24), [float]($dim * 0.045), [float]($dim * 0.09))

    $glareSmall = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 255, 255, 255))
    $gfx.FillEllipse($glareSmall, [float]($cx - $w * 0.18), [float]($cy - $h * 0.10), [float]($dim * 0.026), [float]($dim * 0.026))

    $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
    $gfx.Dispose()
    $bmp.Dispose()
    Write-Host "Icon created successfully: $target ($dim x $dim)"
}

Create-AppIcon 192 "c:\Users\Code Ahumada\Desktop\Proyectos de Mi Empresa CodeAhumada\HabitFlow\icons\icon-192.png" $false
Create-AppIcon 512 "c:\Users\Code Ahumada\Desktop\Proyectos de Mi Empresa CodeAhumada\HabitFlow\icons\icon-512.png" $false
Create-AppIcon 512 "c:\Users\Code Ahumada\Desktop\Proyectos de Mi Empresa CodeAhumada\HabitFlow\icons\icon-maskable-512.png" $true
