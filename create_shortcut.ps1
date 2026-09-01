Add-Type -AssemblyName System.Drawing

$pngPath = "d:\Softwares\Surgery bill\logo.png"
$icoPath = "d:\Softwares\Surgery bill\app_icon.ico"
$htmlPath = "d:\Softwares\Surgery bill\index.html"

# Convert logo.png to app_icon.ico if logo exists
if (Test-Path $pngPath) {
    try {
        $bmp = [System.Drawing.Bitmap]::FromFile($pngPath)
        $hIcon = $bmp.GetHicon()
        $icon = [System.Drawing.Icon]::FromHandle($hIcon)
        $fs = [System.IO.File]::Create($icoPath)
        $icon.Save($fs)
        $fs.Close()
        $bmp.Dispose()
        Write-Host "Created app_icon.ico successfully."
    } catch {
        Write-Host "Failed to convert PNG to ICO: $_"
    }
}

# Find Desktop path
$desktopPath = [Environment]::GetFolderPath('Desktop')
Write-Host "Desktop folder: $desktopPath"

# Create WScript.Shell COM Object
$WshShell = New-Object -ComObject WScript.Shell

# 1. Create .lnk shortcut on Desktop
$shortcutPath = Join-Path $desktopPath "Hospital Billing Agent.lnk"
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $htmlPath
$Shortcut.WorkingDirectory = "d:\Softwares\Surgery bill"
$Shortcut.Description = "Open Hospital Billing Agent app"

if (Test-Path $icoPath) {
    $Shortcut.IconLocation = "$icoPath, 0"
}

$Shortcut.Save()
Write-Host "Created shortcut at: $shortcutPath"

# 2. Also create a URL shortcut as backup
$urlShortcutPath = Join-Path $desktopPath "Hospital Billing Agent.url"
$UrlShortcut = "[InternetShortcut]`r`nURL=file:///$($htmlPath.Replace('\', '/'))`r`n"
if (Test-Path $icoPath) {
    $UrlShortcut += "IconFile=$icoPath`r`nIconIndex=0`r`n"
}
Set-Content -Path $urlShortcutPath -Value $UrlShortcut
Write-Host "Created URL shortcut at: $urlShortcutPath"
