const fs = require('fs')
const text = fs.readFileSync(
  'C:/Users/artem/AppData/Roaming/Code/User/settings.json',
  'utf8'
)
const matches = text.match(/{[\s\S]*?}/g)
if (!matches) {
  console.error('No matches')
  process.exit(1)
}
fs.writeFileSync(
  'C:/Users/artem/Рабочий стол/settings_matches.txt',
  matches.map((m, i) => `--- MATCH ${i} ---\n${m}\n`).join('\n')
)
