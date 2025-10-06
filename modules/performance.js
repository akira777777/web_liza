/**
 * Performance Module - Модуль мониторинга производительности
 * Отслеживает метрики производительности и ошибки
 */
export class PerformanceModule {
  constructor() {
    this.metrics = new Map();
    this.errors = [];
    this.initialized = false;
    this.startTime = performance.now();
  }

  /**
   * Инициализация модуля
   */
  async init() {
    if (this.initialized) {
      return;
    }

    try {
      this.setupMetrics();
      this.setupErrorTracking();
      this.setupPerformanceObserver();

      this.initialized = true;
      console.log('📊 Performance module initialized');
    } catch (error) {
      console.error('❌ Performance module initialization failed:', error);
      throw error;
    }
  }

  /**
   * Настройка базовых метрик
   */
  setupMetrics() {
    // Инициализируем базовые метрики
    this.metrics.set('pageLoadStart', this.startTime);
    this.metrics.set('jsHeapSize', this.getMemoryInfo());

    // Отслеживаем загрузку страницы
    window.addEventListener('load', () => {
      this.recordMetric('pageLoadEnd', performance.now());
      this.recordMetric('totalLoadTime', performance.now() - this.startTime);
      this.analyzeNavigationTiming();
    });
  }

  /**
   * Настройка отслеживания ошибок
   */
  setupErrorTracking() {
    // JavaScript ошибки
    window.addEventListener('error', event => {
      this.recordError('javascript', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    // Promise rejection ошибки
    window.addEventListener('unhandledrejection', event => {
      this.recordError('promise', {
        reason: event.reason,
        timestamp: Date.now()
      });
    });

    // Resource loading ошибки
    window.addEventListener(
      'error',
      event => {
        if (event.target !== window) {
          this.recordError('resource', {
            element: event.target.tagName,
            source: event.target.src || event.target.href,
            timestamp: Date.now()
          });
        }
      },
      true
    );
  }

  /**
   * Настройка Performance Observer
   */
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        // Наблюдаем за navigation timing
        const navigationObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            this.recordMetric(`navigation_${entry.name}`, entry.duration);
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });

        // Наблюдаем за resource timing
        const resourceObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 100) {
              // Только медленные ресурсы
              this.recordMetric(`resource_${entry.name}`, entry.duration);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Наблюдаем за paint timing
        const paintObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            this.recordMetric(entry.name, entry.startTime);
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('Performance Observer setup failed:', error);
      }
    }
  }

  /**
   * Анализ Navigation Timing API
   */
  analyzeNavigationTiming() {
    if (!performance.timing) return;

    const timing = performance.timing;
    const metrics = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      dom: timing.domContentLoadedEventEnd - timing.domLoading,
      load: timing.loadEventEnd - timing.loadEventStart
    };

    Object.entries(metrics).forEach(([key, value]) => {
      if (value > 0) {
        this.recordMetric(`timing_${key}`, value);
      }
    });
  }

  /**
   * Получение информации о памяти
   */
  getMemoryInfo() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * Запись метрики
   */
  recordMetric(name, value) {
    this.metrics.set(name, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Запись ошибки
   */
  recordError(type, details) {
    const error = {
      type,
      details,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errors.push(error);

    // Ограничиваем количество ошибок в памяти
    if (this.errors.length > 50) {
      this.errors.shift();
    }

    // Отправляем в мониторинг (если настроен)
    this.sendToMonitoring(error);
  }

  /**
   * Отправка данных в мониторинг
   */
  sendToMonitoring(error) {
    // Интеграция с внешними сервисами мониторинга
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `${error.type}: ${JSON.stringify(error.details)}`,
        fatal: false
      });
    }

    // Можно добавить Sentry, LogRocket и т.д.
    if (window.Sentry) {
      window.Sentry.captureException(new Error(JSON.stringify(error.details)));
    }
  }

  /**
   * Получение всех метрик
   */
  getMetrics() {
    const result = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Получение всех ошибок
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Получение отчета о производительности
   */
  getPerformanceReport() {
    return {
      metrics: this.getMetrics(),
      errors: this.getErrors(),
      memoryInfo: this.getMemoryInfo(),
      timestamp: Date.now()
    };
  }

  /**
   * Измерение времени выполнения функции
   */
  measureFunction(fn, name = 'anonymous') {
    const startTime = performance.now();

    try {
      const result = fn();

      // Если результат - Promise
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const duration = performance.now() - startTime;
          this.recordMetric(`function_${name}`, duration);
        });
      }

      // Синхронная функция
      const duration = performance.now() - startTime;
      this.recordMetric(`function_${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(`function_${name}_error`, duration);
      this.recordError('function', {
        name,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Создание маркера производительности
   */
  mark(name) {
    if (performance.mark) {
      performance.mark(name);
    }
    this.recordMetric(`mark_${name}`, performance.now());
  }

  /**
   * Измерение между маркерами
   */
  measure(name, startMark, endMark) {
    if (performance.measure && performance.mark) {
      try {
        performance.measure(name, startMark, endMark);
        const entry = performance.getEntriesByName(name, 'measure')[0];
        if (entry) {
          this.recordMetric(`measure_${name}`, entry.duration);
        }
      } catch (error) {
        console.warn('Performance measure failed:', error);
      }
    }
  }

  /**
   * Очистка старых данных
   */
  cleanup() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 часа

    // Очищаем старые ошибки
    this.errors = this.errors.filter(error => error.timestamp > cutoff);

    // Очищаем старые метрики
    this.metrics.forEach((value, key) => {
      if (value.timestamp && value.timestamp < cutoff) {
        this.metrics.delete(key);
      }
    });
  }

  /**
   * Уничтожение модуля
   */
  destroy() {
    this.metrics.clear();
    this.errors.length = 0;
    this.initialized = false;
    console.log('📊 Performance module destroyed');
  }
}

// Экспорт по умолчанию
export default PerformanceModule;
