// Заглушка для изображения схемы, если файл ещё не загружен в assets/schemas.
//
// Пока файла нет, вместо «битой» картинки показывается аккуратная плашка
// с пояснением. Текст переводится вместе с языком сайта.
(function () {
    'use strict';

    var TEXT = {
        ru: 'Изображение схемы пока не добавлено. Файл нужно положить в папку assets/schemas с именем ',
        en: 'The schema image has not been added yet. The file must be placed in the assets/schemas folder as '
    };

    var current = null;

    function placeholderText(fileName) {
        var lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
        var base = TEXT[lang] || TEXT.ru;
        if (!fileName) return base;
        return base + fileName;
    }

    function fileNameFromSrc(src) {
        if (!src) return '';
        var clean = src.split('?')[0].split('/').pop();
        return clean || '';
    }

    function showPlaceholder(img) {
        if (!img || !img.parentNode) return;
        var box = document.createElement('div');
        box.className = 'schema-image-missing';
        box.setAttribute('role', 'status');
        var fileName = fileNameFromSrc(img.getAttribute('src'));
        box.textContent = placeholderText(fileName);
        img.parentNode.replaceChild(box, img);
        current = box;
    }

    function init() {
        var images = document.querySelectorAll('img.schema-image');
        for (var i = 0; i < images.length; i++) {
            (function (img) {
                // Если файл уже загрузился — ничего не делаем
                if (img.complete && img.naturalWidth > 0) return;
                img.addEventListener('error', function () { showPlaceholder(img); });
                // Если картинка не загрузилась до запуска обработчика
                if (img.complete && img.naturalWidth === 0) showPlaceholder(img);
            })(images[i]);
        }

        // Язык поменяли — обновляем текст плашки
        if (window.SiteSettings) {
            window.SiteSettings.on('lang', function () {
                if (!current) return;
                var fileName = fileNameFromSrc(current.getAttribute('data-file') || '');
                current.textContent = placeholderText(fileName);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
