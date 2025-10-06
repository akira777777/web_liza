# Прямая очистка проекта через PowerShell
# cleanup-direct.ps1

Write-Host "🧹 Прямая очистка проекта портфолио" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Создаем архивную папку
$archiveDir = "_archive"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    Write-Host "📁 Создана папка архива: $archiveDir" -ForegroundColor Green
}

# Списки файлов для обработки
$filesToRemove = @(
    "blackbox_mcp_settings.json",
    "blackbox-lm-studio-config.json", 
    "advanced-fix-css.js",
    "final-clean-css.js",
    "fix-css-duplicates.js",
    "script-enhanced.js",
    "main-browser.js",
    "settings_tail.txt",
    "settings_tail_keys.txt",
    "favicon-inline.txt",
    "Untitled-1.ini",
    "extract_objects.js",
    "TestJava$1.class",
    "test-cleaner.js"
)

$filesToMove = @(
    "mcp-server-setup.md",
    "WORKSPACE_FIXES.md",
    "verify-mcp-server.js",
    "simple-mcp-test.js",
    "test-mcp-request.js", 
    "mcp-client-test.js",
    "test-mcp-server.js",
    "launch.bat",
    "create-pr.bat",
    "setup-remote.bat",
    "start-mcp-server.bat",
    "stop-mcp-server.bat",
    "test-lm-studio.bat",
    "test-create-file.js",
    "test-lm-studio-connection.js",
    "omni-install.sh"
)

$foldersToMove = @(
    "reports"
)

# Счетчики
$moved = 0
$removed = 0
$errors = 0

Write-Host "📊 Анализ проекта:" -ForegroundColor Yellow
Write-Host "   Файлов для удаления: $($filesToRemove.Count)"
Write-Host "   Файлов для архивирования: $($filesToMove.Count)"
Write-Host "   Папок для архивирования: $($foldersToMove.Count)"
Write-Host ""

# Перемещаем файлы в архив
Write-Host "📦 Архивирование файлов..." -ForegroundColor Cyan
foreach ($file in $filesToMove) {
    if (Test-Path $file) {
        try {
            Move-Item $file $archiveDir -Force
            Write-Host "   ✅ Перемещен: $file" -ForegroundColor Green
            $moved++
        } catch {
            Write-Host "   ❌ Ошибка при перемещении $file`: $($_.Exception.Message)" -ForegroundColor Red
            $errors++
        }
    }
}

# Перемещаем папки в архив
foreach ($folder in $foldersToMove) {
    if (Test-Path $folder) {
        try {
            Move-Item $folder $archiveDir -Force
            Write-Host "   ✅ Перемещена папка: $folder" -ForegroundColor Green
            $moved++
        } catch {
            Write-Host "   ❌ Ошибка при перемещении папки $folder`: $($_.Exception.Message)" -ForegroundColor Red
            $errors++
        }
    }
}

Write-Host ""

# Удаляем временные файлы
Write-Host "🗑️  Удаление временных файлов..." -ForegroundColor Cyan
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "   ✅ Удален: $file" -ForegroundColor Green
            $removed++
        } catch {
            Write-Host "   ❌ Ошибка при удалении $file`: $($_.Exception.Message)" -ForegroundColor Red
            $errors++
        }
    }
}

Write-Host ""

# Создаем отчет
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    summary = @{
        moved = $moved
        removed = $removed  
        errors = $errors
        totalProcessed = $moved + $removed
    }
    recommendations = @(
        "Протестируйте проект: npm run dev",
        "Проверьте сборку: npm run build", 
        "Запустите тесты: npm run test",
        "Архив можно удалить через месяц если проект стабилен"
    )
}

# Сохраняем отчет
$reportPath = Join-Path $archiveDir "cleanup-report.json"
$report | ConvertTo-Json -Depth 3 | Set-Content $reportPath -Encoding UTF8

# Создаем README для архива
$readmeContent = @"
# Архив файлов портфолио

Дата создания: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Содержимое

Файлы, перемещенные из основной папки проекта портфолио:

- Документация разработки (mcp-server-setup.md, WORKSPACE_FIXES.md)
- MCP server тестовые файлы 
- Временные batch файлы
- Отчеты тестирования

## Восстановление

Для восстановления файла скопируйте его обратно в корень проекта:

``````powershell
Copy-Item "_archive/filename" "./"
``````

## Безопасное удаление

Если проект работает стабильно в течение месяца, архив можно удалить.
"@

Set-Content (Join-Path $archiveDir "README.md") $readmeContent -Encoding UTF8

# Показываем итоги
Write-Host "✅ Очистка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Итоги:" -ForegroundColor Cyan
Write-Host "   Файлов перемещено в архив: $moved" -ForegroundColor Green
Write-Host "   Файлов удалено: $removed" -ForegroundColor Green
if ($errors -gt 0) {
    Write-Host "   Ошибок: $errors" -ForegroundColor Red
}
Write-Host "   Всего обработано: $($moved + $removed)"
Write-Host ""
Write-Host "📋 Отчет сохранен: $reportPath"
Write-Host "📂 README архива: $(Join-Path $archiveDir 'README.md')"

Write-Host ""
Write-Host "🎉 Проект очищен! Теперь можно тестировать:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor Yellow
Write-Host "   npm run test" -ForegroundColor Yellow