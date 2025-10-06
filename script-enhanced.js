// ===== ENHANCED PORTFOLIO INTERACTIONS =====

// ===== VIDEO PORTFOLIO ENHANCEMENTS =====
class VideoPortfolioManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupVideoFilters();
    this.setupVideoHoverEffects();
    this.setupVideoLazyLoading();
    this.setupVideoAccessibility();
  }

  setupVideoFilters() {
    const videoFilter = document.querySelector('[data-filter="video"]');
    if (videoFilter) {
      videoFilter.addEventListener('click', () => {
        this.filterVideoItems();
        this.animateVideoAppearance();
      });
    }
  }

  filterVideoItems() {
    const videoItems = document.querySelectorAll(
      '.portfolio-item[data-category="video"]'
    );
    const allItems = document.querySelectorAll('.portfolio-item');

    // Скрываем все элементы
    allItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
    });

    // Показываем только видео элементы
    setTimeout(() => {
      videoItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
          item.style.transition = 'all 0.4s ease';
        }, index * 100);
      });
    }, 200);
  }

  animateVideoAppearance() {
    const videoItems = document.querySelectorAll('.video-portfolio-item');

    videoItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('animate-in');

        // Добавляем пульсирующий эффект для кнопки воспроизведения
        const playButton = item.querySelector('.play-button');
        if (playButton) {
          playButton.style.animation = 'pulse 2s infinite';
        }
      }, index * 150);
    });
  }

  setupVideoHoverEffects() {
    const videoItems = document.querySelectorAll('.video-portfolio-item');

    videoItems.forEach(item => {
      const video = item.querySelector('video');
      const overlay = item.querySelector('.video-overlay');

      item.addEventListener('mouseenter', () => {
        if (video) {
          video.style.filter = 'brightness(1.1) contrast(1.05)';

          // Плавное появление оверлея
          if (overlay) {
            overlay.style.background = 'rgba(0, 0, 0, 0.4)';
          }
        }
      });

      item.addEventListener('mouseleave', () => {
        if (video) {
          video.style.filter = 'none';

          if (overlay) {
            overlay.style.background = 'rgba(0, 0, 0, 0.3)';
          }
        }
      });
    });
  }

  setupVideoLazyLoading() {
    const videoElements = document.querySelectorAll('.portfolio-video');

    const videoObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const video = entry.target;

            // Загружаем метаданные видео
            video.addEventListener('loadedmetadata', () => {
              video.currentTime = 1; // Устанавливаем на первую секунду для превью
              video.parentElement.classList.add('video-loaded');
            });

            videoObserver.unobserve(video);
          }
        });
      },
      { threshold: 0.1 }
    );

    videoElements.forEach(video => videoObserver.observe(video));
  }

  setupVideoAccessibility() {
    const videoItems = document.querySelectorAll('.video-portfolio-item');

    videoItems.forEach(item => {
      // Добавляем ARIA атрибуты
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', 'Воспроизвести видео');

      // Поддержка клавиатуры
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });

      // Фокус стили
      item.addEventListener('focus', () => {
        item.style.outline = '2px solid #667eea';
        item.style.outlineOffset = '2px';
      });

      item.addEventListener('blur', () => {
        item.style.outline = 'none';
      });
    });
  }
}

// ===== ENHANCED ANIMATIONS =====
class EnhancedAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupParallaxEffects();
    this.setupMouseEffects();
    this.setupLoadingAnimations();
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const animateOnScroll = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');

          // Специальная анимация для элементов портфолио
          if (entry.target.classList.contains('portfolio-item')) {
            this.animatePortfolioItem(entry.target);
          }
        }
      });
    }, observerOptions);

    // Анимируем все элементы с класом animate
    document
      .querySelectorAll('.portfolio-item, .service-item, .section-header')
      .forEach(el => {
        animateOnScroll.observe(el);
      });
  }

  animatePortfolioItem(item) {
    const image = item.querySelector('.portfolio-image, .portfolio-video');
    const info = item.querySelector('.portfolio-info');

    if (image) {
      image.style.transform = 'translateY(0)';
      image.style.opacity = '1';
      image.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }

    if (info) {
      setTimeout(() => {
        info.style.transform = 'translateY(0)';
        info.style.opacity = '1';
        info.style.transition = 'all 0.4s ease 0.2s';
      }, 100);
    }
  }

  setupParallaxEffects() {
    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('[data-parallax]');

      parallaxElements.forEach(element => {
        const speed = element.dataset.parallax || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });

      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick);
  }

  setupMouseEffects() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    let cursorX = 0,
      cursorY = 0;
    let targetX = 0,
      targetY = 0;

    document.addEventListener('mousemove', e => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    const animateCursor = () => {
      cursorX += (targetX - cursorX) * 0.1;
      cursorY += (targetY - cursorY) * 0.1;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      requestAnimationFrame(animateCursor);
    };

    animateCursor();

    // Hover effects для интерактивных элементов
    document.querySelectorAll('a, button, .portfolio-item').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  setupLoadingAnimations() {
    // Анимация скелетона для загружающегося контента
    const addSkeletonLoader = element => {
      element.classList.add('skeleton-loading');

      setTimeout(
        () => {
          element.classList.remove('skeleton-loading');
          element.classList.add('content-loaded');
        },
        Math.random() * 1000 + 500
      );
    };

    document
      .querySelectorAll('.portfolio-item:not(.video-item)')
      .forEach(addSkeletonLoader);
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  new VideoPortfolioManager();
  new EnhancedAnimations();
});

// ===== ENHANCED PORTFOLIO INTERACTIONS =====

// Performance optimizations
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Preloader
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.remove();
    }, 500);
  }, 1500);
});

// Scroll Progress Bar
const updateScrollProgress = () => {
  const scrollProgress = document.querySelector('.scroll-progress-bar');
  const scrollTop = window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = `${scrollPercent}%`;
};

window.addEventListener('scroll', debounce(updateScrollProgress, 10));

// Dark Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Initialize theme
const currentTheme =
  localStorage.getItem('theme') ||
  (prefersDarkScheme.matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);
document.body.classList.toggle('dark-theme', currentTheme === 'dark');
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);

  // Добавляем класс для совместимости с тестами
  document.body.classList.toggle('dark-theme', newTheme === 'dark');

  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);

  // Обновляем навигацию с учетом новой темы
  updateNavbar();
});

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Enhanced Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

const updateNavbar = () => {
  const currentScrollY = window.scrollY;
  const isDarkTheme =
    document.documentElement.getAttribute('data-theme') === 'dark';

  if (currentScrollY > 100) {
    if (isDarkTheme) {
      navbar.style.background = 'rgba(18, 18, 18, 0.98)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    }
    navbar.style.backdropFilter = 'blur(20px)';
    navbar.style.borderBottomColor = 'var(--color-gray-300)';
  } else {
    if (isDarkTheme) {
      navbar.style.background = 'rgba(18, 18, 18, 0.95)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
    navbar.style.backdropFilter = 'blur(10px)';
    navbar.style.borderBottomColor = 'var(--color-gray-200)';
  }

  // Hide/show navbar on scroll
  if (currentScrollY > lastScrollY && currentScrollY > 200) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }

  lastScrollY = currentScrollY;
};

window.addEventListener('scroll', debounce(updateNavbar, 10));

// Mobile menu toggle with enhanced animations
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  navbar.classList.toggle('active');
  document.body.classList.toggle('menu-open');
});

// Close mobile menu when clicking on nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    navbar.classList.remove('active');
    document.body.classList.remove('menu-open');
  });
});

// Enhanced smooth scrolling with easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const targetPosition = target.offsetTop - 80;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Active navigation link highlighting with smooth transitions
const updateActiveNav = () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;

    if (
      window.scrollY >= sectionTop &&
      window.scrollY < sectionTop + sectionHeight
    ) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').substring(1) === current) {
      link.classList.add('active');
    }
  });
};

window.addEventListener('scroll', debounce(updateActiveNav, 50));

// Portfolio Filters
const portfolioFilters = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioFilters.forEach(filter => {
  filter.addEventListener('click', () => {
    // Remove active class from all filters
    portfolioFilters.forEach(f => f.classList.remove('active'));
    // Add active class to clicked filter
    filter.classList.add('active');

    const filterValue = filter.getAttribute('data-filter');

    // Filter portfolio items with animation
    portfolioItems.forEach((item, index) => {
      const itemCategory = item.getAttribute('data-category');

      setTimeout(() => {
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          item.classList.add('show');
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px) scale(0.9)';
          item.classList.remove('show');
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      }, index * 50);
    });
  });
});

// Enhanced portfolio lightbox functionality
function createLightbox() {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <img class="lightbox-image" src="" alt="">
            <div class="lightbox-info">
                <h3 class="lightbox-title"></h3>
                <p class="lightbox-category"></p>
            </div>
            <button class="lightbox-prev">&#10094;</button>
            <button class="lightbox-next">&#10095;</button>
            <div class="lightbox-counter">
                <span class="current">1</span> / <span class="total">6</span>
            </div>
        </div>
    `;
  document.body.appendChild(lightbox);
  return lightbox;
}

// Initialize enhanced portfolio gallery
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = createLightbox();
  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxCategory = lightbox.querySelector('.lightbox-category');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  const currentSpan = lightbox.querySelector('.current');
  const totalSpan = lightbox.querySelector('.total');

  let currentIndex = 0;

  // Update total count
  totalSpan.textContent = portfolioItems.length;

  // Open lightbox with enhanced animations
  portfolioItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentIndex = index;
      showLightbox();
    });
  });

  // Enhanced lightbox display
  function showLightbox() {
    const currentItem = portfolioItems[currentIndex];
    const title = currentItem.querySelector('.portfolio-title').textContent;
    const category = currentItem.querySelector(
      '.portfolio-category'
    ).textContent;
    const img = currentItem.querySelector('.portfolio-image img');

    if (img && img.src) {
      lightboxImage.src = img.src;
    } else {
      lightboxImage.src = `https://picsum.photos/800/1000?random=${currentIndex + 1}`;
    }

    lightboxTitle.textContent = title;
    lightboxCategory.textContent = category;
    currentSpan.textContent = currentIndex + 1;

    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Add entrance animation
    setTimeout(() => {
      lightbox.style.opacity = '1';
      lightboxImage.style.transform = 'scale(1)';
    }, 50);
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      lightbox.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300);
  }

  // Navigation with smooth transitions
  function showNext() {
    lightboxImage.style.transform = 'scale(0.9)';
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % portfolioItems.length;
      showLightbox();
    }, 150);
  }

  function showPrev() {
    lightboxImage.style.transform = 'scale(0.9)';
    setTimeout(() => {
      currentIndex =
        (currentIndex - 1 + portfolioItems.length) % portfolioItems.length;
      showLightbox();
    }, 150);
  }

  // Event listeners
  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', showNext);
  prevBtn.addEventListener('click', showPrev);

  // Close on background click
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Enhanced keyboard navigation
  document.addEventListener('keydown', e => {
    if (lightbox.style.display === 'flex') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
  });
});

// Enhanced portfolio images with lazy loading
document.addEventListener('DOMContentLoaded', () => {
  const imageNames = [
    'portfolio-1.jpg',
    'portfolio-2.jpg',
    'portfolio-3.jpg',
    'portfolio-4.jpg',
    'portfolio-5.jpg',
    'portfolio-6.jpg'
  ];

  const portfolioImages = document.querySelectorAll('.portfolio-image');

  portfolioImages.forEach((image, index) => {
    const img = document.createElement('img');
    img.src = `assets/images/${imageNames[index] || 'portfolio-placeholder.jpg'}`;
    img.alt = 'Portfolio image';
    img.loading = 'lazy'; // Native lazy loading
    img.style.cssText = `
            width: 100%; height: 100%; object-fit: cover; 
            filter: grayscale(10%); transition: all 0.4s ease;
            opacity: 0; transform: scale(1.1);
        `;

    // Enhanced image loading
    img.onload = function () {
      this.style.opacity = '1';
      this.style.transform = 'scale(1)';
    };

    img.onerror = function () {
      this.src = `https://picsum.photos/600/800?random=${index + 20}`;
    };

    const placeholder = image.querySelector('.portfolio-placeholder');
    if (placeholder) {
      image.insertBefore(img, placeholder);
      placeholder.style.display = 'none';
    }

    // Enhanced hover effects
    image.addEventListener('mouseenter', () => {
      img.style.filter = 'grayscale(0%) brightness(1.1)';
      img.style.transform = 'scale(1.05)';
    });

    image.addEventListener('mouseleave', () => {
      img.style.filter = 'grayscale(10%)';
      img.style.transform = 'scale(1)';
    });
  });
});

// Enhanced form handling with validation
const contactForm = document.querySelector('.form');

if (contactForm) {
  // Add floating labels effect
  const formGroups = document.querySelectorAll('.form-group');
  formGroups.forEach(group => {
    const input = group.querySelector('input, textarea');
    const placeholder = input.getAttribute('placeholder');

    input.addEventListener('focus', () => {
      group.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      if (!input.value) {
        group.classList.remove('focused');
      }
    });
  });

  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.querySelector('input[name="name"]');
    const email = document.querySelector('input[name="email"]');
    const message = document.querySelector('textarea[name="message"]');

    // Enhanced validation
    let isValid = true;

    if (name.value.trim() === '') {
      showFieldError(name, 'Name is required');
      isValid = false;
    } else {
      clearFieldError(name);
    }

    if (email.value.trim() === '') {
      showFieldError(email, 'Email is required');
      isValid = false;
    } else if (!isValidEmail(email.value)) {
      showFieldError(email, 'Please enter a valid email');
      isValid = false;
    } else {
      clearFieldError(email);
    }

    if (message.value.trim() === '') {
      showFieldError(message, 'Message is required');
      isValid = false;
    } else {
      clearFieldError(message);
    }

    if (isValid) {
      // Simulate form submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        showSuccessMessage('Thank you! Your message has been sent.');
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 2000);
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(field, message) {
  clearFieldError(field);
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
  field.classList.add('error');
}

function clearFieldError(field) {
  const errorDiv = field.parentNode.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
  field.classList.remove('error');
}

function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  contactForm.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

// Custom Cursor (desktop only)
if (window.innerWidth > 768) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', e => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  // Cursor hover effects
  const hoverElements = document.querySelectorAll(
    'a, button, .portfolio-item, .service-item'
  );
  hoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    element.addEventListener('mouseleave', () =>
      cursor.classList.remove('hover')
    );
  });
}

// Enhanced intersection observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';

      // Stagger animations for child elements
      const children = entry.target.querySelectorAll(
        '.service-item, .portfolio-item'
      );
      children.forEach((child, index) => {
        setTimeout(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }
  });
}, observerOptions);

// Observe elements for enhanced animations
document.addEventListener('DOMContentLoaded', () => {
  const animateElements = document.querySelectorAll(
    '.services, .portfolio, .contact, .about'
  );

  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
    observer.observe(el);
  });
});

// Performance monitoring
const performanceEntries = performance.getEntriesByType('navigation');
if (performanceEntries.length > 0) {
  const loadTime =
    performanceEntries[0].loadEventEnd - performanceEntries[0].loadEventStart;
  if (window.logger)
    window.logger.log(`🚀 Page loaded in ${loadTime.toFixed(2)}ms`);
}

// ===== SCROLL INDICATORS & NAVIGATION =====
class ScrollIndicators {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollIndicators();
    this.setupBackToTop();
    this.setupSmoothScrolling();
  }

  setupScrollIndicators() {
    const indicators = document.querySelectorAll('.scroll-dot');
    const sections = document.querySelectorAll('section[id]');

    if (!indicators.length || !sections.length) return;

    // Обработчики клика для индикаторов
    indicators.forEach(dot => {
      dot.addEventListener('click', () => {
        const sectionId = dot.dataset.section;
        const section = document.getElementById(sectionId);

        if (section) {
          section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Обновление активного индикатора при прокрутке
    const updateActiveIndicator = debounce(() => {
      let currentSection = '';

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (
          rect.top <= window.innerHeight / 2 &&
          rect.bottom >= window.innerHeight / 2
        ) {
          currentSection = section.id;
        }
      });

      indicators.forEach(dot => {
        dot.classList.remove('active');
        if (dot.dataset.section === currentSection) {
          dot.classList.add('active');
        }
      });
    }, 100);

    window.addEventListener('scroll', updateActiveIndicator);
    updateActiveIndicator(); // Инициализация
  }

  setupBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    // Показ/скрытие кнопки
    const toggleBackToTop = debounce(() => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, 100);

    // Клик по кнопке
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', toggleBackToTop);
  }

  setupSmoothScrolling() {
    // Плавная прокрутка для всех внутренних ссылок
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();

        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const offsetTop =
            targetElement.getBoundingClientRect().top + window.pageYOffset - 80;

          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// ===== ENHANCED PRELOADER =====
class EnhancedPreloader {
  constructor() {
    this.loadingSteps = [
      'Инициализация модулей...',
      'Загрузка стилей...',
      'Подготовка анимаций...',
      'Настройка видео...',
      'Финализация...'
    ];
    this.currentStep = 0;
    this.init();
  }

  init() {
    this.updatePreloader();
    this.simulateLoading();
  }

  updatePreloader() {
    const preloaderText = document.getElementById('preloader-text');
    const preloaderBar = document.getElementById('preloader-bar');
    const preloaderDetails = document.getElementById('preloader-details');

    if (preloaderText && this.loadingSteps[this.currentStep]) {
      preloaderText.textContent = this.loadingSteps[this.currentStep];
    }

    if (preloaderBar) {
      const progress = ((this.currentStep + 1) / this.loadingSteps.length) * 100;
      preloaderBar.style.width = `${progress}%`;
    }

    if (preloaderDetails) {
      const details = [
        'Модули: Core, Media, Animations',
        'CSS: Стили портфолио и анимации',
        'JS: Intersection Observer, GSAP',
        'Видео: MediaModule инициализация',
        'Готово к работе!'
      ];

      preloaderDetails.textContent = details[this.currentStep] || '';
    }
  }

  simulateLoading() {
    const interval = setInterval(() => {
      this.currentStep++;

      if (this.currentStep < this.loadingSteps.length) {
        this.updatePreloader();
      } else {
        clearInterval(interval);
        this.hidePreloader();
      }
    }, 300);
  }

  hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.remove();
          this.triggerEntryAnimations();
        }, 500);
      }, 200);
    }
  }

  triggerEntryAnimations() {
    // Запускаем анимации входа для основных элементов
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.opacity = '0';
      hero.style.transform = 'translateY(30px)';

      setTimeout(() => {
        hero.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        hero.style.opacity = '1';
        hero.style.transform = 'translateY(0)';
      }, 100);
    }
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  new ScrollIndicators();
  new EnhancedPreloader();
});

// Enhanced console messages (брендинг для development)
/* eslint-disable no-console */
if (window.logger && window.logger.isDevelopment)
  console.log(
    '%c🎨 Elizaveta Vakalova Portfolio',
    'color: #000; font-size: 20px; font-weight: bold;'
  );
if (window.logger && window.logger.isDevelopment)
  console.log(
    '%cEnhanced with modern web technologies',
    'color: #666; font-size: 14px;'
  );
if (window.logger && window.logger.isDevelopment)
  console.log('%c• Lazy loading images', 'color: #888; font-size: 12px;');
if (window.logger && window.logger.isDevelopment)
  console.log('%c• Dark theme support', 'color: #888; font-size: 12px;');
if (window.logger && window.logger.isDevelopment)
  console.log('%c• Portfolio filters', 'color: #888; font-size: 12px;');
if (window.logger && window.logger.isDevelopment)
  console.log('%c• Enhanced animations', 'color: #888; font-size: 12px;');
if (window.logger && window.logger.isDevelopment)
  console.log('%c• Video integration', 'color: #888; font-size: 12px;');
if (window.logger && window.logger.isDevelopment)
  console.log('%c• Scroll indicators', 'color: #888; font-size: 12px;');
