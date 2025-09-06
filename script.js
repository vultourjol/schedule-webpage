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
let calendarFilters = {
    lecture: true,
    seminar: true,
    practice: true,
    lab: true
};

document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    loadTodaySchedule();
    initCalendar();
    initCalendarControls();
    initCalendarFilters();
    generateCalendar();
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar();
        updateDateSelectors();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar();
        updateDateSelectors();
    });
    
    document.addEventListener('keydown', function(event) {
        // Проверяем, что модальные окна не открыты
        const modal = document.getElementById('lectureModal');
        const dayModal = document.getElementById('dayScheduleModal');
        const isModalOpen = (modal && modal.style.display === 'block') || 
                           (dayModal && dayModal.style.display === 'block');
        
        if (isModalOpen) return;
        
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar();
            updateDateSelectors();
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar();
            updateDateSelectors();
        }
        else if (event.key === 'Home') {
            event.preventDefault();
            const today = new Date();
            currentMonth = today.getMonth();
            currentYear = today.getFullYear();
            generateCalendar();
            updateDateSelectors();
        }
        else if (event.key === 'Escape') {
            hideTooltip();
            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
                clearModalSearch();
                document.body.classList.remove('modal-open');
            }
            if (dayModal && dayModal.style.display === 'block') {
                dayModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        }
    });

    document.getElementById('dataManagementBtn').addEventListener('click', function() {
        openLectureModal('управлениеданными');
    });

    document.getElementById('itBtn').addEventListener('click', function() {
        openLectureModal('информационныетехнологии');
    });

    document.getElementById('probabilityStatisticsBtn').addEventListener('click', function() {
        openLectureModal('вероятностьистатистика');
    });

    document.getElementById('computationalMathBtn').addEventListener('click', function() {
        openLectureModal('вычислительнаяматематика');
    });

    document.getElementById('differentialEquationsBtn').addEventListener('click', function() {
        openLectureModal('дифференциальныеуравнения');
    });

    document.getElementById('foreignLanguageBtn').addEventListener('click', function() {
        openLectureModal('иностранныйязык');
    });

    document.getElementById('informationTheoryBtn').addEventListener('click', function() {
        openLectureModal('теорияинформации');
    });

    document.getElementById('programmingTechnologiesBtn').addEventListener('click', function() {
        openLectureModal('технологиипрограммирования');
    });

    document.getElementById('uiripBtn').addEventListener('click', function() {
        openLectureModal('уирип');
    });

    const modal = document.getElementById('lectureModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        clearModalSearch();
        document.body.classList.remove('modal-open');
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            clearModalSearch();        document.body.classList.remove('modal-open');
        }
    });

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
    updateDateSelectors();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Создаем заголовки дней недели
    dayNames.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day header';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Дни предыдущего месяца
    for (let i = 0; i < firstDayWeek; i++) {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
        const dayNum = prevMonthLastDay - firstDayWeek + i + 1;
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = dayNum;
        dayElement.appendChild(dayNumber);
        
        calendarGrid.appendChild(dayElement);
    }
    
    // Дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        const dayDate = new Date(currentYear, currentMonth, day);
        
        // Проверяем выходные
        if (isWeekend(dayDate)) {
            dayElement.classList.add('weekend');
        }
        
        // Проверяем сегодняшний день
        if (dayDate.toDateString() === currentDate.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Проверяем наличие занятий
        const lessons = getScheduleForDate(dayDate);
        const filteredLessons = getFilteredLessons(lessons);
        
        if (filteredLessons.length > 0) {
            dayElement.classList.add('has-classes');
            dayElement.title = `Занятий: ${filteredLessons.length}`;
            
            // Добавляем индикаторы занятий
            const indicators = createLessonIndicators(lessons);
            dayElement.appendChild(indicators);
            
            // Добавляем обработчики для tooltip
            let hoverTimeout;
            
            dayElement.addEventListener('mouseenter', function() {
                hoverTimeout = setTimeout(() => {
                    showTooltip(dayElement, dayDate, lessons);
                }, 300);
            });
            
            dayElement.addEventListener('mouseleave', function() {
                clearTimeout(hoverTimeout);
                hideTooltip();
            });
        }
        
        // Обработчик клика
        dayElement.addEventListener('click', () => {
            hideTooltip();
            showDaySchedule(dayDate);
        });
        
        calendarGrid.appendChild(dayElement);
    }
    
    // Дни следующего месяца
    const totalCells = calendarGrid.children.length - 7; 
    const remainingCells = 42 - 7 - totalCells; 
    
    for (let day = 1; day <= remainingCells && totalCells < 35; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        calendarGrid.appendChild(dayElement);
    }
      // Скрываем tooltip при перегенерации календаря
    hideTooltip();
    // addCalendarAnimations(); // Отключена анимация переключения месяца
    addAccessibilitySupport();
}

function showDaySchedule(date) {
    const daySchedule = getScheduleForDate(date);
    const filteredSchedule = getFilteredLessons(daySchedule);
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = date.toLocaleDateString('ru-RU', options);
    
    if (filteredSchedule.length === 0) {
        // Создаем красивое модальное окно вместо alert
        showScheduleModal(dateString, []);
        return;
    }
    
    showScheduleModal(dateString, filteredSchedule);
}

function showScheduleModal(dateString, schedule) {
    // Создаем модальное окно для расписания дня
    let modal = document.getElementById('dayScheduleModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dayScheduleModal';
        modal.className = 'modal day-schedule-modal';
        modal.innerHTML = `
            <div class="modal-wrapper">
                <div class="modal-content day-schedule-content">
                    <div class="day-schedule-header">
                        <h3 id="dayScheduleDate"></h3>
                        <button class="modal-close-btn" id="dayScheduleCloseBtn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <div id="dayScheduleContent"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Обработчики закрытия
        const closeBtn = modal.querySelector('#dayScheduleCloseBtn');
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
        
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    }
    
    const dateElement = modal.querySelector('#dayScheduleDate');
    const contentElement = modal.querySelector('#dayScheduleContent');
    
    dateElement.textContent = dateString;
    
    if (schedule.length === 0) {
        contentElement.innerHTML = `
            <div class="no-lessons-message">
                В этот день занятий нет
            </div>
        `;
    } else {
        contentElement.innerHTML = `
            <div class="day-schedule-list">
                ${schedule.map(lesson => `
                    <div class="day-schedule-item">
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
                `).join('')}
            </div>
        `;
    }
    
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
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

async function openLectureModal(lectureName) {
    const modal = document.getElementById('lectureModal');
    const content = document.getElementById('lectureContent');
    
    clearModalSearch();
    document.getElementById('modalSearchInput').value = '';
    
    try {
        const response = await fetch(`lectures/${lectureName}.md`);
        if (!response.ok) {
            throw new Error('Файл не найден');
        }
        
        const markdownText = await response.text();
        
        const htmlContent = markdownToHtml(markdownText);
        
        content.innerHTML = htmlContent;
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        
    } catch (error) {
        console.error('Ошибка загрузки лекции:', error);
        content.innerHTML = '<h3>Ошибка</h3><p>Не удалось загрузить лекцию. Попробуйте позже.</p>';
        modal.style.display = 'block';
    }
}

function markdownToHtml(markdown) {
    let html = markdown;
    
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    html = html.replace(/^\s*[\*\-] (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\s*\d+\. (.*$)/gim, '<li>$1</li>');
    
    html = html.replace(/(<li>.*?<\/li>)/gims, function(match) {
        if (!match.includes('<ul>') && !match.includes('<ol>')) {
            return '<ul>' + match + '</ul>';
        }
        return match;
    });
    
    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs.map(p => {
        p = p.trim();
        if (p.startsWith('<h') || p.startsWith('<ul>') || p.startsWith('<ol>') || p.includes('<li>')) {
            return p;
        }
        return p ? `<p>${p}</p>` : '';
    }).join('');
    
    return html;
}

let modalSearchData = {
    originalContent: '',
    currentMatches: [],
    currentIndex: -1,
    isSearchActive: false
};

function initModalSearch() {
    const searchInput = document.getElementById('modalSearchInput');
    const prevBtn = document.getElementById('prevSearchBtn');
    const nextBtn = document.getElementById('nextSearchBtn');
    const clearBtn = document.getElementById('clearSearchBtn');
    const counter = document.getElementById('searchCounter');

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 0) {
            performModalSearch(query);
        } else {
            clearModalSearch();
        }
    });

    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (modalSearchData.currentMatches.length > 0) {
                navigateToNextMatch();
            }
        }
    });

    prevBtn.addEventListener('click', navigateToPrevMatch);
    nextBtn.addEventListener('click', navigateToNextMatch);

    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearModalSearch();
        searchInput.focus();
    });
}

function performModalSearch(query) {
    const content = document.getElementById('lectureContent');
    
    if (!modalSearchData.isSearchActive) {
        modalSearchData.originalContent = content.innerHTML;
        modalSearchData.isSearchActive = true;
    }

    content.innerHTML = modalSearchData.originalContent;

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
            
            while (wrapper.firstChild) {
                parent.insertBefore(wrapper.firstChild, textNode);
            }
            parent.removeChild(textNode);
        }
    });

    const highlights = content.querySelectorAll('.search-highlight');
    modalSearchData.currentMatches = Array.from(highlights).map(el => ({ element: el }));

    updateSearchUI();

    if (modalSearchData.currentMatches.length > 0) {
        modalSearchData.currentIndex = 0;
        highlightCurrentMatch();
        scrollToCurrentMatch();
    }
}

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

function navigateToNextMatch() {
    if (modalSearchData.currentMatches.length === 0) return;

    if (modalSearchData.currentIndex >= 0) {
        const currentElement = modalSearchData.currentMatches[modalSearchData.currentIndex].element;
        currentElement.classList.remove('current');
    }

    modalSearchData.currentIndex = (modalSearchData.currentIndex + 1) % modalSearchData.currentMatches.length;
    highlightCurrentMatch();
    scrollToCurrentMatch();
    updateSearchUI();
}

function navigateToPrevMatch() {
    if (modalSearchData.currentMatches.length === 0) return;

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

function highlightCurrentMatch() {
    if (modalSearchData.currentIndex >= 0 && modalSearchData.currentMatches.length > 0) {
        const currentElement = modalSearchData.currentMatches[modalSearchData.currentIndex].element;
        currentElement.classList.add('current');
    }
}

function scrollToCurrentMatch() {
    if (modalSearchData.currentIndex >= 0 && modalSearchData.currentMatches.length > 0) {
        const currentElement = modalSearchData.currentMatches[modalSearchData.currentIndex].element;
        currentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

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

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showExportNotification(filename) {
    // Создаем уведомление об успешном экспорте
    const notification = document.createElement('div');
    notification.className = 'export-success';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Файл "${filename}" скачан</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function addCalendarAnimations() {
    // Добавляем плавные переходы при смене месяца
    const calendarGrid = document.getElementById('calendarGrid');
    if (calendarGrid) {
        calendarGrid.classList.add('changing');
        setTimeout(() => {
            calendarGrid.classList.remove('changing');
            calendarGrid.classList.add('entering');
            setTimeout(() => {
                calendarGrid.classList.remove('entering');
            }, 300);
        }, 150);
    }
}

function addAccessibilitySupport() {
    // Добавляем поддержку клавиатурной навигации
    const calendarDays = document.querySelectorAll('.calendar-day:not(.header):not(.other-month)');
    
    calendarDays.forEach((day, index) => {
        day.setAttribute('tabindex', '0');
        day.setAttribute('role', 'button');
        
        // Добавляем описание для screen readers
        const dayNumber = day.querySelector('.calendar-day-number').textContent;
        const hasClasses = day.classList.contains('has-classes');
        const isToday = day.classList.contains('today');
        
        let ariaLabel = `${dayNumber} число`;
        if (isToday) ariaLabel += ', сегодня';
        if (hasClasses) ariaLabel += ', есть занятия';
        
        day.setAttribute('aria-label', ariaLabel);
        
        // Обработка Enter и Space
        day.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                day.click();
            }
        });
    });
}

function exportCalendar() {
    const year = currentYear;
    const month = currentMonth;
    
    // Собираем все данные за месяц
    const monthData = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const lessons = getScheduleForDate(date);
        const filteredLessons = getFilteredLessons(lessons);
        
        if (filteredLessons.length > 0) {
            monthData.push({
                date: date.toLocaleDateString('ru-RU'),
                lessons: filteredLessons
            });
        }
    }
    
    // Создаем CSV контент
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    const filename = `schedule_${monthNames[month]}_${year}.csv`;
    let csvContent = `Расписание за ${monthNames[month]} ${year}\n\n`;
    csvContent += "Дата,Время,Предмет,Преподаватель,Аудитория,Тип\n";
    
    monthData.forEach(dayData => {
        dayData.lessons.forEach(lesson => {
            csvContent += `"${dayData.date}","${lesson.time}","${lesson.subject}","${lesson.teacher}","${lesson.room}","${getTypeLabel(lesson.type)}"\n`;
        });
    });
    
    // Скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Показываем уведомление об успешном экспорте
    showExportNotification(filename);
}

function initCalendar() {
    const currentYear = new Date().getFullYear();
    const yearSelector = document.getElementById('yearSelector');
    
    // Заполняем выбор года (от текущего года - 2 до текущего года + 5)
    for (let year = currentYear - 2; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelector.appendChild(option);
    }
}

function initCalendarControls() {
    const monthSelector = document.getElementById('monthSelector');
    const yearSelector = document.getElementById('yearSelector');
    const todayBtn = document.getElementById('todayBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    monthSelector.value = currentMonth;
    yearSelector.value = currentYear;
    
    monthSelector.addEventListener('change', function() {
        currentMonth = parseInt(this.value);
        generateCalendar();
    });
    
    yearSelector.addEventListener('change', function() {
        currentYear = parseInt(this.value);
        generateCalendar();
    });
    
    todayBtn.addEventListener('click', function() {
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        updateDateSelectors();
        generateCalendar();
    });
    
    exportBtn.addEventListener('click', function() {
        exportCalendar();
    });
}

function updateDateSelectors() {
    document.getElementById('monthSelector').value = currentMonth;
    document.getElementById('yearSelector').value = currentYear;
}

function initCalendarFilters() {
    const filterInputs = {
        lecture: document.getElementById('filterLecture'),
        seminar: document.getElementById('filterSeminar'),
        practice: document.getElementById('filterPractice'),
        lab: document.getElementById('filterLab')
    };
    
    Object.keys(filterInputs).forEach(type => {
        filterInputs[type].addEventListener('change', function() {
            calendarFilters[type] = this.checked;
            generateCalendar();
        });
    });
}

function getFilteredLessons(lessons) {
    return lessons.filter(lesson => calendarFilters[lesson.type]);
}

function createLessonIndicators(lessons) {
    const filteredLessons = getFilteredLessons(lessons);
    const indicators = document.createElement('div');
    indicators.className = 'calendar-day-indicators';
    
    const typeCount = {};
    filteredLessons.forEach(lesson => {
        typeCount[lesson.type] = (typeCount[lesson.type] || 0) + 1;
    });
    
    Object.keys(typeCount).forEach(type => {
        for (let i = 0; i < Math.min(typeCount[type], 4); i++) {
            const indicator = document.createElement('div');
            indicator.className = `lesson-indicator ${type}`;
            indicators.appendChild(indicator);
        }
    });
    
    return indicators;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Воскресенье или суббота
}

function createCalendarTooltip() {
    let tooltip = document.getElementById('calendarTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'calendarTooltip';
        tooltip.className = 'calendar-tooltip';
        document.body.appendChild(tooltip);
    }
    return tooltip;
}

function showTooltip(dayElement, date, lessons) {
    const tooltip = createCalendarTooltip();
    const filteredLessons = getFilteredLessons(lessons);
    
    if (filteredLessons.length === 0) return;
    
    const options = { 
        weekday: 'long', 
        day: 'numeric',
        month: 'long'
    };
    const dateString = date.toLocaleDateString('ru-RU', options);
    
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <span class="tooltip-date">${dateString}</span>
            <span class="tooltip-count">${filteredLessons.length} занятий</span>
        </div>
        <div class="tooltip-content">
            ${filteredLessons.map(lesson => `
                <div class="tooltip-lesson">
                    <div class="tooltip-lesson-indicator ${lesson.type}"></div>
                    <div class="tooltip-lesson-text">
                        <div class="tooltip-lesson-time">${lesson.time}</div>
                        <div class="tooltip-lesson-subject">${lesson.subject}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Позиционирование tooltip
    const rect = dayElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - 10;
    
    // Проверяем границы экрана
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) {
        top = rect.bottom + 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('visible');
}

function hideTooltip() {
    const tooltip = document.getElementById('calendarTooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

