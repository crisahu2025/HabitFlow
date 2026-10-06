/**
 * HabitFlow - Capa de Almacenamiento y Persistencia (localStorage)
 * Code Ahumada
 */

const STORAGE_KEYS = {
  PROFILE: 'habitflow_profile_v1',
  TODAY: 'habitflow_today_v1',
  HISTORY: 'habitflow_history_v1',
  SCHEDULE: 'habitflow_schedule_v1',
  HABITS: 'habitflow_habits_v1',
  THEME: 'habitflow_theme_mode'
};

const DEFAULT_PROFILE = {
  dailyGoal: 2000,
  weightKg: 70,
  glassSize: 250,
  isFrankGoalSet: true
};

const DEFAULT_SCHEDULE = {
  mode: 'interval', // 'interval' | 'fixed'
  startTime: '08:00',
  endTime: '22:00',
  intervalMinutes: 90,
  fixedTimes: ['08:30', '10:30', '12:30', '15:00', '17:30', '20:00', '21:30'],
  soundEnabled: true,
  hapticEnabled: true,
  notificationsEnabled: true,
  pauseDuringMeals: true // Proteger la digestión en almuerzo
};

const DEFAULT_EXTRA_HABITS = [
  {
    id: 'posture',
    title: 'Pausa Activa y Postura',
    subtitle: 'Estiramiento y respiración profunda cada hora',
    icon: 'posture',
    active: true,
    progressToday: 3,
    targetToday: 6,
    unit: 'pausas',
    color: 'emerald'
  },
  {
    id: 'electrolytes',
    title: 'Magnesio y Potasio',
    subtitle: 'Minerales esenciales para la recuperación muscular y celular',
    icon: 'minerals',
    active: true,
    progressToday: 1,
    targetToday: 2,
    unit: 'tomas',
    color: 'amber'
  },
  {
    id: 'steps',
    title: 'Caminata Diaria Oxigenante',
    subtitle: 'Meta de 8.000 pasos para reactivar el tono muscular',
    icon: 'walk',
    active: true,
    progressToday: 5400,
    targetToday: 8000,
    unit: 'pasos',
    color: 'sky'
  },
  {
    id: 'sleep',
    title: 'Desconexión y Sueño Profundo',
    subtitle: 'Apagado de pantallas azules a las 22:30 hs (Sistema Pasivo)',
    icon: 'moon',
    active: false,
    progressToday: 0,
    targetToday: 1,
    unit: 'noche',
    color: 'indigo'
  }
];

class StorageManager {
  constructor() {
    this.ensureTodayData();
  }

  getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- Perfil y Metas ---
  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : { ...DEFAULT_PROFILE };
    } catch (e) {
      return { ...DEFAULT_PROFILE };
    }
  }

  saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  setDailyGoal(goalMl) {
    const ml = Number(goalMl) || 2000;
    const profile = this.getProfile();
    profile.dailyGoal = ml;
    this.saveProfile(profile);

    const today = this.getTodayData();
    today.goalMl = ml;
    this.saveTodayData(today);
    return profile;
  }

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  }

  setTheme(theme) {
    const mode = theme === 'light' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEYS.THEME, mode);
    if (mode === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
    return mode;
  }

  /**
   * Cálculo de la meta óptima de hidratación diaria según peso corporal:
   * Vasos de 250 ml = Peso en kg / 7
   * Mililitros = (Peso / 7) * 250
   */
  calculateHydrationGoal(weightKg) {
    const weight = Math.max(30, Math.min(250, Number(weightKg) || 70));
    const rawGlasses = weight / 7;
    const glasses = Math.round(rawGlasses * 10) / 10;
    const ml = Math.round(glasses * 250);
    return {
      weight,
      glasses,
      ml
    };
  }

  calculateFrankGoal(weightKg) {
    return this.calculateHydrationGoal(weightKg);
  }

  // --- Datos de Hoy ---
  getTodayData() {
    const todayStr = this.getTodayString();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TODAY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date === todayStr) {
          if (!Array.isArray(parsed.entries)) {
            parsed.entries = [];
          }
          if (typeof parsed.totalMl !== 'number' || isNaN(parsed.totalMl)) {
            parsed.totalMl = parsed.entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          }
          if (typeof parsed.goalMl !== 'number' || isNaN(parsed.goalMl) || parsed.goalMl <= 0) {
            parsed.goalMl = this.getProfile().dailyGoal || 2000;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error al leer datos del día:', e);
    }

    // Si es un nuevo día o no existe, inicializar de forma limpia
    const profile = this.getProfile();
    const newDay = {
      date: todayStr,
      totalMl: 0,
      goalMl: profile.dailyGoal || 2000,
      entries: [],
      celebratedToday: false
    };
    this.saveTodayData(newDay);
    return newDay;
  }

  saveTodayData(data) {
    if (!data) return;
    if (!Array.isArray(data.entries)) data.entries = [];
    if (typeof data.totalMl !== 'number' || isNaN(data.totalMl)) {
      data.totalMl = data.entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    }
    localStorage.setItem(STORAGE_KEYS.TODAY, JSON.stringify(data));
  }

  ensureTodayData() {
    const todayStr = this.getTodayString();
    const raw = localStorage.getItem(STORAGE_KEYS.TODAY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date !== todayStr) {
          // Archivar el día anterior en el historial antes de rotar
          this.archiveDay(parsed);
          const profile = this.getProfile();
          const fresh = {
            date: todayStr,
            totalMl: 0,
            goalMl: profile.dailyGoal || 2000,
            entries: [],
            celebratedToday: false
          };
          this.saveTodayData(fresh);
        }
      } catch (e) {
        // Fallback silencioso
      }
    }
  }

  addWaterEntry(amount, label = 'Vaso de agua') {
    const today = this.getTodayData();
    if (!Array.isArray(today.entries)) {
      today.entries = [];
    }

    const cleanAmount = Math.max(1, Math.round(Number(amount) || 250));
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const entry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      amount: cleanAmount,
      label: String(label || 'Vaso de agua'),
      time: time,
      timestamp: Date.now()
    };

    today.entries.unshift(entry); // El más reciente primero
    today.totalMl = today.entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const goalMetJustNow = !today.celebratedToday && today.totalMl >= today.goalMl;
    if (goalMetJustNow) {
      today.celebratedToday = true;
    }

    this.saveTodayData(today);
    return { today, newEntry: entry, goalMetJustNow };
  }

  removeWaterEntry(entryId) {
    const today = this.getTodayData();
    if (!Array.isArray(today.entries)) today.entries = [];
    today.entries = today.entries.filter(e => e.id !== entryId);
    today.totalMl = today.entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    if (today.totalMl < today.goalMl) {
      today.celebratedToday = false;
    }
    this.saveTodayData(today);
    return today;
  }

  undoLastEntry() {
    const today = this.getTodayData();
    if (!Array.isArray(today.entries)) today.entries = [];
    if (today.entries.length > 0) {
      const removed = today.entries.shift();
      today.totalMl = today.entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      if (today.totalMl < today.goalMl) {
        today.celebratedToday = false;
      }
      this.saveTodayData(today);
      return { today, removed };
    }
    return { today, removed: null };
  }

  // --- Historial Semanal y Racha ---
  getHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  archiveDay(dayData) {
    if (!dayData || !dayData.date) return;
    const history = this.getHistory();
    // Reemplazar o insertar
    const existingIdx = history.findIndex(h => h.date === dayData.date);
    const summary = {
      date: dayData.date,
      totalMl: dayData.totalMl,
      goalMl: dayData.goalMl,
      goalMet: dayData.totalMl >= dayData.goalMl,
      glassCount: Math.round(dayData.totalMl / 250)
    };

    if (existingIdx >= 0) {
      history[existingIdx] = summary;
    } else {
      history.push(summary);
    }

    // Conservar últimos 30 días
    if (history.length > 30) {
      history.sort((a, b) => a.date.localeCompare(b.date));
      history.splice(0, history.length - 30);
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  /**
   * Cálculo inteligente de la racha de días consecutivos cumpliendo la meta
   */
  getStreakStats() {
    const history = this.getHistory();
    const today = this.getTodayData();
    const todayMet = today.totalMl >= today.goalMl;

    // Crear mapa rápido por fecha
    const metMap = {};
    history.forEach(h => {
      metMap[h.date] = h.goalMet;
    });

    let currentStreak = todayMet ? 1 : 0;
    let checkDate = new Date();
    // Mirar hacia atrás a partir de ayer
    checkDate.setDate(checkDate.getDate() - 1);

    for (let i = 0; i < 365; i++) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;

      if (metMap[dStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak,
      todayMet
    };
  }

  /**
   * Obtiene los últimos 7 días formateados para el gráfico de barras semanal
   */
  getWeeklyChartData() {
    const daysName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const result = [];
    const history = this.getHistory();
    const historyMap = {};
    history.forEach(h => { historyMap[h.date] = h; });

    const today = this.getTodayData();
    historyMap[today.date] = {
      date: today.date,
      totalMl: today.totalMl,
      goalMl: today.goalMl,
      goalMet: today.totalMl >= today.goalMl
    };

    const now = new Date();
    // Generar de hace 6 días hasta hoy
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${dayNum}`;

      const rec = historyMap[dStr] || { totalMl: 0, goalMl: today.goalMl, goalMet: false };
      const pct = rec.goalMl > 0 ? Math.min(100, Math.round((rec.totalMl / rec.goalMl) * 100)) : 0;

      result.push({
        date: dStr,
        dayLabel: daysName[d.getDay()],
        isToday: i === 0,
        totalMl: rec.totalMl,
        goalMl: rec.goalMl,
        percentage: pct,
        goalMet: rec.goalMet
      });
    }

    return result;
  }

  // --- Horarios y Configuración ---
  getSchedule() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      return raw ? { ...DEFAULT_SCHEDULE, ...JSON.parse(raw) } : { ...DEFAULT_SCHEDULE };
    } catch (e) {
      return { ...DEFAULT_SCHEDULE };
    }
  }

  saveSchedule(sched) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(sched));
    if (window.reminderManager && typeof window.reminderManager.scheduleAllNativeAndroid === 'function') {
      window.reminderManager.scheduleAllNativeAndroid();
    }
  }

  /**
   * Distribuye equitativamente todos los vasos de la meta del usuario (ej: 14 vasos de 250ml)
   * a lo largo de su día activo (08:00 a 22:00), respetando la pausa de comida.
   */
  autoDistributeSchedule(targetGlassesCount = null) {
    const profile = this.getProfile();
    const glasses = targetGlassesCount || Math.max(4, Math.round((profile.dailyGoal || 2000) / (profile.glassSize || 250)));
    const sched = this.getSchedule();

    const [startH, startM] = (sched.startTime || '08:00').split(':').map(Number);
    const [endH, endM] = (sched.endTime || '22:00').split(':').map(Number);

    const startMins = (startH * 60) + startM;
    const endMins = (endH * 60) + endM;

    // Pausa de digestión recomendada durante el almuerzo (13:00 a 14:00)
    const pauseStart = 13 * 60; // 13:00
    const pauseEnd = 14 * 60;   // 14:00

    const validMinutes = [];
    for (let m = startMins; m <= endMins; m += 5) {
      if (sched.pauseDuringMeals && m >= pauseStart && m < pauseEnd) {
        continue;
      }
      validMinutes.push(m);
    }

    if (validMinutes.length === 0) return [];

    const distributedTimes = [];
    if (glasses <= 1) {
      distributedTimes.push(sched.startTime);
    } else {
      const step = (validMinutes.length - 1) / (glasses - 1);
      for (let i = 0; i < glasses; i++) {
        const idx = Math.min(validMinutes.length - 1, Math.round(i * step));
        const rawMins = validMinutes[idx];
        const h = Math.floor(rawMins / 60);
        const m = rawMins % 60;
        const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (!distributedTimes.includes(formatted)) {
          distributedTimes.push(formatted);
        }
      }
    }

    sched.fixedTimes = distributedTimes.sort();
    sched.mode = 'fixed';
    this.saveSchedule(sched);
    return sched.fixedTimes;
  }

  // --- Hábitos Extra ---
  getExtraHabits() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
      return raw ? JSON.parse(raw) : DEFAULT_EXTRA_HABITS;
    } catch (e) {
      return DEFAULT_EXTRA_HABITS;
    }
  }

  saveExtraHabits(habits) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }

  toggleHabitActive(habitId) {
    const habits = this.getExtraHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habit.active = !habit.active;
      this.saveExtraHabits(habits);
    }
    return habits;
  }

  incrementHabitProgress(habitId) {
    const habits = this.getExtraHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habit.progressToday = Math.min(habit.targetToday, (habit.progressToday || 0) + 1);
      this.saveExtraHabits(habits);
    }
    return habits;
  }
}

window.storageManager = new StorageManager();
