function loadScheduleData() {
    const newFormatData = JSON.parse(localStorage.getItem('universitySchedule'));
    if (newFormatData && Object.keys(newFormatData).length > 0) {
        return newFormatData;
    }
    
    return {};
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
