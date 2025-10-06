import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          // Группировка внешних библиотек
          vendor: ['intersection-observer', 'core-js'],

          // Группировка модулей по функциональности
          core: ['./modules/core.js', './modules/performance.js'],
          ui: ['./modules/animations.js', './modules/gallery.js'],
          forms: ['./modules/forms.js'],
          media: ['./modules/media.js']
        },

        // Оптимальное именование файлов
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: assetInfo => {
          const name = assetInfo.fileName || ''
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            return 'images/[name]-[hash].[ext]'
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/i.test(name)) {
            return 'fonts/[name]-[hash].[ext]'
          }
          if (/\.css$/i.test(name)) {
            return 'css/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },

    // Оптимизация terser
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      format: {
        comments: false
      }
    },

    // CSS оптимизация
    cssCodeSplit: true,
    cssMinify: true,

    // Размер chunk предупреждений
    chunkSizeWarningLimit: 500
  },

  // CSS preprocessing
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    devSourcemap: true
  },

  // Оптимизация для разработки
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,

    // HMR оптимизация
    hmr: {
      overlay: true
    }
  },

  // Предварительный просмотр
  preview: {
    port: 4173,
    host: true,
    cors: true
  },

  plugins: [
    // Поддержка современных браузеров (исключаем IE полностью)
    legacy({
      targets: [
        'last 2 versions',
        '> 1%',
        'Chrome >= 88',
        'Firefox >= 85',
        'Safari >= 14',
        'Edge >= 88',
        'not IE 11',
        'not IE_Mob 11',
        'not dead',
        'supports es6-module'
      ],
      modernPolyfills: true,
      renderLegacyChunks: false // Отключаем legacy chunks для IE
    })
    // PWA конфигурация (временно отключена для решения проблем совместимости)
    // VitePWA({...})
  ],

  // Оптимизации
  optimizeDeps: {
    include: ['intersection-observer', 'core-js'],
    exclude: ['@vite/client', '@vite/env']
  },

  // Определение переменных окружения
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
