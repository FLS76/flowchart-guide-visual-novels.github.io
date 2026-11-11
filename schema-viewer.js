// Просмотровик блок-схем — модальное окно с масштабированием,
// перетаскиванием, навигацией между схемами новеллы.
//
// Управление:
//   Колёсико          — масштаб (+/−)
//   Ctrl + колёсико   — зум к курсору
//   Перетаскивание    — панорама
//   ← / →            — следующая / предыдущая схема
//   Esc               — закрыть
//   + / −            — масштаб
//   1                —.fit (100%)
//
// Все схемы новеллы собираются автоматически из ссылкок .schema-block.
(function () {
    'use strict';

    var SCALE_MIN = 0.1;
    var SCALE_MAX = 8;
    var SCALE_STEP = 1.25;
    var PAN_SPEED = 0.05;

    var state = { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 };
    var images = [];   // [{url, alt, index}]
    var currentIndex = 0;
    var modal = null;
    var overlay = null;
    var viewport = null;
    var canvas = null;
    var img = null;
    var navPrev = null;
    var navNext = null;
    var scaleLabel = null;
    var closeBtn = null;
    var fitBtn = null;
    var zoomIn = null;
    var zoomOut = null;
    var counter = null;

    function esc(n) {
        var d = document.createElement('div');
        d.textContent = n;
        return d.innerHTML;
    }

    function buildModal() {
        modal = document.createElement('div');
        modal.className = 'schema-viewer';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Просмотровик блок-схемы');

        modal.innerHTML =
            '<div class="viewer-overlay"></div>' +
            '<div class="viewer-viewport">' +
                '<div class="viewer-canvas">' +
                    '<img class="viewer-img" draggable="false" alt="">' +
                '</div>' +
            '</div>' +
            '<div class="viewer-controls">' +
                '<button class="viewer-btn viewer-close" aria-label="Закрыть">✕</button>' +
                '<button class="viewer-btn viewer-fit" aria-label="По размеру">⊡</button>' +
                '<button class="viewer-btn viewer-zoom-out" aria-label="Уменьшить">−</button>' +
                '<span class="viewer-scale">100%</span>' +
                '<button class="viewer-btn viewer-zoom-in" aria-label="Увеличить">+</button>' +
                '<span class="viewer-counter"></span>' +
                '<button class="viewer-btn viewer-prev" aria-label="Предыдущая схема">‹</button>' +
                '<button class="viewer-btn viewer-next" aria-label="Следующая схема">›</button>' +
            '</div>';

        overlay = modal.querySelector('.viewer-overlay');
        viewport = modal.querySelector('.viewer-viewport');
        canvas = modal.querySelector('.viewer-canvas');
        img = modal.querySelector('.viewer-img');
        closeBtn = modal.querySelector('.viewer-close');
        fitBtn = modal.querySelector('.viewer-fit');
        zoomIn = modal.querySelector('.viewer-zoom-in');
        zoomOut = modal.querySelector('.viewer-zoom-out');
        scaleLabel = modal.querySelector('.viewer-scale');
        counter = modal.querySelector('.viewer-counter');
        navPrev = modal.querySelector('.viewer-prev');
        navNext = modal.querySelector('.viewer-next');

        document.body.appendChild(modal);
    }

    function gatherImages() {
        images = [];
        // Сначала ищем .schema-block (на страницах новелл)
        var blocks = document.querySelectorAll('.schema-block');
        blocks.forEach(function (block, i) {
            var a = block.querySelector('a[href]');
            if (!a) return;
            var href = a.getAttribute('href');
            var thumb = block.querySelector('img');
            var alt = thumb ? thumb.alt : '';
            var url = href;
            if (/\.html$/.test(href)) {
                var innerImg = block.querySelector('img');
                if (innerImg) url = innerImg.src || innerImg.getAttribute('data-src') || href;
            }
            if (href.match(/\.png$/i)) url = href;
            images.push({ url: url, alt: alt, index: i });
        });

        // Если не нашли — ищем .schema-link (на страницах схем)
        if (images.length === 0) {
            var links = document.querySelectorAll('.schema-link');
            links.forEach(function (link, i) {
                var href = link.getAttribute('href');
                var innerImg = link.querySelector('img');
                var url = href || (innerImg ? innerImg.src : null);
                var alt = innerImg ? innerImg.alt : '';
                if (url) images.push({ url: url, alt: alt, index: i });
            });
        }

        // Fallback: ищем img.schema-image напрямую
        if (images.length === 0) {
            var imgs = document.querySelectorAll('img.schema-image');
            imgs.forEach(function (el, i) {
                images.push({ url: el.src, alt: el.alt, index: i });
            });
        }
    }

    function openViewer(index) {
        if (images.length === 0) return;
        if (index === undefined) index = 0;
        currentIndex = index;
        if (!modal) buildModal();

        modal.classList.add('viewer-open');
        document.body.style.overflow = 'hidden';
        modal.focus();
        updateImage();
        updateCounter();
    }

    function updateImage() {
        var item = images[currentIndex];
        if (!item) return;
        img.src = item.url;
        img.alt = item.alt;
        state.scale = 1;
        state.x = 0;
        state.y = 0;
        applyTransform();
        updateCounter();
        updateNav();
    }

    function updateCounter() {
        if (images.length > 1) {
            counter.textContent = (currentIndex + 1) + ' / ' + images.length;
            counter.style.display = '';
        } else {
            counter.style.display = 'none';
        }
    }

    function updateNav() {
        navPrev.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
        navNext.style.visibility = currentIndex < images.length - 1 ? 'visible' : 'hidden';
    }

    function applyTransform() {
        canvas.style.transform = 'translate(' + state.x + 'px,' + state.y + 'px) scale(' + state.scale + ')';
        scaleLabel.textContent = Math.round(state.scale * 100) + '%';
    }

    function closeViewer() {
        if (!modal) return;
        modal.classList.remove('viewer-open');
        document.body.style.overflow = '';
        state.dragging = false;
    }

    function zoomTo(newScale, cx, cy) {
        newScale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, newScale));
        var vw = viewport.clientWidth;
        var vh = viewport.clientHeight;
        if (cx === undefined) { cx = vw / 2; cy = vh / 2; }
        var ratio = newScale / state.scale;
        state.x = cx - ratio * (cx - state.x);
        state.y = cy - ratio * (cy - state.y);
        state.scale = newScale;
        applyTransform();
    }

    function fitToViewport() {
        var vw = viewport.clientWidth;
        var vh = viewport.clientHeight;
        var iw = img.naturalWidth || 800;
        var ih = img.naturalHeight || 600;
        var scale = Math.min(vw / iw, vh / ih) * 0.92;
        state.scale = scale;
        state.x = (vw - iw * scale) / 2;
        state.y = (vh - ih * scale) / 2;
        applyTransform();
    }

    function prevImage() {
        if (currentIndex > 0) { currentIndex--; updateImage(); }
    }

    function nextImage() {
        if (currentIndex < images.length - 1) { currentIndex++; updateImage(); }
    }

    // ===== Events =====

    function onMouseDown(e) {
        if (e.button !== 0) return;
        state.dragging = true;
        state.startX = e.clientX;
        state.startY = e.clientY;
        state.startPanX = state.x;
        state.startPanY = state.y;
        viewport.style.cursor = 'grabbing';
        e.preventDefault();
    }

    function onMouseMove(e) {
        if (!state.dragging) return;
        state.x = state.startPanX + (e.clientX - state.startX);
        state.y = state.startPanY + (e.clientY - state.startY);
        applyTransform();
    }

    function onMouseUp() {
        state.dragging = false;
        viewport.style.cursor = '';
    }

    function onWheel(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            var rect = viewport.getBoundingClientRect();
            var cx = e.clientX - rect.left;
            var cy = e.clientY - rect.top;
            var delta = e.deltaY < 0 ? 1 / SCALE_STEP : SCALE_STEP;
            zoomTo(state.scale * delta, cx, cy);
        } else {
            e.preventDefault();
            var rect = viewport.getBoundingClientRect();
            var cx = e.clientX - rect.left;
            var cy = e.clientY - rect.top;
            var delta = e.deltaY < 0 ? 1 / SCALE_STEP : SCALE_STEP;
            zoomTo(state.scale * delta, cx, cy);
        }
    }

    function onKeyDown(e) {
        switch (e.key) {
            case 'Escape':      closeViewer(); break;
            case 'ArrowLeft':   prevImage(); break;
            case 'ArrowRight':  nextImage(); break;
            case '+': case '=': zoomTo(state.scale * SCALE_STEP); break;
            case '-': case '_': zoomTo(state.scale / SCALE_STEP); break;
            case '1':           fitToViewport(); break;
        }
    }

    function onTouchStart(e) {
        if (e.touches.length === 1) {
            state.dragging = true;
            state.startX = e.touches[0].clientX;
            state.startY = e.touches[0].clientY;
            state.startPanX = state.x;
            state.startPanY = state.y;
        }
    }

    function onTouchMove(e) {
        if (!state.dragging || e.touches.length !== 1) return;
        state.x = state.startPanX + (e.touches[0].clientX - state.startX);
        state.y = state.startPanY + (e.touches[0].clientY - state.startY);
        applyTransform();
        e.preventDefault();
    }

    function onTouchEnd() { state.dragging = false; }

    function init() {
        gatherImages();
        if (images.length === 0) return;

        // Создаём модал сразу, чтобы все элементы были доступны
        if (!modal) buildModal();

        // Клик по схеме — открыть просмотровик
        document.querySelectorAll('.schema-link, .schema-image, .schema-block').forEach(function (el) {
            el.addEventListener('click', function (e) {
                // Обычная ссылка на HTML-страницу — не перехватываем
                if (el.tagName === 'A' && el.href && !el.href.match(/\.png$/i) && !el.classList.contains('schema-link')) return;
                var idx = -1;
                var item = images.find(function (it, i) {
                    if (it.url === el.src || it.url === el.getAttribute('href')) { idx = i; return true; }
                    return false;
                });
                if (idx >= 0) {
                    e.preventDefault();
                    openViewer(idx);
                } else if (!el.href || el.href.match(/\.png$/i)) {
                    e.preventDefault();
                    openViewer(0);
                }
            });
        });

        // Клик по overlay — закрыть
        overlay.addEventListener('click', closeViewer);

        // Кнопки
        closeBtn.addEventListener('click', closeViewer);
        fitBtn.addEventListener('click', fitToViewport);
        zoomIn.addEventListener('click', function () { zoomTo(state.scale * SCALE_STEP); });
        zoomOut.addEventListener('click', function () { zoomTo(state.scale / SCALE_STEP); });
        navPrev.addEventListener('click', prevImage);
        navNext.addEventListener('click', nextImage);

        // Мышь
        viewport.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        viewport.addEventListener('wheel', onWheel, { passive: false });

        // Тач
        viewport.addEventListener('touchstart', onTouchStart, { passive: true });
        viewport.addEventListener('touchmove', onTouchMove, { passive: false });
        viewport.addEventListener('touchend', onTouchEnd);

        // Клавиатура
        document.addEventListener('keydown', onKeyDown);

        // Resize
        window.addEventListener('resize', function () {
            if (modal && modal.classList.contains('viewer-open')) fitToViewport();
        });

        // Если картинка не загрузилась — всё равно открываем (покажет ошибку)
        img.addEventListener('error', function () {
            canvas.innerHTML = '<p class="viewer-error">Изображение не загружено</p>';
        });
    }

    // Expose globally for inline handlers
    window.SchemaViewer = { open: openViewer, close: closeViewer };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
