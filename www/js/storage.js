/**
 * HabitFlow - Capa de Almacenamiento y Persistencia (localStorage)
 * Code Ahumada
 */

const STORAGE_KEYS = {
  PROFILE: 'habitflow_profile_v1',
  TODAY: 'habitflow_today_v1',
  HISTORY: 'habitflow_history_v1',
  SCHEDULE: 'habitflow_schedule_v1',
  HABITS: 'habitflow_habits_v1'
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
  pauseDuringMeals: true // Consejo Frank: proteger ácido gástrico
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
    title: 'Magnesio y Potasio (Frank Suárez)',
    subtitle: 'Minerales esenciales para activar el metabolismo celular',
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
    subtitle: 'Meta de 8.000 pasos para reactivar el ATP muscular',
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

  /**
   * Cálculo de la meta recomendada por Frank Suárez:
   * Vasos de 250 ml = Peso en kg / 7
   * Mililitros = (Peso / 7) * 250
   */
  calculateFrankGoal(weightKg) {
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

  // --- Datos de Hoy ---
  getTodayData() {
    const todayStr = this.getTodayString();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TODAY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === todayStr) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error al leer datos del día:', e);
    }

    // Si es un nuevo día, inicializar
    const profile = this.getProfile();
    const newDay = {
      date: todayStr,
      totalMl: 0,
      goalMl: profile.dailyGoal,
      entries: [],
      celebratedToday: false
    };
    this.saveTodayData(newDay);
    return newDay;
  }

  saveTodayData(data) {
    localStorage.setItem(STORAGE_KEYS.TODAY, JSON.stringify(data));
  }

  ensureTodayData() {
    const todayStr = this.getTodayString();
    const raw = localStorage.getItem(STORAGE_KEYS.TODAY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.date !== todayStr) {
          // Archivar el día anterior en el historial antes de rotar
          this.archiveDay(parsed);
          const profile = this.getProfile();
          const fresh = {
            date: todayStr,
            totalMl: 0,
            goalMl: profile.dailyGoal,
            entries: [],
            celebratedToday: false
          };
          this.saveTodayData(fresh);
        }
      } catch (e) {
        // Fallback
      }
    }
  }

  addWaterEntry(amount, label = 'Vaso de agua') {
    const today = this.getTodayData();
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const entry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      amount: Number(amount),
      label: String(label),
      time: time,
      timestamp: Date.now()
    };

    today.entries.unshift(entry); // El más reciente primero
    today.totalMl = today.entries.reduce((sum, e) => sum + e.amount, 0);

    const goalMetJustNow = !today.celebratedToday && today.totalMl >= today.goalMl;
    if (goalMetJustNow) {
      today.celebratedToday = true;
    }

    this.saveTodayData(today);
    return { today, newEntry: entry, goalMetJustNow };
  }

  removeWaterEntry(entryId) {
    const today = this.getTodayData();
    today.entries = today.entries.filter(e => e.id !== entryId);
    today.totalMl = today.entries.reduce((sum, e) => sum + e.amount, 0);
    if (today.totalMl < today.goalMl) {
      today.celebratedToday = false;
    }
    this.saveTodayData(today);
    return today;
  }

  undoLastEntry() {
    const today = this.getTodayData();
    if (today.entries.length > 0) {
      const removed = today.entries.shift();
      today.totalMl = today.entries.reduce((sum, e) => sum + e.amount, 0);
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

    while (true) {
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
