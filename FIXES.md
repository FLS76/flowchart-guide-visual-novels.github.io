# Исправление путей на страницах новелл

Проблема: ссылки "Назад к списку" ведут на неправильный путь.

## Исправлено:

- ✅ sharin-himawari
- ✅ ever17  
- ✅ wanko
- ✅ phoenix-wright
- ✅ nekopara
- ✅ sharin-yuukyuu

Остальные 14 страниц нужно исправить аналогично.

## Что исправлено:

В каждой странице новелл заменено:
```html
<a href="index.html" class="back-link">← Назад к списку</a>
```

На:
```html
<a href="../index.html" class="back-link">← Назад к списку</a>
```

Также добавлено подключение обоих CSS файлов:
```html
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="style.css">
```

## Статус:
- ✅ 6 страниц исправлены
- ⏳ 14 страниц требуют исправления
