// Единое хранилище настроек сайта: тема и язык — общие для всех страниц и вкладок.
//
// Ключи в localStorage:
//   "theme" — "light" | "dark"
//   "lang"  — "ru" | "en"
//
// Изменение в одной вкладке мгновенно применяется во всех остальных открытых
// вкладках: браузер сообщает об этом событием "storage".
(function () {
    'use strict';

    var KEY_THEME = 'theme';
    var KEY_LANG = 'lang';
    var listeners = { theme: [], lang: [] };

    function read(key) {
        try {
            var value = localStorage.getItem(key);
            if (value !== null) return value;
        } catch (e) {
            // localStorage недоступен — используем cookie
        }
        return readCookie(key);
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            // localStorage недоступен (приватный режим, запрет хранилища) — пишем в cookie
        }
        try {
            document.cookie = key + '=' + encodeURIComponent(value) + '; path=/; max-age=31536000; SameSite=Lax';
            return true;
        } catch (e) {
            return false;
        }
    }

    function readCookie(key) {
        try {
            var parts = document.cookie ? document.cookie.split('; ') : [];
            for (var i = 0; i < parts.length; i++) {
                var pair = parts[i].split('=');
                if (decodeURIComponent(pair[0]) === key) {
                    return decodeURIComponent(pair.slice(1).join('='));
                }
            }
        } catch (e) {
            // cookie недоступны
        }
        return null;
    }

    function getTheme() {
        var value = read(KEY_THEME);
        if (value === 'light' || value === 'dark') return value;
        // Фолбэк на класс, который ставит head-скрипт до загрузки страницы
        return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
    }

    function getLang() {
        var value = read(KEY_LANG);
        if (value === 'ru' || value === 'en') return value;
        return document.documentElement.lang === 'en' ? 'en' : 'ru';
    }

    function notify(type, value, source) {
        var list = listeners[type] || [];
        for (var i = 0; i < list.length; i++) {
            try {
                list[i](value, source);
            } catch (e) {
                // Ошибка одного подписчика не должна ломать остальных
            }
        }
        try {
            document.dispatchEvent(new CustomEvent('site:' + type, {
                detail: { value: value, source: source }
            }));
        } catch (e) {
            // CustomEvent может быть недоступен в старых браузерах
        }
    }

    function setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') return;
        write(KEY_THEME, theme);
        notify('theme', theme, 'local');
    }

    function setLang(lang) {
        if (lang !== 'ru' && lang !== 'en') return;
        write(KEY_LANG, lang);
        notify('lang', lang, 'local');
    }

    function on(type, fn) {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
    }

    // Другая вкладка изменила хранилище — применяем изменение у себя
    window.addEventListener('storage', function (e) {
        if (e.key === null) {
            // Вызвали localStorage.clear() — перечитываем актуальные значения
            notify('theme', getTheme(), 'storage');
            notify('lang', getLang(), 'storage');
            return;
        }
        if (e.key === KEY_THEME) {
            notify('theme', e.newValue === 'light' ? 'light' : 'dark', 'storage');
        }
        if (e.key === KEY_LANG) {
            notify('lang', e.newValue === 'en' ? 'en' : 'ru', 'storage');
        }
    });

    // Страница вернулась из кэша bfcache (кнопка «назад»): события storage
    // за время кэширования не доставляются — перечитываем настройки сами.
    window.addEventListener('pageshow', function (e) {
        if (e && e.persisted) {
            notify('theme', getTheme(), 'pageshow');
            notify('lang', getLang(), 'pageshow');
        }
    });

    // Вкладка снова активна — настройки могли измениться, пока она была в фоне
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            notify('theme', getTheme(), 'visible');
            notify('lang', getLang(), 'visible');
        }
    });

    window.SiteSettings = {
        getTheme: getTheme,
        getLang: getLang,
        setTheme: setTheme,
        setLang: setLang,
        on: on
    };

    // Firefox даёт каждому файлу, открытому как file://, отдельное хранилище.
    // Из-за этого общая тема и язык между страницами невозможны — предупреждаем.
    function showLocalFileNotice() {
        if (location.protocol !== 'file:') return;
        if (document.getElementById('localFileNotice')) return;

        var lang = getLang();
        var text = lang === 'en'
            ? 'The site is opened as a local file (file://). Firefox gives every file its own storage, so the theme and language are not shared between pages. Start the local server (K:\\Сайты\\start-site.cmd) and open http://localhost:8765'
            : 'Сайт открыт как локальный файл (file://). Firefox даёт каждому файлу отдельное хранилище, поэтому тема и язык не общие между страницами. Запустите локальный сервер (K:\\Сайты\\start-site.cmd) и откройте http://localhost:8765';

        var box = document.createElement('div');
        box.id = 'localFileNotice';
        box.textContent = text;
        box.setAttribute('role', 'note');
        box.style.cssText = [
            'position:fixed',
            'left:12px',
            'right:12px',
            'bottom:12px',
            'z-index:9999',
            'padding:12px 16px',
            'border-radius:12px',
            'border:1px solid rgba(212,117,10,.45)',
            'background:rgba(255,250,240,.98)',
            'color:#5d4e37',
            'font-family:inherit',
            'font-size:14px',
            'line-height:1.5',
            'box-shadow:0 10px 30px rgba(0,0,0,.18)'
        ].join(';');
        document.body.appendChild(box);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showLocalFileNotice);
    } else {
        showLocalFileNotice();
    }
})();
