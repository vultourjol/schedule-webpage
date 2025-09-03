let scheduleData = JSON.parse(localStorage.getItem('universitySchedule')) || {};

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;
let editingLessonId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadExistingData();
    generateCalendar();
    initializeEventListeners();
});

function loadExistingData() {
    const savedData = localStorage.getItem('universitySchedule');
    if (savedData) {
        try {
            scheduleData = JSON.parse(savedData);
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            scheduleData = {};
        }
    } else {
        scheduleData = {};
    }
}

function clearAllData() {
    scheduleData = {};
    localStorage.removeItem('universitySchedule');
    localStorage.removeItem('weeklySchedule'); 
    localStorage.removeItem('scheduleTemplates');
}

function initializeEventListeners() {
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

    document.getElementById('lessonForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);

    document.getElementById('copyWeekBtn').addEventListener('click', copyWeek);
    document.getElementById('createTemplateBtn').addEventListener('click', createTemplate);
    document.getElementById('clearDayBtn').addEventListener('click', clearDay);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllSchedule);

    document.getElementById('saveDataBtn').addEventListener('click', saveData);

    document.getElementById('confirmYes').addEventListener('click', confirmAction);
    document.getElementById('confirmNo').addEventListener('click', closeModal);
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
        
        const dayDate = new Date(currentYear, currentMonth, day);
        const dateKey = formatDateKey(dayDate);
        const dayLessons = scheduleData[dateKey] || [];
        
        const dayNumber = document.createElement('div');
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        if (dayLessons.length > 0) {
            dayElement.classList.add('has-lessons');
            const lessonCount = document.createElement('div');
            lessonCount.className = 'lesson-count';
            lessonCount.textContent = `${dayLessons.length} зан.`;
            dayElement.appendChild(lessonCount);
        }
        
        if (dayDate.toDateString() === currentDate.toDateString()) {
            dayElement.classList.add('today');
        }
        
        if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        dayElement.addEventListener('click', () => {
            selectDate(dayDate);
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

function selectDate(date) {
    selectedDate = date;
    generateCalendar();
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = date.toLocaleDateString('ru-RU', options);
    document.getElementById('selectedDateInfo').textContent = `Выбрана дата: ${dateString}`;
    
    loadDayLessons();
    cancelEdit();
}

function loadDayLessons() {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    const dayLessons = scheduleData[dateKey] || [];
    const lessonsList = document.getElementById('lessonsList');
    
    if (dayLessons.length === 0) {
        lessonsList.innerHTML = '<p class="no-lessons">На эту дату занятий нет</p>';
        return;
    }
    
    lessonsList.innerHTML = dayLessons.map(lesson => `
        <div class="lesson-item">
            <div class="lesson-actions">
                <button class="edit-btn" onclick="editLesson('${lesson.id}')">✏️</button>
                <button class="delete-btn" onclick="deleteLesson('${lesson.id}')">🗑️</button>
            </div>
            <div class="lesson-time">${lesson.time}</div>
            <div class="lesson-subject">${lesson.subject}</div>
            <div class="lesson-details">
                Преподаватель: ${lesson.teacher}<br>
                Аудитория: ${lesson.room}
            </div>
            <span class="lesson-type ${lesson.type}">${getTypeLabel(lesson.type)}</span>
        </div>
    `).join('');
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!selectedDate) {
        alert('Выберите дату в календаре');
        return;
    }
    
    const timeStart = document.getElementById('timeStart').value;
    const timeEnd = document.getElementById('timeEnd').value;
    const subject = document.getElementById('subject').value;
    const teacher = document.getElementById('teacher').value;
    const room = document.getElementById('room').value;
    const type = document.getElementById('type').value;
    
    const lesson = {
        id: editingLessonId || generateId(),
        time: `${timeStart}-${timeEnd}`,
        subject,
        teacher,
        room,
        type
    };
    
    const dateKey = formatDateKey(selectedDate);
    
    if (!scheduleData[dateKey]) {
        scheduleData[dateKey] = [];
    }
    
    if (editingLessonId) {
        const lessonIndex = scheduleData[dateKey].findIndex(l => l.id === editingLessonId);
        if (lessonIndex !== -1) {
            scheduleData[dateKey][lessonIndex] = lesson;
        }
    } else {
        scheduleData[dateKey].push(lesson);
    }
    
    scheduleData[dateKey].sort((a, b) => a.time.localeCompare(b.time));
    
    loadDayLessons();
    generateCalendar();
    clearForm();
    cancelEdit();
    
    localStorage.setItem('universitySchedule', JSON.stringify(scheduleData));
}

function editLesson(lessonId) {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    const lesson = scheduleData[dateKey]?.find(l => l.id === lessonId);
    
    if (!lesson) return;
    
    editingLessonId = lessonId;
    
    const [timeStart, timeEnd] = lesson.time.split('-');
    document.getElementById('timeStart').value = timeStart;
    document.getElementById('timeEnd').value = timeEnd;
    document.getElementById('subject').value = lesson.subject;
    document.getElementById('teacher').value = lesson.teacher;
    document.getElementById('room').value = lesson.room;
    document.getElementById('type').value = lesson.type;
    
    document.querySelector('.add-btn').textContent = 'Сохранить изменения';
}

function deleteLesson(lessonId) {
    showConfirmModal(
        'Вы уверены, что хотите удалить это занятие?',
        () => {
            if (!selectedDate) return;
            
            const dateKey = formatDateKey(selectedDate);
            if (scheduleData[dateKey]) {
                scheduleData[dateKey] = scheduleData[dateKey].filter(l => l.id !== lessonId);
                
                if (scheduleData[dateKey].length === 0) {
                    delete scheduleData[dateKey];
                }
            }
            
            loadDayLessons();
            generateCalendar();
            localStorage.setItem('universitySchedule', JSON.stringify(scheduleData));
            closeModal();
        }
    );
}

function cancelEdit() {
    editingLessonId = null;
    clearForm();
    document.querySelector('.add-btn').textContent = 'Добавить занятие';
}

function clearForm() {
    document.getElementById('lessonForm').reset();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function copyWeek() {
    if (!selectedDate) {
        alert('Выберите дату для копирования недели');
        return;
    }
    
    showConfirmModal(
        'Скопировать расписание выбранной недели на следующую неделю?',
        () => {
            const startOfWeek = new Date(selectedDate);
            startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
            
            for (let i = 0; i < 7; i++) {
                const currentDay = new Date(startOfWeek);
                currentDay.setDate(startOfWeek.getDate() + i);
                
                const nextWeekDay = new Date(currentDay);
                nextWeekDay.setDate(currentDay.getDate() + 7);
                
                const currentKey = formatDateKey(currentDay);
                const nextWeekKey = formatDateKey(nextWeekDay);
                
                if (scheduleData[currentKey]) {
                    scheduleData[nextWeekKey] = scheduleData[currentKey].map(lesson => ({
                        ...lesson,
                        id: generateId()
                    }));
                }
            }
            
            generateCalendar();
            localStorage.setItem('universitySchedule', JSON.stringify(scheduleData));
            closeModal();
            alert('Неделя успешно скопирована!');
        }
    );
}

function createTemplate() {
    if (!selectedDate) {
        alert('Выберите дату для создания шаблона');
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    const dayLessons = scheduleData[dateKey];
    
    if (!dayLessons || dayLessons.length === 0) {
        alert('На выбранную дату нет занятий для создания шаблона');
        return;
    }
    
    const templateName = prompt('Введите название шаблона:');
    if (!templateName) return;
    
    const templates = JSON.parse(localStorage.getItem('scheduleTemplates')) || {};
    templates[templateName] = dayLessons;
    localStorage.setItem('scheduleTemplates', JSON.stringify(templates));
    
    alert(`Шаблон "${templateName}" создан!`);
}

function clearAllSchedule() {
    const totalLessons = Object.values(scheduleData).reduce((total, dayLessons) => total + dayLessons.length, 0);
    
    if (totalLessons === 0) {
        alert('Расписание уже пустое');
        return;
    }
    
    showConfirmModal(
        `Удалить ВСЁ расписание? Будет удалено ${totalLessons} занятий. Это действие нельзя отменить!`,
        () => {
            scheduleData = {};
            localStorage.removeItem('universitySchedule');
            localStorage.removeItem('weeklySchedule'); 
            localStorage.removeItem('scheduleTemplates');
            
            loadDayLessons();
            generateCalendar();
            selectedDate = null;
            document.getElementById('selectedDateInfo').textContent = 'Выберите дату в календаре';
            closeModal();
            alert('Всё расписание очищено!');
        }
    );
}

function clearDay() {
    if (!selectedDate) {
        alert('Выберите дату для очистки');
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    const dayLessons = scheduleData[dateKey];
    
    if (!dayLessons || dayLessons.length === 0) {
        alert('На выбранную дату нет занятий для удаления');
        return;
    }
    
    showConfirmModal(
        `Удалить все занятия (${dayLessons.length} шт.) с выбранной даты?`,
        () => {
            delete scheduleData[dateKey];
            loadDayLessons();
            generateCalendar();
            localStorage.setItem('universitySchedule', JSON.stringify(scheduleData));
            closeModal();
        }
    );
}

function saveData() {
    try {
        localStorage.setItem('universitySchedule', JSON.stringify(scheduleData));
        alert('Данные успешно сохранены!');
    } catch (error) {
        alert('Ошибка при сохранении данных: ' + error.message);
    }
}

function convertToLegacyFormat(data) {
    const legacy = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    
    Object.keys(data).forEach(dateKey => {
        const date = new Date(dateKey);
        const dayOfWeek = date.getDay();
        
        data[dateKey].forEach(lesson => {
            legacy[dayOfWeek].push({
                time: lesson.time,
                subject: lesson.subject,
                teacher: lesson.teacher,
                room: lesson.room,
                type: lesson.type
            });
        });
    });
    
    return legacy;
}

function loadSampleData() {
    if (Object.keys(scheduleData).length > 0) return; 
    
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    const sampleSchedule = {
        1: [ 
            { time: "9:00-10:30", subject: "Математический анализ", teacher: "Иванов И.И.", room: "Ауд. 205", type: "lecture" },
            { time: "10:45-12:15", subject: "Физика", teacher: "Петров П.П.", room: "Ауд. 301", type: "seminar" },
            { time: "13:00-14:30", subject: "Программирование", teacher: "Сидоров С.С.", room: "Комп. класс 1", type: "lab" }
        ],
        2: [ 
            { time: "9:00-10:30", subject: "История", teacher: "Козлова А.А.", room: "Ауд. 105", type: "lecture" },
            { time: "10:45-12:15", subject: "Английский язык", teacher: "Смирнова О.В.", room: "Ауд. 202", type: "practice" }
        ],
        3: [ 
            { time: "9:00-10:30", subject: "Математический анализ", teacher: "Иванов И.И.", room: "Ауд. 205", type: "seminar" },
            { time: "10:45-12:15", subject: "Программирование", teacher: "Сидоров С.С.", room: "Комп. класс 2", type: "lecture" }
        ],
        4: [ 
            { time: "9:00-10:30", subject: "Английский язык", teacher: "Смирнова О.В.", room: "Ауд. 202", type: "practice" },
            { time: "10:45-12:15", subject: "Физика", teacher: "Петров П.П.", room: "Лаб. 15", type: "lab" }
        ],
        5: [ 
            { time: "9:00-10:30", subject: "История", teacher: "Козлова А.А.", room: "Ауд. 105", type: "seminar" },
            { time: "10:45-12:15", subject: "Математический анализ", teacher: "Иванов И.И.", room: "Ауд. 205", type: "practice" }
        ]
    };
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + dayOffset);
        const dayOfWeek = date.getDay();
        
        if (sampleSchedule[dayOfWeek]) {
            const dateKey = formatDateKey(date);
            scheduleData[dateKey] = sampleSchedule[dayOfWeek].map(lesson => ({
                ...lesson,
                id: generateId()
            }));
        }
    }
    
    localStorage.setItem('universitySchedule', JSON.stringify(scheduleData));
}

function showConfirmModal(message, onConfirm) {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').style.display = 'block';
    
    window.currentConfirmAction = onConfirm;
}

function confirmAction() {
    if (window.currentConfirmAction) {
        window.currentConfirmAction();
    }
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
    window.currentConfirmAction = null;
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeModal();
    }
});
