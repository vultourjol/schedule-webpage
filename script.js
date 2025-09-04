function loadScheduleData() {
    let allScheduleData = {};
    
    if (typeof september2025 !== 'undefined') {
        allScheduleData = { ...allScheduleData, ...september2025 };
    }
    if (typeof october2025 !== 'undefined') {
        allScheduleData = { ...allScheduleData, ...october2025 };
    }
    // Добавляйте новые месяцы здесь по мере их создания
    // if (typeof november2025 !== 'undefined') {
    //     allScheduleData = { ...allScheduleData, ...november2025 };
    // }
    
    return allScheduleData;
}

function getScheduleForDate(date) {
    const actualScheduleData = loadScheduleData();
    const dateKey = formatDateKey(date);
    return actualScheduleData[dateKey] || [];
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function hasLessonsOnDate(date) {
    const lessons = getScheduleForDate(date);
    return lessons.length > 0;
}

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    loadTodaySchedule();
    generateCalendar();
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar();
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar();
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar();
        }
    });

    // Обработчик для кнопки "Управление данными"
    document.getElementById('dataManagementBtn').addEventListener('click', function() {
        openLectureModal('управлениеданными');
    });

    // Обработчик для кнопки "Информационные технологии"
    document.getElementById('itBtn').addEventListener('click', function() {
        openLectureModal('информационныетехнологии');
    });

    // Обработчик для кнопки "Вероятность и статистика"
    document.getElementById('probabilityStatisticsBtn').addEventListener('click', function() {
        openLectureModal('вероятностьистатистика');
    });

    // Обработчик для кнопки "Вычислительная математика"
    document.getElementById('computationalMathBtn').addEventListener('click', function() {
        openLectureModal('вычислительнаяматематика');
    });

    // Обработчик для кнопки "Дифференциальные уравнения"
    document.getElementById('differentialEquationsBtn').addEventListener('click', function() {
        openLectureModal('дифференциальныеуравнения');
    });

    // Обработчик для кнопки "Иностранный язык"
    document.getElementById('foreignLanguageBtn').addEventListener('click', function() {
        openLectureModal('иностранныйязык');
    });

    // Обработчик для кнопки "Теория информации"
    document.getElementById('informationTheoryBtn').addEventListener('click', function() {
        openLectureModal('теорияинформации');
    });

    // Обработчик для кнопки "Технологии программирования"
    document.getElementById('programmingTechnologiesBtn').addEventListener('click', function() {
        openLectureModal('технологиипрограммирования');
    });

    // Обработчик для кнопки "УИРИП"
    document.getElementById('uiripBtn').addEventListener('click', function() {
        openLectureModal('уирип');
    });

    // Обработчик для закрытия модального окна
    const modal = document.getElementById('lectureModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        clearModalSearch();
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            clearModalSearch();
        }
    });

    // Закрытие модального окна по нажатию Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            clearModalSearch();
        }
    });

    // Инициализация поиска в модальном окне
    initModalSearch();
});

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

function loadTodaySchedule() {
    const todaySchedule = getScheduleForDate(currentDate);
    const tableBody = document.getElementById('scheduleTableBody');
    const scheduleList = document.getElementById('scheduleList');
    
    if (todaySchedule.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: #a0a0a0; font-style: italic;">
                    Сегодня занятий нет
                </td>
            </tr>
        `;
        
        scheduleList.innerHTML = `
            <div class="no-lessons-message">
                Сегодня занятий нет
            </div>
        `;
        return;
    }
    
    tableBody.innerHTML = todaySchedule.map(lesson => `
        <tr>
            <td class="time-cell">${lesson.time}</td>
            <td class="subject-cell">${lesson.subject}</td>
            <td class="teacher-cell">${lesson.teacher}</td>
            <td class="room-cell">${lesson.room}</td>
            <td><span class="type-cell ${lesson.type}">${getTypeLabel(lesson.type)}</span></td>
        </tr>
    `).join('');
    
    scheduleList.innerHTML = todaySchedule.map(lesson => `
        <div class="schedule-item">
            <div class="schedule-item-header">
                <span class="schedule-time">${lesson.time}</span>
                <span class="schedule-type ${lesson.type}">${getTypeLabel(lesson.type)}</span>
            </div>
            <div class="schedule-subject">${lesson.subject}</div>
            <div class="schedule-details">
                <div class="schedule-teacher">${lesson.teacher}</div>
                <div class="schedule-room">Аудитория ${lesson.room}</div>
            </div>
        </div>
    `).join('');
}

function getTypeLabel(type) {
    const types = {
        'lecture': 'Лекция',
        'seminar': 'Семинар',
        'lab': 'Лабораторная',
        'practice': 'Практика'
    };
    return types[type] || type;
}

function generateCalendar() {
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    dayNames.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day header';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    for (let i = 0; i < firstDayWeek; i++) {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
        const dayNum = prevMonthLastDay - firstDayWeek + i + 1;
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = dayNum;
        calendarGrid.appendChild(dayElement);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dayDate = new Date(currentYear, currentMonth, day);
        const dayOfWeek = dayDate.getDay();
        
        if (dayDate.toDateString() === currentDate.toDateString()) {
            dayElement.classList.add('today');
        }
        
        if (hasLessonsOnDate(dayDate)) {
            dayElement.classList.add('has-classes');
            const lessonsCount = getScheduleForDate(dayDate).length;
            dayElement.title = `Занятий: ${lessonsCount}`;
        }
        
        dayElement.addEventListener('click', () => {
            showDaySchedule(dayDate);
        });
        
        calendarGrid.appendChild(dayElement);
    }
    
    const totalCells = calendarGrid.children.length - 7; 
    const remainingCells = 42 - 7 - totalCells; 
    
    for (let day = 1; day <= remainingCells && totalCells < 35; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    }
}

function showDaySchedule(date) {
    const daySchedule = getScheduleForDate(date);
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = date.toLocaleDateString('ru-RU', options);
    
    if (daySchedule.length === 0) {
        alert(`${dateString}\n\nВ этот день занятий нет.`);
        return;
    }
    
    let scheduleText = `${dateString}\n\nРасписание занятий:\n\n`;
    daySchedule.forEach(lesson => {
        scheduleText += `${lesson.time} - ${lesson.subject}\n`;
        scheduleText += `Преподаватель: ${lesson.teacher}\n`;
        scheduleText += `Аудитория: ${lesson.room}\n`;
        scheduleText += `Тип: ${getTypeLabel(lesson.type)}\n\n`;
    });
    
    alert(scheduleText);
}

setInterval(() => {
    const now = new Date();
    if (now.toDateString() !== currentDate.toDateString()) {
        currentDate = now;
        updateCurrentDate();
        loadTodaySchedule();
        generateCalendar();
    }
}, 60000);

// Функция для открытия модального окна с лекцией
async function openLectureModal(lectureName) {
    const modal = document.getElementById('lectureModal');
    const content = document.getElementById('lectureContent');
    
    // Очищаем поиск при открытии нового модального окна
    clearModalSearch();
    document.getElementById('modalSearchInput').value = '';
    
    try {
        // Загружаем markdown файл
        const response = await fetch(`lectures/${lectureName}.md`);
        if (!response.ok) {
            throw new Error('Файл не найден');
        }
        
        const markdownText = await response.text();
        
        // Преобразуем markdown в HTML
        const htmlContent = markdownToHtml(markdownText);
        
        // Отображаем содержимое в модальном окне
        content.innerHTML = htmlContent;
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Ошибка загрузки лекции:', error);
        content.innerHTML = '<h3>Ошибка</h3><p>Не удалось загрузить лекцию. Попробуйте позже.</p>';
        modal.style.display = 'block';
    }
}

// Простая функция для преобразования Markdown в HTML
function markdownToHtml(markdown) {
    let html = markdown;
    
    // Заголовки
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Жирный текст
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Списки
    html = html.replace(/^\s*[\*\-] (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\s*\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Обертываем списки в ul
    html = html.replace(/(<li>.*?<\/li>)/gims, function(match) {
        // Проверяем, не обернут ли уже в список
        if (!match.includes('<ul>') && !match.includes('<ol>')) {
            return '<ul>' + match + '</ul>';
        }
        return match;
    });
    
    // Параграфы - разделяем по двойным переносам строк
    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs.map(p => {
        p = p.trim();
        // Не оборачиваем в <p> если это уже заголовок или список
        if (p.startsWith('<h') || p.startsWith('<ul>') || p.startsWith('<ol>') || p.includes('<li>')) {
            return p;
        }
        return p ? `<p>${p}</p>` : '';
    }).join('');
    
    return html;
}

// Переменные для поиска в модальном окне
let modalSearchData = {
    originalContent: '',
    currentMatches: [],
    currentIndex: -1,
    isSearchActive: false
};

// Инициализация поиска в модальном окне
function initModalSearch() {
    const searchInput = document.getElementById('modalSearchInput');
    const prevBtn = document.getElementById('prevSearchBtn');
    const nextBtn = document.getElementById('nextSearchBtn');
    const clearBtn = document.getElementById('clearSearchBtn');
    const counter = document.getElementById('searchCounter');

    // Обработчик ввода в поле поиска
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 0) {
            performModalSearch(query);
        } else {
            clearModalSearch();
        }
    });

    // Обработчик для Enter в поле поиска
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (modalSearchData.currentMatches.length > 0) {
                navigateToNextMatch();
            }
        }
    });

    // Навигация по результатам
    prevBtn.addEventListener('click', navigateToPrevMatch);
    nextBtn.addEventListener('click', navigateToNextMatch);

    // Очистка поиска
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearModalSearch();
        searchInput.focus();
    });
}

// Выполнение поиска
function performModalSearch(query) {
    const content = document.getElementById('lectureContent');
    
    // Сохраняем оригинальный контент при первом поиске
    if (!modalSearchData.isSearchActive) {
        modalSearchData.originalContent = content.innerHTML;
        modalSearchData.isSearchActive = true;
    }

    // Восстанавливаем оригинальный контент
    content.innerHTML = modalSearchData.originalContent;

    // Ищем совпадения (игнорируем регистр)
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const walker = document.createTreeWalker(
        content,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim() && regex.test(node.textContent)) {
            textNodes.push(node);
        }
    }

    modalSearchData.currentMatches = [];
    modalSearchData.currentIndex = -1;

    // Выделяем найденный текст
    textNodes.forEach(textNode => {
        const parent = textNode.parentNode;
        const text = textNode.textContent;
        const highlightedHTML = text.replace(regex, (match, p1, offset) => {
            modalSearchData.currentMatches.push({ element: null, offset: offset });
            return `<span class="search-highlight">${match}</span>`;
        });

        if (highlightedHTML !== text) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = highlightedHTML;
            
            // Заменяем текстовый узел на выделенный контент
            while (wrapper.firstChild) {
                parent.insertBefore(wrapper.firstChild, textNode);
            }
            parent.removeChild(textNode);
        }
    });

    // Обновляем ссылки на выделенные элементы
    const highlights = content.querySelectorAll('.search-highlight');
    modalSearchData.currentMatches = Array.from(highlights).map(el => ({ element: el }));

    updateSearchUI();

    // Переходим к первому результату
    if (modalSearchData.currentMatches.length > 0) {
        modalSearchData.currentIndex = 0;
        highlightCurrentMatch();
        scrollToCurrentMatch();
    }
}

// Очистка поиска
function clearModalSearch() {
    const content = document.getElementById('lectureContent');
    
    if (modalSearchData.isSearchActive && modalSearchData.originalContent) {
        content.innerHTML = modalSearchData.originalContent;
    }

    modalSearchData = {
        originalContent: '',
        currentMatches: [],
        currentIndex: -1,
        isSearchActive: false
    };

    updateSearchUI();
}

// Навигация к следующему результату
function navigateToNextMatch() {
    if (modalSearchData.currentMatches.length === 0) return;

    // Убираем выделение с текущего
    if (modalSearchData.currentIndex >= 0) {
        const currentElement = modalSearchData.currentMatches[modalSearchData.currentIndex].element;
        currentElement.classList.remove('current');
    }

    modalSearchData.currentIndex = (modalSearchData.currentIndex + 1) % modalSearchData.currentMatches.length;
    highlightCurrentMatch();
    scrollToCurrentMatch();
    updateSearchUI();
}

// Навигация к предыдущему результату
function navigateToPrevMatch() {
    if (modalSearchData.currentMatches.length === 0) return;

    // Убираем выделение с текущего
    if (modalSearchData.currentIndex >= 0) {
        const currentElement = modalSearchData.currentMatches[modalSearchData.currentIndex].element;
        currentElement.classList.remove('current');
    }

    modalSearchData.currentIndex = modalSearchData.currentIndex <= 0 
        ? modalSearchData.currentMatches.length - 1 
        : modalSearchData.currentIndex - 1;
    
    highlightCurrentMatch();
    scrollToCurrentMatch();
    updateSearchUI();
}

// Выделение текущего совпадения
function highlightCurrentMatch() {
    if (modalSearchData.currentIndex >= 0 && modalSearchData.currentMatches.length > 0) {
        const currentElement = modalSearchData.currentMatches[modalSearchData.currentIndex].element;
        currentElement.classList.add('current');
    }
}

// Прокрутка к текущему совпадению
function scrollToCurrentMatch() {
    if (modalSearchData.currentIndex >= 0 && modalSearchData.currentMatches.length > 0) {
        const currentElement = modalSearchData.currentMatches[modalSearchData.currentIndex].element;
        currentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Обновление интерфейса поиска
function updateSearchUI() {
    const counter = document.getElementById('searchCounter');
    const prevBtn = document.getElementById('prevSearchBtn');
    const nextBtn = document.getElementById('nextSearchBtn');

    if (modalSearchData.currentMatches.length > 0) {
        counter.textContent = `${modalSearchData.currentIndex + 1} из ${modalSearchData.currentMatches.length}`;
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    } else {
        counter.textContent = modalSearchData.isSearchActive ? 'Не найдено' : '';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
}

// Экранирование специальных символов для регулярного выражения
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

