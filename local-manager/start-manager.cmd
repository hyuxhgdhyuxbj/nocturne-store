@echo off
cd /d "%~dp0"
echo NOCTURNE 本地店铺管理器正在启动...
echo 如果浏览器打开的是旧页面，请先关闭之前的黑色 Node 窗口，再重新双击本文件。
start "NOCTURNE 店铺管理器服务" /b node server.js
timeout /t 1 /nobreak >nul
start "NOCTURNE 店铺管理器" http://127.0.0.1:4310/
echo
echo 管理器地址：http://127.0.0.1:4310/
echo 关闭本地管理器时，请关闭本窗口或 Node 服务窗口。
pause
