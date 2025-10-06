$pattern = '"([^"\\]+)"\s*:'
$matches = Select-String -Path 'C:/Users/artem/Рабочий стол/settings_tail.txt' -Pattern $pattern -AllMatches
$keys = foreach ($match in $matches) { foreach ($m in $match.Matches) { $m.Groups[1].Value } }
$keys | Set-Content -Path 'C:/Users/artem/Рабочий стол/settings_tail_keys.txt'
