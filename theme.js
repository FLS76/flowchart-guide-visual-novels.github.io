// Переключатель темы (светлая/тёмная)
(function() {
    'use strict';
    
    function initTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (!themeToggle) return;
        
        // Проверяем сохранённую тему
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.classList.add('light-theme');
            themeToggle.textContent = '☀️';
        }
        
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            body.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');
            themeToggle.textContent = isLight ? '☀️' : '🌙';
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }
    
    // Запускаем сразу, если DOM уже загружен
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
