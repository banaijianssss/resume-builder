@echo off
chcp 65001 >nul
title 简历编辑器
cd /d "%~dp0"

echo ============================================
echo   简历编辑器 - Resume Builder
echo ============================================
echo.

if not exist "node_modules\vite\bin\vite.js" (
    echo 检测到依赖未安装，正在执行 npm install ...
    call npm install
    if errorlevel 1 (
        echo.
        echo 依赖安装失败，请确认已安装 Node.js 并联网后重试。
        pause
        exit /b 1
    )
    echo.
)

REM 若服务已在运行，直接打开浏览器
powershell -NoProfile -Command ^
  "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3000' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo 开发服务器已在运行: http://127.0.0.1:3000
    echo 正在打开浏览器...
    start "" "http://127.0.0.1:3000"
    echo.
    echo 若要停止服务，请关闭之前运行 start.bat 的窗口并按 Ctrl+C。
    pause
    exit /b 0
)

REM 释放被占用的 3000 端口（多为上次未退出的 node/vite）
netstat -ano | findstr "LISTENING" | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo 检测到端口 3000 被占用，正在释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":3000"') do (
        if not "%%a"=="0" taskkill /PID %%a /F >nul 2>&1
    )
    echo 等待端口释放...
    timeout /t 2 /nobreak >nul
    netstat -ano | findstr "LISTENING" | findstr ":3000" >nul 2>&1
    if %errorlevel% equ 0 (
        echo.
        echo [错误] 端口 3000 仍被占用，无法启动。请手动关闭占用该端口的程序后重试。
        echo 可在 PowerShell 中执行: netstat -ano ^| findstr :3000
        pause
        exit /b 1
    )
)

echo 正在启动开发服务器...
echo 浏览器将自动打开 http://127.0.0.1:3000
echo 按 Ctrl+C 停止服务
echo.

call npm run dev

pause
