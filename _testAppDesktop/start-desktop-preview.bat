@echo off
setlocal
cd /d "%~dp0"

set "TRIAGERUSH_DESKTOP_PORT=8081"

echo.
echo  triageRush desktop test app
echo  ---------------------------
echo  Computer: http://localhost:%TRIAGERUSH_DESKTOP_PORT%
echo.
echo  Keep this window open while testing.
echo.

where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 -m http.server %TRIAGERUSH_DESKTOP_PORT% --bind 127.0.0.1
  goto :end
)

where python >nul 2>nul
if %errorlevel% equ 0 (
  python -m http.server %TRIAGERUSH_DESKTOP_PORT% --bind 127.0.0.1
  goto :end
)

echo Python was not found. Install Python or ask Codex to start a preview server.
pause

:end
endlocal
