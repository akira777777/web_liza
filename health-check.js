// Quick Health Check Script для проверки модулей

console.log('🏥 Health Check: Проверка загрузки модулей...');

// Проверяем наличие основных объектов
setTimeout(() => {
  const checks = {
    'Main App': typeof window.PortfolioApp !== 'undefined',
    Gallery: typeof window.PortfolioGallery !== 'undefined',
    Forms: typeof window.PortfolioForms !== 'undefined',
    'DOM Ready':
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
  };

  console.log('📊 Результаты проверки:');
  Object.entries(checks).forEach(([module, status]) => {
    console.log(
      `${status ? '✅' : '❌'} ${module}: ${status ? 'OK' : 'FAILED'}`
    );
  });

  const allOK = Object.values(checks).every(status => status);
  console.log(
    `🎯 Общий статус: ${allOK ? '✅ ВСЁ РАБОТАЕТ' : '❌ ЕСТЬ ПРОБЛЕМЫ'}`
  );

  // Визуальный индикатор на странице
  const indicator = document.createElement('div');
  indicator.id = 'health-indicator';
  indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 10px 15px;2a483fd5-8efa-40f0-a289-f908f332e8c4
        border-radius: 5px;
        color: white;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        transition: all 0.3s ease;
        ${
          allOK
            ? 'background: linear-gradient(135deg, #4CAF50, #45a049); box-shadow: 0 2px 10px rgba(76,175,80,0.3);'
            : 'background: linear-gradient(135deg, #f44336, #d32f2f); box-shadow: 0 2px 10px rgba(244,67,54,0.3);'
        }
    `;
  indicator.innerHTML = `🔧 ${allOK ? 'ВСЁ РАБОТАЕТ' : 'ЕСТЬ ПРОБЛЕМЫ'}`;
  document.body.appendChild(indicator);

  // Убираем через 5 секунд
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }, 5000);
}, 2000);
