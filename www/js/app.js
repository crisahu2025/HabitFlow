/**
 * HabitFlow - Aplicación Principal y Controlador UI
 * Code Ahumada
 */

class HabitFlowApp {
  constructor() {
    this.currentTab = 'water';
    this.init();
  }

  init() {
    this.applyInitialTheme();
    this.setupTabNavigation();
    this.setupEventListeners();
    this.setupSettingsListeners();
    this.renderWaterSection();
    this.renderScheduleSection();
    this.renderProgressSection();
    this.renderHabitsSection();
    this.handleUrlParams();
  }

  /**
   * Pestañas de navegación inferior estilo app nativa
   */
  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabId) {
    if (this.currentTab === tabId) return;
    this.currentTab = tabId;

    if (window.soundEngine) window.soundEngine.playTap();

    // Actualizar botones
    document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
      const active = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', active);
    });

    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach((section) => {
      section.classList.remove('active');
    });

    const activeSection = document.getElementById(`tab-${tabId}`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Scroll arriba en el cambio de tab
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Actualizaciones específicas por pestaña
    if (tabId === 'progress') {
      this.renderProgressSection();
    } else if (tabId === 'schedule') {
      this.renderScheduleSection();
    } else if (tabId === 'habits') {
      this.renderHabitsSection();
    } else if (tabId === 'water') {
      this.renderWaterSection();
    } else if (tabId === 'settings') {
      this.renderSettingsSection();
    }
  }

  /**
   * Manejar parámetros directos de acceso rápido de la PWA (Shortcuts de Android)
   */
  handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const quickAmount = params.get('quick');
    const targetTab = params.get('tab');

    if (targetTab && ['water', 'schedule', 'progress', 'habits', 'settings'].includes(targetTab)) {
      this.switchTab(targetTab);
    }

    if (quickAmount) {
      const ml = Number(quickAmount);
      if (ml > 0) {
        setTimeout(() => {
          this.addWater(ml, `Acceso rápido (${ml} ml)`);
          // Limpiar URL sin recargar
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 300);
      }
    }
  }

  // ==========================================
  // SECCIÓN 1: AGUA (HOY)
  // ==========================================
  renderWaterSection() {
    const today = window.storageManager.getTodayData();
    const profile = window.storageManager.getProfile();
    const streakInfo = window.storageManager.getStreakStats();

    const totalMl = today.totalMl || 0;
    const goalMl = profile.dailyGoal || 2000;
    const percentage = Math.min(100, Math.round((totalMl / goalMl) * 100));

    // Elementos DOM
    const waterLevelEl = document.getElementById('water-level-body');
    const percentageEl = document.getElementById('water-percentage-label');
    const amountEl = document.getElementById('water-amount-label');
    const goalEl = document.getElementById('water-goal-label');
    const glassesEl = document.getElementById('water-glasses-count');
    const streakBadge = document.getElementById('streak-count-badge');

    // Nivel del agua animado
    if (waterLevelEl) {
      waterLevelEl.style.height = `${percentage}%`;
    }

    if (percentageEl) {
      percentageEl.textContent = `${percentage}%`;
    }

    if (amountEl) {
      amountEl.textContent = `${totalMl.toLocaleString('es-AR')} ml`;
    }

    if (goalEl) {
      goalEl.textContent = `Meta: ${goalMl.toLocaleString('es-AR')} ml`;
    }

    // Vasos tomados según Frank Suárez (vaso estándar = 250 ml)
    if (glassesEl) {
      const glassesTaken = (totalMl / 250).toFixed(1).replace('.0', '');
      const totalGlassesTarget = Math.round(goalMl / 250);
      glassesEl.textContent = `${glassesTaken} de ${totalGlassesTarget} vasos de 250 ml`;
    }

    // Racha de días
    if (streakBadge) {
      streakBadge.textContent = `${streakInfo.currentStreak} días`;
    }

    // Renderizar historial de ingestas de hoy
    this.renderTodayHistory(today.entries);
  }

  addWater(amount, label = 'Vaso de agua') {
    const result = window.storageManager.addWaterEntry(amount, label);

    // Sonidos y vibración
    if (window.soundEngine) {
      if (result.goalMetJustNow) {
        window.soundEngine.playGoalCelebration();
        if (window.reminderManager) {
          window.reminderManager.showToast('🎉 ¡Felicitaciones! ¡Alcanzaste tu meta diaria de hidratación!');
        }
      } else {
        window.soundEngine.playDrinkWater();
      }
    }

    // Animación de pulso en el círculo de agua
    const circle = document.getElementById('main-water-circle');
    if (circle) {
      circle.classList.remove('pulse-active');
      void circle.offsetWidth; // Forzar reflow para reiniciar animación
      circle.classList.add('pulse-active');
    }

    this.renderWaterSection();
  }

  undoLastDrink() {
    const res = window.storageManager.undoLastEntry();
    if (res.removed) {
      if (window.soundEngine) window.soundEngine.playWaterDrop();
      if (window.reminderManager) {
        window.reminderManager.showToast(`Se deshizo: ${res.removed.label} (-${res.removed.amount} ml)`);
      }
      this.renderWaterSection();
    }
  }

  renderTodayHistory(entries = []) {
    const container = document.getElementById('today-history-list');
    const emptyMsg = document.getElementById('today-history-empty');
    const countBadge = document.getElementById('today-history-count');

    if (!container) return;

    if (countBadge) {
      countBadge.textContent = `${entries.length} tomas`;
    }

    if (!entries.length) {
      container.textContent = '';
      if (emptyMsg) emptyMsg.classList.remove('hidden');
      return;
    }

    if (emptyMsg) emptyMsg.classList.add('hidden');
    container.textContent = '';

    entries.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'glass-card p-3 rounded-xl flex items-center justify-between gap-3 border border-slate-800/80 hover:border-sky-500/30 transition-all';

      const left = document.createElement('div');
      left.className = 'flex items-center gap-3';

      const iconBox = document.createElement('div');
      iconBox.className = 'w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-400/20 flex items-center justify-center text-sky-400 font-bold text-xs shrink-0';
      iconBox.textContent = `+${item.amount}`;

      const textInfo = document.createElement('div');
      const title = document.createElement('p');
      title.className = 'text-xs font-semibold text-white';
      title.textContent = item.label;

      const time = document.createElement('p');
      time.className = 'text-[11px] text-slate-400';
      time.textContent = `${item.time} hs`;

      textInfo.appendChild(title);
      textInfo.appendChild(time);

      left.appendChild(iconBox);
      left.appendChild(textInfo);

      // Botón para eliminar este registro individual
      const delBtn = document.createElement('button');
      delBtn.className = 'text-slate-500 hover:text-rose-400 p-2 rounded-lg transition-colors';
      delBtn.setAttribute('aria-label', 'Eliminar ingesta');
      delBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;

      delBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playTap();
        window.storageManager.removeWaterEntry(item.id);
        this.renderWaterSection();
      });

      row.appendChild(left);
      row.appendChild(delBtn);

      container.appendChild(row);
    });
  }

  // ==========================================
  // SECCIÓN 2: HORARIOS Y RECORDATORIOS
  // ==========================================
  renderScheduleSection() {
    const config = window.storageManager.getSchedule();

    // Modo Intervalo vs Fijos
    const btnModeInterval = document.getElementById('btn-mode-interval');
    const btnModeFixed = document.getElementById('btn-mode-fixed');
    const panelInterval = document.getElementById('panel-schedule-interval');
    const panelFixed = document.getElementById('panel-schedule-fixed');

    const isInterval = config.mode === 'interval';

    if (btnModeInterval && btnModeFixed) {
      btnModeInterval.classList.toggle('bg-sky-500', isInterval);
      btnModeInterval.classList.toggle('text-white', isInterval);
      btnModeInterval.classList.toggle('text-slate-300', !isInterval);

      btnModeFixed.classList.toggle('bg-sky-500', !isInterval);
      btnModeFixed.classList.toggle('text-white', !isInterval);
      btnModeFixed.classList.toggle('text-slate-300', isInterval);
    }

    if (panelInterval && panelFixed) {
      panelInterval.classList.toggle('hidden', !isInterval);
      panelFixed.classList.toggle('hidden', isInterval);
    }

    // Cargar valores de inputs de intervalo
    const inputStart = document.getElementById('input-start-time');
    const inputEnd = document.getElementById('input-end-time');
    const selectInterval = document.getElementById('select-interval-mins');

    if (inputStart) inputStart.value = config.startTime || '08:00';
    if (inputEnd) inputEnd.value = config.endTime || '22:00';
    if (selectInterval) selectInterval.value = String(config.intervalMinutes || 90);

    // Switches
    this.setToggleState('switch-notifications', config.notificationsEnabled);
    this.setToggleState('switch-sound', config.soundEnabled);
    this.setToggleState('switch-haptic', config.hapticEnabled);
    this.setToggleState('switch-meal-pause', config.pauseDuringMeals);

    // Sincronizar en el motor de audio
    if (window.soundEngine) {
      window.soundEngine.setSoundEnabled(config.soundEnabled);
      window.soundEngine.setHapticEnabled(config.hapticEnabled);
    }

    // Renderizar grilla de horarios calculados de hoy
    this.renderTimesGrid();

    // Renderizar lista de horarios fijos si corresponde
    this.renderFixedTimesList(config.fixedTimes);
  }

  setToggleState(elementId, isActive) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.setAttribute('aria-checked', isActive ? 'true' : 'false');
    el.classList.toggle('bg-sky-500', isActive);
    el.classList.toggle('bg-slate-700', !isActive);

    const circle = el.querySelector('span');
    if (circle) {
      circle.classList.toggle('translate-x-5', isActive);
      circle.classList.toggle('translate-x-0', !isActive);
    }
  }

  renderTimesGrid() {
    const grid = document.getElementById('schedule-times-grid');
    if (!grid) return;

    const times = window.reminderManager.getActiveTimes();
    const now = new Date();
    const currentMins = (now.getHours() * 60) + now.getMinutes();

    grid.textContent = '';

    times.forEach((t) => {
      const [h, m] = t.split(':').map(Number);
      const timeMins = (h * 60) + m;
      const isPast = timeMins < currentMins;

      const chip = document.createElement('div');
      chip.className = `py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
        isPast 
          ? 'bg-slate-900/60 text-slate-500 border-slate-800' 
          : 'bg-sky-950/40 text-sky-200 border-sky-800/40 hover:border-sky-500/50'
      }`;

      const label = document.createElement('span');
      label.textContent = `${t} hs`;

      const statusIcon = document.createElement('span');
      statusIcon.className = 'text-[11px]';
      statusIcon.textContent = isPast ? '✓' : '💧';

      chip.appendChild(label);
      chip.appendChild(statusIcon);
      grid.appendChild(chip);
    });
  }

  renderFixedTimesList(fixedTimes = []) {
    const container = document.getElementById('fixed-times-list');
    if (!container) return;

    container.textContent = '';
    const sorted = [...fixedTimes].sort();

    sorted.forEach((timeStr) => {
      const item = document.createElement('div');
      item.className = 'glass-card px-3.5 py-2.5 rounded-xl flex items-center justify-between border border-slate-800';

      const timeText = document.createElement('span');
      timeText.className = 'font-bold text-sm text-sky-300';
      timeText.textContent = `${timeStr} hs`;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'text-slate-500 hover:text-rose-400 p-1 rounded transition-colors';
      removeBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;

      removeBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playTap();
        const conf = window.storageManager.getSchedule();
        conf.fixedTimes = (conf.fixedTimes || []).filter(t => t !== timeStr);
        window.storageManager.saveSchedule(conf);
        this.renderScheduleSection();
      });

      item.appendChild(timeText);
      item.appendChild(removeBtn);
      container.appendChild(item);
    });
  }

  // ==========================================
  // SECCIÓN 3: PROGRESO Y ESTADÍSTICAS
  // ==========================================
  renderProgressSection() {
    const weeklyData = window.storageManager.getWeeklyChartData();
    const streak = window.storageManager.getStreakStats();
    const profile = window.storageManager.getProfile();

    // Gráfico de barras semanal
    const chartContainer = document.getElementById('weekly-chart-bars');
    if (chartContainer) {
      chartContainer.textContent = '';

      weeklyData.forEach((day) => {
        const col = document.createElement('div');
        col.className = 'flex-1 flex flex-col items-center gap-2';

        const barTrack = document.createElement('div');
        barTrack.className = 'bar-track';

        const barFill = document.createElement('div');
        barFill.className = `bar-fill ${day.goalMet ? 'goal-met' : ''}`;
        barFill.style.height = `${day.percentage}%`;

        barTrack.appendChild(barFill);

        const label = document.createElement('span');
        label.className = `text-[11px] font-semibold ${day.isToday ? 'text-sky-400 font-bold' : 'text-slate-400'}`;
        label.textContent = day.dayLabel;

        const val = document.createElement('span');
        val.className = 'text-[9px] text-slate-500';
        val.textContent = `${day.totalMl}ml`;

        col.appendChild(barTrack);
        col.appendChild(label);
        col.appendChild(val);

        chartContainer.appendChild(col);
      });
    }

    // Estadísticas
    const totalWeeklyMl = weeklyData.reduce((sum, d) => sum + d.totalMl, 0);
    const avgDailyMl = Math.round(totalWeeklyMl / 7);
    const daysMetCount = weeklyData.filter(d => d.goalMet).length;

    const elTotal = document.getElementById('stat-weekly-total');
    const elAvg = document.getElementById('stat-daily-avg');
    const elDaysMet = document.getElementById('stat-days-met');
    const elStreakProgress = document.getElementById('stat-streak-progress');
    const elFrankAtp = document.getElementById('stat-frank-atp');

    if (elTotal) elTotal.textContent = `${(totalWeeklyMl / 1000).toFixed(1)} L`;
    if (elAvg) elAvg.textContent = `${avgDailyMl.toLocaleString('es-AR')} ml`;
    if (elDaysMet) elDaysMet.textContent = `${daysMetCount} de 7 días`;
    if (elStreakProgress) elStreakProgress.textContent = `${streak.currentStreak} días seguidos 🔥`;

    // ATP Estimado (Frank Suárez: 1 vaso de agua = energía celular activa)
    if (elFrankAtp) {
      const estimatedAtpUnits = Math.round(totalWeeklyMl / 250 * 10);
      elFrankAtp.textContent = `~${estimatedAtpUnits} x 10 Julios ATP`;
    }
  }

  // ==========================================
  // SECCIÓN 4: MÁS HÁBITOS Y FRANK SUÁREZ
  // ==========================================
  renderHabitsSection() {
    if (window.habitsManager) {
      window.habitsManager.renderTipsList('frank-tips-container');
      window.habitsManager.renderHabitsList('extra-habits-container');
    }
  }

  // ==========================================
  // EVENT LISTENERS GLOBALES
  // ==========================================
  setupEventListeners() {
    // 1. Botones Rápidos de Agua
    document.querySelectorAll('.btn-quick-water').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ml = Number(btn.getAttribute('data-ml'));
        const label = btn.getAttribute('data-label') || 'Vaso de agua';
        this.addWater(ml, label);
      });
    });

    // 2. Botón Deshacer Ingesta
    const btnUndo = document.getElementById('btn-undo-drink');
    if (btnUndo) {
      btnUndo.addEventListener('click', () => {
        this.undoLastDrink();
      });
    }

    // 3. Botón Vaso Personalizado (+)
    const btnCustom = document.getElementById('btn-custom-water-modal');
    if (btnCustom) {
      btnCustom.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playTap();
        const modal = document.getElementById('custom-water-modal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }
      });
    }

    // 4. Modal Calculadora Frank Suárez
    const btnOpenFrankCalc = document.getElementById('btn-open-frank-calc');
    const modalFrank = document.getElementById('frank-calc-modal');
    if (btnOpenFrankCalc && modalFrank) {
      btnOpenFrankCalc.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playTap();
        this.openFrankCalculatorModal();
      });
    }

    const inputWeight = document.getElementById('frank-input-weight');
    if (inputWeight) {
      inputWeight.addEventListener('input', () => {
        this.recalcFrankFormula();
      });
    }

    const btnApplyFrank = document.getElementById('btn-apply-frank-goal');
    if (btnApplyFrank) {
      btnApplyFrank.addEventListener('click', () => {
        this.applyFrankGoal();
      });
    }

    // 5. Botones de Modo Horarios (Intervalo vs Fijos)
    const btnModeInterval = document.getElementById('btn-mode-interval');
    const btnModeFixed = document.getElementById('btn-mode-fixed');

    if (btnModeInterval) {
      btnModeInterval.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playTap();
        const conf = window.storageManager.getSchedule();
        conf.mode = 'interval';
        window.storageManager.saveSchedule(conf);
        this.renderScheduleSection();
      });
    }

    if (btnModeFixed) {
      btnModeFixed.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playTap();
        const conf = window.storageManager.getSchedule();
        conf.mode = 'fixed';
        window.storageManager.saveSchedule(conf);
        this.renderScheduleSection();
      });
    }

    // 6. Inputs de Horario Dinámico
    const inputStart = document.getElementById('input-start-time');
    const inputEnd = document.getElementById('input-end-time');
    const selectInterval = document.getElementById('select-interval-mins');

    const updateIntervalConfig = () => {
      const conf = window.storageManager.getSchedule();
      if (inputStart) conf.startTime = inputStart.value;
      if (inputEnd) conf.endTime = inputEnd.value;
      if (selectInterval) conf.intervalMinutes = Number(selectInterval.value);
      window.storageManager.saveSchedule(conf);
      this.renderTimesGrid();
    };

    if (inputStart) inputStart.addEventListener('change', updateIntervalConfig);
    if (inputEnd) inputEnd.addEventListener('change', updateIntervalConfig);
    if (selectInterval) selectInterval.addEventListener('change', updateIntervalConfig);

    // 7. Botón Añadir Horario Fijo
    const btnAddFixedTime = document.getElementById('btn-add-fixed-time');
    const inputFixedTime = document.getElementById('input-new-fixed-time');
    if (btnAddFixedTime && inputFixedTime) {
      btnAddFixedTime.addEventListener('click', () => {
        const val = inputFixedTime.value;
        if (!val) return;
        const conf = window.storageManager.getSchedule();
        conf.fixedTimes = conf.fixedTimes || [];
        if (!conf.fixedTimes.includes(val)) {
          conf.fixedTimes.push(val);
          window.storageManager.saveSchedule(conf);
          this.renderScheduleSection();
          inputFixedTime.value = '';
        }
      });
    }

    // 8. Switches de Configuración
    this.bindToggle('switch-notifications', 'notificationsEnabled', async (active) => {
      if (active && window.reminderManager) {
        await window.reminderManager.requestNotificationPermission();
      }
    });
    this.bindToggle('switch-sound', 'soundEnabled', (active) => {
      if (window.soundEngine) window.soundEngine.setSoundEnabled(active);
    });
    this.bindToggle('switch-haptic', 'hapticEnabled', (active) => {
      if (window.soundEngine) window.soundEngine.setHapticEnabled(active);
    });
    this.bindToggle('switch-meal-pause', 'pauseDuringMeals', () => {
      this.renderTimesGrid();
    });

    // 9. Botón 'Probar Notificación y Sonido Ahora'
    const btnTestAlert = document.getElementById('btn-test-alert');
    if (btnTestAlert) {
      btnTestAlert.addEventListener('click', async () => {
        if (window.reminderManager) {
          await window.reminderManager.testNotificationAndSound();
        }
      });
    }

    // 10. Cerrar Modales
    document.querySelectorAll('.btn-close-modal').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playTap();
        document.querySelectorAll('.app-modal').forEach(m => {
          m.classList.remove('flex');
          m.classList.add('hidden');
        });
      });
    });

    // 11. Modal de vaso personalizado: Botón aplicar
    const btnApplyCustom = document.getElementById('btn-apply-custom-water');
    const inputCustomMl = document.getElementById('input-custom-ml');
    if (btnApplyCustom && inputCustomMl) {
      btnApplyCustom.addEventListener('click', () => {
        const ml = Number(inputCustomMl.value);
        if (ml > 0) {
          this.addWater(ml, `Vaso libre (${ml} ml)`);
          inputCustomMl.value = '';
          const modal = document.getElementById('custom-water-modal');
          if (modal) {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
          }
        }
      });
    }
  }

  bindToggle(elementId, configKey, callback) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playTap();
      const conf = window.storageManager.getSchedule();
      conf[configKey] = !conf[configKey];
      window.storageManager.saveSchedule(conf);
      this.setToggleState(elementId, conf[configKey]);
      if (callback) callback(conf[configKey]);
    });
  }

  // ==========================================
  // CALCULADORA FRANK SUÁREZ
  // ==========================================
  openFrankCalculatorModal() {
    const modal = document.getElementById('frank-calc-modal');
    const profile = window.storageManager.getProfile();
    const inputWeight = document.getElementById('frank-input-weight');

    if (inputWeight) {
      inputWeight.value = profile.weightKg || 70;
    }

    this.recalcFrankFormula();

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  recalcFrankFormula() {
    const inputWeight = document.getElementById('frank-input-weight');
    const weight = Number(inputWeight ? inputWeight.value : 70) || 70;
    const calc = window.storageManager.calculateFrankGoal(weight);

    const elGlasses = document.getElementById('frank-calc-glasses');
    const elMl = document.getElementById('frank-calc-ml');
    const elSummary = document.getElementById('frank-calc-formula-text');

    if (elGlasses) elGlasses.textContent = `${calc.glasses} vasos`;
    if (elMl) elMl.textContent = `${calc.ml.toLocaleString('es-AR')} ml diarios`;
    if (elSummary) {
      elSummary.textContent = `${weight} kg ÷ 7 = ${calc.glasses} vasos de 250 ml`;
    }
  }

  applyFrankGoal() {
    const inputWeight = document.getElementById('frank-input-weight');
    const weight = Number(inputWeight ? inputWeight.value : 70) || 70;
    const calc = window.storageManager.calculateFrankGoal(weight);

    const profile = window.storageManager.getProfile();
    profile.weightKg = weight;
    profile.dailyGoal = calc.ml;
    profile.isFrankGoalSet = true;
    window.storageManager.saveProfile(profile);

    // Actualizar meta del día de hoy
    const today = window.storageManager.getTodayData();
    today.goalMl = calc.ml;
    window.storageManager.saveTodayData(today);

    // Cerrar modal
    const modal = document.getElementById('frank-calc-modal');
    if (modal) {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }

    if (window.soundEngine) window.soundEngine.playDrinkWater();
    if (window.reminderManager) {
      window.reminderManager.showToast(`¡Meta de Frank fijada: ${calc.ml} ml (${calc.glasses} vasos)!`);
    }

    this.renderWaterSection();
  }

  // ==========================================
  // SECCIÓN 5: GESTIÓN DE USUARIO Y PERFIL
  // ==========================================
  setupAuthListeners() {
    this.updateUserHeaderUI();

    // Botón Header: Abrir Perfil o Login
    const btnOpenUser = document.getElementById('btn-open-user-profile');
    if (btnOpenUser) {
      btnOpenUser.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playTap();
        if (window.authManager && window.authManager.isLoggedIn()) {
          this.openProfileModal();
        } else {
          this.openAuthModal();
        }
      });
    }

    // Pestañas Login / Registro
    const tabLogin = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const authError = document.getElementById('auth-error-msg');

    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => {
        tabLogin.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all bg-sky-500 text-white shadow';
        tabRegister.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-slate-400 hover:text-white';
        if (formLogin) formLogin.classList.remove('hidden');
        if (formRegister) formRegister.classList.add('hidden');
        if (authError) authError.classList.add('hidden');
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all bg-emerald-500 text-white shadow';
        tabLogin.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-slate-400 hover:text-white';
        if (formLogin) formLogin.classList.add('hidden');
        if (formRegister) formRegister.classList.remove('hidden');
        if (authError) authError.classList.add('hidden');
      });
    }

    // Submit Login
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        try {
          await window.authManager.login(username, password);
          this.closeModals();
          this.updateUserHeaderUI();
          this.renderWaterSection();
          if (window.reminderManager) {
            window.reminderManager.showToast(`¡Bienvenido de vuelta, ${window.authManager.currentUser.name}!`);
          }
        } catch (err) {
          if (authError) {
            authError.textContent = err.message || 'Error al iniciar sesión';
            authError.classList.remove('hidden');
          }
        }
      });
    }

    // Submit Registro
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const weightKg = document.getElementById('reg-weight').value;

        try {
          const user = await window.authManager.register({ name, username, email, password, weightKg });
          this.closeModals();
          this.updateUserHeaderUI();
          this.renderWaterSection();
          if (window.reminderManager) {
            window.reminderManager.showToast(`¡Cuenta creada con éxito! Meta: ${user.recommendedWaterMl} ml.`);
          }
        } catch (err) {
          if (authError) {
            authError.textContent = err.message || 'Error al registrar usuario';
            authError.classList.remove('hidden');
          }
        }
      });
    }

    // Botón Recalcular en Perfil
    const btnProfileRecalc = document.getElementById('btn-profile-recalc-frank');
    if (btnProfileRecalc) {
      btnProfileRecalc.addEventListener('click', async () => {
        const inputWeight = document.getElementById('profile-input-weight');
        const weight = Number(inputWeight ? inputWeight.value : 70) || 70;
        const calc = window.storageManager.calculateFrankGoal(weight);
        if (window.authManager) {
          await window.authManager.updateProfile({ weightKg: weight, dailyGoalMl: calc.ml });
        }
        this.openProfileModal(); // refrescar datos mostrados
        this.renderWaterSection();
        if (window.reminderManager) {
          window.reminderManager.showToast(`Meta actualizada a ${calc.ml} ml (${calc.glasses} vasos)`);
        }
      });
    }

    // Botón Cerrar Sesión
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (confirm('¿Deseás cerrar tu sesión en HabitFlow?')) {
          window.authManager.logout();
        }
      });
    }

    // Botón Buscar Actualizaciones de APK
    const btnCheckApk = document.getElementById('btn-check-apk-updates');
    if (btnCheckApk) {
      btnCheckApk.addEventListener('click', () => {
        this.closeModals();
        const updateModal = document.getElementById('apk-update-modal');
        if (updateModal) {
          updateModal.classList.remove('hidden');
          updateModal.classList.add('flex');
        }
      });
    }
  }

  updateUserHeaderUI() {
    const elName = document.getElementById('header-user-name');
    if (!elName) return;

    if (window.authManager && window.authManager.isLoggedIn()) {
      const u = window.authManager.currentUser;
      const firstName = (u.name || u.username).split(' ')[0];
      elName.textContent = firstName;
      elName.parentElement.classList.add('border-sky-500/40', 'bg-sky-500/10', 'text-sky-300');
    } else {
      elName.textContent = 'Ingresar';
      elName.parentElement.classList.remove('border-sky-500/40', 'bg-sky-500/10', 'text-sky-300');
    }
  }

  openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  openProfileModal() {
    const modal = document.getElementById('user-profile-modal');
    if (!modal) return;

    const u = window.authManager.currentUser;
    if (!u) return;

    const elAvatar = document.getElementById('profile-avatar-letter');
    const elName = document.getElementById('profile-display-name');
    const elUser = document.getElementById('profile-display-username');
    const inputWeight = document.getElementById('profile-input-weight');
    const elGoal = document.getElementById('profile-display-goal');
    const elGlasses = document.getElementById('profile-display-glasses');

    if (elAvatar) elAvatar.textContent = (u.name || u.username)[0].toUpperCase();
    if (elName) elName.textContent = u.name || u.username;
    if (elUser) elUser.textContent = `@${u.username}`;
    if (inputWeight) inputWeight.value = u.weightKg || 70;

    const goal = u.recommendedWaterMl || 2000;
    const glasses = Math.round(goal / 250);
    if (elGoal) elGoal.textContent = `${goal.toLocaleString('es-AR')} ml`;
    if (elGlasses) elGlasses.textContent = `${glasses} vasos de 250 ml`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  // ==========================================
  // SECCIÓN 6: CONFIGURACIÓN Y AJUSTES
  // ==========================================
  applyInitialTheme() {
    const savedTheme = window.storageManager.getTheme();
    window.storageManager.setTheme(savedTheme);
    this.updateThemeUI(savedTheme);
  }

  updateThemeUI(theme) {
    const isLight = theme === 'light';
    const switchBtn = document.getElementById('switch-theme-mode');
    const circle = document.getElementById('switch-theme-circle');
    const iconContainer = document.getElementById('theme-icon-container');
    const titleText = document.getElementById('theme-title-text');
    const subtitleText = document.getElementById('theme-subtitle-text');

    if (switchBtn && circle) {
      if (isLight) {
        switchBtn.className = 'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-amber-400';
        circle.className = 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-5';
      } else {
        switchBtn.className = 'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-slate-700';
        circle.className = 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-300 shadow-lg ring-0 transition duration-200 ease-in-out translate-x-0';
      }
    }

    if (iconContainer) {
      iconContainer.textContent = isLight ? '☀️' : '🌙';
      iconContainer.className = isLight 
        ? 'w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg'
        : 'w-10 h-10 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center text-lg';
    }

    if (titleText) {
      titleText.textContent = isLight ? 'Modo Soleado (Claro)' : 'Modo Nocturno (Oscuro)';
    }

    if (subtitleText) {
      subtitleText.textContent = isLight 
        ? 'Tocá para cambiar a Modo Nocturno 🌙'
        : 'Tocá para cambiar a Modo Soleado ☀️';
    }
  }

  toggleTheme() {
    const current = window.storageManager.getTheme();
    const next = current === 'light' ? 'dark' : 'light';
    window.storageManager.setTheme(next);
    this.updateThemeUI(next);
    if (window.soundEngine) window.soundEngine.playTap();
    if (window.reminderManager) {
      window.reminderManager.showToast(next === 'light' ? 'Modo Soleado activado ☀️' : 'Modo Nocturno activado 🌙');
    }
  }

  renderSettingsSection() {
    // 1. Perfil de Usuario
    const elAvatar = document.getElementById('settings-avatar-letter');
    const elName = document.getElementById('settings-display-name');
    const elUser = document.getElementById('settings-display-user');
    const elEmail = document.getElementById('settings-display-email');
    const elWeight = document.getElementById('settings-display-weight');
    const elGoal = document.getElementById('settings-display-goal');
    const btnLogout = document.getElementById('btn-settings-logout');

    const isLoggedIn = window.authManager && window.authManager.isLoggedIn();
    if (isLoggedIn) {
      const u = window.authManager.currentUser;
      if (elAvatar) elAvatar.textContent = (u.name || u.username)[0].toUpperCase();
      if (elName) elName.textContent = u.name || u.username;
      if (elUser) elUser.textContent = `@${u.username}`;
      if (elEmail) elEmail.textContent = u.email || 'Cuenta activa';
      if (elWeight) elWeight.textContent = `${u.weightKg || 70} kg`;
      const goal = u.recommendedWaterMl || 2000;
      if (elGoal) elGoal.textContent = `${goal.toLocaleString('es-AR')} ml`;
      if (btnLogout) {
        btnLogout.textContent = 'Cerrar Sesión';
        btnLogout.className = 'w-full mt-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs active:scale-95 transition-all';
      }
    } else {
      const profile = window.storageManager.getProfile();
      if (elAvatar) elAvatar.textContent = '👤';
      if (elName) elName.textContent = 'Usuario Local';
      if (elUser) elUser.textContent = '@invitado';
      if (elEmail) elEmail.textContent = 'Tocá para registrarte o iniciar sesión';
      if (elWeight) elWeight.textContent = `${profile.weightKg || 70} kg`;
      if (elGoal) elGoal.textContent = `${(profile.dailyGoal || 2000).toLocaleString('es-AR')} ml`;
      if (btnLogout) {
        btnLogout.textContent = 'Iniciar Sesión / Registrarse';
        btnLogout.className = 'w-full mt-1 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-xs active:scale-95 transition-all';
      }
    }

    // 2. Apariencia
    this.updateThemeUI(window.storageManager.getTheme());

    // 3. Tus Cosas (Estadísticas acumuladas históricas)
    const history = window.storageManager.getHistory() || [];
    const today = window.storageManager.getTodayData() || { totalMl: 0, entries: [] };
    const streakInfo = window.storageManager.getStreakStats() || { currentStreak: 0, bestStreak: 0 };

    const historyTotalMl = history.reduce((acc, h) => acc + (Number(h.totalMl) || 0), 0);
    const totalMlLifetime = historyTotalMl + (Number(today.totalMl) || 0);

    const elTotalLiters = document.getElementById('my-things-total-liters');
    const elBestStreak = document.getElementById('my-things-best-streak');
    const elTotalGlasses = document.getElementById('my-things-total-glasses');
    const elTotalAtp = document.getElementById('my-things-total-atp');

    if (elTotalLiters) {
      elTotalLiters.textContent = `${(totalMlLifetime / 1000).toFixed(1)} L`;
    }

    if (elBestStreak) {
      const best = Math.max(streakInfo.bestStreak || 0, streakInfo.currentStreak || 0);
      elBestStreak.textContent = `${best} ${best === 1 ? 'día' : 'días'}`;
    }

    if (elTotalGlasses) {
      const glasses = Math.round(totalMlLifetime / 250);
      elTotalGlasses.textContent = `${glasses} ${glasses === 1 ? 'vaso' : 'vasos'}`;
    }

    if (elTotalAtp) {
      const atpJoules = Math.round(totalMlLifetime * 3.5);
      elTotalAtp.textContent = `~${atpJoules.toLocaleString('es-AR')} J`;
    }
  }

  setupSettingsListeners() {
    // Switch de Tema Claro / Oscuro
    const switchTheme = document.getElementById('switch-theme-mode');
    if (switchTheme) {
      switchTheme.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Botón de Editar Perfil
    const btnOpenEdit = document.getElementById('btn-settings-edit-profile') || document.getElementById('btn-open-edit-profile');
    if (btnOpenEdit) {
      btnOpenEdit.addEventListener('click', () => {
        this.openEditProfileModal();
      });
    }

    // Botón de Cerrar Sesión en Ajustes
    const btnSettingsLogout = document.getElementById('btn-settings-logout');
    if (btnSettingsLogout) {
      btnSettingsLogout.addEventListener('click', () => {
        if (window.authManager && window.authManager.isLoggedIn()) {
          if (confirm('¿Deseás cerrar tu sesión en HabitFlow?')) {
            window.authManager.logout();
          }
        } else {
          this.openAuthModal();
        }
      });
    }

    // Input reactivo de peso en el Modal de Edición de Perfil
    const inputWeight = document.getElementById('edit-profile-weight');
    const previewCalc = document.getElementById('edit-profile-frank-calc-preview');
    const inputGoal = document.getElementById('edit-profile-goal');

    if (inputWeight) {
      inputWeight.addEventListener('input', (e) => {
        const w = Number(e.target.value) || 0;
        if (w > 0) {
          const glasses = Math.round(w / 7);
          const ml = glasses * 250;
          if (previewCalc) {
            previewCalc.textContent = `Recomendación Frank Suárez: ${glasses} vasos (${ml.toLocaleString('es-AR')} ml)`;
          }
          if (inputGoal && !inputGoal.dataset.manuallyEdited) {
            inputGoal.value = ml;
          }
        }
      });
    }

    if (inputGoal) {
      inputGoal.addEventListener('input', () => {
        inputGoal.dataset.manuallyEdited = 'true';
      });
    }

    // Guardar formulario de edición de perfil
    const formEditProfile = document.getElementById('form-edit-profile');
    if (formEditProfile) {
      formEditProfile.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('edit-profile-name').value.trim();
        const weightVal = Number(document.getElementById('edit-profile-weight').value) || 70;
        const goalVal = Number(document.getElementById('edit-profile-goal').value) || 2000;

        if (window.authManager && window.authManager.isLoggedIn()) {
          try {
            await window.authManager.updateProfile({
              name: nameVal,
              weightKg: weightVal,
              dailyGoalMl: goalVal
            });
          } catch (err) {
            console.error('Error al actualizar perfil de usuario:', err);
          }
        } else {
          const p = window.storageManager.getProfile();
          p.weightKg = weightVal;
          p.dailyGoal = goalVal;
          window.storageManager.saveProfile(p);
          window.storageManager.setDailyGoal(goalVal);
        }

        this.closeModals();
        this.renderSettingsSection();
        this.renderWaterSection();
        this.updateUserHeaderUI();

        if (window.soundEngine) window.soundEngine.playSuccess();
        if (window.reminderManager) {
          window.reminderManager.showToast('✅ ¡Perfil y meta actualizados con éxito!');
        }
      });
    }
  }

  openEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    const inputName = document.getElementById('edit-profile-name');
    const inputWeight = document.getElementById('edit-profile-weight');
    const inputGoal = document.getElementById('edit-profile-goal');
    const previewCalc = document.getElementById('edit-profile-frank-calc-preview');

    if (window.authManager && window.authManager.isLoggedIn()) {
      const u = window.authManager.currentUser;
      if (inputName) inputName.value = u.name || u.username;
      if (inputWeight) inputWeight.value = u.weightKg || 70;
      const goal = u.recommendedWaterMl || 2000;
      if (inputGoal) {
        inputGoal.value = goal;
        delete inputGoal.dataset.manuallyEdited;
      }
      const glasses = Math.round((u.weightKg || 70) / 7);
      if (previewCalc) {
        previewCalc.textContent = `Recomendación Frank Suárez: ${glasses} vasos (${goal.toLocaleString('es-AR')} ml)`;
      }
    } else {
      const p = window.storageManager.getProfile();
      if (inputName) inputName.value = 'Usuario Local';
      if (inputWeight) inputWeight.value = p.weightKg || 70;
      if (inputGoal) {
        inputGoal.value = p.dailyGoal || 2000;
        delete inputGoal.dataset.manuallyEdited;
      }
      const glasses = Math.round((p.weightKg || 70) / 7);
      if (previewCalc) {
        previewCalc.textContent = `Recomendación Frank Suárez: ${glasses} vasos (${p.dailyGoal.toLocaleString('es-AR')} ml)`;
      }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeModals() {
    document.querySelectorAll('.app-modal').forEach((m) => {
      m.classList.remove('flex');
      m.classList.add('hidden');
    });
  }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HabitFlowApp();
  if (window.app.setupAuthListeners) {
    window.app.setupAuthListeners();
  }
});
