module.exports = {
  plugins: {
    autoprefixer: {
      // Используем конфигурацию из .browserslistrc
      // Автоматически исключаем Internet Explorer
      remove: false, // Сохраняем префиксы для совместимости
      cascade: false // Более читаемый вывод
    }
  }
}
