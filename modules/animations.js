/**
 * Animations Module - Модуль анимаций портфолио
 * Управляет всеми анимациями и переходами
 */
export class AnimationsModule {
  constructor() {
    this.animations = new Map()
    this.observers = new Map()
    this.initialized = false
    this.animationQueue = []
    this.isAnimating = false
  }

  /**
   * Инициализация модуля
   */
  async init() {
    if (this.initialized) {
      return
    }

    try {
      this.setupIntersectionObserver()
      this.setupScrollAnimations()
      this.setupHoverEffects()
      this.setupTransitions()

      this.initialized = true
      console.log('🎬 Animations module initialized')
    } catch (error) {
      console.error('❌ Animations module initialization failed:', error)
      throw error
    }
  }

  /**
   * Настройка Intersection Observer для анимаций при скролле
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn(
        'IntersectionObserver not supported, falling back to scroll events'
      )
      this.setupScrollFallback()
      return
    }

    const options = {
      threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
      rootMargin: '50px 0px -50px 0px'
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target, entry.intersectionRatio)
        }
      })
    }, options)

    // Наблюдаем за элементами с data-animate
    const elementsToAnimate = document.querySelectorAll('[data-animate]')
    elementsToAnimate.forEach(element => {
      observer.observe(element)
    })

    this.observers.set('intersection', observer)
  }

  /**
   * Анимация элемента при появлении
   */
  animateElement(element) {
    const animationType = element.dataset.animate
    const delay = parseInt(element.dataset.animateDelay) || 0
    const duration = parseInt(element.dataset.animateDuration) || 600

    setTimeout(() => {
      switch (animationType) {
        case 'fade-in':
          this.fadeIn(element, duration)
          break
        case 'slide-up':
          this.slideUp(element, duration)
          break
        case 'slide-left':
          this.slideLeft(element, duration)
          break
        case 'slide-right':
          this.slideRight(element, duration)
          break
        case 'scale-in':
          this.scaleIn(element, duration)
          break
        case 'rotate-in':
          this.rotateIn(element, duration)
          break
        default:
          this.fadeIn(element, duration)
      }
    }, delay)
  }

  /**
   * Анимация появления с прозрачности
   */
  fadeIn(element, duration = 600) {
    element.style.opacity = '0'
    element.style.transition = `opacity ${duration}ms ease-out`

    requestAnimationFrame(() => {
      element.style.opacity = '1'
    })

    return new Promise(resolve => {
      setTimeout(resolve, duration)
    })
  }

  /**
   * Анимация появления снизу вверх
   */
  slideUp(element, duration = 600) {
    element.style.transform = 'translateY(50px)'
    element.style.opacity = '0'
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`

    requestAnimationFrame(() => {
      element.style.transform = 'translateY(0)'
      element.style.opacity = '1'
    })

    return new Promise(resolve => {
      setTimeout(resolve, duration)
    })
  }

  /**
   * Анимация появления справа налево
   */
  slideLeft(element, duration = 600) {
    element.style.transform = 'translateX(50px)'
    element.style.opacity = '0'
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`

    requestAnimationFrame(() => {
      element.style.transform = 'translateX(0)'
      element.style.opacity = '1'
    })

    return new Promise(resolve => {
      setTimeout(resolve, duration)
    })
  }

  /**
   * Анимация появления слева направо
   */
  slideRight(element, duration = 600) {
    element.style.transform = 'translateX(-50px)'
    element.style.opacity = '0'
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`

    requestAnimationFrame(() => {
      element.style.transform = 'translateX(0)'
      element.style.opacity = '1'
    })

    return new Promise(resolve => {
      setTimeout(resolve, duration)
    })
  }

  /**
   * Анимация появления с масштабированием
   */
  scaleIn(element, duration = 600) {
    element.style.transform = 'scale(0.8)'
    element.style.opacity = '0'
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`

    requestAnimationFrame(() => {
      element.style.transform = 'scale(1)'
      element.style.opacity = '1'
    })

    return new Promise(resolve => {
      setTimeout(resolve, duration)
    })
  }

  /**
   * Анимация появления с поворотом
   */
  rotateIn(element, duration = 600) {
    element.style.transform = 'rotate(-10deg) scale(0.8)'
    element.style.opacity = '0'
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`

    requestAnimationFrame(() => {
      element.style.transform = 'rotate(0deg) scale(1)'
      element.style.opacity = '1'
    })

    return new Promise(resolve => {
      setTimeout(resolve, duration)
    })
  }

  /**
   * Настройка анимаций при скролле
   */
  setupScrollAnimations() {
    let scrollTimeout
    let isScrolling = false

    window.addEventListener(
      'scroll',
      () => {
        const scrolled = window.pageYOffset
        const rate = scrolled * -0.5

        // Параллакс для hero секции
        const heroSection = document.querySelector('.hero')
        if (heroSection) {
          heroSection.style.transform = `translateY(${rate}px)`
        }

        // Обновление прогресс-бара скролла
        this.updateScrollProgress()

        // Плавное появление кнопки "наверх"
        this.toggleScrollToTop(scrolled > 300)

        if (!isScrolling) {
          isScrolling = true
          document.body.classList.add('scrolling')
        }

        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          isScrolling = false
          document.body.classList.remove('scrolling')
        }, 150)
      },
      { passive: true }
    )
  }

  /**
   * Обновление прогресс-бара скролла
   */
  updateScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress')
    if (!scrollProgress) return

    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight
    const scrolled = window.pageYOffset
    const progress = (scrolled / scrollHeight) * 100

    scrollProgress.style.width = `${Math.min(progress, 100)}%`
  }

  /**
   * Показ/скрытие кнопки "наверх"
   */
  toggleScrollToTop(show) {
    const scrollToTop = document.querySelector('.scroll-to-top')
    if (!scrollToTop) return

    if (show) {
      scrollToTop.classList.add('visible')
    } else {
      scrollToTop.classList.remove('visible')
    }
  }

  /**
   * Настройка hover эффектов
   */
  setupHoverEffects() {
    // Hover эффекты для карточек проектов
    const projectCards = document.querySelectorAll('.project-card')
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.animateProjectCard(card, true)
      })

      card.addEventListener('mouseleave', () => {
        this.animateProjectCard(card, false)
      })
    })

    // Hover эффекты для кнопок
    const buttons = document.querySelectorAll('.btn')
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        this.animateButton(button, true)
      })

      button.addEventListener('mouseleave', () => {
        this.animateButton(button, false)
      })
    })
  }

  /**
   * Анимация карточки проекта при hover
   */
  animateProjectCard(card, isHover) {
    const image = card.querySelector('.project-image')
    const overlay = card.querySelector('.project-overlay')

    if (isHover) {
      card.style.transform = 'translateY(-10px)'
      card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'

      if (image) {
        image.style.transform = 'scale(1.05)'
      }

      if (overlay) {
        overlay.style.opacity = '1'
      }
    } else {
      card.style.transform = 'translateY(0)'
      card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)'

      if (image) {
        image.style.transform = 'scale(1)'
      }

      if (overlay) {
        overlay.style.opacity = '0'
      }
    }
  }

  /**
   * Анимация кнопки при hover
   */
  animateButton(button, isHover) {
    if (isHover) {
      button.style.transform = 'translateY(-2px)'
      button.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'
    } else {
      button.style.transform = 'translateY(0)'
      button.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'
    }
  }

  /**
   * Настройка плавных переходов
   */
  setupTransitions() {
    // Добавляем базовые переходы для всех интерактивных элементов
    const style = document.createElement('style')
    style.textContent = `
      .project-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .project-image {
        transition: transform 0.3s ease;
      }
      
      .project-overlay {
        transition: opacity 0.3s ease;
      }
      
      .btn {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .scroll-to-top {
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .scroll-to-top.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .scroll-progress {
        transition: width 0.3s ease;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Fallback для старых браузеров без IntersectionObserver
   */
  setupScrollFallback() {
    let scrollTimeout

    window.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          const elementsToAnimate = document.querySelectorAll(
            '[data-animate]:not(.animated)'
          )

          elementsToAnimate.forEach(element => {
            const rect = element.getBoundingClientRect()
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0

            if (isVisible) {
              element.classList.add('animated')
              this.animateElement(element, 1)
            }
          })
        }, 100)
      },
      { passive: true }
    )
  }

  /**
   * Плавный скролл к элементу
   */
  scrollToElement(element, offset = 0) {
    const targetPosition = element.offsetTop - offset

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }

  /**
   * Добавление элемента в очередь анимации
   */
  queueAnimation(animationFunction, delay = 0) {
    this.animationQueue.push({
      function: animationFunction,
      delay
    })

    if (!this.isAnimating) {
      this.processAnimationQueue()
    }
  }

  /**
   * Обработка очереди анимаций
   */
  async processAnimationQueue() {
    if (this.animationQueue.length === 0) {
      this.isAnimating = false
      return
    }

    this.isAnimating = true
    const animation = this.animationQueue.shift()

    if (animation.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, animation.delay))
    }

    await animation.function()
    this.processAnimationQueue()
  }

  /**
   * Проверка поддержки анимаций
   */
  supportsAnimations() {
    return (
      'animate' in document.createElement('div') ||
      'transition' in document.createElement('div').style
    )
  }

  /**
   * Уничтожение модуля
   */
  destroy() {
    // Очищаем наблюдатели
    this.observers.forEach(observer => {
      observer.disconnect()
    })
    this.observers.clear()

    // Очищаем анимации
    this.animations.clear()
    this.animationQueue.length = 0
    this.isAnimating = false

    this.initialized = false
    console.log('🎬 Animations module destroyed')
  }
}

// Экспорт по умолчанию
export default AnimationsModule
