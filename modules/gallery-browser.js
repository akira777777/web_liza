/**
 * Portfolio Gallery Module - Browser Compatible
 * Модуль галереи для портфолио без ES6 импортов
 */

(function (window) {
  'use strict';

  class PortfolioGallery {
    constructor() {
      this.galleries = [];
      this.currentGallery = null;
      this.isInitialized = false;

      this.init();
    }

    init() {
      console.log('🖼️ Gallery module initializing...');
      
      // Инициализируем после загрузки DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initGallery());
      } else {
        this.initGallery();
      }
    }

    initGallery() {
      try {
        // Находим все галереи на странице
        const galleryElements = document.querySelectorAll('.gallery, .portfolio-grid, [data-gallery]');
        
        if (galleryElements.length === 0) {
          console.log('📷 No gallery elements found on page');
          return;
        }

        // Инициализируем каждую галерею
        galleryElements.forEach((element, index) => {
          this.initSingleGallery(element, index);
        });

        // Настраиваем обработчики событий
        this.setupEventListeners();

        this.isInitialized = true;
        console.log(`✅ Gallery module initialized with ${galleryElements.length} galleries`);

      } catch (error) {
        console.error('❌ Error initializing gallery:', error);
      }
    }

    initSingleGallery(element, index) {
      const galleryId = `gallery-${index}`;
      element.setAttribute('data-gallery-id', galleryId);

      // Находим все изображения в галерее
      const images = element.querySelectorAll('img, [data-src]');
      
      const gallery = {
        id: galleryId,
        element: element,
        images: Array.from(images),
        currentIndex: 0,
        isLightboxOpen: false
      };

      // Обрабатываем каждое изображение
      images.forEach((img, imgIndex) => {
        img.setAttribute('data-index', imgIndex);
        img.style.cursor = 'pointer';
        
        // Добавляем обработчик клика
        img.addEventListener('click', (e) => {
          e.preventDefault();
          this.openLightbox(gallery, imgIndex);
        });
      });

      this.galleries.push(gallery);
    }

    setupEventListeners() {
      // Обработчик клавиш для навигации в лайтбоксе
      document.addEventListener('keydown', (e) => {
        if (this.currentGallery && this.currentGallery.isLightboxOpen) {
          switch (e.key) {
            case 'Escape':
              this.closeLightbox();
              break;
            case 'ArrowLeft':
              this.previousImage();
              break;
            case 'ArrowRight':
              this.nextImage();
              break;
          }
        }
      });
    }

    openLightbox(gallery, imageIndex) {
      this.currentGallery = gallery;
      gallery.currentIndex = imageIndex;
      gallery.isLightboxOpen = true;

      // Создаем элементы лайтбокса если их нет
      if (!document.getElementById('portfolio-lightbox')) {
        this.createLightboxElements();
      }

      // Показываем лайтбокс
      this.showLightbox(gallery.images[imageIndex]);
    }

    createLightboxElements() {
      const lightbox = document.createElement('div');
      lightbox.id = 'portfolio-lightbox';
      lightbox.className = 'lightbox-overlay';
      lightbox.innerHTML = `
        <div class="lightbox-container">
          <button class="lightbox-close" aria-label="Close">&times;</button>
          <button class="lightbox-prev" aria-label="Previous">‹</button>
          <button class="lightbox-next" aria-label="Next">›</button>
          <img class="lightbox-image" alt="">
          <div class="lightbox-info">
            <span class="lightbox-counter"></span>
          </div>
        </div>
      `;

      // Добавляем стили
      this.addLightboxStyles();

      // Обработчики событий
      lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
      lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.previousImage());
      lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.nextImage());
      
      // Закрытие по клику на оверлей
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          this.closeLightbox();
        }
      });

      document.body.appendChild(lightbox);
    }

    addLightboxStyles() {
      if (document.getElementById('gallery-styles')) return;

      const styles = document.createElement('style');
      styles.id = 'gallery-styles';
      styles.textContent = `
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .lightbox-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        .lightbox-container {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .lightbox-close, .lightbox-prev, .lightbox-next {
          position: absolute;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: background 0.3s ease;
          z-index: 1001;
        }

        .lightbox-close:hover, .lightbox-prev:hover, .lightbox-next:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .lightbox-close {
          top: 20px;
          right: 20px;
        }

        .lightbox-prev {
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
        }

        .lightbox-next {
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
        }

        .lightbox-info {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          background: rgba(0, 0, 0, 0.7);
          padding: 10px 20px;
          border-radius: 20px;
        }

        @media (max-width: 768px) {
          .lightbox-prev, .lightbox-next {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
          
          .lightbox-prev {
            left: 10px;
          }
          
          .lightbox-next {
            right: 10px;
          }
        }
      `;

      document.head.appendChild(styles);
    }

    showLightbox(image) {
      const lightbox = document.getElementById('portfolio-lightbox');
      const lightboxImage = lightbox.querySelector('.lightbox-image');
      const counter = lightbox.querySelector('.lightbox-counter');

      // Устанавливаем изображение
      lightboxImage.src = image.src || image.dataset.src;
      lightboxImage.alt = image.alt || '';

      // Обновляем счетчик
      const current = this.currentGallery.currentIndex + 1;
      const total = this.currentGallery.images.length;
      counter.textContent = `${current} / ${total}`;

      // Показываем лайтбокс
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
      const lightbox = document.getElementById('portfolio-lightbox');
      if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        if (this.currentGallery) {
          this.currentGallery.isLightboxOpen = false;
        }
      }
    }

    nextImage() {
      if (!this.currentGallery) return;

      const gallery = this.currentGallery;
      gallery.currentIndex = (gallery.currentIndex + 1) % gallery.images.length;
      this.showLightbox(gallery.images[gallery.currentIndex]);
    }

    previousImage() {
      if (!this.currentGallery) return;

      const gallery = this.currentGallery;
      gallery.currentIndex = gallery.currentIndex === 0 
        ? gallery.images.length - 1 
        : gallery.currentIndex - 1;
      this.showLightbox(gallery.images[gallery.currentIndex]);
    }

    // Публичные методы
    cleanup() {
      // Очистка при необходимости
      this.galleries.forEach(gallery => {
        gallery.images.forEach(img => {
          img.style.cursor = '';
        });
      });

      const lightbox = document.getElementById('portfolio-lightbox');
      if (lightbox) {
        lightbox.remove();
      }

      const styles = document.getElementById('gallery-styles');
      if (styles) {
        styles.remove();
      }

      this.galleries = [];
      this.currentGallery = null;
    }
  }

  // Экспортируем в глобальную область видимости
  window.PortfolioGallery = PortfolioGallery;

})(window);