# PowerShell script для исправления CSS совместимости
# filepath: fix-css-compatibility.ps1

param(
    [switch]$Validate = $false,
    [switch]$Force = $false
)

Write-Host "🎨 CSS Compatibility Fixer" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Проверяем наличие Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Проверяем наличие утилиты
if (-not (Test-Path "utils/css-compatibility-fixer.js")) {
    Write-Host "❌ CSS Compatibility Fixer not found." -ForegroundColor Red
    Write-Host "Please make sure utils/css-compatibility-fixer.js exists." -ForegroundColor Yellow
    exit 1
}

try {
    if ($Validate) {
        Write-Host "🔍 Validating CSS files..." -ForegroundColor Yellow
        # В будущем можно добавить флаг --validate
        node utils/css-compatibility-fixer.js
    } else {
        if (-not $Force) {
            Write-Host "⚠️  This will modify CSS files in your project." -ForegroundColor Yellow
            $confirm = Read-Host "Continue? (y/n)"
            if ($confirm -ne "y" -and $confirm -ne "Y") {
                Write-Host "❌ Operation cancelled." -ForegroundColor Yellow
                exit 0
            }
        }

        Write-Host ""
        Write-Host "🚀 Running CSS Compatibility Fixer..." -ForegroundColor Cyan
        node utils/css-compatibility-fixer.js

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ CSS compatibility fixes completed successfully!" -ForegroundColor Green
            Write-Host "🧪 Test your changes: npm run dev" -ForegroundColor Yellow
        } else {
            Write-Host ""
            Write-Host "❌ CSS compatibility fixes failed." -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Process finished!" -ForegroundColor Green
