/**
 * Forms Module - Модуль обработки форм портфолио
 * Управляет валидацией и отправкой форм
 */
export class FormsModule {
  constructor() {
    this.initialized = false
    this.forms = new Map()
    this.validators = new Map()
    this.moduleName = 'forms'
  }

  /**
   * Инициализация модуля
   */
  async init() {
    if (this.initialized) {
      return
    }

    this.setupForms()
    this.setupValidation()
    this.setupSubmissionHandlers()

    this.initialized = true
  }

  /**
   * Настройка форм
   */
  setupForms() {
    const forms = document.querySelectorAll('form[data-portfolio-form]')

    forms.forEach(form => {
      const formId = form.id || `form-${Date.now()}`
      const formConfig = {
        element: form,
        type: form.dataset.portfolioForm || 'contact',
        fields: this.getFormFields(form),
        isSubmitting: false
      }

      this.forms.set(formId, formConfig)
      this.setupFormEvents(formConfig)
    })
  }

  /**
   * Получение полей формы
   */
  getFormFields(form) {
    const fields = form.querySelectorAll('input, textarea, select')
    const fieldMap = new Map()

    fields.forEach(field => {
      if (field.name) {
        fieldMap.set(field.name, {
          element: field,
          type: field.type || 'text',
          required: field.hasAttribute('required'),
          value: field.value,
          valid: true,
          errors: []
        })
      }
    })

    return fieldMap
  }

  /**
   * Настройка событий формы
   */
  setupFormEvents(formConfig) {
    const form = formConfig.element

    form.addEventListener('submit', e => {
      e.preventDefault()
      this.handleSubmit(formConfig)
    })

    // Валидация в реальном времени
    formConfig.fields.forEach(field => {
      field.element.addEventListener('blur', () => {
        this.validateField(field)
      })

      field.element.addEventListener('input', () => {
        // Очищаем ошибки при изменении
        this.clearFieldErrors(field)
      })
    })
  }

  /**
   * Настройка валидации
   */
  setupValidation() {
    // Стандартные валидаторы
    this.validators.set('required', value => {
      return value.trim() !== '' || 'Поле обязательно для заполнения'
    })

    this.validators.set('email', value => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) || 'Введите корректный email адрес'
    })

    this.validators.set('phone', value => {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      return (
        phoneRegex.test(value.replace(/\s/g, '')) ||
        'Введите корректный номер телефона'
      )
    })

    this.validators.set('minLength', (value, minLength) => {
      return (
        value.length >= minLength || `Минимальная длина: ${minLength} символов`
      )
    })

    this.validators.set('maxLength', (value, maxLength) => {
      return (
        value.length <= maxLength || `Максимальная длина: ${maxLength} символов`
      )
    })
  }

  /**
   * Валидация поля
   */
  validateField(field) {
    field.errors = []
    field.valid = true

    const value = field.element.value
    const element = field.element

    // Проверка обязательности
    if (field.required) {
      const result = this.validators.get('required')(value)
      if (typeof result === 'string') {
        field.errors.push(result)
        field.valid = false
      }
    }

    // Проверка email
    if (field.type === 'email' && value) {
      const result = this.validators.get('email')(value)
      if (typeof result === 'string') {
        field.errors.push(result)
        field.valid = false
      }
    }

    // Проверка телефона
    if (field.type === 'tel' && value) {
      const result = this.validators.get('phone')(value)
      if (typeof result === 'string') {
        field.errors.push(result)
        field.valid = false
      }
    }

    // Проверка минимальной длины
    const minLength = element.getAttribute('data-min-length')
    if (minLength && value) {
      const result = this.validators.get('minLength')(
        value,
        parseInt(minLength)
      )
      if (typeof result === 'string') {
        field.errors.push(result)
        field.valid = false
      }
    }

    // Проверка максимальной длины
    const maxLength = element.getAttribute('data-max-length')
    if (maxLength && value) {
      const result = this.validators.get('maxLength')(
        value,
        parseInt(maxLength)
      )
      if (typeof result === 'string') {
        field.errors.push(result)
        field.valid = false
      }
    }

    this.showFieldValidation(field)
    return field.valid
  }

  /**
   * Показ результатов валидации поля
   */
  showFieldValidation(field) {
    const element = field.element
    const errorContainer = element.parentElement.querySelector('.field-error')

    if (field.valid) {
      element.classList.remove('error')
      element.classList.add('valid')
      if (errorContainer) {
        errorContainer.textContent = ''
        errorContainer.style.display = 'none'
      }
    } else {
      element.classList.remove('valid')
      element.classList.add('error')

      if (errorContainer) {
        errorContainer.textContent = field.errors[0]
        errorContainer.style.display = 'block'
      } else {
        // Создаем контейнер для ошибки
        const errorDiv = document.createElement('div')
        errorDiv.className = 'field-error'
        errorDiv.textContent = field.errors[0]
        element.parentElement.appendChild(errorDiv)
      }
    }
  }

  /**
   * Очистка ошибок поля
   */
  clearFieldErrors(field) {
    const element = field.element
    const errorContainer = element.parentElement.querySelector('.field-error')

    element.classList.remove('error')
    if (errorContainer) {
      errorContainer.style.display = 'none'
    }
  }

  /**
   * Настройка обработчиков отправки
   */
  setupSubmissionHandlers() {
    // Добавляем стили для состояний форм
    const style = document.createElement('style')
    style.textContent = `
      .form-field.error input,
      .form-field.error textarea {
        border-color: #ff4757;
        background-color: #fff5f5;
      }
      
      .form-field.valid input,
      .form-field.valid textarea {
        border-color: #2ed573;
        background-color: #f0fff4;
      }
      
      .field-error {
        color: #ff4757;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: none;
      }
      
      .form-message {
        padding: 1rem;
        border-radius: 4px;
        margin: 1rem 0;
      }
      
      .form-message--success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      
      .form-message--error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      
      .form-submitting {
        opacity: 0.7;
        pointer-events: none;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Обработка отправки формы
   */
  async handleSubmit(formConfig) {
    if (formConfig.isSubmitting) {
      return
    }

    // Валидация всех полей
    let isValid = true
    formConfig.fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false
      }
    })

    if (!isValid) {
      this.showMessage(
        'Пожалуйста, исправьте ошибки в форме',
        'error',
        formConfig.element
      )
      return
    }

    // Подготовка данных
    const formData = this.getFormData(formConfig)

    try {
      formConfig.isSubmitting = true
      this.showLoading(formConfig.element, true)

      // Отправка данных
      await this.submitForm(formData, formConfig)

      // Успешная отправка
      this.showMessage(
        'Сообщение успешно отправлено!',
        'success',
        formConfig.element
      )
      this.resetForm(formConfig)
    } catch (error) {
      this.showMessage(
        'Произошла ошибка при отправке. Попробуйте еще раз.',
        'error',
        formConfig.element
      )
      // Form submission error handled
    } finally {
      formConfig.isSubmitting = false
      this.showLoading(formConfig.element, false)
    }
  }

  /**
   * Получение данных формы
   */
  getFormData(formConfig) {
    const data = {}

    formConfig.fields.forEach((field, name) => {
      data[name] = field.element.value
    })

    return data
  }

  /**
   * Отправка формы
   */
  async submitForm() {
    // Здесь должна быть реальная отправка на сервер
    // Пока что имитируем отправку
    return new Promise(resolve => {
      setTimeout(() => {
        // Имитация успешной отправки
        resolve({ success: true })
      }, 1000)
    })
  }

  /**
   * Показ состояния загрузки
   */
  showLoading(form, show) {
    const submitButton = form.querySelector(
      'button[type="submit"], input[type="submit"]'
    )

    if (show) {
      form.classList.add('form-submitting')
      if (submitButton) {
        submitButton.disabled = true
        submitButton.dataset.originalText = submitButton.textContent
        submitButton.textContent = 'Отправка...'
      }
    } else {
      form.classList.remove('form-submitting')
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent =
          submitButton.dataset.originalText || 'Отправить'
      }
    }
  }

  /**
   * Показ сообщения
   */
  showMessage(message, type, form = document.body) {
    // Удаляем предыдущие сообщения
    const existingMessage = form.querySelector('.form-message')
    if (existingMessage) {
      existingMessage.remove()
    }

    // Создаем новое сообщение
    const messageEl = document.createElement('div')
    messageEl.className = `form-message form-message--${type}`
    messageEl.textContent = message

    // Вставляем сообщение
    form.appendChild(messageEl)

    // Автоудаление через 5 секунд
    setTimeout(() => {
      if (messageEl.parentElement) {
        messageEl.remove()
      }
    }, 5000)
  }

  /**
   * Сброс формы
   */
  resetForm(formConfig) {
    const form = formConfig.element
    form.reset()

    // Очищаем состояния полей
    formConfig.fields.forEach(field => {
      field.element.classList.remove('valid', 'error')
      this.clearFieldErrors(field)
    })
  }

  /**
   * Уничтожение модуля
   */
  destroy() {
    this.forms.clear()
    this.validators.clear()
    this.initialized = false

    // Forms module destroyed
  }
}

// Экспорт по умолчанию
export default FormsModule
