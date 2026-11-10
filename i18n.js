// Переключение языка RU/EN с глобальным сохранением.
// Словарь сопоставляет точный русский текст (без пробелов по краям) с английским.
(function () {
    'use strict';

    var STORAGE_KEY = 'lang';
    var originals = new WeakMap();
    var attrOriginals = new WeakMap();
    var titleRu = null;

    var DICT = {
        "Прохождения визуальных новелл в виде блок-схем": "Visual Novel Walkthroughs as Flowcharts",
        "Руководства по прохождению визуальных новелл в виде блок-схем": "Visual novel walkthrough guides in flowchart form",
        "О проекте": "About the project",
        "Сделано": "Completed",
        "В планах": "Planned",
        "Не требуют схем": "No flowchart needed",
        "Здесь я собираю в виде каталога прохождения визуальных новелл в виде блок-схем, которые сделал сам. Я стараюсь, чтобы схема была не просто сводкой выбора, а удобным путеводителем по сюжету: где ответвляются ветки, как добраться до нужной концовки, какие сцены можно пропустить без ущерба.": "Here I collect visual novel walkthroughs as flowcharts that I made myself. I try to make each chart more than a list of choices—a convenient guide to the story: where branches split, how to reach the ending you want, and which scenes can be skipped without missing anything.",
        "Сейчас на сайте только мои работы. Но я задаюсь вопросом: стоит ли расширять каталог и добавлять чужие блок-схемы того же типа? Если у вас есть мнение — напишите в": "Right now the site only contains my own work. But I wonder: should the catalog be expanded with other people's flowcharts of the same kind? If you have an opinion, write in",
        "на GitHub.": "on GitHub.",
        "Как пользоваться": "How to use the site",
        "На главной странице переключайтесь между вкладками — «Сделано», «В планах» и «Не требуют схем». Вкладка «Сделано» содержит ссылки на страницы новелл, где доступны блок-схемы. Вкладка «В планах» — новеллы, для которых схемы ещё создаются. Вкладка «Не требуют схем» — кинетические новеллы или те, где исчерпывающая схема уже есть внутри игры.": "On the main page, switch between the tabs—Completed, Planned, and No flowchart needed. The Completed tab links to novel pages with flowcharts. The Planned tab lists novels whose charts are still being made. The No flowchart needed tab covers kinetic novels or novels that already include a complete chart in-game.",
        "Я планирую делать блок-схемы на все новеллы, которые пройду. Полный список ожидаемых прохождений — в моём": "I plan to make flowcharts for every visual novel I complete. The full list of upcoming walkthroughs is in my",
        "профиле на VNDB": "VNDB profile",
        "Мои ресурсы": "My links",
        "Мой изначальный блог с прохождениями": "My original walkthrough blog",
        "Профиль на Square Faction": "Square Faction profile",
        "Профиль на VNDB": "VNDB profile",
        "Профиль на GameFAQs": "GameFAQs profile",
        "Профиль на GitHub": "GitHub profile",
        "Использование материалов": "Using the materials",
        "Блок-схемы защищены авторским правом. Использование возможно только с разрешения автора.": "The flowcharts are copyrighted. They may be used only with the author's permission.",
        "Обложки новелл взяты из базы VNDB и сохранены локально. Права на обложки принадлежат издателям и правообладателям; по запросу правообладателя изображение будет удалено.": "Novel covers are taken from the VNDB database and stored locally. The rights to the covers belong to the publishers and rights holders; the image will be removed at the rights holder's request.",
        "Сделанные схемы": "Completed flowcharts",
        "Амнея28: две вечности": "Amneya28: Two Eternities",
        "Амнея28": "Amneya28",
        "Схемы в планах": "Planned flowcharts",
        "Новеллы, для которых ещё не созданы блок-схемы. Статус обновляется по мере готовности.": "Novels that do not have flowcharts yet. The status is updated as charts are completed.",
        "Обозначение «(?)» — я безуспешно надеюсь на перевод на русский язык… желательно ручной.": "The “(?)” mark means I am still hoping for a Russian translation… preferably a human one.",
        "Полный список на": "Full list on",
        "VNDB профиля автора": "the author's VNDB profile",
        "Новеллы, не требующие схем": "Novels that do not need flowcharts",
        "Кинетические новеллы (без выборов) или новеллы, где исчерпывающая блок-схема уже есть в самой игре.": "Kinetic novels (no choices) or novels that already contain a complete flowchart.",
        "Кинетическая, без выборов": "Kinetic, no choices",
        "Новелла сама является блок-схемой": "The novel itself is a flowchart",
        "Кинетическая, одинарные кнопки": "Kinetic, single-button choices",
        "Кинетическая, есть схема в новелле": "Kinetic, chart included in the novel",
        "Есть схема в новелле": "Chart included in the novel",
        "Исчерпывающая схема в новелле": "Complete chart included in the novel",
        "Кинетическая, одна одинарная кнопка": "Kinetic, one single button",
        "Автор схем:": "Chart author:",
        "проверщик (NRFX)": "проверщик (NRFX)",

        "Блок-схемы визуальных новелл": "Visual Novel Flowcharts",
        "← Назад к списку": "← Back to the list",
        "← Назад к списку схем": "← Back to the schema list",
        "Общая информация": "General information",
        "Разработчик:": "Developer:",
        "Год:": "Year:",
        "Блок-схемы": "Flowcharts",
        "Блок-схема": "Flowchart",
        "Блок-схема 1": "Flowchart 1",
        "Блок-схема 2": "Flowchart 2",
        "Блок-схема 98%": "Flowchart 98%",
        "Блок-схема v1.5.3": "Flowchart v1.5.3",
        "Блок-схема v2.0": "Flowchart v2.0",
        "Автор:": "Author:",
        "Язык:": "Language:",
        "Русский": "Russian",
        "Версия:": "Version:",
        "Информация о схеме": "Schema information",
        "Комментарий автора": "Author's comment",
        "Автор схемы:": "Schema author:",
        "Примечание автора": "Author's note",
        "Постер: VNDB": "Poster: VNDB",
        "Другие названия": "Alternative titles",
        "Спойлер": "Spoiler",
        "Сменить тему": "Toggle theme",
        "Сменить язык": "Change language",
        "Переключить на английский": "Switch to Russian",
        "Switch to Russian": "Переключить на русский",
    };

    function readLang() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ru';
        } catch (e) {
            return document.documentElement.lang === 'en' ? 'en' : 'ru';
        }
    }

    function saveLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {}
    }

    function translateTitle(text) {
        if (Object.prototype.hasOwnProperty.call(DICT, text)) {
            return DICT[text];
        }
        return text
            .replace(/^Блок-схема/, 'Flowchart')
            .replace(/Эпизод 1/g, 'Episode 1')
            .replace(/Эпизод 2/g, 'Episode 2')
            .replace(/Амнея28: две вечности/g, 'Amneya28: Two Eternities')
            .replace(/ — Прохождения визуальных новелл в виде блок-схем$/, ' — Visual Novel Walkthroughs');
    }

    function translateAttribute(value) {
        if (Object.prototype.hasOwnProperty.call(DICT, value)) {
            return DICT[value];
        }
        var altPrefix = 'Блок-схема прохождений ';
        if (value.indexOf(altPrefix) === 0) {
            var rest = value.slice(altPrefix.length);
            return 'Flowchart walkthrough: ' + (DICT[rest] || rest);
        }
        return value;
    }

    function applyTextNodes(lang) {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                var parent = node.parentNode;
                if (!parent) return NodeFilter.FILTER_REJECT;
                var tag = parent.nodeName;
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') {
                    return NodeFilter.FILTER_REJECT;
                }
                if (parent.closest && parent.closest('.lang-toggle')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        var node;
        while ((node = walker.nextNode())) {
            if (!originals.has(node)) {
                originals.set(node, node.nodeValue);
            }
            var original = originals.get(node);
            if (lang === 'ru') {
                if (node.nodeValue !== original) node.nodeValue = original;
                continue;
            }
            var trimmed = original.trim();
            if (!trimmed) continue;
            var normalized = trimmed.replace(/\s+/g, ' ');
            var translated = DICT[normalized];
            if (!translated) continue;
            var leading = original.match(/^\s*/)[0];
            var trailing = original.match(/\s*$/)[0];
            node.nodeValue = leading + translated + trailing;
        }
    }

    function applyAttributes(lang) {
        var elements = document.querySelectorAll('[title], [alt], [placeholder], [aria-label]');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (el.id === 'langToggle') continue;
            var attrs = ['title', 'alt', 'placeholder', 'aria-label'];
            for (var j = 0; j < attrs.length; j++) {
                var name = attrs[j];
                if (!el.hasAttribute(name)) continue;
                var map = attrOriginals.get(el);
                if (!map) {
                    map = {};
                    attrOriginals.set(el, map);
                }
                if (!Object.prototype.hasOwnProperty.call(map, name)) {
                    map[name] = el.getAttribute(name);
                }
                var original = map[name];
                el.setAttribute(name, lang === 'ru' ? original : translateAttribute(original));
            }
        }
    }

    function applyTitle(lang) {
        var title = document.querySelector('title');
        if (!title) return;
        if (titleRu === null) titleRu = title.textContent;
        title.textContent = lang === 'ru' ? titleRu : translateTitle(titleRu);
    }

    function updateButton(lang) {
        var btn = document.getElementById('langToggle');
        if (!btn) return;
        btn.textContent = lang === 'en' ? 'RU' : 'EN';
        btn.title = lang === 'en' ? 'Switch to Russian' : 'Переключить на английский';
        btn.setAttribute('aria-label', btn.title);
    }

    function applyLanguage(lang) {
        document.documentElement.lang = lang === 'en' ? 'en' : 'ru';
        applyTextNodes(lang);
        applyAttributes(lang);
        applyTitle(lang);
        updateButton(lang);
    }

    function setLanguage(lang) {
        saveLang(lang);
        applyLanguage(lang);
    }

    function createButton() {
        if (document.getElementById('langToggle')) return;
        var themeToggle = document.getElementById('themeToggle');
        if (!themeToggle || !themeToggle.parentNode) return;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'langToggle';
        btn.className = 'theme-toggle lang-toggle';
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            setLanguage(document.documentElement.lang === 'en' ? 'ru' : 'en');
        });
        themeToggle.parentNode.insertBefore(btn, themeToggle);
        updateButton(readLang());
    }

    function init() {
        createButton();
        applyLanguage(readLang());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
