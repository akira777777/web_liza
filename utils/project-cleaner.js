/**
 * Project Cleaner - Утилита очистки проекта портфолио
 * Удаляет или перемещает файлы, не относящиеся к web портфолио
 * 
 * Использование:
 * node utils/project-cleaner.js --dry-run  # Анализ проекта
 * node utils/project-cleaner.js            # Выполнение очистки
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectCleaner {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.backupDir = path.join(this.projectRoot, '_archive');
    this.itemsToRemove = [];
    this.itemsToMove = [];
    this.summary = {
      removed: [],
      moved: [],
      errors: []
    };
  }

  /**
   * Основной метод очистки проекта
   */
  async cleanProject() {
    try {
      this.logInfo('🧹 Starting portfolio project cleanup...');
      
      // Анализируем структуру проекта
      await this.analyzeProject();
      
      // Создаем архивную папку
      await this.createBackupDirectory();
      
      // Выполняем очистку
      await this.executeCleanup();
      
      // Генерируем отчет
      const report = await this.generateReport();
      
      this.logInfo('✅ Project cleanup completed successfully!');
      return report;
      
    } catch (error) {
      this.logError('❌ Cleanup failed', error);
      throw error;
    }
  }

  /**
   * Анализ структуры проекта
   */
  async analyzeProject() {
    this.logInfo('🔍 Analyzing project structure...');
    
    // Файлы для удаления (не относятся к web портфолио)
    const filesToRemove = [
      // MCP Server файлы
      'blackbox_mcp_settings.json',
      'blackbox-lm-studio-config.json',
      'lm-studio-setup-guide.md',
      
      // Временные скрипты оптимизации CSS
      'advanced-fix-css.js',
      'final-clean-css.js',
      'fix-css-duplicates.js',
      
      // Дублирующие модули
      'script-enhanced.js',
      'main-browser.js',
      
      // Временные файлы настроек
      'settings_tail.txt',
      'settings_tail_keys.txt',
      'favicon-inline.txt',
      'Untitled-1.ini',
      
      // Временные скрипты работы с изображениями
      'copy-new-images.ps1',
      'create-variants.ps1',
      'download.ps1',
      'extract_keys.ps1',
      'extract_objects.js',
      'extract_tail_keys.ps1',
      'rename-images.ps1',
      'sanitize_settings.ps1',
      
      // Временные Java файлы
      'TestJava$1.class'
    ];

    // Файлы для перемещения в архив (могут пригодиться для разработки)
    const filesToMove = [
      // Документация разработки
      'mcp-server-setup.md',
      'WORKSPACE_FIXES.md',
      
      // Скрипты PowerShell
      'audit.ps1',
      'optimize-portfolio.ps1',
      'optimize-portfolio-images.ps1',
      
      // Тестовые MCP файлы
      'verify-mcp-server.js',
      'simple-mcp-test.js',
      'test-mcp-request.js',
      'mcp-client-test.js',
      'test-mcp-server.js',
      
      // Батники
      'launch.bat',
      'create-pr.bat',
      'setup-remote.bat',
      'start-mcp-server.bat',
      'stop-mcp-server.bat',
      'test-lm-studio.bat',
      
      // Временные отчеты и тесты
      'reports/',
      'test-create-file.js',
      'test-lm-studio-connection.js',
      
      // Дублирующие модули (на всякий случай)
      'modules/forms-browser.js',
      'modules/gallery-browser.js',
      
      // Shell скрипты
      'omni-install.sh'
    ];

    // Фильтруем существующие файлы
    for (const file of filesToRemove) {
      if (await this.fileExists(file)) {
        this.itemsToRemove.push(file);
      }
    }

    for (const file of filesToMove) {
      if (await this.fileExists(file)) {
        this.itemsToMove.push(file);
      }
    }

    this.logInfo(`📊 Analysis complete: ${this.itemsToRemove.length} files to remove, ${this.itemsToMove.length} files to archive`);
  }

  /**
   * Создание директории для архива
   */
  async createBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Создаем README для архива
      const archiveReadme = `# Архив файлов портфолио

Дата создания: ${new Date().toISOString()}
Операционная система: ${os.platform()} ${os.arch()}

## Содержимое

Файлы, перемещенные из основной папки проекта портфолио:

- Документация разработки (mcp-server-setup.md, WORKSPACE_FIXES.md)
- Скрипты PowerShell для оптимизации
- MCP server тестовые файлы
- Временные batch файлы
- Дублирующие модули
- Отчеты тестирования

## Восстановление

Для восстановления файла скопируйте его обратно в корень проекта:

\`\`\`bash
cp _archive/path/to/file ./path/to/file
\`\`\`

## Безопасное удаление

Если проект работает стабильно в течение месяца, архив можно удалить.

## Структура проекта после очистки

\`\`\`
web_liza/
├── index.html                 # Главная страница
├── main.js                    # Основной модуль приложения
├── styles-minimalist.css      # Главные стили
├── modules/                   # Модульная архитектура
│   ├── core.js
│   ├── performance.js
│   ├── media-optimized.js
│   ├── forms.js
│   ├── gallery.js
│   └── animations.js
├── assets/                    # Ресурсы
├── css/                       # Дополнительные стили
├── sw.js                      # Service Worker
├── package.json               # Зависимости
├── vite.config.js            # Конфигурация сборки
└── _archive/                 # Этот архив
\`\`\`
`;
      
      await fs.writeFile(path.join(this.backupDir, 'README.md'), archiveReadme, 'utf8');
      this.logInfo('📁 Backup directory created');
      
    } catch (error) {
      throw new Error(`Failed to create backup directory: ${error.message}`);
    }
  }

  /**
   * Выполнение очистки
   */
  async executeCleanup() {
    this.logInfo('🚀 Executing cleanup...');
    
    // Перемещаем файлы в архив
    for (const item of this.itemsToMove) {
      try {
        await this.moveToArchive(item);
        this.summary.moved.push(item);
        this.logInfo(`📦 Moved: ${item}`);
      } catch (error) {
        this.summary.errors.push({ item, error: error.message, action: 'move' });
        this.logError(`Failed to move ${item}`, error);
      }
    }

    // Удаляем временные файлы
    for (const item of this.itemsToRemove) {
      try {
        await this.removeItem(item);
        this.summary.removed.push(item);
        this.logInfo(`🗑️  Removed: ${item}`);
      } catch (error) {
        this.summary.errors.push({ item, error: error.message, action: 'remove' });
        this.logError(`Failed to remove ${item}`, error);
      }
    }
  }

  /**
   * Перемещение файла в архив
   */
  async moveToArchive(itemPath) {
    const sourcePath = path.join(this.projectRoot, itemPath);
    const targetPath = path.join(this.backupDir, itemPath);
    const targetDir = path.dirname(targetPath);

    // Создаем директорию если нужно
    await fs.mkdir(targetDir, { recursive: true });

    // Перемещаем файл или папку
    const stat = await fs.stat(sourcePath);
    
    if (stat.isDirectory()) {
      await this.copyDirectory(sourcePath, targetPath);
      await fs.rm(sourcePath, { recursive: true, force: true });
    } else {
      await fs.copyFile(sourcePath, targetPath);
      await fs.unlink(sourcePath);
    }
  }

  /**
   * Копирование директории
   */
  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
    
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  /**
   * Удаление элемента
   */
  async removeItem(itemPath) {
    const fullPath = path.join(this.projectRoot, itemPath);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      await fs.rm(fullPath, { recursive: true, force: true });
    } else {
      await fs.unlink(fullPath);
    }
  }

  /**
   * Проверка существования файла
   */
  async fileExists(filePath) {
    try {
      await fs.access(path.join(this.projectRoot, filePath));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Генерация отчета
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProcessed: this.itemsToRemove.length + this.itemsToMove.length,
        moved: this.summary.moved.length,
        removed: this.summary.removed.length,
        errors: this.summary.errors.length
      },
      details: {
        moved: this.summary.moved,
        removed: this.summary.removed,
        errors: this.summary.errors
      },
      recommendations: this.getRecommendations()
    };

    // Сохраняем отчет
    const reportPath = path.join(this.backupDir, 'cleanup-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

    this.logInfo('📋 Report saved to _archive/cleanup-report.json');
    return report;
  }

  /**
   * Получение рекомендаций
   */
  getRecommendations() {
    const recommendations = [];

    if (this.summary.errors.length > 0) {
      recommendations.push('⚠️  Проверьте ошибки и решите их вручную');
    }

    recommendations.push('🧪 Протестируйте проект после очистки: npm run dev');
    recommendations.push('🏗️  Убедитесь, что сборка работает: npm run build');
    recommendations.push('🔍 Запустите тесты: npm run test');

    if (this.summary.moved.length > 0) {
      recommendations.push(`📦 Архив создан в папке _archive (${this.summary.moved.length} файлов)`);
      recommendations.push('🗑️  Архив можно удалить через месяц если проект стабилен');
    }

    return recommendations;
  }

  /**
   * Сухой запуск (показать что будет сделано)
   */
  async dryRun() {
    this.logInfo('🔍 Dry run - analyzing what will be done...');
    await this.analyzeProject();
    
    const result = {
      willMove: this.itemsToMove,
      willRemove: this.itemsToRemove,
      totalItems: this.itemsToRemove.length + this.itemsToMove.length
    };

    this.logInfo('📊 Dry run results:');
    this.logInfo(`   Files to move to archive: ${result.willMove.length}`);
    this.logInfo(`   Files to remove: ${result.willRemove.length}`);
    this.logInfo(`   Total items: ${result.totalItems}`);

    if (result.willMove.length > 0) {
      this.logInfo('\n📦 Files to move to archive:');
      result.willMove.forEach(file => this.logInfo(`   ${file}`));
    }

    if (result.willRemove.length > 0) {
      this.logInfo('\n🗑️  Files to remove:');
      result.willRemove.forEach(file => this.logInfo(`   ${file}`));
    }

    return result;
  }

  /**
   * Логирование информации
   */
  logInfo(message) {
    console.log(`[INFO] ${message}`);
  }

  /**
   * Логирование ошибок
   */
  logError(message, error) {
    console.error(`[ERROR] ${message}`);
    if (error && error.message) {
      console.error(`[ERROR] ${error.message}`);
    }
  }
}

// CLI запуск
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new ProjectCleaner();
  const isDryRun = process.argv.includes('--dry-run');

  if (isDryRun) {
    cleaner.dryRun()
      .then((result) => {
        console.log('[INFO] Dry run completed successfully');
        console.log(`[INFO] Total files to process: ${result.totalItems}`);
        console.log(`[INFO] Files to move: ${result.willMove.length}`);
        console.log(`[INFO] Files to remove: ${result.willRemove.length}`);
        process.exit(0);
      })
      .catch(error => {
        console.error('[ERROR] Dry run failed:', error.message);
        process.exit(1);
      });
  } else {
    cleaner.cleanProject()
      .then(report => {
        console.log('[SUCCESS] Project cleanup completed successfully!');
        console.log(`[INFO] Moved: ${report.summary.moved}, Removed: ${report.summary.removed}`);
        if (report.summary.errors > 0) {
          console.log(`[WARNING] Errors: ${report.summary.errors}`);
        }
        console.log('[INFO] Check _archive/cleanup-report.json for detailed report');
        process.exit(0);
      })
      .catch(error => {
        console.error('[ERROR] Cleanup failed:', error.message);
        process.exit(1);
      });
  }
}

export { ProjectCleaner };