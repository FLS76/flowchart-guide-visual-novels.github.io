// Переключение языка RU/EN с глобальным сохранением.
// Словарь сопоставляет точный русский текст (без пробелов по краям) с английским.
// Состояние языка хранится в settings.js — оно общее для всех страниц и вкладок.
(function () {
    'use strict';

    var STORAGE_KEY = 'lang';
    var originals = new WeakMap();
    var attrOriginals = new WeakMap();
    var metaOriginals = new WeakMap();
    var titleRu = null;
    var settings = window.SiteSettings || null;

    var DICT = {
        // ===== Главная страница =====
        "Руководства для визуальных новелл в виде блок-схем": "Flowchart guide visual novels",
        "Прохождения визуальных новелл в виде блок-схем": "Visual novel walkthroughs as flowcharts",
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
        "Обсуждения": "Discussions",
        "Спасибо и предложения": "Thanks and suggestions",
        "— сказать «Спасибо», попросить сделать ещё или указать на ошибку.": "— say thanks, ask for more, or point out a mistake.",
        "Какие схемы нужны?": "Which flowcharts are needed?",
        "— предложить новеллу, для которой стоит сделать блок-схему.": "— suggest a visual novel that deserves a flowchart.",
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

        // ===== Общие элементы страниц новелл и схем =====
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
        "Других названий в VNDB нет": "No other names listed on VNDB",
        "Такой страницы нет": "This page does not exist",
        "Возможно, ссылка устарела или в адресе опечатка.": "The link may be outdated or contain a typo.",
        "← На главную": "← Back to the homepage",
        "Атри: Мои дорогие моменты": "ATRI: My Dear Moments",
        "Судебный поворот": "Gyakuten Saiban",
        "Судебный поворот 2": "Gyakuten Saiban 2",
        "Судебный поворот 3": "Gyakuten Saiban 3",
        "Страна Колес, Девочка-Подсолнух": "Sharin no Kuni: The Girl Among the Sunflowers",
        "Спойлер": "Spoiler",
        "Сменить тему": "Toggle theme",
        "Сменить язык": "Change language",
        "Переключить на английский": "Switch to English",
        "Switch to Russian": "Переключить на русский",

        // ===== 9-nine-1 =====
        "9 -Nine- Эпизод 1": "9 -Nine- Episode 1",
        "Почему-то все главы этой истории имеют выбор… Хм-м-м…..": "For some reason every chapter of this story has a choice… Hmm-m-m…",
        "Очередная элементарная блок схема. И, судя по новеллам, которые я сейчас прохожу, таких блок схем будет не мало. Ждите, что уж…": "Another elementary flowchart. And judging by the novels I'm playing right now, there will be quite a few more. Just wait…",
        "Здесь даже концовок нет, только «продолжение следует…» и всё.": "There aren't even any endings here—just “to be continued…” and that's it.",

        // ===== 9-nine-2 =====
        "9 -Nine- Эпизод 2": "9 -Nine- Episode 2",
        "Давайте как в последний раз": "Let's do this like it's the last time",
        "Вторая серия по выборам проще.": "The second episode is simpler in terms of choices.",
        "В текстовом прохождении (да, есть текстовое прохождение к этому) было написано, что хорошая концовка начинается автоматически после плохой, что, почему то, смутила меня, ведь думал что будет также как в первом эпизоде: сначала плохая концовка потом выбор, но нет — выбор даётся сразу.": "In the text walkthrough (yes, there is one for this game) it said that the good ending starts automatically after the bad one, which confused me a little, because I thought it would be the same as in the first episode: first the bad ending, then a choice. But no—the choice appears right away.",
        "Следующие части, как не странно, не требуют блок-схем. Обозначено в каталоге.": "The following parts, oddly enough, don't need flowcharts. It's marked in the catalog.",
        "Короче, представляю блок-схему к второй серии сериала.": "Anyway, here is the flowchart for the second episode of the series.",

        // ===== Amneya28 =====
        "Я сделал схему — прохождение новеллы «Амнея28: две вечности» и её представляю.": "I made a walkthrough chart for “Amneya28: Two Eternities” and here it is.",
        "Даже не знаю что ещё сказать. Текстовое прохождение текстовыми файлами прям в папке с игрой — это конечно сильно. Причём, единственное прохождение этой новеллы в интернете только в форме файлов, н-да… Ну, ладно, моё прохождение пополняет разнообразие!": "I don't even know what else to say. A text walkthrough delivered as text files right in the game folder—that's impressive, all right. And the only walkthrough of this novel on the internet exists only as files. Well, okay, my walkthrough adds some variety!",
        "Представляю вам прохождение блок-схему «Амнея28: две вечности»!": "Here is my flowchart walkthrough for “Amneya28: Two Eternities”!",

        // ===== Angels with Scaly Wings =====
        "Я несколько раз впадал в апатию, болела голова, но я всё таки завершил… Надо было просто найти правильное текстовое прохождение.": "I fell into apathy several times and had headaches, but I finished it anyway… I just needed to find the right text walkthrough.",
        "Много что хочу сказать… Во-первых вы не найдёте текстовое прохождение в привычном для ВН понимании. Они все не объясняют как проходить «руты», а объясняют как разблокировать достижения, максимально, как это возможно для данной ВН, не детальными формулировками.": "There's a lot I want to say… First, you won't find a text walkthrough in the usual visual novel sense. None of them explain how to follow the routes; they explain how to unlock achievements, as much as possible for this game, without detailed wording.",
        "Хм… я сказал «они», когда все эти «они» это копирки с одного сайта… Ладно…": "Hmm… I said “they”, when all of “them” are copies from one site… Whatever…",
        "Так вот, нашёл пошаговое текстовое прохождение (скорее всего, оригинал этих копирок), но этого мне не достаточно было. Самому мучатся, в новелле где есть переменные, которые не факт увидишь за всё время, не хотелось.": "So, I found a step-by-step text walkthrough (probably the original behind those copies), but that wasn't enough for me. I didn't want to struggle through a novel with variables you might never even see.",
        "Ну, и нашёл детальное текстовое прохождение (в 3 частях). Я сразу выдохнул.": "Then I found a detailed text walkthrough (in three parts). I breathed a sigh of relief.",
        "Во-вторых…": "Second…",
        "Мало того что новелла разделяется на стандартные дни, но и сцены. Я все их обозначил «(Сцена [какая]) => (Конец сцены)» они работают как скобки или папки… удобно. Пришлось сжимать изображение…": "Not only is the novel divided into standard days, but also into scenes. I marked them all as “(Scene [which]) => (End of scene)”; they work like brackets or folders… convenient. I had to compress the image…",
        "Думаю придётся изображение открыть в отдельной вкладке — мелко.": "I think you'll have to open the image in a separate tab—it's small.",
        "Ну, и всё! Это всё что хотел сказать. педставляю вам блок — схему Angels with Scaly Wings.": "Well, that's it! That's all I wanted to say. Here is the flowchart for Angels with Scaly Wings.",

        // ===== ATRI =====
        "Представляю вам блок-схему новеллы ATRI -My Dear Moments-.": "Here is the flowchart for ATRI -My Dear Moments-.",
        "7… 7 текстовых прохождений существуют, два из которых на русском. Ещё два на английском, оставшиеся — остальные языки… на это.": "7… there are 7 text walkthroughs, two of them in Russian. Two more in English, and the rest in other languages… that's a lot.",
        "Ладно, я тоже присоединяюсь.": "Fine, I'm joining in too.",
        "Всё очень легко проходиться.": "Everything is very easy to complete.",

        // ===== Ever17 =====
        "Утерян. Если востановлю, добавлю.": "Lost. If I restore it, I'll add it.",

        // ===== GINKA =====
        "Представляю вам блок-схему новеллы GINKA.": "Here is the flowchart for GINKA.",
        "Есть несколько текстовых похождений, чуть отличающиеся по наполнению.": "There are several text walkthroughs that differ slightly in content.",
        "Начиная с «Next» главы меняются чаще, чем их идентифицирующие заглушки (картинки с названием игры). То есть в «Next» глав 14, когда заглушек всего 3 (если не путаю).": "Starting with “Next”, chapters change more often than their identifying placeholders (images with the game title). That is, there are 14 “Next” chapters, while there are only 3 placeholders (if I remember correctly).",

        // ===== Himawari =====
        "Представляю вам блок-схему прохождение визуальной новеллы Himawari.": "Here is the flowchart walkthrough for the visual novel Himawari.",
        "Неожиданно, но в интернете есть блок-схема для этой ВН… на китайском. И нет, я на неё не опирался, при составлении своей.": "Surprisingly, there is a flowchart for this visual novel online… in Chinese. And no, I didn't rely on it when making mine.",
        "Три текстовых прохождения. Я сверялся с самым понятным — на fuwanovel.": "Three text walkthroughs. I checked against the clearest one—on fuwanovel.",
        "В Steam — переусложнено оглавление, а третий, допустим на Otaku Lair, похож на первый (ведь тот на fuwanovel и был основан на нём), но информация «навалена» без внятных разъяснений.": "The Steam one has an overly complicated table of contents, and the third one, say on Otaku Lair, is similar to the first (since the fuwanovel one was based on it), but the information is dumped without clear explanations.",

        // ===== I Wani Hug that Gator! =====
        "3 визуальное прохождение новеллы в интернете.": "3 visual walkthroughs of the novel exist online.",
        "По текстовым прохождениям здесь уже разнообразней, чем в snoot game: целых 3 прохождения в Steam, два из которых имеют табличку «отношений балов к концовкам». они чуть отличаются, по этому и два визуальных прохождения… это третье.": "There's more variety in text walkthroughs here than in Snoot Game: three whole walkthroughs on Steam, two of which have a “points-to-endings relationship” table. They differ slightly, hence two visual walkthroughs… this is the third.",
        "По самой схеме мне сказать нечего — он стандартен для меня, если вы вдели мои схемы, вы понимаете как их читать.": "I have nothing to say about the chart itself—it's standard for me. If you've seen my charts, you know how to read them.",
        "Представляю вам прохождение в виде блок-схемы «I Wani Hug that Gator!»": "Here is the walkthrough as a flowchart for “I Wani Hug that Gator!”",

        // ===== If My Heart Had Wings =====
        "Я вам представляю схему с прохождением визуальной новеллы If My Heart Had Wings.": "Here is my walkthrough chart for the visual novel If My Heart Had Wings.",
        "Предупрежу с обозначениями: «главы», «предисловие» и «послесловие» — это промежутки новеллы между интро — разделитель интро;": "A note on the labels: “chapters”, “prologue”, and “epilogue” are the intervals between intros—the intro separator;",
        "«главы» — это промежуток между картинками с названием новеллы на белых полосках (поймёте).": "“chapters” are the intervals between the images with the novel title on white strips (you'll understand).",
        "Изначально я хотел назвать их «днями», но, как оказалось, в сцене может быть и несколько дней и опускаться большие хронологические промежутки, поэтому решил отказаться и назвать сцены «сценами».": "At first I wanted to call them “days”, but it turned out a scene can span several days and skip large chronological gaps, so I decided against it and called the scenes “scenes”.",
        "Всё остальное должно быть понятно.": "Everything else should be clear.",
        "Да, визуальная новелла реально оказалась простой и бедна на выборы.": "Yes, the visual novel really turned out to be simple and light on choices.",
        "Если вдруг найдёте ошибки (надеюсь, нет), пишите.": "If you find any mistakes (I hope not), let me know.",

        // ===== Nekopara After =====
        "Пф-ф… без комментариев.": "Pff… no comment.",
        "Тоже самое что и в 4 части — блок-схема состоит из технических выборов…": "Same as in part 4—the flowchart consists of technical choices…",
        "Представляю вам очередную элементарную блок-схему Nekopara After": "Here is another elementary flowchart for Nekopara After",

        // ===== Nekopara: Catboys Paradise =====
        "… Хех, я опоздал с первым апреля, но с 1 апреля!": "… Heh, I'm late for April Fools, but happy April 1st!",
        "Мда… эта самая лёгкая блок-схема, которую делал… Ладно, первая лёгкая блок-схема, которую делал.": "Well… this is the easiest flowchart I've made… Okay, the first easy flowchart I've made.",
        "Оказывается здесь есть выбор…": "Turns out there is a choice here…",
        "Один… один выбор, Карл!": "One… one choice, Carl!",
        "представляю Прохождение — схему Nekopara: Catboys Paradise… Пхф… Ха…": "here is the walkthrough chart for Nekopara: Catboys Paradise… Pff… Ha…",

        // ===== Nekopara Vol. 4 =====
        "Ещё одна ближайшая лёгкая блок — схема…": "Another easy flowchart coming up…",
        "… Я не знал что тут есть выбор — честно.": "… I didn't know there was a choice here—honestly.",
        "До меня не сразу дошло, но выборы просты в понимании: выборы обращаются к самому игроку, а не к игровому сюжету.": "It took me a while to realize, but the choices are simple to understand: they address the player, not the game's story.",
        "Представляю вам ещё одну элементарную прохождение — схему (следующих таких блок — схем не ожидается) Nekopara Vol. 4": "Here is another elementary walkthrough chart (no more such flowcharts are expected) for Nekopara Vol. 4",

        // ===== Phoenix Wright: Ace Attorney =====
        "Фух, вот я и закончил со схемой — прохождением Phoenix Wright: Ace Attorney. Хоть 5-е дело и отсутствует из-за незаконченности перевода, когда его завершат — статья также будет обновлена.": "Phew, I've finished the walkthrough chart for Phoenix Wright: Ace Attorney. Although case 5 is missing because the translation isn't finished, the article will be updated when it is.",
        "Первое, что я хотел сказать — игра является адвенчурой поэтому схема в разы увеличилась по сравнению со схемами на обычные новеллы (я боюсь представить размеры следующих схем на новеллы — адвенчуры).": "The first thing I wanted to say: the game is an adventure, so the chart has grown many times larger than my charts for regular visual novels (I dread to imagine the size of future charts for adventure novels).",
        "Второе, при приближении вы заметите плохое качество букв и линий. Я 4 дня потратил чтобы png, размером 5 мб (оригинальный pdf файл весит целых 29 мб, а svg вообще 45 мб) сжал до 887 кб. Вполне неплохой результат (я ещё больше боюсь представить длительность сжатия и поиска компромиссов следующих схем новелл — адвенчуры)…": "Second, when you zoom in you'll notice the poor quality of the letters and lines. I spent four days compressing a 5 MB PNG (the original PDF is 29 MB, and the SVG is 45 MB) down to 887 KB. A pretty good result (I dread even more to imagine how long it will take to compress and find compromises for future adventure-novel charts)…",
        "Третье, я знаю про кривость формулировки и ошибок в «объяснении отображения». Я всё исправлю и ещё больше оптимизирую когда выйдет перевод 5 дела (v.2….), так как я не имею возможности тут же исправить.": "Third, I know about the awkward wording and mistakes in the “display explanation”. I'll fix everything and optimize it further when the case 5 translation is released (v.2…), since I can't fix it right away.",
        "Это всё, что я хотел сказать.": "That's all I wanted to say.",

        // ===== Phoenix Wright: v2 =====
        "[4-5 декабря 2025]": "[December 4-5, 2025]",
        "Фух, надо же… обновление.": "Phew, well then… an update.",
        "Я обновил блок-схему первой части до 2 версии! Долго сжимал эту картинку, по этому 4-5 декабря…": "I updated the flowchart for the first game to version 2! It took me a long time to compress this image, hence December 4-5…",
        "Вот отличия от v.1.5.3:": "Here are the differences from v1.5.3:",
        "— «Объяснение отображения» исправлено (перенесено из схемы ко 2 части и дополнено).": "— The “display explanation” has been fixed (moved from the second game's chart and expanded).",
        "— Исправлены огрехи в 4 главе.": "— Fixed the rough edges in chapter 4.",
        "— Расположение элементов «Идти» и «Показать» в вертикальный формат (вместе с остальными).": "— “Go” and “Show” elements are now arranged vertically (along with the rest).",
        "— Ну, и самое главное: добавлена 5 глава!": "— And most importantly: chapter 5 has been added!",
        "Вот и всё, дыра залатана.": "That's it, the hole is patched.",

        // ===== Phoenix Wright: Justice for All =====
        "Я задушнился с этой новеллой — походить одно и тоже 2 раза подряд марафоном, тянул как мог и вот наконец-то прошёл и представляю вам прохождение — схему этой адвенчуры…": "I got bogged down in this novel—going through the same thing twice in a row as a marathon, I dragged it out as long as I could, and now I've finally finished it and present the walkthrough chart for this adventure…",
        "Первое что хотел сказать — чтобы вы не ждали, пока картинка прогрузится, чтобы её открыть в дугой вкладке, в спойлере лежит ссылка сразу на эту вкладку (чтобы вы уже её подгрузки ожидали). Может поможет.": "The first thing I wanted to say: so you don't have to wait for the image to load before opening it in another tab, the spoiler contains a direct link to that tab (so you can expect it to load). Maybe it will help.",
        "Второе — картинка 15000х9000, меньше чем предыдущая. Так же, в этот раз, я потратил, неожиданно, меньше времени на сжатие изображения с 7 МБ до 876 КБ, хоть мне пришлось сжимать цвет отдельно.": "Second, the image is 15000×9000, smaller than the previous one. Also, this time I unexpectedly spent less time compressing the image from 7 MB to 876 KB, even though I had to compress the color separately.",
        "И да, теперь «Объяснение отображения» написан не так криво как в предыдущий раз — исправил.": "And yes, the “display explanation” is now written less awkwardly than last time—I fixed it.",
        "Ну, это всё что хотел сказать.": "Well, that's all I wanted to say.",

        // ===== Phoenix Wright: Trials and Tribulations =====
        "Я и закончил с блок-схемой Phoenix Wright: Ace Attorney — Trials and Tribulations прям под новый год": "I finished the Phoenix Wright: Ace Attorney — Trials and Tribulations flowchart right before the New Year",
        "Да, я закончил, успел до нового года.": "Yes, I finished it, just in time for the New Year.",
        "Никаких сложностей при создании не было. Так же проблем сжатия тоже.": "There were no difficulties while creating it. No compression problems either.",
        "Мне более нечего сказать, кроме…": "I have nothing more to say, except…",
        "Представляю вам блок-схему Phoenix Wright: Ace Attorney — Trials and Tribulations…": "Here is the flowchart for Phoenix Wright: Ace Attorney — Trials and Tribulations…",
        "Ну и с новым годом.": "And happy New Year.",

        // ===== Remember11 =====
        "Вот я и сделал схему Remember 11: Age of Infinity. Текстовое прохождение выглядит страшным, Когда ещё пытаться все «уровни» использовать одновременно, но это не так.": "So I made the chart for Remember 11: Age of Infinity. The text walkthrough looks intimidating—when else would you try to use all the “levels” at once—but it's not that bad.",
        "В основном я использовал текстовое прохождение. Я хотел использовать зарубежную схему, ведь на «Ever 17», она есть, но я её не нашёл… тогда.": "I mostly used the text walkthrough. I wanted to use a foreign chart, since there is one for Ever 17, but I couldn't find it… at the time.",
        "Сразу хочу сказать по поводу «сохранения системных данных» — их два вида: при любом выходе в меню и после концовок. Так вот, если вам нужно сохранить системные данные, такие как «параметры», без использования «сохранения», просто выйдя, то вам потребуется второй вид — после концовок. Так как если просто выйти в меню, то новелла просто сохранит текст прочитанным (да, если из-за системной ошибки (которая есть) или просто выключить новеллу, она не сохранит текст и перемотать его не будет возможно).": "I want to mention “system data saving” right away—there are two kinds: when you exit to the menu and after endings. So if you need to save system data such as “settings” without using “save”, just by exiting, you'll need the second kind—after endings. Because if you just exit to the menu, the novel will only save the text as read (yes, if the game crashes due to a system error (which exists) or you simply turn it off, it won't save the text and you won't be able to fast-forward it).",
        "Только к концу, когда мне надо было найти и пройти пару сообщений текста (для меня сложно находимых), я нашёл зарубежную блок-схему… две блок-схемы: одна схема концовок, вторая — схема сцен. Они одинаковы, только схема сцен разделена на сцены, поставленных параллельно по хронологии, а вторая — только на дни. Ох, и что я могу сказать в итоге: моя схема отличается… В моей обозначены заметки — там нет, но там показаны все связи на мелкий текст (даже те, в которых я сомневаюсь) — по этому, по-хорошему, можно использовать оба прохождения.": "Only near the end, when I needed to find and get through a couple of text messages (hard for me to find), I found a foreign flowchart… two flowcharts: one for endings, the other for scenes. They are the same, except the scene chart is divided into scenes placed in parallel by chronology, while the other is divided only by days. Oh, and what can I say in the end: my chart is different… Mine has notes—theirs doesn't, but theirs shows all the connections to small text (even the ones I doubt), so ideally both walkthroughs can be used.",
        "Но, сразу хочу предупредить, у нас разные подсчёты, и кто из нас прав… я не знаю.": "But I want to warn you right away: our counts differ, and which of us is right… I don't know.",
        "Представляю вам схему — прохождение Remember 11: Age of Infinity.": "Here is the walkthrough chart for Remember 11: Age of Infinity.",

        // ===== Snoot Game =====
        "Представляю вам вариант прохождение в виде блок-схемы.": "Here is my walkthrough in flowchart form.",
        "Существует табличка «отношений балов к концовкам» и табличка «важных выборов», читающихся вместе. Есть где-то и на русском языке.": "There is a “points-to-endings relationship” table and an “important choices” table that are read together. There is also a Russian version somewhere.",
        "Ну а я же сделал «всё в одном» в виде, привычном для меня, блок-схемы. Вроде как, второе визуальное прохождение в интернете на эту новеллу (первое — эти таблички).": "Well, I made an “all in one” version in my usual flowchart form. It seems to be the second visual walkthrough for this novel online (the first being those tables).",

        // ===== Wanko to Kurasou =====
        "Схема охватывает 98% CG. Один финальный CG остаётся неполученным — я не смог найти способ его активировать. Если вы знаете, как его получить, напишите в": "The chart covers 98% of the CGs. One final CG remains unobtained—I couldn't find a way to unlock it. If you know how to get it, write in",
        "Схема охватывает 98% CG. Один финальный CG остаётся неполученным — я не смог найти способ его активировать.": "The chart covers 98% of the CGs. One final CG remains unobtained—I couldn't find a way to unlock it.",
        "Если вы знаете, как его получить, напишите в": "If you know how to get it, write in",

        // ===== Wolf Girl =====
        "Представляю вам блок-схему визуальной новеллы Kemono Musume no Sodatekata (How to Raise a Wolf Girl).": "Here is the flowchart for the visual novel Kemono Musume no Sodatekata (How to Raise a Wolf Girl).",
        "У кого-то реально возникают трудности в прохождении этой новеллы, а конкретно с 5 сценой. У меня никаких проблем не было.": "Some people really have trouble getting through this novel, specifically scene 5. I had no problems at all.",
        "Одно единственное текстовое прохождение… Всё.": "Only one single text walkthrough… That's all."
    };

    function readLang() {
        if (settings) return settings.getLang();
        try {
            return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ru';
        } catch (e) {
            return document.documentElement.lang === 'en' ? 'en' : 'ru';
        }
    }

    function saveLang(lang) {
        if (settings) {
            settings.setLang(lang);
            return;
        }
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
            .replace(/ — Руководства для визуальных новелл в виде блок-схем$/, ' — Flowchart guide visual novels');
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

    // Мета-теги для поисковиков: description, og:title, og:description,
    // twitter:title, twitter:description. Английский вариант лежит в data-en.
    function applyMeta(lang) {
        var metas = document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]');
        for (var i = 0; i < metas.length; i++) {
            var el = metas[i];
            var en = el.getAttribute('data-en');
            if (!en) continue;
            var map = metaOriginals.get(el);
            if (!map) {
                map = {};
                metaOriginals.set(el, map);
            }
            if (map.ru === undefined) map.ru = el.getAttribute('content') || '';
            el.setAttribute('content', lang === 'en' ? en : map.ru);
        }
    }

    function updateButton(lang) {
        var btn = document.getElementById('langToggle');
        if (btn) {
            btn.textContent = lang === 'en' ? 'RU' : 'EN';
            btn.title = lang === 'en' ? 'Switch to Russian' : 'Переключить на английский';
            btn.setAttribute('aria-label', btn.title);
        }

        // Название кнопки темы тоже зависит от языка
        var themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.title = lang === 'en' ? 'Toggle theme' : 'Сменить тему';
        }
    }

    function applyLanguage(lang) {
        document.documentElement.lang = lang === 'en' ? 'en' : 'ru';
        applyTextNodes(lang);
        applyAttributes(lang);
        applyMeta(lang);
        applyTitle(lang);
        updateButton(lang);
    }

    function setLanguage(lang) {
        if (settings) {
            // settings сам разошлёт изменение подписчикам (включая эту страницу)
            settings.setLang(lang);
            return;
        }
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
        // Сначала применяем язык, затем тему (чтобы тема не перезаписала перевод кнопки)
        applyLanguage(readLang());

        // Язык сменили в другой вкладке — применяем у себя
        if (settings) {
            settings.on('lang', function (lang) {
                applyLanguage(lang);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
