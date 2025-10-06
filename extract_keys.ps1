$pattern = '"([^"\\]+)"\s*:'
$matches = Select-String -Path 'C:/Users/artem/AppData/Roaming/Code/User/settings.json' -Pattern $pattern -AllMatches
$keys = foreach ($match in $matches) { foreach ($m in $match.Matches) { $m.Groups[1].Value } }
$keys | Set-Content -Path 'C:/Users/artem/AppData/Roaming/Code/User/settings_keys.txt'
