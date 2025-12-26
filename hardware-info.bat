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

echo ISLEMCI (CPU) > "%outfile%"
for /f "tokens=2 delims==" %%a in ('wmic cpu get Name /value ^| find "="') do echo   Model: %%a >> "%outfile%"
for /f "tokens=2 delims==" %%a in ('wmic cpu get NumberOfCores /value ^| find "="') do echo   Cekirdek: %%a >> "%outfile%"
for /f "tokens=2 delims==" %%a in ('wmic cpu get NumberOfLogicalProcessors /value ^| find "="') do echo   Thread: %%a >> "%outfile%"

echo. >> "%outfile%"
echo BELLEK (RAM) >> "%outfile%"
systeminfo | findstr /C:"Total Physical Memory" >> "%outfile%"
echo. >> "%outfile%"
echo   Yuvalar (her satir = 1 dolu slot): >> "%outfile%"
wmic memorychip get BankLabel, Capacity, Speed, SMBIOSMemoryType /format:table 2>nul >> "%outfile%"
echo   DDR: 24=DDR3, 26=DDR4, 34=DDR5 >> "%outfile%"

echo. >> "%outfile%"
echo EKRAN KARTI (GPU) >> "%outfile%"
wmic path win32_videocontroller get Name /format:list 2>nul | find "=" >> "%outfile%"
echo   (Intel/AMD Graphics=Dahili, NVIDIA/AMD RX=Harici) >> "%outfile%"

echo. >> "%outfile%"
echo DISK >> "%outfile%"
powershell -command "Get-WmiObject Win32_DiskDrive | ForEach-Object { $gb=[math]::Round($_.Size/1GB); '  ' + $_.Model + ' - ' + $gb + ' GB - ' + $_.MediaType }" >> "%outfile%"

echo. >> "%outfile%"
echo ANAKART >> "%outfile%"
for /f "tokens=2 delims==" %%a in ('wmic baseboard get Manufacturer /value ^| find "="') do echo   Uretici: %%a >> "%outfile%"
for /f "tokens=2 delims==" %%a in ('wmic baseboard get Product /value ^| find "="') do echo   Model: %%a >> "%outfile%"

notepad "%outfile%"
