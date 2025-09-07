// Глобальная переменная для хранения всех данных расписания
let scheduleData = {};

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Глобальные переменные для tooltip
let tooltip = null;
let tooltipTimeout = null;

// Инициализация страницы
document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем расписание для текущего месяца
    await loadScheduleForCurrentMonth();
    
    updateCurrentDate();
    loadTodaySchedule();
    await loadTomorrowSchedule();
    generateCalendar();
    
    // Обработчики для кнопок календаря
    document.getElementById('prevMonth').addEventListener('click', goToPreviousMonth);
    document.getElementById('nextMonth').addEventListener('click', goToNextMonth);
    
    // Обработчик клавиатуры для переключения месяцев стрелочками
    document.addEventListener('keydown', function(event) {
        // Проверяем, что фокус не находится на элементах ввода
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || 
            activeElement.contentEditable === 'true') {
            return;
        }
        
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goToPreviousMonth();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            goToNextMonth();
        }
    });
    
    // Обработчик для скрытия tooltip при скролле или движении по странице
    document.addEventListener('scroll', hideTooltip);
    document.addEventListener('resize', hideTooltip);
});

// Загружает расписание для текущего месяца
async function loadScheduleForCurrentMonth() {
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    const monthName = monthNames[currentMonth];
    const variableName = `${monthName}Schedule`;
    
    // Проверяем, загружены ли уже данные для этого месяца
    if (window[variableName]) {
        scheduleData = window[variableName];
        return;
    }
    
    // Пытаемся загрузить файл для текущего месяца
    try {
        const script = document.createElement('script');
        script.src = `months/${monthName}.js`;
        
        return new Promise((resolve) => {
            script.onload = () => {
                scheduleData = window[variableName] || {};
                resolve();
            };
            script.onerror = () => {
                console.log(`Файл расписания для ${monthName} ${currentYear} не найден`);
                scheduleData = {};
                resolve();
            };
            
            // Проверяем, не загружен ли уже этот скрипт
            const existingScript = document.querySelector(`script[src="months/${monthName}.js"]`);
            if (!existingScript) {
                document.head.appendChild(script);
            } else {
                scheduleData = window[variableName] || {};
                resolve();
            }
        });
    } catch (error) {
        console.log(`Ошибка при загрузке расписания для ${monthName}:`, error);
        scheduleData = {};
    }
}

// Функция для перехода к предыдущему месяцу
async function goToPreviousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    await loadScheduleForCurrentMonth();
    loadTodaySchedule();
    await loadTomorrowSchedule();
    generateCalendar();
}

// Функция для перехода к следующему месяцу
async function goToNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    await loadScheduleForCurrentMonth();
    loadTodaySchedule();
    await loadTomorrowSchedule();
    generateCalendar();
}

// Обновление текущей даты в заголовке
function updateCurrentDate() {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const dateString = currentDate.toLocaleDateString('ru-RU', options);
    document.getElementById('currentDate').textContent = dateString;
}

// Загрузка расписания на сегодня
function loadTodaySchedule() {
    const today = formatDate(currentDate);
    const todaySchedule = scheduleData[today] || [];
    const container = document.getElementById('todaySchedule');
    
    if (todaySchedule.length === 0) {
        container.innerHTML = '<div class="no-schedule">На сегодня занятий нет</div>';
        return;
    }
    
    container.innerHTML = todaySchedule.map(item => `
        <div class="schedule-item">
            <div class="type">${item.type}</div>
            <div class="subject">${item.subject}</div>
            <div class="teacher">Преподаватель: ${item.teacher}</div>
            <div class="time">Время: ${item.time}</div>
        </div>
    `).join('');
}

// Загрузка расписания на завтра
async function loadTomorrowSchedule() {
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Проверяем, нужно ли загрузить данные для другого месяца
    const tomorrowMonth = tomorrow.getMonth();
    const tomorrowYear = tomorrow.getFullYear();
    
    let tomorrowScheduleData = scheduleData;
    
    // Если завтра в другом месяце, загружаем данные для этого месяца
    if (tomorrowMonth !== currentMonth || tomorrowYear !== currentYear) {
        const monthNames = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        
        const monthName = monthNames[tomorrowMonth];
        const variableName = `${monthName}Schedule`;
        
        // Пытаемся загрузить данные для месяца завтрашнего дня
        if (!window[variableName]) {
            try {
                const script = document.createElement('script');
                script.src = `months/${monthName}.js`;
                
                await new Promise((resolve) => {
                    script.onload = () => {
                        tomorrowScheduleData = window[variableName] || {};
                        resolve();
                    };
                    script.onerror = () => {
                        console.log(`Файл расписания для ${monthName} ${tomorrowYear} не найден`);
                        tomorrowScheduleData = {};
                        resolve();
                    };
                    
                    // Проверяем, не загружен ли уже этот скрипт
                    const existingScript = document.querySelector(`script[src="months/${monthName}.js"]`);
                    if (!existingScript) {
                        document.head.appendChild(script);
                    } else {
                        tomorrowScheduleData = window[variableName] || {};
                        resolve();
                    }
                });
            } catch (error) {
                console.log(`Ошибка при загрузке расписания для ${monthName}:`, error);
                tomorrowScheduleData = {};
            }
        } else {
            tomorrowScheduleData = window[variableName];
        }
    }
    
    const tomorrowDateString = formatDate(tomorrow);
    const tomorrowSchedule = tomorrowScheduleData[tomorrowDateString] || [];
    const container = document.getElementById('tomorrowSchedule');
    
    if (tomorrowSchedule.length === 0) {
        container.innerHTML = '<div class="no-schedule">На завтра занятий нет</div>';
        return;
    }
    
    container.innerHTML = tomorrowSchedule.map(item => `
        <div class="schedule-item">
            <div class="type">${item.type}</div>
            <div class="subject">${item.subject}</div>
            <div class="teacher">Преподаватель: ${item.teacher}</div>
            <div class="time">Время: ${item.time}</div>
        </div>
    `).join('');
}

// Генерация календаря
function generateCalendar() {
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    document.getElementById('monthYear').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем день недели для первого дня месяца (понедельник = 0)
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Добавляем заголовки дней недели
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-weekday';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dayDate = new Date(currentYear, currentMonth, day);
        const dateString = formatDate(dayDate);
        
        // Проверяем, есть ли занятия в этот день
        if (scheduleData[dateString]) {
            dayElement.classList.add('has-classes');
        }
        
        // Выделяем сегодняшний день
        if (dayDate.toDateString() === currentDate.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Добавляем обработчик клика для показа расписания
        dayElement.addEventListener('click', function() {
            showDaySchedule(dateString, dayDate);
        });
        
        // Добавляем обработчики для tooltip
        dayElement.addEventListener('mouseenter', function() {
            showTooltip(dayElement, dateString, dayDate);
        });
        
        dayElement.addEventListener('mouseleave', function() {
            hideTooltip();
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

// Показать расписание для выбранного дня
function showDaySchedule(dateString, date) {
    const schedule = scheduleData[dateString] || [];
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = date.toLocaleDateString('ru-RU', dateOptions);
    
    if (schedule.length === 0) {
        alert(`${formattedDate}\n\nНа этот день занятий нет`);
        return;
    }
    
    const scheduleText = schedule.map(item => 
        `${item.time} - ${item.type.toUpperCase()}\n${item.subject}\nПреподаватель: ${item.teacher}`
    ).join('\n\n');
    
    alert(`${formattedDate}\n\n${scheduleText}`);
}

// Форматирование даты в строку YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
