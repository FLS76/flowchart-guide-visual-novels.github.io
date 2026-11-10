// Переключатель темы (светлая/тёмная) с глобальным сохранением.
(function () {
    'use strict';

    var STORAGE_KEY = 'theme';

    function readTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
        } catch (e) {
            return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
        }
    }

    function updateButton(theme) {
        var button = document.getElementById('themeToggle');
        if (!button) return;
        button.textContent = theme === 'light' ? '☀️' : '🌙';
        button.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }

    function setTheme(theme, persist) {
        document.documentElement.classList.toggle('light-theme', theme === 'light');
        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (e) {
                // localStorage может быть недоступен при открытии через file://
            }
        }
        updateButton(theme);
    }

    function init() {
        var button = document.getElementById('themeToggle');
        if (!button) return;

        var theme = readTheme();
        // Применяем сохранённую тему без перезаписи localStorage
        setTheme(theme, false);

        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var next = document.documentElement.classList.contains('light-theme') ? 'dark' : 'light';
            // При переключении всегда сохраняем
            setTheme(next, true);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
