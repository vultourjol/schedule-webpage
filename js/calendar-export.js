// Класс для экспорта расписания в различные календарные форматы
class CalendarExporter {
    constructor(scheduleManager) {
        this.scheduleManager = scheduleManager;
    }

    // Генерирует файл ICS (iCalendar) для расписания
    async generateICS(includeAllSchedule = false) {
        const events = await this.collectEvents(includeAllSchedule);
        
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//РОСНОУ//Расписание занятий//RU',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:РОСНОУ Расписание',
            'X-WR-CALDESC:Расписание занятий РОСНОУ'
        ];

        events.forEach(event => {
            icsContent.push(...this.createICSEvent(event));
        });

        icsContent.push('END:VCALENDAR');
        
        return icsContent.join('\r\n');
    }

    // Собирает все события для экспорта
    async collectEvents(includeAllSchedule) {
        if (includeAllSchedule) {
            // Загружаем все доступные месяцы
            await this.scheduleManager.loadAllAvailableMonths();
        }
        
        const events = [];
        const currentDate = new Date();
        const startMonth = includeAllSchedule ? 8 : currentDate.getMonth(); // Сентябрь = 8
        const endMonth = includeAllSchedule ? 11 : currentDate.getMonth(); // Декабрь = 11
        const year = currentDate.getFullYear();

        for (let month = startMonth; month <= endMonth; month++) {
            // Убеждаемся, что месяц загружен
            await this.scheduleManager.loadMonth(year, month);
            
            const datesInMonth = this.scheduleManager.getDatesWithScheduleInMonth(year, month);
            
            datesInMonth.forEach(date => {
                const dateString = this.scheduleManager.formatDate(date);
                const schedule = this.scheduleManager.getScheduleForDate(dateString);
                
                schedule.forEach(item => {
                    events.push({
                        date: date,
                        subject: item.subject,
                        teacher: item.teacher,
                        time: item.time,
                        type: item.type
                    });
                });
            });
        }

        return events;
    }

    // Создает событие в формате ICS
    createICSEvent(event) {
        const [startTime, endTime] = this.parseTime(event.time);
        const startDateTime = this.combineDateAndTime(event.date, startTime);
        const endDateTime = this.combineDateAndTime(event.date, endTime);
        
        const uid = this.generateUID(event);
        const timestamp = this.formatICSDateTime(new Date());
        
        return [
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTART:${this.formatICSDateTime(startDateTime)}`,
            `DTEND:${this.formatICSDateTime(endDateTime)}`,
            `DTSTAMP:${timestamp}`,
            `SUMMARY:${this.escapeICSText(event.subject)}`,
            `DESCRIPTION:${this.escapeICSText(`Тип: ${event.type}\\nПреподаватель: ${event.teacher}\\nВремя: ${event.time}`)}`,
            `LOCATION:РОСНОУ`,
            `CATEGORIES:${event.type.toUpperCase()}`,
            'STATUS:CONFIRMED',
            'TRANSP:OPAQUE',
            'END:VEVENT'
        ];
    }

    // Парсит время в формате "09:00-11:50"
    parseTime(timeString) {
        const [start, end] = timeString.split('-');
        return [start.trim(), end.trim()];
    }

    // Комбинирует дату и время
    combineDateAndTime(date, time) {
        const [hours, minutes] = time.split(':').map(Number);
        const result = new Date(date);
        result.setHours(hours, minutes, 0, 0);
        return result;
    }

    // Форматирует дату для ICS (UTC)
    formatICSDateTime(date) {
        // Конвертируем в UTC для корректного отображения в календарях
        const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return utcDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }

    // Генерирует уникальный ID для события
    generateUID(event) {
        const dateStr = this.scheduleManager.formatDate(event.date);
        const subjectHash = this.simpleHash(event.subject + event.time);
        return `${dateStr}-${subjectHash}@rosnou.schedule`;
    }

    // Простая хеш-функция для генерации ID
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Конвертация в 32-битное число
        }
        return Math.abs(hash).toString(36);
    }

    // Экранирует специальные символы для ICS
    escapeICSText(text) {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '');
    }

    // Скачивает ICS файл
    async downloadICS(includeAllSchedule = false) {
        const icsContent = await this.generateICS(includeAllSchedule);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        
        const fileName = includeAllSchedule ? 
            'rosnou-schedule-full.ics' : 
            `rosnou-schedule-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}.ics`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        // Показываем инструкцию пользователю
        setTimeout(() => {
            alert(
                'Файл расписания скачан!\n\n' +
                'Для импорта в календарь:\n' +
                '• Google Calendar: Настройки → Импорт и экспорт → Выбрать файл\n' +
                '• Apple Calendar: откройте файл двойным кликом\n' +
                '• Outlook: Файл → Открыть и экспортировать → Импорт/экспорт\n' +
                '• Другие приложения: импортируйте ICS файл через настройки календаря'
            );
        }, 500);
    }
}

// Инициализация экспорта календаря
document.addEventListener('DOMContentLoaded', function() {
    const calendarExporter = new CalendarExporter(scheduleManager);
    
    // Обработчик для кнопки экспорта ICS
    document.getElementById('exportICS').addEventListener('click', async function() {
        this.disabled = true;
        this.innerHTML = '<i class="ri-loader-4-line"></i> Генерируем файл...';
        
        try {
            const includeAllSchedule = document.getElementById('exportAllSchedule').checked;
            await calendarExporter.downloadICS(includeAllSchedule);
        } catch (error) {
            console.error('Ошибка экспорта ICS:', error);
            alert('Произошла ошибка при создании файла. Попробуйте еще раз.');
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="ri-download-2-line"></i> Скачать расписание (ICS)';
        }
    });
    
    // Обработчик для переключения опций экспорта
    document.getElementById('exportCurrentMonth').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('exportAllSchedule').checked = false;
        }
    });
    
    document.getElementById('exportAllSchedule').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('exportCurrentMonth').checked = false;
        }
    });
});
