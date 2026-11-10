// Переключатель темы (светлая/тёмная) - глобальное сохранение
(function() {
    'use strict';
    
    // Применяем сохранённую тему сразу при загрузке (до рендеринга)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    }
    
    // Ждём загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            applyTheme();
        });
    } else {
        applyTheme();
    }
    
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
})();
