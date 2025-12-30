@echo off
:: Admin check and auto-elevate
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

chcp 65001 >nul 2>&1
set "outfile=%userprofile%\Desktop\donanim-bilgisi.txt"

echo Bilgi toplaniyor...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$out = '%outfile%'; " ^
"'ISLEMCI (CPU)' | Out-File $out -Encoding UTF8; " ^
"$cpu = Get-CimInstance Win32_Processor; " ^
"'  Model: ' + $cpu.Name | Out-File $out -Append; " ^
"'  Cekirdek: ' + $cpu.NumberOfCores | Out-File $out -Append; " ^
"'  Thread: ' + $cpu.NumberOfLogicalProcessors | Out-File $out -Append; " ^
"'' | Out-File $out -Append; " ^
"'BELLEK (RAM)' | Out-File $out -Append; " ^
"$ram = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB); " ^
"'  Toplam: ' + $ram + ' GB' | Out-File $out -Append; " ^
"'' | Out-File $out -Append; " ^
"'  Yuvalar (her satir = 1 dolu slot):' | Out-File $out -Append; " ^
"Get-CimInstance Win32_PhysicalMemory | ForEach-Object { " ^
"  $gb = [math]::Round($_.Capacity/1GB); " ^
"  $ddr = switch($_.SMBIOSMemoryType){ 24{'DDR3'} 26{'DDR4'} 34{'DDR5'} default{$_.SMBIOSMemoryType} }; " ^
"  '  ' + $_.BankLabel + ' - ' + $gb + ' GB - ' + $ddr + ' - ' + $_.Speed + ' MHz' " ^
"} | Out-File $out -Append; " ^
"'' | Out-File $out -Append; " ^
"'EKRAN KARTI (GPU)' | Out-File $out -Append; " ^
"Get-CimInstance Win32_VideoController | ForEach-Object { " ^
"  $type = if($_.Name -match 'Intel|AMD Radeon Graphics'){'Dahili'}else{'Harici'}; " ^
"  '  ' + $_.Name + ' (' + $type + ')' " ^
"} | Out-File $out -Append; " ^
"'' | Out-File $out -Append; " ^
"'DISK' | Out-File $out -Append; " ^
"Get-CimInstance Win32_DiskDrive | ForEach-Object { " ^
"  $gb = [math]::Round($_.Size/1GB); " ^
"  $type = if($_.MediaType -match 'SSD'){'SSD'}else{'HDD'}; " ^
"  '  ' + $_.Model + ' - ' + $gb + ' GB - ' + $type " ^
"} | Out-File $out -Append; " ^
"'' | Out-File $out -Append; " ^
"'ANAKART' | Out-File $out -Append; " ^
"$mb = Get-CimInstance Win32_BaseBoard; " ^
"'  Uretici: ' + $mb.Manufacturer | Out-File $out -Append; " ^
"'  Model: ' + $mb.Product | Out-File $out -Append;"

notepad "%outfile%"
