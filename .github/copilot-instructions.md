# Copilot Instructions for elizaveta-portfolio

## Архитектура и основные компоненты

- Проект — профессиональное портфолио на Vite, с модульной структурой JS и поддержкой PWA.
- Главный файл: `main.js` — точка входа, координирует загрузку и инициализацию модулей.
- Критические модули: `core.js`, `performance.js`, `media-optimized.js`, `library-loader.js`, `utils.js` (в папке `modules/`).
- Вторичные модули (динамически загружаются): `animations.js`, `gallery.js`, `forms.js`.
- Все модули инициализируются через класс `PortfolioApp`.
- Глобальные объекты: `window.PortfolioApp`, `window.app`, `window.LibraryLoader`.

## Важные рабочие процессы

- **Сборка и запуск**:
  - dev-сервер: `npm run dev` (Vite)
  - production build: `npm run build`
  - предпросмотр: `npm run preview`
- **Тестирование**:
  - Playwright: `npm run test`, `npm run test:ui`, `npm run test:debug`
  - MCP server тесты: `node verify-mcp-server.js`, `node simple-mcp-test.js`, `node test-mcp-request.js`, `node mcp-client-test.js`
- **Линтинг и автоформатирование**:
  - JS: `npm run fix:js`, CSS: `npm run fix:css`, Prettier: `npm run format`
  - Все глобальные переменные для внешних библиотек объявлены в `.eslintrc.js`.
- **Оптимизация**:
  - `npm run optimize` — линтинг, форматирование, сборка и анализ бандла.

## Конвенции и паттерны

- Все пути к MCP серверу и его скриптам определяются динамически (см. `verify-mcp-server.js`).
- Ошибки логируются через модуль `performance` и могут отправляться в мониторинг (Sentry, gtag).
- Для кроссплатформенности используются проверки ОС (`os.platform()`), пути не хардкодятся.
- Статусы и ошибки в батниках помечаются префиксами `[OK]`, `[INFO]`, `[SUCCESS]`.
- Консольные предупреждения допустимы в тестовых/утилитарных скриптах.
- Все тестовые и утилитарные скрипты используют единый стиль и обработку ошибок.

## Интеграции и внешние зависимости

- MCP сервер: пакет `@modelcontextprotocol/server-filesystem`, запуск через `start-mcp-server.bat`/`stop-mcp-server.bat`.
- Node.js, npm, Playwright, Vite, Stylelint, Prettier, Sharp, PWA (workbox-window).
- Для анализа бандла: `vite-bundle-analyzer`.
- Для аудита: PowerShell-скрипт `audit.ps1`.

## Примеры ключевых файлов

- `main.js` — архитектура приложения, обработка ошибок, динамическая загрузка модулей.
- `verify-mcp-server.js` — динамическое определение путей, проверка установки MCP сервера.
- `stop-mcp-server.bat` — единый скрипт остановки сервера с расширенной обработкой статусов.
- `mcp-server-setup.md` — подробная документация по установке и тестированию MCP сервера.
- `WORKSPACE_FIXES.md` — история и рекомендации по улучшению рабочего пространства.

## Рекомендации для AI-агентов

- Всегда используйте динамическое определение путей и проверку ОС.
- Для тестов и утилит допускается консольный вывод.
- Следуйте единому стилю ошибок и статусов.
- Для новых интеграций и скриптов — ориентируйтесь на паттерны из `main.js` и `verify-mcp-server.js`.

---

Если какие-либо разделы или паттерны не ясны — уточните у пользователя для доработки инструкции.
