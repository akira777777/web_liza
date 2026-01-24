# Utils Directory

This directory contains utility scripts and tools for the PortfolioApp project.

## Available Utilities

### CSS Compatibility Fixer

**File:** `css-compatibility-fixer.js`

Automatically fixes CSS compatibility issues and adds browser prefixes.

**Features:**
- Fixes known CSS compatibility problems (e.g., `min-height: auto` → `min-height: initial`)
- Adds vendor prefixes for critical properties (webkit, moz, ms)
- Validates CSS files without modifying them
- Integrates with performance monitoring

**Usage:**

```bash
# Run directly
node utils/css-compatibility-fixer.js

# Or use convenience scripts
fix-css-compatibility.bat        # Windows
fix-css-compatibility.ps1        # PowerShell
```

**Documentation:** See [CSS_COMPATIBILITY_GUIDE.md](./CSS_COMPATIBILITY_GUIDE.md)

## Creating New Utilities

When creating new utilities for this project:

1. **Follow the naming convention:** Use kebab-case (e.g., `my-utility.js`)
2. **Export classes/functions:** Make utilities reusable as ES modules
3. **Integrate with performance:** Use the performance module for logging
4. **CLI support:** Add CLI entry point with `import.meta.url` check
5. **Documentation:** Create accompanying markdown documentation
6. **ESLint compliance:** Ensure code passes `npm run fix:js`

### Template

```javascript
/**
 * Utility Name - Description
 * Purpose and main functionality
 */

import { promises as fs } from 'fs';

// Динамический импорт performance модуля если доступен
let performance = null;
try {
  const perfModule = await import('../modules/performance.js');
  performance = new perfModule.PerformanceModule();
} catch (error) {
  console.log('[INFO] Running without performance module');
}

class MyUtility {
  constructor() {
    // Initialize
  }

  async execute() {
    try {
      // Main logic
      if (performance) {
        performance.recordMetric('my-metric', value);
      }
    } catch (error) {
      if (performance) {
        performance.recordError('my-error', error);
      }
      throw error;
    }
  }
}

// Export for use in other modules
export { MyUtility };

// CLI support
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const utility = new MyUtility();
  utility.execute()
    .then(result => {
      console.log('[SUCCESS] Completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('[ERROR] Failed:', error.message);
      process.exit(1);
    });
}
```

## Integration with PortfolioApp

All utilities in this directory are designed to integrate seamlessly with the PortfolioApp architecture:

- Use ES modules (type: module)
- Follow logging conventions: `[SUCCESS]`, `[ERROR]`, `[INFO]`, `[OK]`
- Integrate with `modules/performance.js` when available
- Support both programmatic and CLI usage
- Handle errors gracefully

## Testing Utilities

Before committing new utilities:

1. **Run ESLint:** `npx eslint utils/your-utility.js`
2. **Test CLI:** `node utils/your-utility.js`
3. **Test imports:** Create test script that imports your utility
4. **Check build:** Run `npm run build` to ensure no conflicts

## Available Scripts

In the project root, you can use:

- `npm run fix:js` - Auto-fix JavaScript/ESLint issues
- `npm run fix:css` - Auto-fix CSS/Stylelint issues
- `npm run build` - Build project (tests all code)

## Notes

- Utilities should not modify `node_modules`, `.git`, or `dist` directories
- Always use dynamic path resolution (avoid hardcoded paths)
- Support cross-platform execution (Windows, Linux, macOS)
- Log meaningful progress and error messages
- Clean up temporary resources on completion
