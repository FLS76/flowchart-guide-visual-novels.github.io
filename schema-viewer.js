// Просмотрщик блок-схем.
//
// Открывается по клику на изображение схемы. Умеет:
//   • масштабировать колёсиком (с привязкой к курсору) и кнопками;
//   • панорамировать перетаскиванием мышью или пальцем;
//   • показывать схему целиком, по ширине или по высоте;
//   • показывать реальный размер (1:1);
//   • переключать схемы стрелками / свайпом;
//   • показывать мини-карту с рамкой текущего участка;
//   • открыть оригинал в новой вкладке и скачать файл.
//
// Управление с клавиатуры:
//   Esc      — закрыть
//   + / -    — масштаб
//   0        — вписать целиком
//   1        — реальный размер (1:1)
//   W        — по ширине
//   H        — по высоте
//   ← / →    — предыдущая / следующая схема
//   M        — показать или скрыть мини-карту
//   F        — полноэкранный режим
(function () {
    'use strict';

    var SCALE_MIN = 0.02;
    var SCALE_MAX = 12;
    var SCALE_STEP = 1.25;

    // Состояние просмотра
    var view = {
        scale: 1,      // текущий масштаб
        x: 0,          // смещение по X (пиксели экрана)
        y: 0,          // смещение по Y
        dragging: false,
        startX: 0,
        startY: 0,
        originX: 0,
        originY: 0,
        naturalW: 0,
        naturalH: 0,
        fitMode: 'contain' // contain | width | height | actual
    };

    var images = [];      // [{ url, alt, title }]
    var current = 0;

    var modal, backdrop, stage, canvas, picture, loader;
    var toolbar, counter, scaleReadout, minimap, minimapImg, minimapWindow;
    var btnPrev, btnNext, btnZoomOut, btnZoomIn, btnFit, btnActual, btnWidth, btnHeight;
    var btnOriginal, btnFullscreen, btnMap, btnClose;

    var settings = window.SiteSettings || null;

    // ===== Локализация =====

    var I18N = {
        ru: {
            close: 'Закрыть просмотрщик',
            prev: 'Предыдущая схема',
            next: 'Следующая схема',
            zoomIn: 'Увеличить',
            zoomOut: 'Уменьшить',
            fit: 'Вписать целиком',
            actual: 'Реальный размер (1:1)',
            width: 'По ширине',
            height: 'По высоте',
            original: 'Открыть оригинал в новой вкладке',
            fullscreen: 'Полноэкранный режим',
            minimap: 'Показать или скрыть мини-карту',
            loading: 'Загрузка схемы…',
            failed: 'Не удалось загрузить изображение',
            of: 'из',
            hints: 'Закрыть',
            hZoom: 'Масштаб',
            hFit: 'Вписать целиком',
            hActual: 'Реальный размер',
            hWidth: 'По ширине',
            hHeight: 'По высоте',
            hMap: 'Мини-карта',
            hFull: 'Полный экран',
            hNav: 'Схема вперёд / назад'
        },
        en: {
            close: 'Close viewer',
            prev: 'Previous flowchart',
            next: 'Next flowchart',
            zoomIn: 'Zoom in',
            zoomOut: 'Zoom out',
            fit: 'Fit to screen',
            actual: 'Actual size (1:1)',
            width: 'Fit to width',
            height: 'Fit to height',
            original: 'Open original in a new tab',
            fullscreen: 'Toggle fullscreen',
            minimap: 'Show or hide minimap',
            loading: 'Loading flowchart…',
            failed: 'Could not load the image',
            of: 'of',
            hints: 'Close',
            hZoom: 'Zoom',
            hFit: 'Fit to screen',
            hActual: 'Actual size',
            hWidth: 'Fit to width',
            hHeight: 'Fit to height',
            hMap: 'Minimap',
            hFull: 'Fullscreen',
            hNav: 'Previous / next flowchart'
        }
    };

    function lang() {
        return document.documentElement.lang === 'en' ? 'en' : 'ru';
    }

    function t(key) {
        var dict = I18N[lang()] || I18N.ru;
        return dict[key] || I18N.ru[key] || key;
    }

    // ===== Сбор данных =====

    function collectImages() {
        var list = [];
        var seen = {};

        function add(url, alt, title) {
            if (!url || seen[url]) return;
            seen[url] = true;
            list.push({ url: url, alt: alt || '', title: title || '' });
        }

        // Ищем картинки схем на странице
        var imgs = document.querySelectorAll('img.schema-image');
        for (var i = 0; i < imgs.length; i++) {
            var el = imgs[i];
            var link = el.closest ? el.closest('.schema-link') : null;
            var href = link ? link.getAttribute('href') : null;
            add(el.currentSrc || el.src || el.getAttribute('data-src'), el.alt, href);
        }

        // Ссылки на оригинал (если картинка не отрисовалась)
        if (list.length === 0) {
            var links = document.querySelectorAll('.schema-link[href]');
            for (var j = 0; j < links.length; j++) {
                var href2 = links[j].getAttribute('href');
                if (!href2 || !/\.(png|jpe?g|webp)$/i.test(href2)) continue;
                var inner = links[j].querySelector('img');
                add(href2, inner ? inner.alt : '', href2);
            }
        }

        return list;
    }

    // ===== Построение окна =====

    function buildModal() {
        modal = document.createElement('div');
        modal.className = 'sv-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Просмотрщик блок-схем');

        modal.innerHTML = [
            '<div class="sv-backdrop"></div>',
            '<div class="sv-stage">',
            '    <div class="sv-canvas"><img class="sv-picture" draggable="false" alt=""></div>',
            '    <div class="sv-loader"><span class="sv-spinner"></span><span class="sv-loader-text"></span></div>',
            '</div>',
            '<div class="sv-topbar">',
            '    <span class="sv-counter"></span>',
            '</div>',
            '<div class="sv-minimap">',
            '    <img class="sv-minimap-img" alt="">',
            '    <div class="sv-minimap-window"></div>',
            '</div>',
            '<div class="sv-hint">' +
            '    <button type="button" class="sv-hint-btn" data-act="hint" aria-label="Подсказки">?</button>' +
            '    <div class="sv-hint-panel">' +
            '        <div class="sv-hint-row"><kbd>Esc</kbd><span class="sv-hint-key"></span></div>' +
            '        <div class="sv-hint-row"><kbd>+</kbd><kbd>−</kbd><span class="sv-hint-key"></span></div>' +
            '        <div class="sv-hint-row"><kbd>0</kbd><span class="sv-hint-key"></span></div>' +
            '        <div class="sv-hint-row"><kbd>1</kbd><span class="sv-hint-key"></span></div>' +
            '        <div class="sv-hint-row"><kbd>W</kbd><span class="sv-hint-key"></span></div>' +
            '        <div class="sv-hint-row"><kbd>H</kbd><span class="sv-hint-key"></span></div>' +
            '        <div class="sv-hint-row"><kbd>M</kbd><span class="sv-hint-key"></span></div>' +
            '        <div class="sv-hint-row"><kbd>F</kbd><span class="sv-hint-key"></span></div>' +
            '        <div class="sv-hint-row"><kbd>←</kbd><kbd>→</kbd><span class="sv-hint-key"></span></div>' +
            '    </div>',
            '</div>',
            '<div class="sv-toolbar">',
            '    <button type="button" class="sv-btn sv-prev" data-act="prev"><svg viewBox="0 0 24 24"><path d="M15 5 8 12l7 7"/></svg></button>',
            '    <button type="button" class="sv-btn sv-zoom-out" data-act="zoomOut"><svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button>',
            '    <span class="sv-scale">100%</span>',
            '    <button type="button" class="sv-btn sv-zoom-in" data-act="zoomIn"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>',
            '    <span class="sv-sep"></span>',
            '    <button type="button" class="sv-btn sv-fit" data-act="fit"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>',
            '    <button type="button" class="sv-btn sv-actual" data-act="actual"><span class="sv-btn-text">1:1</span></button>',
            '    <button type="button" class="sv-btn sv-width" data-act="width"><svg viewBox="0 0 24 24"><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg></button>',
            '    <button type="button" class="sv-btn sv-height" data-act="height"><svg viewBox="0 0 24 24"><path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/></svg></button>',
            '    <span class="sv-sep"></span>',
            '    <button type="button" class="sv-btn sv-map" data-act="map"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><rect x="10" y="10" width="6" height="5" fill="currentColor" stroke="none"/></svg></button>',
            '    <button type="button" class="sv-btn sv-original" data-act="original"><svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-8 8M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg></button>',
            '    <button type="button" class="sv-btn sv-fullscreen" data-act="fullscreen"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>',
            '    <span class="sv-sep"></span>',
            '    <button type="button" class="sv-btn sv-close" data-act="close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>',
            '</div>'
        ].join('');

        document.body.appendChild(modal);

        backdrop  = modal.querySelector('.sv-backdrop');
        stage     = modal.querySelector('.sv-stage');
        canvas    = modal.querySelector('.sv-canvas');
        picture   = modal.querySelector('.sv-picture');
        loader    = modal.querySelector('.sv-loader');
        toolbar   = modal.querySelector('.sv-toolbar');
        counter   = modal.querySelector('.sv-counter');
        scaleReadout = modal.querySelector('.sv-scale');
        minimap   = modal.querySelector('.sv-minimap');
        minimapImg = modal.querySelector('.sv-minimap-img');
        minimapWindow = modal.querySelector('.sv-minimap-window');

        btnPrev = modal.querySelector('.sv-prev');
        btnNext = modal.querySelector('.sv-next');
        btnZoomOut = modal.querySelector('.sv-zoom-out');
        btnZoomIn = modal.querySelector('.sv-zoom-in');
        btnFit = modal.querySelector('.sv-fit');
        btnActual = modal.querySelector('.sv-actual');
        btnWidth = modal.querySelector('.sv-width');
        btnHeight = modal.querySelector('.sv-height');
        btnMap = modal.querySelector('.sv-map');
        btnOriginal = modal.querySelector('.sv-original');
        btnFullscreen = modal.querySelector('.sv-fullscreen');
        btnClose = modal.querySelector('.sv-close');

        modal.querySelector('.sv-loader-text').textContent = t('loading');
    }

    // ===== Расчёт геометрии =====

    function stageSize() {
        return {
            w: stage.clientWidth || window.innerWidth,
            h: stage.clientHeight || window.innerHeight
        };
    }

    function computeFit(mode) {
        var s = stageSize();
        var iw = view.naturalW || 1;
        var ih = view.naturalH || 1;
        var margin = 24;

        if (mode === 'actual') return 1;
        if (mode === 'width') return (s.w - margin * 2) / iw;
        if (mode === 'height') return (s.h - margin * 2) / ih;

        // contain — целиком в кадр
        return Math.min((s.w - margin * 2) / iw, (s.h - margin * 2) / ih);
    }

    function applyScale(scale, anchorX, anchorY) {
        var s = stageSize();
        var ax = anchorX === undefined ? s.w / 2 : anchorX;
        var ay = anchorY === undefined ? s.h / 2 : anchorY;

        var next = Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale));
        var ratio = next / view.scale;

        view.x = ax - ratio * (ax - view.x);
        view.y = ay - ratio * (ay - view.y);
        view.scale = next;
        render();
    }

    function center(scale) {
        var s = stageSize();
        var iw = view.naturalW || 1;
        var ih = view.naturalH || 1;
        view.scale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale));
        view.x = (s.w - iw * view.scale) / 2;
        view.y = (s.h - ih * view.scale) / 2;
        render();
    }

    function fitTo(mode) {
        view.fitMode = mode;
        center(computeFit(mode));
    }

    function render() {
        canvas.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.scale + ')';
        scaleReadout.textContent = Math.round(view.scale * 100) + '%';
        updateMinimap();
    }

    // ===== Мини-карта =====

    function updateMinimap() {
        if (!minimap || minimap.hidden) return;
        var iw = view.naturalW || 1;
        var ih = view.naturalH || 1;
        var mw = minimap.clientWidth;
        var mh = minimap.clientHeight;
        if (!mw || !mh) return;

        // Масштаб мини-карты: картинка целиком в мини-карте
        var mapScale = Math.min(mw / iw, mh / ih);
        minimapImg.style.width = (iw * mapScale) + 'px';
        minimapImg.style.height = (ih * mapScale) + 'px';
        minimapImg.style.transform = 'translate(' + ((mw - iw * mapScale) / 2) + 'px,' + ((mh - ih * mapScale) / 2) + 'px)';

        // Рамка текущего участка
        var s = stageSize();
        var w = s.w / view.scale * mapScale;
        var h = s.h / view.scale * mapScale;
        var x = (-view.x / view.scale) * mapScale + (mw - iw * mapScale) / 2;
        var y = (-view.y / view.scale) * mapScale + (mh - ih * mapScale) / 2;

        minimapWindow.style.width = Math.max(8, Math.min(mw, w)) + 'px';
        minimapWindow.style.height = Math.max(8, Math.min(mh, h)) + 'px';
        minimapWindow.style.transform = 'translate(' + Math.max(0, Math.min(mw - 8, x)) + 'px,' + Math.max(0, Math.min(mh - 8, y)) + 'px)';
    }

    // ===== Показ изображения =====

    function showImage(index) {
        if (!images[index]) return;
        current = index;
        var item = images[index];

        loader.hidden = false;
        picture.classList.remove('sv-loaded');

        picture.onload = function () {
            view.naturalW = picture.naturalWidth;
            view.naturalH = picture.naturalHeight;
            loader.hidden = true;
            picture.classList.add('sv-loaded');
            minimapImg.src = item.url;
            fitTo('contain');
        };
        picture.onerror = function () {
            loader.hidden = false;
            loader.querySelector('.sv-loader-text').textContent = t('failed');
            loader.querySelector('.sv-spinner').hidden = true;
        };

        picture.src = item.url;
        picture.alt = item.alt || '';

        // Счётчик: если схем несколько — «2 из 3», иначе название из alt
        if (images.length > 1) {
            counter.textContent = (index + 1) + ' ' + t('of') + ' ' + images.length;
        } else {
            counter.textContent = item.alt || '';
        }

        btnPrev.hidden = index <= 0;
        btnNext.hidden = index >= images.length - 1;
        btnOriginal.hidden = !item.url;
    }

    // ===== Открытие / закрытие =====

    function open(index) {
        if (!images.length) return;
        if (!modal) buildModal();
        modal.classList.add('sv-is-open');
        document.documentElement.style.overflow = 'hidden';
        applyLabels();
        showImage(index === undefined ? 0 : index);
        if (btnClose) btnClose.focus();
    }

    function close() {
        if (!modal) return;
        modal.classList.remove('sv-is-open');
        document.documentElement.style.overflow = '';
        view.dragging = false;
    }

    function isOpen() {
        return modal && modal.classList.contains('sv-is-open');
    }

    // ===== Подписи (язык) =====

    function applyLabels() {
        if (!modal) return;
        var labels = {
            '.sv-close': 'close',
            '.sv-prev': 'prev',
            '.sv-next': 'next',
            '.sv-zoom-in': 'zoomIn',
            '.sv-zoom-out': 'zoomOut',
            '.sv-fit': 'fit',
            '.sv-actual': 'actual',
            '.sv-width': 'width',
            '.sv-height': 'height',
            '.sv-map': 'minimap',
            '.sv-original': 'original',
            '.sv-fullscreen': 'fullscreen'
        };
        for (var sel in labels) {
            if (!labels.hasOwnProperty(sel)) continue;
            var el = modal.querySelector(sel);
            if (!el) continue;
            var text = t(labels[sel]);
            el.setAttribute('title', text);
            el.setAttribute('aria-label', text);
        }
        var loaderText = modal.querySelector('.sv-loader-text');
        if (loaderText) {
            var spinner = modal.querySelector('.sv-spinner');
            if (spinner) spinner.hidden = false;
            loaderText.textContent = t('loading');
        }

        applyHintLabels();
    }

    // Подписи в панели горячих клавиш
    function applyHintLabels() {
        if (!modal) return;
        var rows = modal.querySelectorAll('.sv-hint-row');
        var keys = ['hints', 'hZoom', 'hFit', 'hActual', 'hWidth', 'hHeight', 'hMap', 'hFull', 'hNav'];
        for (var i = 0; i < rows.length && i < keys.length; i++) {
            var span = rows[i].querySelector('.sv-hint-key');
            if (span) span.textContent = t(keys[i]);
        }
        var hintBtn = modal.querySelector('.sv-hint-btn');
        if (hintBtn) {
            hintBtn.setAttribute('title', t('hints'));
            hintBtn.setAttribute('aria-label', t('hints'));
        }
    }

    // ===== Действия =====

    function act(name) {
        switch (name) {
            case 'close': close(); break;
            case 'prev': if (current > 0) showImage(current - 1); break;
            case 'next': if (current < images.length - 1) showImage(current + 1); break;
            case 'zoomIn': applyScale(view.scale * SCALE_STEP); break;
            case 'zoomOut': applyScale(view.scale / SCALE_STEP); break;
            case 'fit': fitTo('contain'); break;
            case 'actual': fitTo('actual'); break;
            case 'width': fitTo('width'); break;
            case 'height': fitTo('height'); break;
            case 'map':
                minimap.hidden = !minimap.hidden;
                btnMap.classList.toggle('sv-active', !minimap.hidden);
                updateMinimap();
                break;
            case 'hint':
                modal.querySelector('.sv-hint').classList.toggle('sv-hint-open');
                break;
            case 'original':
                if (images[current] && images[current].url) {
                    window.open(images[current].url, '_blank', 'noopener');
                }
                break;
            case 'fullscreen':
                if (document.fullscreenElement) {
                    if (document.exitFullscreen) document.exitFullscreen();
                } else if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                }
                break;
        }
    }

    // ===== События =====

    function onWheel(e) {
        e.preventDefault();
        var rect = stage.getBoundingClientRect();
        var cx = e.clientX - rect.left;
        var cy = e.clientY - rect.top;
        var factor = e.deltaY < 0 ? SCALE_STEP : 1 / SCALE_STEP;
        // Нормализуем разные единицы дельты (Firefox — строки, Chrome — пиксели)
        var delta = e.deltaMode === 1 ? e.deltaY * 16 : (e.deltaMode === 2 ? e.deltaY * 100 : e.deltaY);
        if (Math.abs(delta) < 1) delta = e.deltaY < 0 ? -1 : 1;
        applyScale(view.scale * factor, cx, cy);
    }

    function onPointerDown(e) {
        if (e.button !== undefined && e.button !== 0) return;
        view.dragging = true;
        view.startX = e.clientX;
        view.startY = e.clientY;
        view.originX = view.x;
        view.originY = view.y;
        stage.classList.add('sv-dragging');
    }

    function onPointerMove(e) {
        if (!view.dragging) return;
        view.x = view.originX + (e.clientX - view.startX);
        view.y = view.originY + (e.clientY - view.startY);
        render();
    }

    function onPointerUp() {
        view.dragging = false;
        stage.classList.remove('sv-dragging');
    }

    function onDblClick(e) {
        e.preventDefault();
        // Двойной клик переключает между «вписать» и реальным размером
        if (view.fitMode === 'actual') fitTo('contain');
        else fitTo('actual');
    }

    function onKey(e) {
        if (!isOpen()) return;
        switch (e.key) {
            case 'Escape':    e.preventDefault(); close(); break;
            case 'ArrowLeft': e.preventDefault(); act('prev'); break;
            case 'ArrowRight':e.preventDefault(); act('next'); break;
            case '+': case '=': e.preventDefault(); act('zoomIn'); break;
            case '-': case '_': e.preventDefault(); act('zoomOut'); break;
            case '0':         e.preventDefault(); act('fit'); break;
            case '1':         e.preventDefault(); act('actual'); break;
            case 'w': case 'W': e.preventDefault(); act('width'); break;
            case 'h': case 'H': e.preventDefault(); act('height'); break;
            case 'm': case 'M': e.preventDefault(); act('map'); break;
            case 'f': case 'F': e.preventDefault(); act('fullscreen'); break;
        }
    }

    function onMinimapClick(e) {
        var rect = minimap.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var iw = view.naturalW || 1;
        var ih = view.naturalH || 1;
        var mw = minimap.clientWidth;
        var mh = minimap.clientHeight;
        var mapScale = Math.min(mw / iw, mh / ih);

        // Центр рамки → новая точка
        var targetX = (mx - (mw - iw * mapScale) / 2) / mapScale;
        var targetY = (my - (mh - ih * mapScale) / 2) / mapScale;
        var s = stageSize();
        view.x = s.w / 2 - targetX * view.scale;
        view.y = s.h / 2 - targetY * view.scale;
        render();
    }

    // ===== Инициализация =====

    function init() {
        images = collectImages();
        if (!images.length) return;
        if (!modal) buildModal();

        // Клик по схеме открывает просмотрщик (capture — до обработки <a>)
        document.addEventListener('click', function (e) {
            if (modal && modal.contains(e.target)) return;

            var target = e.target;
            var img = null;

            if (target.tagName === 'IMG' && target.classList.contains('schema-image')) {
                img = target;
            } else if (target.classList.contains('schema-image')) {
                img = target;
            } else {
                var p = target;
                for (var d = 0; d < 6; d++) {
                    p = p.parentElement;
                    if (!p) break;
                    var found = p.querySelector('img.schema-image');
                    if (found) { img = found; break; }
                }
            }
            if (!img) return;

            var url = img.currentSrc || img.src || '';
            var idx = -1;
            for (var i = 0; i < images.length; i++) {
                if (images[i].url === url || images[i].url === img.getAttribute('src')) { idx = i; break; }
            }
            if (idx < 0) idx = 0;

            e.preventDefault();
            e.stopPropagation();
            open(idx);
        }, true);

        // Кнопки панели
        toolbar.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.sv-btn') : null;
            if (!btn) return;
            e.preventDefault();
            act(btn.getAttribute('data-act'));
        });

        // Клик по фону — закрыть
        backdrop.addEventListener('click', close);

        // Кнопка подсказок и сама панель
        var hintBox = modal.querySelector('.sv-hint');
        var hintBtn = modal.querySelector('.sv-hint-btn');
        hintBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            hintBox.classList.toggle('sv-hint-open');
        });
        // Клик вне открытой панели — закрыть её
        modal.addEventListener('click', function (e) {
            if (!hintBox.classList.contains('sv-hint-open')) return;
            if (hintBox.contains(e.target)) return;
            hintBox.classList.remove('sv-hint-open');
        });

        // Панорама мышью
        stage.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        // Зум колёсиком
        stage.addEventListener('wheel', onWheel, { passive: false });

        // Двойной клик
        stage.addEventListener('dblclick', onDblClick);

        // Тач: один палец — панорама, два — зум
        var pinchStart = 0;
        var touchStartX = 0, touchStartY = 0, touchOriginX = 0, touchOriginY = 0;

        stage.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) {
                view.dragging = true;
                view.startX = e.touches[0].clientX;
                view.startY = e.touches[0].clientY;
                view.originX = view.x;
                view.originY = view.y;
            } else if (e.touches.length === 2) {
                view.dragging = false;
                var dx = e.touches[0].clientX - e.touches[1].clientX;
                var dy = e.touches[0].clientY - e.touches[1].clientY;
                pinchStart = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: true });

        stage.addEventListener('touchmove', function (e) {
            if (e.touches.length === 1 && view.dragging) {
                view.x = view.originX + (e.touches[0].clientX - view.startX);
                view.y = view.originY + (e.touches[0].clientY - view.startY);
                render();
                e.preventDefault();
            } else if (e.touches.length === 2) {
                var dx = e.touches[0].clientX - e.touches[1].clientX;
                var dy = e.touches[0].clientY - e.touches[1].clientY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (pinchStart > 0) {
                    var rect = stage.getBoundingClientRect();
                    var cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
                    var cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
                    applyScale(view.scale * (dist / pinchStart), cx, cy);
                }
                pinchStart = dist;
                e.preventDefault();
            }
        }, { passive: false });

        stage.addEventListener('touchend', function () {
            view.dragging = false;
            pinchStart = 0;
        });

        // Клавиатура
        document.addEventListener('keydown', onKey);

        // Мини-карта
        minimap.addEventListener('click', onMinimapClick);
        btnMap.classList.add('sv-active');

        // Пересчёт при изменении размера окна
        window.addEventListener('resize', function () {
            if (!isOpen()) return;
            if (view.fitMode === 'actual') {
                center(1);
            } else {
                fitTo(view.fitMode);
            }
        });

        // Язык сменили — обновляем подписи
        if (settings && settings.on) {
            settings.on('lang', function () {
                applyLabels();
                if (images.length > 1) {
                    counter.textContent = (current + 1) + ' ' + t('of') + ' ' + images.length;
                }
            });
        }
    }

    window.SchemaViewer = { open: open, close: close };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
