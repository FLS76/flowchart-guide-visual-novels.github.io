// Переключатель темы (светлая/тёмная).
//
// Состояние хранится в localStorage (ключ "theme") и является общим для всего сайта.
// Модуль settings.js следит за событием "storage", поэтому смена темы в одной вкладке
// мгновенно применяется во всех остальных открытых вкладках.
(function () {
    'use strict';

    var settings = window.SiteSettings || null;

    function currentTheme() {
        if (settings) return settings.getTheme();
        try {
            return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
        } catch (e) {
            return 'dark';
        }
    }

    function updateButton(theme) {
        var button = document.getElementById('themeToggle');
        if (!button) return;
        button.textContent = theme === 'light' ? '☀️' : '🌙';
        button.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
        // title кнопки переводит i18n.js — здесь его не трогаем
    }

    function applyTheme(theme) {
        document.documentElement.classList.toggle('light-theme', theme === 'light');
        updateButton(theme);
    }

    function init() {
        var button = document.getElementById('themeToggle');

        // Применяем сохранённую тему сразу, не переписывая хранилище
        applyTheme(currentTheme());

        if (button) {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var next = document.documentElement.classList.contains('light-theme') ? 'dark' : 'light';
                if (settings) {
                    settings.setTheme(next);
                } else {
                    try {
                        localStorage.setItem('theme', next);
                    } catch (err) {
                        // localStorage недоступен — применяем только на текущей странице
                    }
                    applyTheme(next);
                }
            });
        }

        // Изменение темы в другой вкладке
        if (settings) {
            settings.on('theme', function (theme) {
                applyTheme(theme);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
