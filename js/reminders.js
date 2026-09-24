/**
 * HabitFlow - Gestor de Horarios, Recordatorios y Notificaciones
 * Code Ahumada
 */

class ReminderManager {
  constructor() {
    this.timerInterval = null;
    this.lastTriggeredTime = null;
    this.init();
  }

  init() {
    this.startLiveTimer();
  }

  /**
   * Genera la lista de horarios activos para hoy según la configuración del usuario
   */
  getActiveTimes() {
    const config = window.storageManager.getSchedule();

    if (config.mode === 'fixed') {
      return [...(config.fixedTimes || [])].sort();
    }

    // Modo Intervalo Dinámico
    const [startH, startM] = (config.startTime || '08:00').split(':').map(Number);
    const [endH, endM] = (config.endTime || '22:00').split(':').map(Number);
    const interval = Number(config.intervalMinutes) || 90;

    const times = [];
    let currentMins = (startH * 60) + startM;
    const endMins = (endH * 60) + endM;

    while (currentMins <= endMins) {
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      // Si tiene activada la pausa de digestión de Frank Suárez (13:00 - 14:00 o 21:00 - 21:45)
      const isMealTime = config.pauseDuringMeals && (
        (currentMins >= 780 && currentMins < 840) // 13:00 a 14:00
      );

      if (!isMealTime) {
        times.push(formatted);
      }

      currentMins += interval;
    }

    return times;
  }

  /**
   * Calcula el próximo vaso respecto a la hora actual
   */
  getNextReminder() {
    const times = this.getActiveTimes();
    if (!times.length) return null;

    const now = new Date();
    const currentMins = (now.getHours() * 60) + now.getMinutes();
    const currentSecs = now.getSeconds();

    for (const timeStr of times) {
      const [h, m] = timeStr.split(':').map(Number);
      const timeMins = (h * 60) + m;

      if (timeMins > currentMins || (timeMins === currentMins && currentSecs < 10)) {
        const diffMinutes = timeMins - currentMins;
        const totalSecondsLeft = (diffMinutes * 60) - currentSecs;
        return {
          time: timeStr,
          minutesLeft: Math.max(0, diffMinutes),
          secondsLeft: Math.max(0, totalSecondsLeft),
          isToday: true
        };
      }
    }

    // Si ya pasaron todos los de hoy, el próximo es el primero de mañana
    const firstTomorrow = times[0];
    const [h, m] = firstTomorrow.split(':').map(Number);
    const minsToMidnight = (24 * 60) - currentMins;
    const totalMins = minsToMidnight + (h * 60) + m;
    const totalSecondsLeft = (totalMins * 60) - currentSecs;

    return {
      time: firstTomorrow,
      minutesLeft: totalMins,
      secondsLeft: totalSecondsLeft,
      isToday: false
    };
  }

  /**
   * Actualiza el temporizador visual y verifica si debe disparar la alarma
   */
  startLiveTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  tick() {
    const next = this.getNextReminder();
    this.updateLiveIndicator(next);
    this.checkReminderTrigger();
  }

  formatCountdown(secondsLeft) {
    if (secondsLeft <= 0) return '¡Ahora!';
    const hours = Math.floor(secondsLeft / 3600);
    const mins = Math.floor((secondsLeft % 3600) / 60);
    const secs = secondsLeft % 60;

    if (hours > 0) {
      return `${hours}h ${String(mins).padStart(2, '0')}m`;
    }
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  updateLiveIndicator(next) {
    const container = document.getElementById('next-reminder-card');
    const labelTime = document.getElementById('next-reminder-time');
    const labelCountdown = document.getElementById('next-reminder-countdown');

    if (!container || !next) return;

    if (labelTime) {
      labelTime.textContent = next.isToday ? `${next.time} hs` : `Mañana ${next.time} hs`;
    }

    if (labelCountdown) {
      labelCountdown.textContent = next.isToday 
        ? `en ${this.formatCountdown(next.secondsLeft)}`
        : `meta de hoy completada`;
    }
  }

  /**
   * Chequea si el minuto actual coincide con algún recordatorio
   */
  checkReminderTrigger() {
    const now = new Date();
    const curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (this.lastTriggeredTime === curTime) return;

    const times = this.getActiveTimes();
    if (times.includes(curTime)) {
      this.lastTriggeredTime = curTime;
      this.triggerAlert('¡Momento de hidratarte!', 'Tomá un vaso de agua fresca para encender tu metabolismo celular.');
    }
  }

  /**
   * Dispara sonido, vibración y notificación push/nativa
   */
  triggerAlert(title = '¡Momento de tomar agua!', body = 'Tu cuerpo y tu metabolismo necesitan un vaso de agua fresca.') {
    const config = window.storageManager.getSchedule();

    // 1. Sonido Web Audio API
    if (config.soundEnabled && window.soundEngine) {
      window.soundEngine.playWaterDrop();
    }

    // 2. Vibración háptica
    if (config.hapticEnabled && window.soundEngine) {
      window.soundEngine.vibrate([120, 80, 140]);
    }

    // 3. Notificación Web API
    if (config.notificationsEnabled) {
      this.showWebNotification(title, body);
    }
  }

  /**
   * Pide permisos y muestra notificación nativa en celular / PC
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones de sistema.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async showWebNotification(title, body) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      this.createNotificationInstance(title, body);
    } else if (Notification.permission !== 'denied') {
      const granted = await this.requestNotificationPermission();
      if (granted) {
        this.createNotificationInstance(title, body);
      }
    }
  }

  createNotificationInstance(title, body) {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body: body,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon.svg',
            vibrate: [150, 80, 150],
            tag: 'habitflow-reminder',
            renotify: true,
            actions: [
              { action: 'drink_250', title: '💧 Tomé un vaso (+250ml)' }
            ]
          });
        });
      } else {
        new Notification(title, {
          body: body,
          icon: 'icons/icon-192.png'
        });
      }
    } catch (e) {
      console.warn('No se pudo lanzar notificación del sistema:', e);
    }
  }

  /**
   * Prueba instantánea requerida por el Director Cristian:
   * "un botón interactivo 'Probar Notificación y Sonido Ahora'"
   */
  async testNotificationAndSound() {
    if (window.soundEngine) {
      window.soundEngine.playWaterDrop();
      window.soundEngine.vibrate([150, 100, 200]);
    }

    const permitted = await this.requestNotificationPermission();
    if (permitted) {
      this.triggerAlert(
        '💧 Prueba de HabitFlow Exitosa',
        '¡Genial! Las notificaciones nativas y el sonido de gota están 100% activos y funcionando.'
      );
    } else {
      // Notificación in-app si el usuario no dio permisos del sistema
      this.showToast('Alerta y sonido probados correctamente en la app.');
    }
  }

  showToast(message) {
    const toast = document.getElementById('habitflow-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    }, 3200);
  }
}

window.reminderManager = new ReminderManager();
