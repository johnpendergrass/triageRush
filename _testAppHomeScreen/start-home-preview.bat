@echo off
cd /d "%~dp0.."
echo.
echo triageRush HOME screen preview
echo.
echo On this PC:
echo   http://localhost:8082/_testAppHomeScreen/
echo.
echo On an iPhone connected to the same Wi-Fi:
echo   http://YOUR-PC-IP:8082/_testAppHomeScreen/
echo.
python -m http.server 8082 --bind 0.0.0.0
