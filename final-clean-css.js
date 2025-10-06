const fs = require('fs')

// Финальная очистка CSS файла
function finalCleanCSS(inputFile) {
  console.log(`Финальная очистка файла: ${inputFile}`)

  let content = fs.readFileSync(inputFile, 'utf8')

  // 1. Удаляем все пустые блоки
  content = content.replace(/[^{}]+\{\s*\}/g, '')

  // 2. Удаляем блоки с только комментариями или пробелами
  content = content.replace(/[^{}]+\{\s*\/\*[^}]*\*\/\s*\}/g, '')

  // 3. Убираем лишние пустые строки
  content = content.replace(/\n\s*\n\s*\n+/g, '\n\n')

  // 4. Исправляем конкретные дублирующиеся селекторы
  const duplicateSelectors = [
    '.hero-image',
    "[data-theme='dark'] .navbar",
    '.portfolio-item',
    '.portfolio-filters',
    '.scroll-progress-bar',
    '.service-item',
    '.preloader.fade-out'
  ]

  for (const selector of duplicateSelectors) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(
      `(${escapedSelector}\\s*\\{[^}]*\\})([\\s\\S]*?)(${escapedSelector}\\s*\\{[^}]*\\})`,
      'g'
    )

    content = content.replace(regex, (match, first, middle, second) => {
      // Объединяем свойства из обоих блоков
      const firstProps = first.match(/\{([^}]*)\}/)[1]
      const secondProps = second.match(/\{([^}]*)\}/)[1]

      const allProps = new Set()
      const propsMap = new Map()

      // Парсим свойства из первого блока
      firstProps.split(';').forEach(prop => {
        const trimmed = prop.trim()
        if (trimmed && trimmed.includes(':')) {
          const [key, value] = trimmed.split(':')
          propsMap.set(key.trim(), value.trim())
        }
      })

      // Парсим свойства из второго блока (перезаписывают первый)
      secondProps.split(';').forEach(prop => {
        const trimmed = prop.trim()
        if (trimmed && trimmed.includes(':')) {
          const [key, value] = trimmed.split(':')
          propsMap.set(key.trim(), value.trim())
        }
      })

      // Создаем объединенный блок
      const mergedProps = Array.from(propsMap.entries())
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n')

      return `${middle}${selector} {\n${mergedProps}\n}`
    })
  }

  // 5. Убираем оставшиеся пустые строки
  content = content.replace(/\n\s*\n\s*\n+/g, '\n\n')
  content = `${content.trim()}\n`

  fs.writeFileSync(inputFile, content, 'utf8')
  console.log('Файл очищен от пустых блоков и дублирующихся селекторов')
}

if (process.argv.length < 3) {
  console.log('Использование: node final-clean-css.js <input_file>')
  process.exit(1)
}

try {
  finalCleanCSS(process.argv[2])
  console.log('Очистка завершена успешно!')
} catch (error) {
  console.error(`Ошибка: ${error.message}`)
  process.exit(1)
}
