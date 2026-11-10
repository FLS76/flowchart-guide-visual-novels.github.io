// Переключатель темы (светлая/тёмная) - глобальное сохранение
(function() {
    'use strict';
    
    function applyTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        // Проверяем текущую тему
        const isLight = document.documentElement.classList.contains('light-theme');
        themeToggle.textContent = isLight ? '☀️' : '🌙';
        
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const html = document.documentElement;
            html.classList.toggle('light-theme');
            const nowLight = html.classList.contains('light-theme');
            
            themeToggle.textContent = nowLight ? '☀️' : '🌙';
            localStorage.setItem('theme', nowLight ? 'light' : 'dark');
        });
    }
    
    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTheme);
    } else {
        applyTheme();
    }
})();
