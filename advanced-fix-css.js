const fs = require('fs')

function advancedFixCSSDuplicates(inputFile, outputFile = null) {
  if (!outputFile) {
    outputFile = inputFile
  }

  console.log(`Продвинутый анализ файла: ${inputFile}`)

  // Читаем файл
  let content = fs.readFileSync(inputFile, 'utf8')

  // Удаляем пустые блоки и лишние пробелы
  content = content.replace(/[^{}]+\{\s*\}/g, '') // Удаляем пустые блоки
  content = content.replace(/\n\s*\n\s*\n+/g, '\n\n') // Убираем лишние пустые строки

  // Более точный regex для CSS блоков
  const cssBlockRegex = /([^{}]+?)\s*\{([^{}]*?)\}/gs
  const matches = [...content.matchAll(cssBlockRegex)]

  // Группируем по селекторам
  const selectors = new Map()

  matches.forEach((match, index) => {
    const selector = match[1].trim().replace(/\s+/g, ' ')
    const properties = match[2].trim()

    // Пропускаем пустые блоки
    if (!properties) {
      return
    }

    if (!selectors.has(selector)) {
      selectors.set(selector, [])
    }
    selectors.get(selector).push({
      properties,
      fullMatch: match[0],
      index
    })
  })

  // Находим дублирующиеся селекторы
  const duplicates = Array.from(selectors.entries()).filter(
    ([selector, blocks]) => blocks.length > 1
  )

  console.log(`Найдено дублирующихся селекторов: ${duplicates.length}`)

  if (duplicates.length === 0) {
    console.log('Дублирующиеся селекторы не найдены!')
    return 0
  }

  // Создаем карту для замен
  const replacements = new Map()

  duplicates.forEach(([selector, blocks]) => {
    console.log(`  - ${selector} (встречается ${blocks.length} раз)`)

    // Объединяем все свойства
    const allProperties = new Map()

    blocks.forEach(block => {
      const props = block.properties
        .split(';')
        .map(p => p.trim())
        .filter(p => p)
      props.forEach(prop => {
        if (prop.includes(':')) {
          const colonIndex = prop.indexOf(':')
          const key = prop.substring(0, colonIndex).trim()
          const value = prop.substring(colonIndex + 1).trim()
          allProperties.set(key, value)
        }
      })
    })

    // Создаем новый блок CSS
    const newProperties = Array.from(allProperties.entries())
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')

    const newBlock = `${selector} {\n${newProperties}\n}`

    // Сохраняем первый блок для замены, остальные помечаем для удаления
    blocks.forEach((block, index) => {
      if (index === 0) {
        replacements.set(block.fullMatch, newBlock)
      } else {
        replacements.set(block.fullMatch, '') // Удаляем дублирующийся блок
      }
    })
  })

  // Применяем замены
  let newContent = content
  for (const [oldBlock, newBlock] of replacements) {
    // Экранируем специальные символы для regex
    const escapedOld = oldBlock.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escapedOld, 'g')
    newContent = newContent.replace(regex, newBlock)
  }

  // Убираем лишние пустые строки после замен
  newContent = newContent.replace(/\n\s*\n\s*\n+/g, '\n\n')
  newContent = newContent.replace(/^\s*\n/, '') // Убираем пустые строки в начале
  newContent = newContent.replace(/\n\s*$/, '\n') // Оставляем одну пустую строку в конце

  // Сохраняем результат
  fs.writeFileSync(outputFile, newContent, 'utf8')

  console.log(`Исправленный файл сохранен: ${outputFile}`)
  console.log(`Обработано дублирующихся селекторов: ${duplicates.length}`)

  return duplicates.length
}

// Проверяем аргументы командной строки
if (process.argv.length < 3) {
  console.log(
    'Использование: node advanced-fix-css.js <input_file> [output_file]'
  )
  process.exit(1)
}

const inputFile = process.argv[2]
const outputFile = process.argv[3] || null

try {
  const duplicatesFixed = advancedFixCSSDuplicates(inputFile, outputFile)
  console.log(`Успешно исправлено ${duplicatesFixed} дублирующихся селекторов!`)
} catch (error) {
  console.error(`Ошибка: ${error.message}`)
  process.exit(1)
}
