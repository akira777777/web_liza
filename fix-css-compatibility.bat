@echo off
:: Batch script для исправления CSS совместимости
:: filepath: fix-css-compatibility.bat

echo [INFO] Starting CSS compatibility fixes...

:: Проверяем наличие Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

:: Запускаем утилиту
echo [INFO] Running CSS Compatibility Fixer...
node utils/css-compatibility-fixer.js

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] CSS compatibility fixes completed!
    echo [INFO] Check the output above for details.
) else (
    echo.
    echo [ERROR] CSS compatibility fixes failed.
    echo [INFO] Check the error messages above.
)

pause
