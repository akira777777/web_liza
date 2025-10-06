@echo off
:: cleanup-project.bat
:: Batch script для очистки проекта портфолио от ненужных файлов

setlocal enabledelayedexpansion

echo.
echo 🧹 Portfolio Project Cleanup
echo =============================
echo.

:: Проверяем наличие Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo [INFO]  Download from: https://nodejs.org/
    pause
    exit /b 1
)

:: Получаем версию Node.js
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [INFO] Node.js version: %NODE_VERSION%

:: Проверяем наличие cleaner утилиты
if not exist "utils\project-cleaner.js" (
    echo [ERROR] Project cleaner utility not found.
    echo [INFO]  Expected location: utils\project-cleaner.js
    pause
    exit /b 1
)

echo [INFO] Project cleaner utility found ✅
echo.

:: Показываем что будет сделано (dry run)
echo [INFO] 🔍 Analyzing project structure...
echo [INFO] This will show what files will be processed...
echo.

node utils\project-cleaner.js --dry-run
if %errorlevel% neq 0 (
    echo [ERROR] Analysis failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ⚠️  WARNING: This will move/remove files from your project!
echo.
echo 📦 Files will be moved to _archive folder (can be restored)
echo 🗑️  Temporary files will be permanently deleted
echo.

set /p confirm="Do you want to continue? (y/N): "

:: Проверяем подтверждение (по умолчанию N)
if /i "!confirm!" neq "y" (
    echo [INFO] Cleanup cancelled by user.
    echo [INFO] No files were modified.
    pause
    exit /b 0
)

echo.
echo [INFO] 🚀 Starting cleanup process...
echo.

:: Выполняем очистку
node utils\project-cleaner.js

:: Проверяем результат
if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS: Project cleanup completed successfully!
    echo.
    echo 📋 Next steps:
    echo    1. Check _archive folder for moved files
    echo    2. Test your project: npm run dev
    echo    3. Verify build works: npm run build
    echo    4. Run tests: npm run test
    echo.
    echo 📂 Detailed report: _archive\cleanup-report.json
    echo.
    
    :: Показываем краткую статистику архива если он существует
    if exist "_archive" (
        echo 📊 Archive contents:
        for /f %%i in ('dir /b /s "_archive\*.*" 2^>nul ^| find /c /v ""') do (
            echo    Files archived: %%i
        )
        echo.
    )
    
    set /p openArchive="Open archive folder? (y/N): "
    if /i "!openArchive!" equ "y" (
        if exist "_archive" (
            explorer "_archive"
        )
    )
    
) else (
    echo.
    echo ❌ ERROR: Cleanup failed!
    echo [ERROR] Check the error messages above for details.
    echo [INFO]  You may need to run as administrator or check file permissions.
    echo.
)

echo.
echo 🎉 Cleanup process finished!
pause