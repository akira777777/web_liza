/**
 * Core Module - Базовый модуль портфолио
 * Предоставляет основную функциональность и утилиты
 */
export class CoreModule {
  constructor() {
    this.initialized = false
    this.version = '1.0.0'
    this.features = new Set()
  }

  /**
   * Инициализация модуля
   */
  async init() {
    if (this.initialized) {
      return
    }

    try {
      // Базовая инициализация
      this.setupEventListeners()
      this.setupUtilities()

      this.initialized = true
      console.log('🔧 Core module initialized')
    } catch (error) {
      console.error('❌ Core module initialization failed:', error)
      throw error
    }
  }

  /**
   * Настройка базовых обработчиков событий
   */
  setupEventListeners() {
    // Обработка изменения видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onPageHidden()
      } else {
        this.onPageVisible()
      }
    })

    // Обработка изменения размера окна
    let resizeTimeout
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        this.onWindowResize()
      }, 250)
    })
  }

  /**
   * Настройка утилит
   */
  setupUtilities() {
    // Добавляем утилиты в глобальную область
    if (!window.PortfolioUtils) {
      window.PortfolioUtils = {
        // Проверка поддержки функций браузера
        supports: {
          webp: this.supportsWebP(),
          intersection: 'IntersectionObserver' in window,
          classList: 'classList' in document.createElement('div'),
          customElements: 'customElements' in window
        },

        // Утилиты для работы с DOM
        dom: {
          ready: this.domReady.bind(this),
          addClass: this.addClass.bind(this),
          removeClass: this.removeClass.bind(this),
          hasClass: this.hasClass.bind(this)
        },

        // Утилиты для анимаций
        animate: {
          fadeIn: this.fadeIn.bind(this),
          fadeOut: this.fadeOut.bind(this),
          slideDown: this.slideDown.bind(this)
        }
      }
    }
  }

  /**
   * Обработчик скрытия страницы
   */
  onPageHidden() {
    // Приостанавливаем анимации и таймеры
    document.body.classList.add('page-hidden')
  }

  /**
   * Обработчик показа страницы
   */
  onPageVisible() {
    // Возобновляем работу
    document.body.classList.remove('page-hidden')
  }

  /**
   * Обработчик изменения размера окна
   */
  onWindowResize() {
    // Обновляем CSS переменные
    document.documentElement.style.setProperty(
      '--viewport-width',
      `${window.innerWidth}px`
    )
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${window.innerHeight}px`
    )

    // Диспатчим кастомное событие
    window.dispatchEvent(
      new CustomEvent('portfolioResize', {
        detail: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      })
    )
  }

  /**
   * Проверка поддержки WebP
   */
  supportsWebP() {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5
  }

  /**
   * Ожидание готовности DOM
   */
  domReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback)
    } else {
      callback()
    }
  }

  /**
   * Добавление CSS класса с проверкой поддержки
   */
  addClass(element, className) {
    if (element && className) {
      if (element.classList) {
        element.classList.add(className)
      } else {
        element.className += ` ${className}`
      }
    }
  }

  /**
   * Удаление CSS класса
   */
  removeClass(element, className) {
    if (element && className) {
      if (element.classList) {
        element.classList.remove(className)
      } else {
        element.className = element.className
          .replace(new RegExp(`\\b${className}\\b`, 'g'), '')
          .trim()
      }
    }
  }

  /**
   * Проверка наличия CSS класса
   */
  hasClass(element, className) {
    if (!element || !className) return false

    if (element.classList) {
      return element.classList.contains(className)
    } else {
      return new RegExp(`\\b${className}\\b`).test(element.className)
    }
  }

  /**
   * Анимация появления
   */
  fadeIn(element, duration = 300) {
    if (!element) return Promise.resolve()

    return new Promise(resolve => {
      element.style.opacity = '0'
      element.style.display = 'block'
      element.style.transition = `opacity ${duration}ms ease-in-out`

      requestAnimationFrame(() => {
        element.style.opacity = '1'
        setTimeout(resolve, duration)
      })
    })
  }

  /**
   * Анимация исчезновения
   */
  fadeOut(element, duration = 300) {
    if (!element) return Promise.resolve()

    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ease-in-out`
      element.style.opacity = '0'

      setTimeout(() => {
        element.style.display = 'none'
        resolve()
      }, duration)
    })
  }

  /**
   * Анимация разворачивания
   */
  slideDown(element, duration = 300) {
    if (!element) return Promise.resolve()

    return new Promise(resolve => {
      element.style.height = '0'
      element.style.overflow = 'hidden'
      element.style.display = 'block'
      element.style.transition = `height ${duration}ms ease-in-out`

      const height = element.scrollHeight
      requestAnimationFrame(() => {
        element.style.height = `${height}px`
        setTimeout(() => {
          element.style.height = ''
          element.style.overflow = ''
          resolve()
        }, duration)
      })
    })
  }

  /**
   * Регистрация функции модуля
   */
  registerFeature(name) {
    this.features.add(name)
    return this
  }

  /**
   * Проверка доступности функции
   */
  hasFeature(name) {
    return this.features.has(name)
  }

  /**
   * Очистка ресурсов модуля
   */
  destroy() {
    // Очищаем обработчики событий
    window.removeEventListener('resize', this.onWindowResize)
    document.removeEventListener('visibilitychange', this.onPageHidden)

    // Очищаем состояние
    this.features.clear()
    this.initialized = false

    console.log('🔧 Core module destroyed')
  }
}

// Экспорт для использования в других модулях
export default CoreModule
