# Портфолио изображений

Каталог изображений для портфолио проектов Елизаветы Вакаловой.

## Структура папок

```plaintext
portfolio/
├── 3d-composition.jpg          # Основное изображение героя
├── 3d-composition.svg          # SVG версия
├── freepik__*.jpg              # Изображения проектов (JPG)
├── freepik__*.svg              # SVG заглушки для проектов
└── thumbnails/                 # Миниатюры для галереи
    ├── project1-thumb.webp
    ├── project1-thumb.jpg
    └── ...
```

## Требования к изображениям

### Превью для галереи

- **Размер**: 400x300px (4:3)
- **Форматы**: JPG + WebP
- **Качество**: 85% для JPG, оптимальное для WebP
- **Размер файла**: до 150KB

### Детальные изображения

- **Размер**: до 1920x1080px
- **Форматы**: JPG + WebP
- **Качество**: 90% для JPG
- **Размер файла**: до 500KB

### SVG заглушки

- **Использование**: Временные изображения для разработки
- **Стиль**: Градиентные фоны с названиями проектов
- **Размер файла**: до 10KB

## Оптимизация изображений

Используйте команду для автоматической оптимизации:

```bash
npm run optimize:images
```

## Текущие изображения

### Основные проекты

1. **3D Composition** (`3d-composition.jpg`)
   - Основное изображение для hero-секции
   - Размер: 800x600px
   - Формат: JPG/SVG

2. **DRICTILE** (`freepik__subtle-variation-of-the-previous-electronic-music-__38651.*`)
   - Абстрактная типографика и флюид дизайн
   - Размер: 896x1280px
   - Категории: Typography, Abstract, Poster Design

3. **Chrome Spheres** (`freepik__upload__96336.*`)
   - 3D металлические композиции
   - Размер: 400x400px (квадрат)
   - Категории: 3D Art, Chrome

4. **EFEST Festival** (`freepik__upload__96337.*`, `freepik__upload__96338.*`)
   - Постеры электронного музыкального фестиваля
   - Размер: 400x400px (квадрат)
   - Категории: Event Design, Music, 3D

### Дополнительные работы

1. **Color Geometry** (`freepik__upload__96339.*`)
   - Абстрактные геометрические композиции
   - Категории: Abstract, Geometry

2. **Chrome Installation** (`freepik__upload__96340.*`)
   - Сложные 3D инсталляции
   - Категории: 3D Art, Installation, Chrome

## Техническая реализация

### Адаптивные изображения

```html
<picture>
  <source
    media="(max-width: 768px)"
    srcset="project1/mobile.webp"
    type="image/webp"
  />
  <source media="(max-width: 768px)" srcset="project1/mobile.jpg" />
  <source srcset="project1/desktop.webp" type="image/webp" />
  <img src="project1/desktop.jpg" alt="Проект 1 - описание" loading="lazy" />
</picture>
```

### Lazy Loading

```javascript
// Модуль media-optimized.js обрабатывает загрузку
const lazyImages = document.querySelectorAll('img[loading="lazy"]')
const imageObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      imageObserver.unobserve(img)
    }
  })
})
```

### Интеграция с галереей

```javascript
// Модуль gallery-browser.js
class PortfolioGallery {
  initSingleGallery(element, index) {
    const images = element.querySelectorAll('img, [data-src]')
    images.forEach((img, imgIndex) => {
      img.addEventListener('click', e => {
        e.preventDefault()
        this.openLightbox(gallery, imgIndex)
      })
    })
  }
}
```

## Авторские права

Все изображения используются в качестве временных заглушек для разработки.
При коммерческом использовании необходимо заменить на оригинальные работы или получить соответствующие лицензии.

## Контакты

По вопросам использования изображений: [hello@elizaveta-portfolio.com](mailto:hello@elizaveta-portfolio.com)
