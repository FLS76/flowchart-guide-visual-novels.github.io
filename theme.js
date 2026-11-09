// Переключатель темы (светлая/тёмная)
(function() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) return;
    
    // Проверяем сохранённую тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
    }
    
    themeToggle.addEventListener('click', () {
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        themeToggle.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
})();
