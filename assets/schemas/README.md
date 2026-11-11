# Папка для изображений блок-схем

Сюда кладутся сами блок-схемы (PNG). Одна схема — один файл.

## Как называть файл

`<slug>-<номер>.png`, где `slug` — папка новеллы в `novels/`, а номер — номер схемы внутри неё.

Пример: `novels/phoenix-wright/schema2/index.html` → `phoenix-wright-2.png`.

## Какие файлы нужны сейчас

| Файл | Страница | Новелла |
|---|---|---|
| `9-nine-1-1.png` | `novels/9-nine-1/schema1/` | 9 -Nine- Kokonotsu Kokonoka Kokonoiro |
| `9-nine-2-1.png` | `novels/9-nine-2/schema1/` | 9 -Nine- Sorairo Sorauta Soranooto |
| `amneya28-1.png` | `novels/amneya28/schema1/` | Амнея28: две вечности |
| `angels-scaly-wings-1.png` | `novels/angels-scaly-wings/schema1/` | Angels with Scaly Wings |
| `atri-1.png` | `novels/atri/schema1/` | ATRI -My Dear Moments- |
| `ever17-1.png` | `novels/ever17/schema1/` | Ever17: Out of the Infinity |
| `ginka-1.png` | `novels/ginka/schema1/` | GINKA |
| `himawari-1.png` | `novels/himawari/schema1/` | Himawari |
| `i-wani-hug-1.png` | `novels/i-wani-hug/schema1/` | I Wani Hug that Gator! |
| `if-heart-wings-1.png` | `novels/if-heart-wings/schema1/` | If my heart had wings |
| `neko-after-1.png` | `novels/neko-after/schema1/` | Nekopara After |
| `neko-catboys-1.png` | `novels/neko-catboys/schema1/` | Nekopara: Catboys Paradise |
| `neko-vol4-1.png` | `novels/neko-vol4/schema1/` | Nekopara Vol. 4 |
| `phoenix-wright-1.png` | `novels/phoenix-wright/schema1/` | Phoenix Wright: Ace Attorney |
| `phoenix-wright-2.png` | `novels/phoenix-wright/schema2/` | Phoenix Wright: Ace Attorney (v2) |
| `phoenix-wright-justice-1.png` | `novels/phoenix-wright-justice/schema1/` | Phoenix Wright: Ace Attorney — Justice for All |
| `phoenix-wright-trials-1.png` | `novels/phoenix-wright-trials/schema1/` | Phoenix Wright: Ace Attorney — Trials and Tribulations |
| `remember11-1.png` | `novels/remember11/schema1/` | Remember11: The Age of Infinity |
| `sharin-himawari-1.png` | `novels/sharin-himawari/schema1/` | Sharin no Kuni, Himawari no Shoujo |
| `sharin-yuukyuu-1.png` | `novels/sharin-yuukyuu/schema1/` | Sharin no Kuni, Yuukyuu no Shounenshoujo |
| `snoot-game-1.png` | `novels/snoot-game/schema1/` | Snoot Game |
| `wanko-1.png` | `novels/wanko/schema1/` | Wanko to Kurasou |
| `wolf-girl-1.png` | `novels/wolf-girl/schema1/` | Kemono Musume no Sodatekata |

## Если файла нет

Страница схемы не показывает битую картинку, а выводит аккуратную плашку
«Изображение схемы пока не добавлено» — так видно, что файл ещё не загружен.

## Требования к файлу

- PNG, оптимизированный (цель — до 1–2 МБ на схему).
- Рекомендуемая ширина: 3000–5000 px, высота — по пропорции схемы.
- Имя — строго по таблице выше, иначе страница не найдёт файл.

## Как добавить новую схему

1. Положить файл в эту папку с нужным именем.
2. Создать страницу `novels/<slug>/schemaN/index.html` — скопировать любую
   готовую (например, `novels/wanko/schema1/index.html`) и поправить
   название, подзаголовок, тексты и `src` картинки.
3. Добавить новую страницу в `sitemap.xml` и в каталог на главной.
4. `git add` + `git commit` + `git push` — GitHub Pages пересоберёт сайт.
