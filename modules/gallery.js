/**
 * Gallery Module - Модуль галереи портфолио
 * Модуль управления галереей изображений с лайтбоксом
 */
export class GalleryModule {
  constructor() {
    this.initialized = false;
    this.lightbox = null;
    this.currentImageIndex = 0;
    this.images = [];
    this.moduleName = 'gallery';
  }

  /**
   * Инициализация модуля
   */
  async init() {
    if (this.initialized) {
      return;
    }

    try {
      this.setupGallery();
      this.setupLightbox();
      this.setupKeyboardNavigation();

      this.initialized = true;
      console.log('🖼️ Gallery module initialized');
    } catch (error) {
      console.error('❌ Gallery module initialization failed:', error);
      throw error;
    }
  }

  /**
   * Настройка галереи
   */
  setupGallery() {
    // Находим все изображения галереи
    this.images = Array.from(
      document.querySelectorAll('.gallery-item img, .project-image')
    );

    // Добавляем обработчики кликов
    this.images.forEach((img, index) => {
      img.addEventListener('click', e => {
        e.preventDefault();
        this.openLightbox(index);
      });

      // Добавляем data-index для удобства
      img.dataset.galleryIndex = index;
    });
  }

  /**
   * Создание лайтбокса
   */
  setupLightbox() {
    const lightboxHTML = `
      <div class="lightbox" id="portfolio-lightbox">
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Закрыть">&times;</button>
          <button class="lightbox-prev" aria-label="Предыдущее изображение">&larr;</button>
          <button class="lightbox-next" aria-label="Следующее изображение">&rarr;</button>
          <img class="lightbox-image" src="" alt="">
          <div class="lightbox-counter">
            <span class="current">1</span> / <span class="total">1</span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    this.lightbox = document.getElementById('portfolio-lightbox');

    // Добавляем обработчики событий
    this.setupLightboxEvents();

    // Добавляем стили
    this.addLightboxStyles();
  }

  /**
   * Настройка событий лайтбокса
   */
  setupLightboxEvents() {
    const closeBtn = this.lightbox.querySelector('.lightbox-close');
    const prevBtn = this.lightbox.querySelector('.lightbox-prev');
    const nextBtn = this.lightbox.querySelector('.lightbox-next');
    const backdrop = this.lightbox.querySelector('.lightbox-backdrop');

    closeBtn.addEventListener('click', () => this.closeLightbox());
    prevBtn.addEventListener('click', () => this.prevImage());
    nextBtn.addEventListener('click', () => this.nextImage());
    backdrop.addEventListener('click', () => this.closeLightbox());
  }

  /**
   * Настройка навигации с клавиатуры
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', e => {
      if (!this.lightbox.classList.contains('active')) return;

      switch (e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.prevImage();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
      }
    });
  }

  /**
   * Открытие лайтбокса
   */
  openLightbox(imageIndex) {
    this.currentImageIndex = imageIndex;
    this.showImage();
    this.updateCounter();

    this.lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');
  }

  /**
   * Закрытие лайтбокса
   */
  closeLightbox() {
    this.lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
  }

  /**
   * Показ текущего изображения
   */
  showImage() {
    const currentImage = this.images[this.currentImageIndex];
    const lightboxImage = this.lightbox.querySelector('.lightbox-image');

    lightboxImage.src = currentImage.src;
    lightboxImage.alt = currentImage.alt || 'Изображение галереи';
  }

  /**
   * Переход к предыдущему изображению
   */
  prevImage() {
    this.currentImageIndex =
      this.currentImageIndex === 0
        ? this.images.length - 1
        : this.currentImageIndex - 1;

    this.showImage();
    this.updateCounter();
  }

  /**
   * Переход к следующему изображению
   */
  nextImage() {
    this.currentImageIndex =
      this.currentImageIndex === this.images.length - 1
        ? 0
        : this.currentImageIndex + 1;

    this.showImage();
    this.updateCounter();
  }

  /**
   * Обновление счетчика изображений
   */
  updateCounter() {
    const currentSpan = this.lightbox.querySelector('.current');
    const totalSpan = this.lightbox.querySelector('.total');

    currentSpan.textContent = this.currentImageIndex + 1;
    totalSpan.textContent = this.images.length;
  }

  /**
   * Добавление стилей лайтбокса
   */
  addLightboxStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .lightbox.active {
        opacity: 1;
        visibility: visible;
      }
      
      .lightbox-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
      }
      
      .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
        z-index: 1;
      }
      
      .lightbox-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      
      .lightbox-close,
      .lightbox-prev,
      .lightbox-next {
        position: absolute;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        font-size: 24px;
        padding: 10px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .lightbox-close:hover,
      .lightbox-prev:hover,
      .lightbox-next:hover {
        background: rgba(255, 255, 255, 0.2);
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
      
      .lightbox-counter {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        background: rgba(0, 0, 0, 0.5);
        padding: 5px 10px;
        border-radius: 3px;
      }
      
      body.lightbox-open {
        overflow: hidden;
      }
      
      .gallery-item img,
      .project-image {
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .gallery-item img:hover,
      .project-image:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Уничтожение модуля
   */
  destroy() {
    if (this.lightbox) {
      this.lightbox.remove();
    }

    this.images = [];
    this.initialized = false;

    console.log('🖼️ Gallery module destroyed');
  }
}

// Экспорт по умолчанию
export default GalleryModule;
