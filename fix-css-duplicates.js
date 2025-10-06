const fs = require('fs')

function fixCSSDuplicates(inputFile, outputFile = null) {
  if (!outputFile) {
    outputFile = inputFile
  }

  console.log(`Анализ файла: ${inputFile}`)

  // Читаем файл
  const content = fs.readFileSync(inputFile, 'utf8')

  // Простой regex для поиска CSS блоков
  const cssBlockRegex = /([^{}]+)\s*\{([^{}]*)\}/g
  const matches = [...content.matchAll(cssBlockRegex)]

  // Группируем по селекторам
  const selectors = {}

  matches.forEach(match => {
    const selector = match[1].trim()
    const properties = match[2].trim()

    if (!selectors[selector]) {
      selectors[selector] = []
    }
    selectors[selector].push(properties)
  })

  // Находим дублирующиеся селекторы
  const duplicates = Object.entries(selectors).filter(
    ([, props]) => props.length > 1
  )

  console.log(`Найдено дублирующихся селекторов: ${duplicates.length}`)

  if (duplicates.length === 0) {
    console.log('Дублирующиеся селекторы не найдены!')
    return 0
  }

  duplicates.forEach(([selector, props]) => {
    console.log(`  - ${selector} (встречается ${props.length} раз)`)
  })

  // Создаем новый контент, удаляя дублирующиеся селекторы
  let newContent = content

  // Для каждого дублирующегося селектора
  for (const [selector, propertyBlocks] of duplicates) {
    // Объединяем все свойства
    const allProperties = {}

    propertyBlocks.forEach(block => {
      const props = block
        .split(';')
        .map(p => p.trim())
        .filter(p => p)
      props.forEach(prop => {
        if (prop.includes(':')) {
          const [key, ...valueParts] = prop.split(':')
          const value = valueParts.join(':').trim()
          allProperties[key.trim()] = value
        }
      })
    })

    // Создаем новый блок CSS
    const newProperties = Object.entries(allProperties)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')

    const newBlock = `${selector} {\n${newProperties}\n}`

    // Удаляем все старые вхождения этого селектора
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const selectorRegex = new RegExp(`${escapedSelector}\\s*\\{[^{}]*\\}`, 'g')
    newContent = newContent.replace(selectorRegex, '')

    // Добавляем новый блок в конец
    newContent += `\n\n${newBlock}`
  }

  // Убираем лишние пустые строки
  newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n')

  // Сохраняем результат
  fs.writeFileSync(outputFile, newContent, 'utf8')

  console.log(`Исправленный файл сохранен: ${outputFile}`)
  console.log(`Обработано дублирующихся селекторов: ${duplicates.length}`)

  return duplicates.length
}

// Проверяем аргументы командной строки
if (process.argv.length < 3) {
  console.log(
    'Использование: node fix-css-duplicates.js <input_file> [output_file]'
  )
  process.exit(1)
}

const inputFile = process.argv[2]
const outputFile = process.argv[3] || null

try {
  const duplicatesFixed = fixCSSDuplicates(inputFile, outputFile)
  console.log(`Успешно исправлено ${duplicatesFixed} дублирующихся селекторов!`)
} catch (error) {
  console.error(`Ошибка: ${error.message}`)
  process.exit(1)
}
