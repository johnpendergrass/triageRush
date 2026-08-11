@echo off
setlocal

rem This file lives in start-local\ but the SITE lives one level up, where
rem index.html is. "%~dp0.." is this script's folder plus "..", i.e. the
rem project root - so the server serves the game rather than this folder.
rem (no-cache-server.py works this out for itself too, so it is safe either
rem way, but keeping the working directory right avoids surprises.)
cd /d "%~dp0.."

set "TRIAGERUSH_PORT=8090"
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$udp = [System.Net.Sockets.UdpClient]::new(); try { $udp.Connect('8.8.8.8', 65530); $udp.Client.LocalEndPoint.Address.IPAddressToString } catch { 'YOUR-COMPUTER-IP' } finally { $udp.Dispose() }"`) do set "TRIAGERUSH_IP=%%I"

echo.
echo  triageRush - production app
echo  ---------------------------
echo  Computer: http://localhost:%TRIAGERUSH_PORT%/
echo  iPhone:   http://%TRIAGERUSH_IP%:%TRIAGERUSH_PORT%/
echo.
echo  Your browser will open automatically in a moment.
echo  Code is never cached; artwork is re-checked on every reload.
echo  Keep this window open while playing; close it to stop the server.
echo  For iPhone testing, both devices must be on the same Wi-Fi network.
echo  If Windows asks, allow access on Private networks.
echo.

rem Open the browser a couple of seconds from now, after the server is up.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:%TRIAGERUSH_PORT%/"

where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 "%~dp0no-cache-server.py" --port %TRIAGERUSH_PORT% --bind 0.0.0.0
  goto :end
)

where python >nul 2>nul
if %errorlevel% equ 0 (
  python "%~dp0no-cache-server.py" --port %TRIAGERUSH_PORT% --bind 0.0.0.0
  goto :end
)

echo Python was not found. Install Python to run the local test server.
pause

:end
endlocal
