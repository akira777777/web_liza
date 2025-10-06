/**
 * Main Portfolio Script - Browser Compatible Version
 * Основной скрипт портфолио без ES6 импортов
 */

(function () {
  'use strict';

  // Конфигурация приложения
  const APP_CONFIG = {
    version: '2.1.0',
    debug: false,
    modules: {
      core: true,
      performance: true,
      gallery: true,
      forms: true,
      animations: false // Отключаем пока не нужны
    }
  };

  class PortfolioApp {
    constructor() {
      this.modules = new Map();
      this.loadStartTime = performance.now();
      this.isInitialized = false;
      this.readyCallbacks = [];

      this.init();
    }

    init() {
      // Проверяем готовность DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initApp());
      } else {
        this.initApp();
      }
    }

    async initApp() {
      try {
        console.log(`🚀 Portfolio App v${APP_CONFIG.version} starting...`);

        // Инициализируем базовые функции
        this.initBasicFeatures();

        // Загружаем модули
        await this.loadModules();

        // Настраиваем интерактивность
        this.setupInteractions();

        // Инициализируем анимации
        this.initAnimations();

        // Завершение инициализации
        this.completeInit();
      } catch (error) {
        console.error('❌ Portfolio App initialization failed:', error);
        this.initFallbackMode();
      }
    }

    initBasicFeatures() {
      // Smooth scroll для ссылок
      this.initSmoothScroll();

      // Мобильное меню
      this.initMobileMenu();

      // Lazy loading изображений
      this.initLazyLoading();

      // Базовая аналитика
      this.initAnalytics();
    }

    initSmoothScroll() {
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });

            // Обновляем URL без перезагрузки
            history.pushState(null, null, `#${targetId}`);
          }
        });
      });
    }

    initMobileMenu() {
      const menuToggle = document.querySelector('.menu-toggle');
      const mobileMenu = document.querySelector('.mobile-menu');
      const navbar = document.querySelector('.navbar');

      if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
          mobileMenu.classList.toggle('active');
          menuToggle.classList.toggle('active');
          document.body.classList.toggle('menu-open');
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', e => {
          if (
            !navbar.contains(e.target) &&
            mobileMenu.classList.contains('active')
          ) {
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
          }
        });

        // Закрытие меню при клике на ссылку
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
          link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
          });
        });
      }
    }

    initLazyLoading() {
      const images = document.querySelectorAll('img[data-src]');

      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                observer.unobserve(img);
              }
            });
          },
          {
            rootMargin: '50px 0px'
          }
        );

        images.forEach(img => imageObserver.observe(img));
      } else {
        // Fallback для старых браузеров
        images.forEach(img => this.loadImage(img));
      }
    }

    loadImage(img) {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
      }
    }

    initAnalytics() {
      // Отслеживание производительности
      window.addEventListener('load', () => {
        const loadTime = performance.now() - this.loadStartTime;
        console.log(`⚡ App loaded in ${Math.round(loadTime)}ms`);

        // Отправка метрик (если настроен GA)
        if (window.gtag) {
          gtag('event', 'page_load_time', {
            value: Math.round(loadTime),
            event_category: 'performance'
          });
        }
      });

      // Отслеживание ошибок
      window.addEventListener('error', e => {
        console.error('Global error:', e.error);

        if (window.gtag) {
          gtag('event', 'javascript_error', {
            error_message: e.message,
            event_category: 'error'
          });
        }
      });
    }

    async loadModules() {
      const promises = [];

      // Загружаем модули параллельно
      if (APP_CONFIG.modules.gallery) {
        promises.push(this.loadGalleryModule());
      }

      if (APP_CONFIG.modules.forms) {
        promises.push(this.loadFormsModule());
      }

      // Ждем загрузки всех модулей
      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Module ${index} failed to load:`, result.reason);
        }
      });
    }

    async loadGalleryModule() {
      try {
        // Проверяем, загружен ли модуль
        if (window.PortfolioGallery) {
          const gallery = new window.PortfolioGallery();
          this.modules.set('gallery', gallery);
          return gallery;
        }

        // Если модуль не загружен, загружаем скрипт
        await this.loadScript('/modules/gallery-browser.js');

        if (window.PortfolioGallery) {
          const gallery = new window.PortfolioGallery();
          this.modules.set('gallery', gallery);
          return gallery;
        }

        throw new Error('Gallery module not found after loading');
      } catch (error) {
        console.error('Failed to load gallery module:', error);
        throw error;
      }
    }

    async loadFormsModule() {
      try {
        if (window.PortfolioForms) {
          const forms = new window.PortfolioForms();
          this.modules.set('forms', forms);
          return forms;
        }

        await this.loadScript('/modules/forms-browser.js');

        if (window.PortfolioForms) {
          const forms = new window.PortfolioForms();
          this.modules.set('forms', forms);
          return forms;
        }

        throw new Error('Forms module not found after loading');
      } catch (error) {
        console.error('Failed to load forms module:', error);
        throw error;
      }
    }

    loadScript(src) {
      return new Promise((resolve, reject) => {
        // Проверяем, не загружен ли уже скрипт
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        script.onload = resolve;
        script.onerror = () =>
          reject(new Error(`Failed to load script: ${src}`));

        document.head.appendChild(script);
      });
    }

    setupInteractions() {
      // Кнопка "Наверх"
      this.setupScrollToTop();

      // Активный раздел в навигации
      this.setupActiveNavigation();

      // Параллакс эффекты (простые)
      this.setupSimpleParallax();
    }

    setupScrollToTop() {
      const scrollBtn =
        document.querySelector('.scroll-to-top') || this.createScrollToTopBtn();

      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          scrollBtn.classList.add('visible');
        } else {
          scrollBtn.classList.remove('visible');
        }
      });

      scrollBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    createScrollToTopBtn() {
      const btn = document.createElement('button');
      btn.className = 'scroll-to-top';
      btn.innerHTML = '↑';
      btn.setAttribute('aria-label', 'Scroll to top');

      // Добавляем стили
      btn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border: none;
                border-radius: 50%;
                background: var(--primary-color, #007bff);
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
            `;

      // Добавляем CSS для видимости
      if (!document.querySelector('#scroll-to-top-styles')) {
        const styles = document.createElement('style');
        styles.id = 'scroll-to-top-styles';
        styles.textContent = `
                    .scroll-to-top.visible {
                        opacity: 1;
                        visibility: visible;
                    }
                    .scroll-to-top:hover {
                        transform: scale(1.1);
                    }
                `;
        document.head.appendChild(styles);
      }

      document.body.appendChild(btn);
      return btn;
    }

    setupActiveNavigation() {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.navbar a[href^="#"]');

      if (!sections.length || !navLinks.length) return;

      const observerOptions = {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
      };

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const activeId = entry.target.id;

            // Убираем активный класс со всех ссылок
            navLinks.forEach(link => link.classList.remove('active'));

            // Добавляем активный класс к текущей ссылке
            const activeLink = document.querySelector(
              `.navbar a[href="#${activeId}"]`
            );
            if (activeLink) {
              activeLink.classList.add('active');
            }
          }
        });
      }, observerOptions);

      sections.forEach(section => observer.observe(section));
    }

    setupSimpleParallax() {
      const parallaxElements = document.querySelectorAll('[data-parallax]');

      if (!parallaxElements.length) return;

      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
          const speed = element.dataset.parallax || 0.5;
          const yPos = -(scrolled * speed);
          element.style.transform = `translateY(${yPos}px)`;
        });
      });
    }

    initAnimations() {
      // Простые анимации появления
      const animateElements = document.querySelectorAll('[data-animate]');

      if (!animateElements.length) return;

      const animationObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target;
              const animation = element.dataset.animate || 'fadeInUp';

              element.classList.add('animate', animation);
              animationObserver.unobserve(element);
            }
          });
        },
        {
          rootMargin: '0px 0px -10% 0px',
          threshold: 0.1
        }
      );

      animateElements.forEach(element => {
        animationObserver.observe(element);
      });

      // Добавляем базовые CSS анимации
      this.addAnimationStyles();
    }

    addAnimationStyles() {
      if (document.querySelector('#portfolio-animations')) return;

      const styles = document.createElement('style');
      styles.id = 'portfolio-animations';
      styles.textContent = `
                [data-animate] {
                    opacity: 0;
                    transition: all 0.8s ease;
                }
                
                .animate.fadeInUp {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                [data-animate="fadeInUp"] {
                    transform: translateY(30px);
                }
                
                .animate.fadeIn {
                    opacity: 1;
                }
                
                .animate.slideInLeft {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                [data-animate="slideInLeft"] {
                    transform: translateX(-30px);
                }
                
                .animate.slideInRight {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                [data-animate="slideInRight"] {
                    transform: translateX(30px);
                }
                
                .animate.scaleIn {
                    opacity: 1;
                    transform: scale(1);
                }
                
                [data-animate="scaleIn"] {
                    transform: scale(0.9);
                }
            `;
      document.head.appendChild(styles);
    }

    completeInit() {
      const loadTime = performance.now() - this.loadStartTime;

      this.isInitialized = true;

      console.log(`✅ Portfolio App initialized in ${Math.round(loadTime)}ms`);

      // Выполняем отложенные коллбеки
      this.readyCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Ready callback error:', error);
        }
      });

      // Отправляем событие готовности
      document.dispatchEvent(
        new CustomEvent('portfolioReady', {
          detail: {
            loadTime,
            modules: Array.from(this.modules.keys())
          }
        })
      );
    }

    initFallbackMode() {
      console.warn('🔄 Running in fallback mode');

      // Минимальная функциональность без модулей
      this.initBasicFeatures();

      // Простые интерактивные элементы
      this.setupInteractions();

      this.isInitialized = true;
    }

    // Публичные методы
    ready(callback) {
      if (this.isInitialized) {
        callback();
      } else {
        this.readyCallbacks.push(callback);
      }
    }

    getModule(name) {
      return this.modules.get(name);
    }
  }

  // Инициализация приложения
  const app = new PortfolioApp();

  // Экспорт для глобального доступа
  window.PortfolioApp = app;
})();
