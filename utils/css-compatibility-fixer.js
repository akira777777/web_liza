/**
 * CSS Compatibility Fixer
 * Автоматическое исправление проблем совместимости CSS
 * Интегрируется с модульной архитектурой PortfolioApp
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Динамический импорт performance модуля если доступен
let performance = null;
try {
  const perfModule = await import('../modules/performance.js');
  performance = new perfModule.PerformanceModule();
} catch (error) {
  // eslint-disable-next-line no-console
  console.log('[INFO] Running without performance module');
}

class CSSCompatibilityFixer {
  constructor() {
    // Известные проблемы совместимости CSS
    this.fixes = {
      'min-height: auto': 'min-height: initial',
      'top: auto': 'top: initial',
      'bottom: auto': 'bottom: initial',
      'left: auto': 'left: initial',
      'right: auto': 'right: initial'
    };

    // Браузерные префиксы для критичных свойств
    this.browserPrefixes = {
      'backdrop-filter': ['-webkit-backdrop-filter'],
      'user-select': ['-webkit-user-select', '-moz-user-select', '-ms-user-select'],
      'appearance': ['-webkit-appearance', '-moz-appearance'],
      'transform': ['-webkit-transform', '-ms-transform'],
      'transition': ['-webkit-transition'],
      'animation': ['-webkit-animation'],
      'box-sizing': ['-webkit-box-sizing', '-moz-box-sizing']
    };

    this.projectRoot = path.resolve(__dirname, '..');
  }

  /**
   * Исправление всех CSS файлов в проекте
   */
  async fixAllCSSFiles() {
    const startTime = Date.now();
    const results = [];

    try {
      // Получаем все CSS файлы
      const cssFiles = await this.findCSSFiles();

      if (performance) {
        performance.recordMetric('css-files-found', cssFiles.length);
      }

      // eslint-disable-next-line no-console
      console.log(`[INFO] Found ${cssFiles.length} CSS files to process`);

      // Обрабатываем каждый файл
      for (const filePath of cssFiles) {
        try {
          const result = await this.fixCSSFile(filePath);
          results.push(result);

          if (result.fixed) {
            // eslint-disable-next-line no-console
            console.log(`[SUCCESS] Fixed: ${result.filePath}`);
            // eslint-disable-next-line no-console
            console.log(`  - Changes: ${result.changes.length}`);
          } else if (result.error) {
            // eslint-disable-next-line no-console
            console.log(`[ERROR] Failed to fix: ${result.filePath}`);
            // eslint-disable-next-line no-console
            console.log(`  - Error: ${result.error}`);
          } else {
            // eslint-disable-next-line no-console
            console.log(`[OK] No changes needed: ${result.filePath}`);
          }
        } catch (error) {
          if (performance) {
            performance.recordError('css-fix-error', {
              file: filePath,
              error: error.message
            });
          }
          results.push({
            filePath,
            fixed: false,
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;

      if (performance) {
        performance.recordMetric('css-fix-duration', duration);
      }

      return {
        totalFiles: cssFiles.length,
        fixed: results.filter(r => r.fixed).length,
        errors: results.filter(r => r.error).length,
        duration,
        results
      };
    } catch (error) {
      if (performance) {
        performance.recordError('css-fix-all-error', error);
      }
      throw error;
    }
  }

  /**
   * Поиск всех CSS файлов в проекте
   */
  async findCSSFiles() {
    const cssFiles = [];
    const excludeDirs = ['node_modules', '.git', 'dist', 'reports'];

    async function scanDirectory(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Пропускаем исключенные директории
            if (!excludeDirs.includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.name.endsWith('.css')) {
            cssFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Игнорируем ошибки доступа к директориям
      }
    }

    await scanDirectory(this.projectRoot);
    return cssFiles;
  }

  /**
   * Исправление отдельного CSS файла
   */
  async fixCSSFile(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      const originalContent = content;
      const changes = [];

      // 1. Исправляем известные проблемы
      for (const [problematic, fix] of Object.entries(this.fixes)) {
        if (content.includes(problematic)) {
          const regex = new RegExp(problematic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          const matches = content.match(regex);

          if (matches) {
            content = content.replace(regex, fix);
            changes.push({
              type: 'fix',
              from: problematic,
              to: fix,
              count: matches.length
            });
          }
        }
      }

      // 2. Добавляем браузерные префиксы где необходимо
      for (const [property, prefixes] of Object.entries(this.browserPrefixes)) {
        // Ищем свойство без префикса
        const propertyRegex = new RegExp(`(^|\\n)(\\s*)${property}\\s*:\\s*([^;]+);`, 'gm');
        let modified = false;
        let addedCount = 0;

        content = content.replace(propertyRegex, (match, lineStart, indent, value) => {
          // Проверяем, есть ли уже хотя бы один префикс для этого свойства рядом
          const beforeMatch = content.substring(0, content.indexOf(match));
          const lines = beforeMatch.split('\n');
          const contextLines = lines.slice(-3); // Проверяем предыдущие 3 строки

          // Если уже есть префикс, не добавляем снова
          const hasPrefixNearby = prefixes.some(prefix =>
            contextLines.some(line => line.includes(`${prefix}:`))
          );

          if (hasPrefixNearby) {
            return match; // Не модифицируем
          }

          // Добавляем префиксы
          const prefixedProps = prefixes
            .map(prefix => `\n${indent}${prefix}: ${value};`)
            .join('');

          modified = true;
          addedCount++;

          return `${prefixedProps}\n${indent}${property}: ${value};`;
        });

        if (modified) {
          changes.push({
            type: 'prefix',
            property,
            prefixes: prefixes.join(', '),
            count: addedCount
          });
        }
      }

      // 3. Сохраняем изменения если были
      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf8');

        return {
          filePath: path.relative(this.projectRoot, filePath),
          fixed: true,
          changes
        };
      }

      return {
        filePath: path.relative(this.projectRoot, filePath),
        fixed: false,
        changes: []
      };
    } catch (error) {
      return {
        filePath: path.relative(this.projectRoot, filePath),
        fixed: false,
        error: error.message
      };
    }
  }

  /**
   * Валидация CSS файла без исправления
   */
  async validateCSSFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const issues = [];

      // Проверяем известные проблемы
      for (const problematic of Object.keys(this.fixes)) {
        if (content.includes(problematic)) {
          issues.push({
            type: 'compatibility',
            property: problematic,
            line: this.getLineNumber(content, problematic),
            severity: 'error'
          });
        }
      }

      // Проверяем отсутствие браузерных префиксов
      for (const property of Object.keys(this.browserPrefixes)) {
        const regex = new RegExp(`\\s+${property}:\\s*[^;]+;`, 'g');
        const matches = content.match(regex);

        if (matches) {
          const prefixRegex = new RegExp(`\\s+-\\w+-${property}:`);
          const hasPrefix = prefixRegex.test(content);

          if (!hasPrefix) {
            issues.push({
              type: 'missing-prefix',
              property,
              line: this.getLineNumber(content, matches[0]),
              severity: 'warning'
            });
          }
        }
      }

      return {
        filePath,
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        filePath,
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Получает номер строки для текста в файле
   */
  getLineNumber(content, searchText) {
    const index = content.indexOf(searchText);
    if (index === -1) return 0;

    const lines = content.substring(0, index).split('\n');
    return lines.length;
  }
}

// Экспорт для использования в других модулях PortfolioApp
export { CSSCompatibilityFixer };

// CLI запуск (только для утилитарных скриптов)
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new CSSCompatibilityFixer();

  fixer
    .fixAllCSSFiles()
    .then(results => {
      // eslint-disable-next-line no-console
      console.log('\n[SUCCESS] CSS compatibility fixes completed');
      // eslint-disable-next-line no-console
      console.log(`[INFO] Total files: ${results.totalFiles}`);
      // eslint-disable-next-line no-console
      console.log(`[INFO] Fixed: ${results.fixed}`);
      // eslint-disable-next-line no-console
      console.log(`[INFO] Errors: ${results.errors}`);
      // eslint-disable-next-line no-console
      console.log(`[INFO] Duration: ${results.duration}ms`);
      process.exit(0);
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error('[ERROR] CSS fix failed:', error.message);
      process.exit(1);
    });
}
