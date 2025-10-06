# 🧹 Руководство по очистке проекта портфолио

Это руководство поможет вам безопасно удалить файлы, не относящиеся к основному web портфолио, освободив место и упростив структуру проекта.

## 📋 Обзор

Утилита очистки проекта автоматически анализирует файлы и разделяет их на:

- **Файлы для удаления** - временные скрипты, настройки разработки
- **Файлы для архивирования** - документация, MCP серверы, тестовые скрипты  
- **Файлы портфолио** - остаются нетронутыми

## 🚀 Быстрый старт

### Вариант 1: Batch скрипт (рекомендуется для Windows)

```batch
# Двойной клик или через командную строку
cleanup-project.bat
```

### Вариант 2: PowerShell (расширенные возможности)

```powershell
# Анализ проекта без изменений
.\cleanup-project.ps1 -DryRun

# Интерактивная очистка
.\cleanup-project.ps1

# Автоматическая очистка без подтверждений
.\cleanup-project.ps1 -Force

# Показать справку
.\cleanup-project.ps1 -Help
```

### Вариант 3: Node.js напрямую

```bash
# Анализ проекта
node utils/project-cleaner.js --dry-run

# Выполнение очистки
node utils/project-cleaner.js
```

## 📊 Что будет сделано

### 🗑️ Файлы для удаления (безвозвратно)

**MCP Server настройки:**
- `blackbox_mcp_settings.json`
- `blackbox-lm-studio-config.json`
- `lm-studio-setup-guide.md`

**Временные скрипты оптимизации CSS:**
- `advanced-fix-css.js`
- `final-clean-css.js`
- `fix-css-duplicates.js`

**Дублирующие модули:**
- `script-enhanced.js` (заменен модульной архитектурой)
- `main-browser.js` (оставляем только `main.js`)

**Временные файлы:**
- `settings_tail.txt`
- `favicon-inline.txt`
- `Untitled-1.ini`

**PowerShell скрипты работы с изображениями:**
- `copy-new-images.ps1`
- `create-variants.ps1`
- `download.ps1`
- `extract_keys.ps1`
- `rename-images.ps1`

### 📦 Файлы для архивирования (в папку `_archive`)

**Документация разработки:**
- `mcp-server-setup.md`
- `WORKSPACE_FIXES.md`

**PowerShell скрипты оптимизации:**
- `audit.ps1`
- `optimize-portfolio.ps1`
- `optimize-portfolio-images.ps1`

**MCP тестовые файлы:**
- `verify-mcp-server.js`
- `simple-mcp-test.js`
- `test-mcp-request.js`
- `test-lm-studio-connection.js`

**Batch файлы:**
- `launch.bat`
- `create-pr.bat`
- `start-mcp-server.bat`
- `stop-mcp-server.bat`

**Отчеты и тесты:**
- `reports/` (папка целиком)
- Дублирующие модули (`modules/forms-browser.js`, `modules/gallery-browser.js`)

### ✅ Файлы портфолио (остаются нетронутыми)

- `index.html` - главная страница
- `main.js` - основной модуль приложения
- `styles-minimalist.css` - главные стили
- `modules/` - модульная архитектура (core.js, performance.js, forms.js, gallery.js, animations.js)
- `assets/` - изображения и ресурсы
- `css/` - дополнительные стили
- `sw.js` - Service Worker
- `package.json` - зависимости проекта
- `vite.config.js` - конфигурация сборки

## 🔒 Безопасность

### Меры предосторожности

1. **Автоматическое архивирование** - важные файлы не удаляются, а перемещаются в `_archive/`
2. **Dry-run режим** - позволяет посмотреть что будет сделано без изменений
3. **Подробные отчеты** - все операции документируются
4. **Восстановление** - любой файл можно вернуть из архива

### Архив (_archive)

Все перемещенные файлы сохраняются в папке `_archive/` с:

- **README.md** - описание содержимого архива
- **cleanup-report.json** - подробный отчет операций  
- **Структура папок** - сохраняется оригинальная организация

## 📋 Пошаговый процесс

### Шаг 1: Анализ проекта

```bash
# Посмотреть что будет сделано
.\cleanup-project.ps1 -DryRun
```

Результат:
```
🔍 Dry run - analyzing what will be done...
📊 Analysis complete: 15 files to remove, 12 files to archive

📦 Files to move to archive:
   mcp-server-setup.md
   WORKSPACE_FIXES.md
   verify-mcp-server.js
   ...

🗑️ Files to remove:
   blackbox_mcp_settings.json
   advanced-fix-css.js
   script-enhanced.js
   ...
```

### Шаг 2: Выполнение очистки

```bash
# Интерактивная очистка с подтверждениями
.\cleanup-project.ps1
```

Процесс:
1. Анализ структуры проекта
2. Показ списка файлов для обработки
3. Запрос подтверждения пользователя
4. Создание архивной папки
5. Перемещение файлов в архив
6. Удаление временных файлов
7. Генерация отчета

### Шаг 3: Проверка результата

```bash
# Тестирование портфолио
npm run dev      # Запуск dev сервера
npm run build    # Проверка сборки
npm run test     # Запуск тестов
```

## 🔄 Восстановление файлов

### Восстановление одного файла

```bash
# Windows
copy "_archive\path\to\file" ".\path\to\file"

# PowerShell
Copy-Item "_archive/path/to/file" "./path/to/file"
```

### Восстановление папки

```powershell
# Восстановить всю папку reports
Copy-Item "_archive/reports" "./" -Recurse
```

### Массовое восстановление

```powershell
# Восстановить все MCP файлы
Get-ChildItem "_archive" -Filter "*mcp*" -Recurse | ForEach-Object {
    Copy-Item $_.FullName "./"
}
```

## 📊 Структура проекта после очистки

```
web_liza/
├── 📄 index.html                    # Главная страница портфолио
├── 🟨 main.js                       # Основной JavaScript модуль
├── 🎨 styles-minimalist.css         # Главные стили
├── 📁 modules/                      # Модульная архитектура
│   ├── core.js                      # Ядро приложения
│   ├── performance.js               # Мониторинг производительности
│   ├── media-optimized.js           # Оптимизация медиа
│   ├── forms.js                     # Обработка форм
│   ├── gallery.js                   # Галерея изображений
│   └── animations.js                # Анимации
├── 📁 assets/                       # Ресурсы портфолио
│   └── images/
├── 📁 css/                          # Дополнительные стили
│   └── media-styles.css
├── ⚙️ package.json                  # Зависимости Node.js
├── ⚙️ vite.config.js               # Конфигурация Vite
├── 🔧 sw.js                        # Service Worker (PWA)
├── 📦 _archive/                     # Архив перемещенных файлов
│   ├── README.md                    # Описание архива
│   ├── cleanup-report.json          # Отчет очистки
│   ├── mcp-server-setup.md          # Документация MCP
│   ├── WORKSPACE_FIXES.md           # История исправлений
│   └── ...                          # Другие архивированные файлы
└── 🛠️ utils/                       # Утилиты проекта
    └── project-cleaner.js           # Утилита очистки
```

## ⚠️ Важные замечания

### Что НЕ будет затронуто

- ✅ Все файлы в `node_modules/`
- ✅ Файлы в `.git/`
- ✅ Сгенерированные файлы в `dist/`
- ✅ Основные файлы портфолио
- ✅ Конфигурационные файлы (.eslintrc, .prettierrc)

### Рекомендации после очистки

1. **Немедленная проверка:**
   ```bash
   npm run dev
   ```

2. **Проверка сборки:**
   ```bash
   npm run build
   ```

3. **Тестирование функций:**
   - Загрузка страницы
   - Работа галереи
   - Отправка форм
   - Мобильная версия

4. **Удаление архива** (через месяц стабильной работы):
   ```bash
   Remove-Item "_archive" -Recurse -Force
   ```

## 🆘 Устранение проблем

### Ошибка "Access denied"

```powershell
# Запустить PowerShell как администратор
Start-Process PowerShell -Verb RunAs
```

### Файлы используются другими процессами

1. Закрыть все редакторы кода
2. Остановить dev серверы (`Ctrl+C`)
3. Закрыть браузеры с проектом
4. Повторить очистку

### Восстановление после ошибок

```bash
# Откатить все изменения из архива
Copy-Item "_archive/*" "./" -Recurse -Force
```

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте `_archive/cleanup-report.json` для деталей
2. Используйте dry-run режим для анализа
3. Восстановите нужные файлы из архива
4. Проверьте права доступа к файлам

---

**Удачной очистки! 🧹✨**