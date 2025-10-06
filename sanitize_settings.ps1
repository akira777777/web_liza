$tailPath = 'C:/Users/artem/Рабочий стол/settings_tail.txt'
$lines = Get-Content -LiteralPath $tailPath

# Insert chat.editing.alwaysSaveWithGeneratedChanges after files.autoSaveDelay
$insertLine = ($lines | Select-String -Pattern '"files.autoSaveDelay"' | Select-Object -First 1)
if ($insertLine) {
    $insertIndex = $insertLine.LineNumber
    $arrayList = New-Object System.Collections.ArrayList
    $arrayList.AddRange($lines)
    $arrayList.Insert($insertIndex, '    "chat.editing.alwaysSaveWithGeneratedChanges": true,') | Out-Null
    $lines = [string[]]$arrayList
}

# Remove trailing comma from workbench.enableExperiments line
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '"workbench.enableExperiments"') {
        $lines[$i] = $lines[$i].TrimEnd().TrimEnd(',')
    }
}

# Build final lines with braces
$finalLines = @('{') + $lines + @('}')

$finalPath = 'C:/Users/artem/AppData/Roaming/Code/User/settings.json'
Set-Content -LiteralPath $finalPath -Value $finalLines -Encoding UTF8
