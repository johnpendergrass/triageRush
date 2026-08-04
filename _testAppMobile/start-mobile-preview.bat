@echo off
setlocal
cd /d "%~dp0"

set "TRIAGERUSH_MOBILE_PORT=8080"
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$udp = [System.Net.Sockets.UdpClient]::new(); try { $udp.Connect('8.8.8.8', 65530); $udp.Client.LocalEndPoint.Address.IPAddressToString } catch { 'YOUR-COMPUTER-IP' } finally { $udp.Dispose() }"`) do set "TRIAGERUSH_IP=%%I"

echo.
echo  triageRush mobile test app
echo  --------------------------
echo  Computer: http://localhost:%TRIAGERUSH_MOBILE_PORT%/
echo  iPhone:   http://%TRIAGERUSH_IP%:%TRIAGERUSH_MOBILE_PORT%/
echo.
echo  Cache is disabled; each reload requests the current files.
echo  Keep this window open while testing.
echo  Your computer and iPhone must be on the same Wi-Fi network.
echo  If Windows asks, allow access on Private networks.
echo.

where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 no-cache-server.py --port %TRIAGERUSH_MOBILE_PORT% --bind 0.0.0.0
  goto :end
)

where python >nul 2>nul
if %errorlevel% equ 0 (
  python no-cache-server.py --port %TRIAGERUSH_MOBILE_PORT% --bind 0.0.0.0
  goto :end
)

echo Python was not found. Install Python or ask Codex to start a preview server.
pause

:end
endlocal
