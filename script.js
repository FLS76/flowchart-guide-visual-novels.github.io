// Переключение вкладок
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Убираем активный класс со всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс текущей вкладке
            tab.classList.add('active');
            
            // Показываем соответствующий контент
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Сохраняем последнюю открытую вкладку
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
        const savedTabBtn = document.querySelector(`.tab[data-tab="${savedTab}"]`);
        if (savedTabBtn) {
            savedTabBtn.click();
        }
    }
    
    // Сохраняем при переключении
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            localStorage.setItem('activeTab', tab.getAttribute('data-tab'));
        });
    });
});
