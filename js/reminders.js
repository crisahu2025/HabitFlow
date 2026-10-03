/**
 * HabitFlow - Gestor de Horarios, Recordatorios y Notificaciones
 * Code Ahumada
 * 
 * v1.0.9 — Notificaciones con Acciones Rápidas:
 *   💧 "Tomé el Agua" → registra +250ml sin abrir la app
 *   ⏰ "Posponer 10 Min" → reprograma la notificación para dentro de 10 minutos
 */

class ReminderManager {
  constructor() {
    this.timerInterval = null;
    this.lastTriggeredTime = null;
    this.init();
  }

  init() {
    // 1. Registrar los tipos de acción para botones en notificaciones
    this.registerNotificationActionTypes();
    // 2. Escuchar respuestas del usuario en las notificaciones
    this.setupNotificationActionListeners();
    // 3. Iniciar el temporizador visual en vivo
    this.startLiveTimer();
    // 4. Programar alarmas nativas de Android en segundo plano al iniciar
    setTimeout(() => {
      this.scheduleAllNativeAndroid();
    }, 1500);
  }

  /**
   * Registra los botones de acción que aparecerán en las notificaciones de Android.
   * Capacitor requiere que se registren ANTES de programar notificaciones con esos actionTypeId.
   */
  async registerNotificationActionTypes() {
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.LocalNotifications) {
      return;
    }

    try {
      const { LocalNotifications } = window.Capacitor.Plugins;

      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'WATER_REMINDER_ACTIONS',
            actions: [
              {
                id: 'drank_water',
                title: '💧 Tomé el Agua'
              },
              {
                id: 'snooze_10',
                title: '⏰ Posponer 10 Min'
              }
            ]
          }
        ]
      });

      console.log('✓ Action types de notificaciones registrados (Tomé el Agua / Posponer 10 Min)');
    } catch (e) {
      console.warn('Error al registrar actionTypes de notificaciones:', e);
    }
  }

  /**
   * Escucha las respuestas del usuario cuando toca un botón de acción en la notificación.
   * - "drank_water" → registra +250ml automáticamente
   * - "snooze_10" → reprograma la notificación para 10 minutos después
   * - Tap genérico (sin botón) → abre la app normalmente
   */
  setupNotificationActionListeners() {
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.LocalNotifications) {
      return;
    }

    const { LocalNotifications } = window.Capacitor.Plugins;

    // Listener principal: el usuario tocó un botón de acción o la notificación misma
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const actionId = action.actionId || '';
      const extra = (action.notification && action.notification.extra) || {};

      console.log(`🔔 Acción de notificación recibida: "${actionId}"`, extra);

      if (actionId === 'drank_water') {
        // Registrar 250ml de agua directamente sin abrir la app
        if (window.storageManager) {
          window.storageManager.addWaterEntry(250, 'Vaso de agua (Notificación)');
          // Si la app está visible, refrescar la UI
          if (window.app && typeof window.app.renderWaterSection === 'function') {
            window.app.renderWaterSection();
          }
        }
        this.showToast('💧 ¡+250ml registrados desde la notificación!');
        return;
      }

      if (actionId === 'snooze_10') {
        // Reprogramar para 10 minutos después
        this.scheduleSnoozeNotification(extra);
        this.showToast('⏰ Recordatorio pospuesto 10 minutos');
        return;
      }

      // Tap genérico en la notificación (sin botón específico): simplemente abrir la app
      // Capacitor maneja el foco de la ventana automáticamente
    });

    console.log('✓ Listeners de acciones de notificación configurados');
  }

  /**
   * Programa una notificación de snooze (pospuesta) para dentro de 10 minutos exactos.
   */
  async scheduleSnoozeNotification(extra = {}) {
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.LocalNotifications) {
      return;
    }

    try {
      const { LocalNotifications } = window.Capacitor.Plugins;
      const snoozeDate = new Date(Date.now() + (10 * 60 * 1000)); // 10 minutos desde ahora
      const userName = (window.authManager && window.authManager.currentUser)
        ? window.authManager.currentUser.name
        : '';

      const snoozeId = 50000 + (Date.now() % 10000);

      await LocalNotifications.schedule({
        notifications: [{
          id: snoozeId,
          title: '💧 ¡Recordatorio pospuesto' + (userName ? ', ' + userName : '') + '!',
          body: '¡Ya pasaron 10 minutos! Tomá tu vaso de agua ahora para mantener activas tus mitocondrias.',
          schedule: {
            at: snoozeDate,
            allowWhileIdle: true
          },
          channelId: 'habitflow_reminders_channel',
          smallIcon: 'ic_notification_water',
          iconColor: '#0284c7',
          actionTypeId: 'WATER_REMINDER_ACTIONS',
          extra: { ...extra, snoozed: true, snoozeTime: snoozeDate.toISOString() }
        }]
      });

      console.log(`✓ Notificación de snooze programada para ${snoozeDate.toLocaleTimeString()}`);
    } catch (e) {
      console.warn('Error al programar notificación de snooze:', e);
    }
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

      // Si tiene activada la pausa de digestión (13:00 - 14:00)
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
      this.triggerAlert('¡Momento de hidratarte!', 'Tomá un vaso de agua fresca para mantener tu energía y bienestar.');
    }
  }

  /**
   * Programa todas las alarmas en el sistema operativo Android mediante Capacitor
   * para que suenen incluso con la app cerrada y la pantalla bloqueada.
   * Ahora con botones de acción: "Tomé el Agua" / "Posponer 10 Min"
   */
  async scheduleAllNativeAndroid() {
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.LocalNotifications) {
      return;
    }

    try {
      const { LocalNotifications } = window.Capacitor.Plugins;
      
      // Pedir permisos si es necesario
      const permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display !== 'granted') {
        console.warn('Permiso de notificaciones nativas Android denegado');
        return;
      }

      // Crear canal de notificación prioritario en Android
      await LocalNotifications.createChannel({
        id: 'habitflow_reminders_channel',
        name: 'Recordatorios de Hidratación HabitFlow',
        description: 'Alarmas periódicas para tomar agua y mantener tu bienestar',
        importance: 5, // High importance
        visibility: 1,
        sound: 'beep.wav',
        vibration: true
      });

      // Cancelar notificaciones pendientes previas
      const pending = await LocalNotifications.getPending();
      if (pending && pending.notifications && pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const config = window.storageManager.getSchedule();
      if (!config.notificationsEnabled) return;

      const times = this.getActiveTimes();
      const now = new Date();
      const notificationsToSchedule = [];
      const userName = (window.authManager && window.authManager.currentUser) ? window.authManager.currentUser.name : '';

      // PROGRAMACIÓN ROBUSTA DE 7 DÍAS EN ADELANTADO (ROLLING WINDOW EXACT ALARMS)
      // En Android 12/13/14/15, 'repeats: true' no permite alarmas exactas si la app está cerrada.
      // Al programar cada vaso individual de los próximos 7 días con fecha exacta (at: Date) y allowWhileIdle: true,
      // el sistema operativo Android programa las alarmas directamente en el kernel (AlarmManager.setExactAndAllowWhileIdle),
      // garantizando que suenen puntuales aunque la aplicación esté 100% cerrada y la pantalla apagada.
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        times.forEach((timeStr, idx) => {
          const [h, m] = timeStr.split(':').map(Number);
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + dayOffset);
          scheduledDate.setHours(h, m, 0, 0);

          if (scheduledDate > now) {
            notificationsToSchedule.push({
              id: (dayOffset * 100) + idx + 1000,
              title: '💧 ¡Momento de hidratarte' + (userName ? ', ' + userName : '') + '!',
              body: 'Tomá un vaso de agua fresca (250 ml) para mantener tu hidratación y energía.',
              schedule: {
                at: scheduledDate,
                allowWhileIdle: true // Permite sonar en Doze mode / pantalla apagada
              },
              channelId: 'habitflow_reminders_channel',
              smallIcon: 'ic_notification_water',
              iconColor: '#0284c7',
              actionTypeId: 'WATER_REMINDER_ACTIONS', // Botones: Tomé el Agua / Posponer 10 Min
              extra: { time: timeStr, amount: 250, dayOffset: dayOffset }
            });
          }
        });
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
        console.log(`✓ ${notificationsToSchedule.length} recordatorios nativos exactos programados para 7 días en Android!`);
      }
    } catch (e) {
      console.warn('Error al programar alarmas nativas en Capacitor:', e);
    }
  }

  /**
   * Dispara sonido, vibración y notificación push/nativa
   * Ahora incluye botones de acción en la notificación
   */
  async triggerAlert(title = '¡Momento de tomar agua!', body = 'Tu cuerpo necesita un vaso de agua fresca para mantenerte activo.') {
    const config = window.storageManager.getSchedule();

    // 1. Sonido Web Audio API
    if (config.soundEnabled && window.soundEngine) {
      window.soundEngine.playWaterDrop();
    }

    // 2. Vibración háptica nativa o web
    if (config.hapticEnabled) {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
        window.Capacitor.Plugins.Haptics.vibrate({ duration: 500 }).catch(() => {});
      } else if (window.soundEngine) {
        window.soundEngine.vibrate([120, 80, 140]);
      }
    }

    // 3. Notificación nativa Android o Web
    if (config.notificationsEnabled) {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
        try {
          await window.Capacitor.Plugins.LocalNotifications.schedule({
            notifications: [{
              id: Date.now() % 100000,
              title: title,
              body: body,
              channelId: 'habitflow_reminders_channel',
              smallIcon: 'ic_notification_water',
              iconColor: '#0284c7',
              schedule: { at: new Date(Date.now() + 500) },
              actionTypeId: 'WATER_REMINDER_ACTIONS', // Botones de acción
              extra: { amount: 250, triggeredAt: new Date().toISOString() }
            }]
          });
        } catch (e) {
          this.showWebNotification(title, body);
        }
      } else {
        this.showWebNotification(title, body);
      }
    }
  }

  /**
   * Pide permisos y muestra notificación nativa en celular / PC
   */
  async requestNotificationPermission() {
    // 1. Si estamos en Capacitor nativo Android
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
      try {
        const { LocalNotifications } = window.Capacitor.Plugins;
        const perm = await LocalNotifications.requestPermissions();
        return perm.display === 'granted';
      } catch (e) {
        console.warn('Error solicitando permisos en Capacitor:', e);
        return false;
      }
    }

    // 2. Si estamos en navegador Web
    if (!('Notification' in window)) {
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
              { action: 'drank_water', title: '💧 Tomé el Agua' },
              { action: 'snooze_10', title: '⏰ Posponer 10 Min' }
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

    // 1. Si estamos en Capacitor nativo Android (APK)
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
      try {
        const { LocalNotifications } = window.Capacitor.Plugins;
        await LocalNotifications.requestPermissions();
        
        await LocalNotifications.createChannel({
          id: 'habitflow_reminders_channel',
          name: 'Recordatorios de Hidratación HabitFlow',
          description: 'Alarmas periódicas para tomar agua y mantener tu bienestar',
          importance: 5,
          visibility: 1,
          sound: 'beep.wav',
          vibration: true
        });

        await LocalNotifications.schedule({
          notifications: [{
            id: 9999,
            title: '💧 Prueba de HabitFlow Exitosa',
            body: '¡Genial! Tocá "Tomé el Agua" o "Posponer 10 Min" para probar los botones.',
            schedule: { at: new Date(Date.now() + 1000) },
            channelId: 'habitflow_reminders_channel',
            smallIcon: 'ic_notification_water',
            iconColor: '#0284c7',
            actionTypeId: 'WATER_REMINDER_ACTIONS',
            extra: { test: true, amount: 250 }
          }]
        });

        this.showToast('🔔 ¡Alerta nativa enviada con botones de acción!');
        return;
      } catch (e) {
        console.warn('Error en notificación de prueba Capacitor:', e);
      }
    }

    // 2. Fallback Web
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
