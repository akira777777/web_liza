/**
 * Media Module - Обработка медиа-контента
 * Управление изображениями, видео и другими медиа-ресурсами
 */

;(function (window) {
  'use strict'

  class MediaModule {
    constructor() {
      this.mediaElements = new Map()
      this.lazyImages = new Set()
      this.videos = new Set()
      this.isInitialized = false

      this.init()
    }

    init() {
      console.log('🎬 Media module initializing...')

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initMedia())
      } else {
        this.initMedia()
      }
    }

    initMedia() {
      try {
        this.setupLazyLoading()
        this.setupVideoHandling()
        this.setupImageOptimization()
        this.setupMediaQueries()

        this.isInitialized = true
        console.log('✅ Media module initialized')
      } catch (error) {
        console.error('❌ Media module initialization failed:', error)
      }
    }

    /**
     * Настройка ленивой загрузки изображений
     */
    setupLazyLoading() {
      if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported, using fallback')
        this.setupLazyLoadingFallback()
        return
      }

      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target
              this.loadLazyImage(img)
              observer.unobserve(img)
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      )

      // Находим все изображения с data-src
      const lazyImages = document.querySelectorAll('img[data-src]')
      lazyImages.forEach(img => {
        imageObserver.observe(img)
        this.lazyImages.add(img)
      })

      console.log(`📷 Found ${lazyImages.length} lazy-loaded images`)
    }

    /**
     * Загрузка ленивого изображения
     */
    loadLazyImage(img) {
      const src = img.getAttribute('data-src')
      const srcset = img.getAttribute('data-srcset')

      if (src) {
        img.src = src
        img.removeAttribute('data-src')
      }

      if (srcset) {
        img.srcset = srcset
        img.removeAttribute('data-srcset')
      }

      img.classList.add('loaded')

      // Обработка ошибок загрузки
      img.addEventListener('error', () => {
        console.warn('⚠️ Failed to load lazy image:', img.src)
        img.classList.add('error')
      })

      img.addEventListener('load', () => {
        img.classList.add('loaded')
      })
    }

    /**
     * Fallback для браузеров без IntersectionObserver
     */
    setupLazyLoadingFallback() {
      const lazyImages = document.querySelectorAll('img[data-src]')

      const loadImagesInViewport = () => {
        lazyImages.forEach(img => {
          if (this.isElementInViewport(img) && img.hasAttribute('data-src')) {
            this.loadLazyImage(img)
          }
        })
      }

      window.addEventListener('scroll', loadImagesInViewport, { passive: true })
      window.addEventListener('resize', loadImagesInViewport, { passive: true })

      // Первоначальная загрузка
      loadImagesInViewport()
    }

    /**
     * Проверка видимости элемента
     */
    isElementInViewport(el) {
      const rect = el.getBoundingClientRect()
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      )
    }

    /**
     * Настройка обработки видео
     */
    setupVideoHandling() {
      const videos = document.querySelectorAll('video')

      videos.forEach(video => {
        this.setupVideoElement(video)
        this.videos.add(video)
      })

      console.log(`🎥 Found ${videos.length} video elements`)
    }

    /**
     * Настройка отдельного видео элемента
     */
    setupVideoElement(video) {
      // Lazy loading для видео
      if (video.hasAttribute('data-src')) {
        const videoObserver = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const src = video.getAttribute('data-src')
                if (src) {
                  video.src = src
                  video.removeAttribute('data-src')
                  video.load()
                }
                videoObserver.unobserve(video)
              }
            })
          },
          { rootMargin: '100px 0px' }
        )

        videoObserver.observe(video)
      }

      // Обработка ошибок видео
      video.addEventListener('error', e => {
        console.warn('⚠️ Video loading error:', e)
        video.classList.add('error')
      })

      // Автовоспроизведение с звуком отключенным
      if (video.hasAttribute('autoplay')) {
        video.muted = true
        video.playsInline = true
      }
    }

    /**
     * Настройка оптимизации изображений
     */
    setupImageOptimization() {
      const images = document.querySelectorAll('img')

      images.forEach(img => {
        // Добавляем обработчики для оптимизации
        img.addEventListener('load', () => {
          this.optimizeImage(img)
        })

        // Обработка ошибок
        img.addEventListener('error', () => {
          this.handleImageError(img)
        })
      })
    }

    /**
     * Оптимизация загруженного изображения
     */
    optimizeImage(img) {
      // Добавляем класс для анимации появления
      img.classList.add('loaded')

      // Проверяем размер изображения
      if (img.naturalWidth && img.naturalHeight) {
        const aspectRatio = img.naturalWidth / img.naturalHeight

        // Устанавливаем aspect-ratio если не задан
        if (!img.style.aspectRatio) {
          img.style.aspectRatio = aspectRatio
        }
      }
    }

    /**
     * Обработка ошибок изображений
     */
    handleImageError(img) {
      console.warn('⚠️ Image failed to load:', img.src)

      img.classList.add('error')

      // Fallback изображение
      if (!img.hasAttribute('data-fallback')) {
        img.src =
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg=='
      }
    }

    /**
     * Настройка медиа-запросов и responsive поведения
     */
    setupMediaQueries() {
      // Отслеживание изменения размера экрана
      const mediaQueries = {
        mobile: window.matchMedia('(max-width: 768px)'),
        tablet: window.matchMedia('(max-width: 1024px)'),
        desktop: window.matchMedia('(min-width: 1025px)')
      }

      Object.entries(mediaQueries).forEach(([name, query]) => {
        query.addEventListener('change', e => {
          this.handleMediaQueryChange(name, e.matches)
        })

        // Первоначальная проверка
        this.handleMediaQueryChange(name, query.matches)
      })
    }

    /**
     * Обработка изменения медиа-запросов
     */
    handleMediaQueryChange(breakpoint, matches) {
      if (matches) {
        document.body.setAttribute('data-breakpoint', breakpoint)

        // Специфическая логика для разных breakpoint'ов
        switch (breakpoint) {
          case 'mobile':
            this.optimizeForMobile()
            break
          case 'tablet':
            this.optimizeForTablet()
            break
          case 'desktop':
            this.optimizeForDesktop()
            break
        }
      }
    }

    /**
     * Оптимизация для мобильных устройств
     */
    optimizeForMobile() {
      // Отключаем тяжелые эффекты на мобильных
      document.body.classList.add('mobile-optimized')

      // Уменьшаем качество изображений если нужно
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        if (img.src.includes('webp')) {
          // Можно заменить на jpg для мобильных если webp не поддерживается
        }
      })
    }

    /**
     * Оптимизация для планшетов
     */
    optimizeForTablet() {
      document.body.classList.remove('mobile-optimized')
      document.body.classList.add('tablet-optimized')
    }

    /**
     * Оптимизация для десктопов
     */
    optimizeForDesktop() {
      document.body.classList.remove('mobile-optimized', 'tablet-optimized')
      document.body.classList.add('desktop-optimized')
    }

    /**
     * Предварительная загрузка критических изображений
     */
    preloadCriticalImages() {
      const criticalImages = document.querySelectorAll(
        'img[fetchpriority="high"], img[loading="eager"]'
      )

      criticalImages.forEach(img => {
        if (img.hasAttribute('data-src')) {
          this.loadLazyImage(img)
        }
      })
    }

    /**
     * Очистка модуля
     */
    cleanup() {
      this.mediaElements.clear()
      this.lazyImages.clear()
      this.videos.clear()
      this.isInitialized = false

      console.log('🎬 Media module cleaned up')
    }
  }

  // Экспортируем в глобальную область видимости
  window.MediaModule = MediaModule
})(window)
