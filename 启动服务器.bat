@echo off
chcp 65001 >nul
echo ========================================
echo MathMaster 服务器启动脚本
echo ========================================
echo.

cd /d "%~dp0"

echo 检查 Node.js 是否安装...
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js！
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js 已安装
echo.

echo 检查依赖是否安装...
if not exist "node_modules" (
    echo 正在安装依赖包...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
    echo 依赖安装完成
    echo.
)

echo 启动服务器...
echo.
echo ========================================
echo 服务器启动后，请在浏览器中访问：
echo http://localhost:3000
echo ========================================
echo.
echo 按 Ctrl+C 可以停止服务器
echo.

node server.js

pause

