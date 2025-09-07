// Менеджер расписания для загрузки данных из разных месяцев
class ScheduleManager {
    constructor() {
        this.scheduleData = {};
        this.loadedMonths = new Set();
    }

    // Загружает расписание для указанного месяца
    async loadMonth(year, month) {
        const monthKey = `${year}-${month + 1}`;
        
        if (this.loadedMonths.has(monthKey)) {
            return;
        }

        const monthNames = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];

        const monthName = monthNames[month];
        const fileName = `months/${monthName}.js`;

        try {
            // Проверяем, есть ли файл для этого месяца
            const response = await fetch(fileName);
            if (response.ok) {
                // Динамически загружаем скрипт
                await this.loadScript(fileName);
                
                // Получаем данные расписания из глобальной переменной
                const monthSchedule = window[`${monthName}Schedule`];
                if (monthSchedule) {
                    Object.assign(this.scheduleData, monthSchedule);
                    this.loadedMonths.add(monthKey);
                }
            }
        } catch (error) {
            console.log(`Файл расписания для ${monthName} ${year} не найден`);
        }
    }

    // Загружает скрипт динамически
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Получает расписание для конкретной даты
    getScheduleForDate(dateString) {
        return this.scheduleData[dateString] || [];
    }

    // Проверяет, есть ли занятия в указанную дату
    hasScheduleForDate(dateString) {
        return this.scheduleData[dateString] && this.scheduleData[dateString].length > 0;
    }

    // Получает все даты с занятиями в указанном месяце
    getDatesWithScheduleInMonth(year, month) {
        const dates = [];
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateString = this.formatDate(date);
            if (this.hasScheduleForDate(dateString)) {
                dates.push(new Date(date));
            }
        }
        
        return dates;
    }

    // Форматирование даты в строку YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Загружает расписание для всех доступных месяцев учебного года
    async loadAllAvailableMonths() {
        const currentYear = new Date().getFullYear();
        const monthsToLoad = [8, 9, 10, 11]; // Сентябрь-декабрь (учебные месяцы)
        
        const loadPromises = monthsToLoad.map(month => this.loadMonth(currentYear, month));
        await Promise.all(loadPromises);
    }

    // Получает все данные расписания
    getAllScheduleData() {
        return this.scheduleData;
    }
}

// Создаем глобальный экземпляр менеджера расписания
const scheduleManager = new ScheduleManager();
