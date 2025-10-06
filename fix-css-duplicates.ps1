# CSS Duplicate Selector Fixer - PowerShell Version
# Исправляет дублирующиеся селекторы в CSS файле

param(
    [Parameter(Mandatory = $true)]
    [string]$InputFile,
    [string]$OutputFile = $null
)

if (-not $OutputFile) {
    $OutputFile = $InputFile
}

if (-not (Test-Path $InputFile)) {
    Write-Error "Файл не найден: $InputFile"
    exit 1
}

Write-Host "Анализ файла: $InputFile"

# Читаем файл
$content = Get-Content $InputFile -Raw -Encoding UTF8

# Находим все селекторы и их позиции в оригинальном файле
$selectorPattern = '([^{}]+)\s*\{'
$regexMatches = [regex]::Matches($content, $selectorPattern)

$selectors = @{}
foreach ($match in $regexMatches) {
    $selector = $match.Groups[1].Value.Trim()
    if (-not $selectors.ContainsKey($selector)) {
        $selectors[$selector] = @()
    }
    $selectors[$selector] += $match.Index
}

# Находим дублирующиеся селекторы
$duplicates = $selectors.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 }

Write-Host "Найдено дублирующихся селекторов: $($duplicates.Count)"

if ($duplicates.Count -eq 0) {
    Write-Host "Дублирующиеся селекторы не найдены!"
    exit 0
}

foreach ($duplicate in $duplicates) {
    Write-Host "  - $($duplicate.Key) (встречается $($duplicate.Value.Count) раз)"
}

# Простое решение - удаляем дублирующиеся селекторы, оставляя последний
$newContent = $content

# Обрабатываем каждый дублирующийся селектор
foreach ($duplicate in $duplicates) {
    $selector = $duplicate.Key
    $positions = $duplicate.Value
    
    # Находим все блоки этого селектора
    $blocks = @()
    foreach ($pos in $positions) {
        # Находим конец блока
        $startPos = $content.IndexOf('{', $pos) + 1
        $braceCount = 1
        $endPos = $startPos
        
        while ($endPos -lt $content.Length -and $braceCount -gt 0) {
            $char = $content[$endPos]
            if ($char -eq '{') { $braceCount++ }
            if ($char -eq '}') { $braceCount-- }
            $endPos++
        }
        
        if ($braceCount -eq 0) {
            $fullBlock = $content.Substring($pos, $endPos - $pos)
            $properties = $content.Substring($startPos, $endPos - $startPos - 1).Trim()
            $blocks += @{
                FullBlock  = $fullBlock
                Properties = $properties
                StartPos   = $pos
                EndPos     = $endPos
            }
        }
    }
    
    if ($blocks.Count -gt 1) {
        # Объединяем свойства
        $allProperties = @{}
        
        foreach ($block in $blocks) {
            $props = $block.Properties -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
            foreach ($prop in $props) {
                if ($prop -match '^\s*([^:]+):\s*(.+)\s*$') {
                    $key = $Matches[1].Trim()
                    $value = $Matches[2].Trim()
                    $allProperties[$key] = $value
                }
            }
        }
        
        # Создаем новый блок
        $newProperties = ($allProperties.GetEnumerator() | ForEach-Object { "  $($_.Key): $($_.Value);" }) -join "`n"
        $newBlock = "$selector {`n$newProperties`n}"
        
        # Удаляем все старые блоки (начиная с конца, чтобы не сбить позиции)
        $sortedBlocks = $blocks | Sort-Object StartPos -Descending
        foreach ($block in $sortedBlocks) {
            $newContent = $newContent.Remove($block.StartPos, $block.EndPos - $block.StartPos)
        }
        
        # Добавляем новый блок в конец
        $newContent += "`n`n$newBlock"
    }
}

# Убираем лишние пустые строки
$newContent = $newContent -replace '\n\s*\n\s*\n', "`n`n"

# Сохраняем результат
Set-Content -Path $OutputFile -Value $newContent -Encoding UTF8 -NoNewline

Write-Host "Исправленный файл сохранен: $OutputFile"
Write-Host "Обработано дублирующихся селекторов: $($duplicates.Count)"