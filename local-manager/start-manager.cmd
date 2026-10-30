@echo off
cd /d "%~dp0"
start "NOCTURNE 店铺管理器" http://127.0.0.1:4310/
node server.js
pause
