// Просмотровик блок-схем
(function () {
    'use strict';

    var SCALE_MIN = 0.05;
    var SCALE_MAX = 10;
    var SCALE_STEP = 1.2;

    var state = { scale: 1, x: 0, y: 0, dragging: false, sx: 0, sy: 0, spx: 0, spy: 0 };
    var images = [];
    var currentIdx = 0;
    var modal, overlay, viewport, canvas, imgEl;
    var closeBtn, fitBtn, zoomInBtn, zoomOutBtn, prevBtn, nextBtn, scaleLabel, counter;

    function buildModal() {
        modal = document.createElement('div');
        modal.className = 'schema-viewer';
        modal.innerHTML =
            '<div class="sv-overlay"></div>' +
            '<div class="sv-viewport">' +
                '<div class="sv-canvas">' +
                    '<img class="sv-img" draggable="false">' +
                '</div>' +
            '</div>' +
            '<div class="sv-controls">' +
                '<button class="sv-btn sv-close" type="button">✕</button>' +
                '<button class="sv-btn sv-fit" type="button" title="По размеру">⊡</button>' +
                '<button class="sv-btn sv-zo" type="button">−</button>' +
                '<span class="sv-scale">100%</span>' +
                '<button class="sv-btn sv-zi" type="button">+</button>' +
                '<span class="sv-counter"></span>' +
                '<button class="sv-btn sv-prev" type="button">‹</button>' +
                '<button class="sv-btn sv-next" type="button">›</button>' +
            '</div>';
        document.body.appendChild(modal);

        overlay   = modal.querySelector('.sv-overlay');
        viewport  = modal.querySelector('.sv-viewport');
        canvas    = modal.querySelector('.sv-canvas');
        imgEl     = modal.querySelector('.sv-img');
        closeBtn  = modal.querySelector('.sv-close');
        fitBtn    = modal.querySelector('.sv-fit');
        zoomInBtn = modal.querySelector('.sv-zi');
        zoomOutBtn= modal.querySelector('.sv-zo');
        prevBtn   = modal.querySelector('.sv-prev');
        nextBtn   = modal.querySelector('.sv-next');
        scaleLabel= modal.querySelector('.sv-scale');
        counter   = modal.querySelector('.sv-counter');
    }

    function gatherImages() {
        images = [];
        var imgs = document.querySelectorAll('img.schema-image');
        imgs.forEach(function (el) {
            var url = el.src || el.getAttribute('data-src');
            if (url) images.push({ url: url, alt: el.alt || '' });
        });
        if (images.length === 0) {
            var links = document.querySelectorAll('.schema-link img');
            links.forEach(function (el) {
                images.push({ url: el.src, alt: el.alt || '' });
            });
        }
    }

    function applyTransform() {
        canvas.style.transform = 'translate(' + state.x + 'px,' + state.y + 'px) scale(' + state.scale + ')';
        scaleLabel.textContent = Math.round(state.scale * 100) + '%';
    }

    function showImage(idx) {
        if (!images[idx]) return;
        currentIdx = idx;
        imgEl.src = images[idx].url;
        imgEl.alt = images[idx].alt;
        state.scale = 1;
        state.x = 0;
        state.y = 0;
        applyTransform();
        counter.textContent = images.length > 1 ? (idx + 1) + ' / ' + images.length : '';
        prevBtn.style.visibility = idx > 0 ? 'visible' : 'hidden';
        nextBtn.style.visibility = idx < images.length - 1 ? 'visible' : 'hidden';
    }

    function fitImage() {
        var vw = viewport.clientWidth;
        var vh = viewport.clientHeight;
        var iw = imgEl.naturalWidth  || 800;
        var ih = imgEl.naturalHeight || 600;
        var s = Math.min(vw / iw, vh / ih) * 0.9;
        state.scale = s;
        state.x = (vw - iw * s) / 2;
        state.y = (vh - ih * s) / 2;
        applyTransform();
    }

    function zoomAt(cx, cy, factor) {
        var ns = Math.min(SCALE_MAX, Math.max(SCALE_MIN, state.scale * factor));
        var ratio = ns / state.scale;
        state.x = cx - ratio * (cx - state.x);
        state.y = cy - ratio * (cy - state.y);
        state.scale = ns;
        applyTransform();
    }

    function openViewer(idx) {
        if (images.length === 0) return;
        if (!modal) buildModal();
        modal.classList.add('sv-open');
        document.body.style.overflow = 'hidden';
        showImage(idx !== undefined ? idx : 0);
    }

    function closeViewer() {
        if (!modal) return;
        modal.classList.remove('sv-open');
        document.body.style.overflow = '';
        state.dragging = false;
    }

    function init() {
        gatherImages();
        if (images.length === 0) return;
        if (!modal) buildModal();

        // Клик по схеме
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
                for (var d = 0; d < 5; d++) {
                    p = p.parentElement;
                    if (!p) break;
                    var found = p.querySelector('img.schema-image');
                    if (found) { img = found; break; }
                }
            }
            if (!img) return;
            var idx = -1;
            for (var i = 0; i < images.length; i++) {
                if (images[i].url === img.src) { idx = i; break; }
            }
            if (idx < 0) idx = 0;
            e.preventDefault();
            e.stopPropagation();
            openViewer(idx);
        }, true);

        overlay.addEventListener('click', closeViewer);
        closeBtn.addEventListener('click', closeViewer);
        fitBtn.addEventListener('click', fitImage);
        zoomInBtn.addEventListener('click', function () { zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, SCALE_STEP); });
        zoomOutBtn.addEventListener('click', function () { zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, 1 / SCALE_STEP); });
        prevBtn.addEventListener('click', function () { if (currentIdx > 0) showImage(currentIdx - 1); });
        nextBtn.addEventListener('click', function () { if (currentIdx < images.length - 1) showImage(currentIdx + 1); });

        // Панорама
        viewport.addEventListener('mousedown', function (e) {
            if (e.button !== 0) return;
            state.dragging = true;
            state.sx = e.clientX;
            state.sy = e.clientY;
            state.spx = state.x;
            state.spy = state.y;
            viewport.style.cursor = 'grabbing';
        });
        viewport.addEventListener('mousemove', function (e) {
            if (!state.dragging) return;
            state.x = state.spx + (e.clientX - state.sx);
            state.y = state.spy + (e.clientY - state.sy);
            applyTransform();
        });
        viewport.addEventListener('mouseup', function () {
            state.dragging = false;
            viewport.style.cursor = '';
        });
        viewport.addEventListener('mouseleave', function () {
            state.dragging = false;
            viewport.style.cursor = '';
        });

        // Зум
        viewport.addEventListener('wheel', function (e) {
            e.preventDefault();
            var rect = viewport.getBoundingClientRect();
            var cx = e.clientX - rect.left;
            var cy = e.clientY - rect.top;
            var factor = e.deltaY < 0 ? SCALE_STEP : 1 / SCALE_STEP;
            zoomAt(cx, cy, factor);
        }, { passive: false });

        // Тач
        var lastTouchDist = 0;
        viewport.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) {
                state.dragging = true;
                state.sx = e.touches[0].clientX;
                state.sy = e.touches[0].clientY;
                state.spx = state.x;
                state.spy = state.y;
            } else if (e.touches.length === 2) {
                state.dragging = false;
                var dx = e.touches[0].clientX - e.touches[1].clientX;
                var dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDist = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: true });
        viewport.addEventListener('touchmove', function (e) {
            if (e.touches.length === 1 && state.dragging) {
                state.x = state.spx + (e.touches[0].clientX - state.sx);
                state.y = state.spy + (e.touches[0].clientY - state.sy);
                applyTransform();
                e.preventDefault();
            } else if (e.touches.length === 2) {
                var dx = e.touches[0].clientX - e.touches[1].clientX;
                var dy = e.touches[0].clientY - e.touches[1].clientY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (lastTouchDist > 0) {
                    var rect = viewport.getBoundingClientRect();
                    var cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
                    var cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
                    zoomAt(cx, cy, dist / lastTouchDist);
                }
                lastTouchDist = dist;
                e.preventDefault();
            }
        }, { passive: false });
        viewport.addEventListener('touchend', function () {
            state.dragging = false;
            lastTouchDist = 0;
        });

        // Клавиатура
        document.addEventListener('keydown', function (e) {
            if (!modal || !modal.classList.contains('sv-open')) return;
            switch (e.key) {
                case 'Escape':    closeViewer(); break;
                case 'ArrowLeft': if (currentIdx > 0) showImage(currentIdx - 1); break;
                case 'ArrowRight':if (currentIdx < images.length - 1) showImage(currentIdx + 1); break;
                case '+': case '=': zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, SCALE_STEP); break;
                case '-': case '_': zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, 1 / SCALE_STEP); break;
                case '1':          fitImage(); break;
            }
        });

        window.addEventListener('resize', function () {
            if (modal && modal.classList.contains('sv-open')) fitImage();
        });

        imgEl.addEventListener('error', function () {
            canvas.innerHTML = '<p class="sv-error">Изображение не загружено</p>';
        });
    }

    window.SchemaViewer = { open: openViewer, close: closeViewer };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
