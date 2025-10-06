/**
 * Portfolio Forms Module - Browser Compatible
 * Модуль форм для портфолио без ES6 импортов
 */

(function (window) {
  'use strict';

  class PortfolioForms {
    constructor() {
      this.forms = [];
      this.isInitialized = false;

      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initForms());
      } else {
        this.initForms();
      }
    }

    initForms() {
      try {
        // Находим все формы на странице
        const formElements = document.querySelectorAll('form');

        if (formElements.length === 0) {
          return;
        }

        // Инициализируем каждую форму
        formElements.forEach((form, index) => {
          this.initSingleForm(form, index);
        });

        this.isInitialized = true;
      } catch (error) {
        // Ошибка не критична для форм
      }
    }

    initSingleForm(form, index) {
      const formId = form.id || `form-${index}`;

      const formConfig = {
        id: formId,
        element: form,
        fields: this.getFormFields(form),
        isSubmitting: false
      };

      // Настраиваем валидацию
      this.setupValidation(formConfig);

      // Настраиваем отправку
      this.setupSubmission(formConfig);

      this.forms.push(formConfig);
    }

    getFormFields(form) {
      const fields = [];
      const inputs = form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        fields.push({
          element: input,
          name: input.name,
          type: input.type,
          required: input.required,
          value: input.value
        });
      });

      return fields;
    }

    setupValidation(formConfig) {
      formConfig.fields.forEach(field => {
        if (field.required) {
          field.element.addEventListener('blur', () => {
            this.validateField(field);
          });
        }
      });
    }

    setupSubmission(formConfig) {
      formConfig.element.addEventListener('submit', e => {
        e.preventDefault();
        this.handleSubmit(formConfig);
      });
    }

    validateField(field) {
      const value = field.element.value.trim();
      let isValid = true;

      // Проверяем обязательные поля
      if (field.required && !value) {
        isValid = false;
      }

      // Проверяем email
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
      }

      // Добавляем/убираем класс ошибки
      if (isValid) {
        field.element.classList.remove('error');
      } else {
        field.element.classList.add('error');
      }

      return isValid;
    }

    validateForm(formConfig) {
      let isValid = true;

      formConfig.fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    }

    async handleSubmit(formConfig) {
      if (formConfig.isSubmitting) return;

      // Валидируем форму
      if (!this.validateForm(formConfig)) {
        this.showMessage(
          formConfig.element,
          'Пожалуйста, исправьте ошибки в форме',
          'error'
        );
        return;
      }

      formConfig.isSubmitting = true;

      // Показываем загрузку
      this.showLoading(formConfig.element, true);

      try {
        // Имитируем отправку (можно заменить на реальный запрос)
        await this.simulateSubmission(formConfig);

        this.showMessage(
          formConfig.element,
          'Сообщение успешно отправлено!',
          'success'
        );
        formConfig.element.reset();
      } catch (error) {
        this.showMessage(
          formConfig.element,
          'Произошла ошибка при отправке',
          'error'
        );
      } finally {
        formConfig.isSubmitting = false;
        this.showLoading(formConfig.element, false);
      }
    }

    simulateSubmission() {
      return new Promise(resolve => {
        setTimeout(resolve, 1000); // Имитируем задержку сети
      });
    }

    showLoading(form, show) {
      const submitButton = form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

      if (submitButton) {
        if (show) {
          submitButton.disabled = true;
          submitButton.dataset.originalText = submitButton.textContent;
          submitButton.textContent = 'Отправка...';
        } else {
          submitButton.disabled = false;
          submitButton.textContent =
            submitButton.dataset.originalText || 'Отправить';
        }
      }
    }

    showMessage(message, type, form = document.body) {
      // Удаляем предыдущие сообщения
      const existingMessage = form.querySelector('.form-message');
      if (existingMessage) {
        existingMessage.remove();
      }

      // Создаем новое сообщение
      const messageEl = document.createElement('div');
      messageEl.className = `form-message form-message--${type}`;
      messageEl.textContent = message;

      // Добавляем стили
      this.addMessageStyles();

      // Вставляем сообщение
      form.appendChild(messageEl);

      // Автоудаление через 5 секунд
      setTimeout(() => {
        if (messageEl.parentElement) {
          messageEl.remove();
        }
      }, 5000);
    }

    addMessageStyles() {
      if (document.getElementById('forms-styles')) return;

      const styles = document.createElement('style');
      styles.id = 'forms-styles';
      styles.textContent = `
        .form-message {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
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

        .error {
          border-color: #dc3545 !important;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }

        input.error:focus, textarea.error:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
      `;

      document.head.appendChild(styles);
    }

    // Публичные методы
    cleanup() {
      this.forms.forEach(formConfig => {
        formConfig.fields.forEach(field => {
          field.element.classList.remove('error');
        });
      });

      const styles = document.getElementById('forms-styles');
      if (styles) {
        styles.remove();
      }

      this.forms = [];
    }
  }

  // Экспортируем в глобальную область видимости
  window.PortfolioForms = PortfolioForms;
})(window);
