/**
 * HabitFlow - Módulo de Novedades Diarias y Tips de Metabolismo TV
 * Code Ahumada • Director Cristian
 * 
 * Basado en:
 * 1. Frutas y alimentos funcionales y los órganos que benefician a nivel celular.
 * 2. Consejos y Shorts oficiales del canal Metabolismo TV (Frank Suárez).
 * 3. Renovación automática diaria a las 06:00 AM con feed remoto y respaldo offline.
 */

const FALLBACK_TIPS_LIBRARY = [
  {
    id: 'tip-palta-corazon',
    title: 'La Palta y el Corazón: Cómo Calmar el Cortisol y Quemar Grasa',
    category: 'Fruta y Órgano del Día',
    badge: '🥑 Fruta & Órgano',
    fruit: {
      name: 'Palta / Aguacate',
      icon: '🥑',
      targetOrgan: '❤️ Corazón y Glándulas Suprarrenales',
      keyNutrient: 'Potasio Natural (800mg) + Ácido Oleico (Omega-9)',
      mechanism: 'El potasio de la palta contrarresta el exceso de sodio celular y apaga la producción desmedida de cortisol (la hormona del estrés), permitiendo que el cuerpo desinflame el sistema cardiovascular y queme grasa abdominal profunda.'
    },
    metabolismoTvShort: {
      title: '¿Por qué la palta no engorda y ayuda a tu corazón?',
      youtubeUrl: 'https://www.youtube.com/@MetabolismoTV/shorts',
      caption: 'Frank Suárez explica cómo las grasas monoinsaturadas activan la tiroides y sacian sin disparar la insulina.'
    },
    frankAdvice: 'Si tenés un sistema nervioso excitado (te cuesta dormir o vivís estresado), comer 1/2 palta en la cena es el mejor relajante natural que existe.',
    quickAction: 'Agregá 1/2 palta fileteada a tu cena de hoy con una pizca de sal marina y gotas de limón fresco.'
  },
  {
    id: 'tip-arandanos-cerebro',
    title: 'Arándanos y el Cerebro: Regeneración Neuronal y Memoria',
    category: 'Fruta y Órgano del Día',
    badge: '🫐 Fruta & Órgano',
    fruit: {
      name: 'Arándanos y Frutos Rojos',
      icon: '🫐',
      targetOrgan: '🧠 Cerebro y Sistema Nervioso Central',
      keyNutrient: 'Antocianinas + Polifenoles antioxidantes',
      mechanism: 'Cruzan la barrera hematoencefálica protegiendo a las neuronas del estrés oxidativo y mejorando la comunicación entre sinapsis sin disparar la glucosa.'
    },
    metabolismoTvShort: {
      title: 'Los frutos rojos son los únicos que recomiendo',
      youtubeUrl: 'https://www.youtube.com/@MetabolismoTV/shorts',
      caption: 'Frank Suárez explica por qué las frutas bajas en fructosa son las mejores aliadas para adelgazar sin dañar el hígado.'
    },
    frankAdvice: 'Evitá las frutas cargadas de fructosa líquida. Los arándanos tienen poca azúcar y un poder antioxidante insuperable para tu mente.',
    quickAction: 'Sumá 1/3 taza de arándanos a tu yogur griego o merienda.'
  },
  {
    id: 'tip-limon-higado',
    title: 'El Limón y el Hígado Graso: Desintoxicación Matutina',
    category: 'Fruta y Órgano del Día',
    badge: '🍋 Fruta & Órgano',
    fruit: {
      name: 'Limón Fresco',
      icon: '🍋',
      targetOrgan: '🫀 Hígado y Vesícula Biliar',
      keyNutrient: 'Ácido Cítrico + Vitamina C Pura',
      mechanism: 'Estimula la producción de bilis y ayuda al hígado a disolver los depósitos de grasa estancada y toxinas acumuladas.'
    },
    metabolismoTvShort: {
      title: 'El jugo de limón en ayunas y el metabolismo',
      youtubeUrl: 'https://www.youtube.com/@MetabolismoTV/shorts',
      caption: 'Cómo un vaso de agua tibia con medio limón al despertar activa tu sistema digestivo en 5 minutos.'
    },
    frankAdvice: 'El limón parece ácido al paladar, pero dentro del cuerpo se convierte en uno de los mayores alcalinizantes y depuradores hepáticos.',
    quickAction: 'Exprimí 1/2 limón en tu primer vaso de agua de la mañana (a las 06:00 hs).'
  },
  {
    id: 'tip-pina-pancreas',
    title: 'La Piña y el Páncreas: La Enzima Bromelina',
    category: 'Fruta y Órgano del Día',
    badge: '🍍 Fruta & Órgano',
    fruit: {
      name: 'Piña / Ananá',
      icon: '🍍',
      targetOrgan: '🫁 Páncreas y Tracto Intestinal',
      keyNutrient: 'Bromelina (Enzima Proteolítica)',
      mechanism: 'Descompone las proteínas densas en aminoácidos asimilables, aliviando la carga de trabajo del páncreas y reduciendo la inflamación abdominal.'
    },
    metabolismoTvShort: {
      title: 'La enzima mágica para personas con digestión lenta',
      youtubeUrl: 'https://www.youtube.com/@MetabolismoTV/shorts',
      caption: 'Frank Suárez detalla cómo la bromelina ayuda a quienes sienten pesadez estomacal después de comer carne.'
    },
    frankAdvice: 'Consumila con moderación (1 rodaja fina) como parte del 25% Tipo E después de una comida proteica abundante.',
    quickAction: 'Comé 1 rodaja fina de ananá natural después de tu almuerzo con carnes rojas.'
  },
  {
    id: 'tip-manzana-pulmones',
    title: 'La Manzana Verde y los Pulmones: Quercetina y Vías Respiratorias',
    category: 'Fruta y Órgano del Día',
    badge: '🍏 Fruta & Órgano',
    fruit: {
      name: 'Manzana Verde Granny Smith',
      icon: '🍏',
      targetOrgan: '🫁 Pulmones y Capacidad Oxigenante',
      keyNutrient: 'Quercetina + Ácido Málico',
      mechanism: 'La quercetina actúa como un antihistamínico natural que desinflama los bronquios y mejora el intercambio de oxígeno a nivel celular.'
    },
    metabolismoTvShort: {
      title: '¿Por qué la manzana verde es la mejor manzana?',
      youtubeUrl: 'https://www.youtube.com/@MetabolismoTV/shorts',
      caption: 'Menos azúcar que la roja y con ácido málico que ablanda los cálculos de la vesícula.'
    },
    frankAdvice: 'La manzana verde tiene la mitad de glucosa que una manzana roja dulce. Es perfecta para quienes buscan mejorar su salud respiratoria y hepática.',
    quickAction: 'Cortá media manzana verde en cubos y sumala a una ensalada verde con hojas de espinaca.'
  }
];

class TipsManager {
  constructor() {
    this.feedData = null;
    this.activeTip = null;
    this.REMOTE_FEED_URL = './data/daily_tips.json';
    this.STORAGE_KEY = 'habitflow_cached_tips_v1';
  }

  init() {
    this.loadCachedFeed();
    this.fetchRemoteFeed();
    this.renderTipsSection();
  }

  loadCachedFeed() {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        this.feedData = JSON.parse(cached);
      }
    } catch (e) {
      console.warn('[TipsManager] Error al cargar caché de tips:', e);
    }
  }

  async fetchRemoteFeed() {
    try {
      // Query param aleatorio anti-caché de red para asegurar que si el agente actualizó el archivo, se descargue fresco
      const url = `${this.REMOTE_FEED_URL}?t=${Date.now()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        this.feedData = data;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        console.log('✓ Feed de Novedades y Tips actualizado desde la nube exitosamente');
        this.renderTipsSection();
      }
    } catch (e) {
      console.log('ℹ️ [TipsManager] Usando banco de tips local (offline / red no disponible).');
    }
  }

  /**
   * Calcula el ciclo del tip considerando la regla de renovación de las 06:00 AM.
   * Si la hora actual es antes de las 06:00 AM, pertenece al ciclo que arrancó ayer a las 06:00 AM.
   */
  getEffectiveCycleDate() {
    const now = new Date();
    // Si todavía no son las 6:00 AM, retroceder 1 día para mantener el tip de la jornada previa
    if (now.getHours() < 6) {
      now.setDate(now.getDate() - 1);
    }
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTodayTip() {
    const effectiveDate = this.getEffectiveCycleDate();

    // 1. Si tenemos feed remoto con tip de hoy
    if (this.feedData && this.feedData.todayTip) {
      if (this.feedData.todayTip.date === effectiveDate) {
        return this.feedData.todayTip;
      }
    }

    // 2. Si no coincide la fecha exacta, calcular por índice rotativo del día del año
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const index = dayOfYear % FALLBACK_TIPS_LIBRARY.length;
    return FALLBACK_TIPS_LIBRARY[index];
  }

  getPastTips() {
    if (this.feedData && Array.isArray(this.feedData.pastTips) && this.feedData.pastTips.length > 0) {
      return this.feedData.pastTips;
    }
    const today = this.getTodayTip();
    return FALLBACK_TIPS_LIBRARY.filter(t => t.id !== today.id);
  }

  renderTipsSection() {
    const tip = this.getTodayTip();
    this.activeTip = tip;

    // Elementos del DOM
    const elDate = document.getElementById('tips-today-date-badge');
    const elTitle = document.getElementById('tips-today-title');
    const elBadge = document.getElementById('tips-today-badge');
    const elFruitIcon = document.getElementById('tips-fruit-icon');
    const elFruitName = document.getElementById('tips-fruit-name');
    const elTargetOrgan = document.getElementById('tips-target-organ');
    const elKeyNutrient = document.getElementById('tips-key-nutrient');
    const elMechanism = document.getElementById('tips-mechanism');
    const elFrankAdvice = document.getElementById('tips-frank-advice');
    const elQuickAction = document.getElementById('tips-quick-action');

    // YouTube Short
    const elShortTitle = document.getElementById('tips-short-title');
    const elShortCaption = document.getElementById('tips-short-caption');
    const elShortBtn = document.getElementById('tips-short-link-btn');

    const formattedDate = new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(new Date());

    if (elDate) {
      elDate.textContent = `Hoy (${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}) • Renueva 06:00 AM`;
    }

    if (tip) {
      if (elTitle) elTitle.textContent = tip.title;
      if (elBadge) elBadge.textContent = tip.badge || '💡 Novedad del Día';

      if (tip.fruit) {
        if (elFruitIcon) elFruitIcon.textContent = tip.fruit.icon || '🍉';
        if (elFruitName) elFruitName.textContent = tip.fruit.name || 'Alimento Saludable';
        if (elTargetOrgan) elTargetOrgan.textContent = tip.fruit.targetOrgan || 'Cuerpo y Metabolismo';
        if (elKeyNutrient) elKeyNutrient.textContent = tip.fruit.keyNutrient || 'Nutrientes Activos';
        if (elMechanism) elMechanism.textContent = tip.fruit.mechanism || '';
      }

      if (tip.metabolismoTvShort) {
        if (elShortTitle) elShortTitle.textContent = tip.metabolismoTvShort.title || 'Metabolismo TV Short';
        if (elShortCaption) elShortCaption.textContent = tip.metabolismoTvShort.caption || 'Consejo en video de Frank Suárez';
        if (elShortBtn) {
          elShortBtn.onclick = () => {
            const url = tip.metabolismoTvShort.youtubeUrl || 'https://www.youtube.com/@MetabolismoTV/shorts';
            window.open(url, '_blank');
          };
        }
      }

      if (elFrankAdvice) elFrankAdvice.textContent = tip.frankAdvice || '';
      if (elQuickAction) elQuickAction.textContent = tip.quickAction || '';
    }

    this.renderPastTipsList();
  }

  renderPastTipsList() {
    const container = document.getElementById('tips-past-list-container');
    if (!container) return;

    const pastTips = this.getPastTips();
    if (!pastTips || pastTips.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-500 text-center py-3">No hay novedades anteriores archivadas.</p>';
      return;
    }

    container.innerHTML = pastTips.map(pt => `
      <div class="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition-all flex items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-2xl p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
            ${pt.fruit ? pt.fruit.icon : '💡'}
          </span>
          <div class="min-w-0">
            <span class="text-[9px] font-extrabold uppercase tracking-wider text-sky-400">
              ${pt.fruit ? pt.fruit.targetOrgan : 'Metabolismo TV'}
            </span>
            <h4 class="text-xs font-bold text-white truncate mt-0.5">${this.escapeHtml(pt.title)}</h4>
            <p class="text-[10px] text-slate-400 truncate mt-0.5">${this.escapeHtml(pt.frankAdvice)}</p>
          </div>
        </div>
        <button type="button" onclick="window.tipsManager.openTipModal('${pt.id}')" class="px-2.5 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-xs font-bold shrink-0 transition-all active:scale-95">
          Ver →
        </button>
      </div>
    `).join('');
  }

  openTipModal(tipId) {
    const pastTips = this.getPastTips();
    const tip = pastTips.find(t => t.id === tipId) || this.activeTip;
    if (!tip) return;

    if (window.soundEngine) window.soundEngine.playTap();

    const modal = document.getElementById('tip-viewer-modal');
    if (!modal) return;

    const titleEl = document.getElementById('modal-tip-viewer-title');
    const organEl = document.getElementById('modal-tip-viewer-organ');
    const fruitEl = document.getElementById('modal-tip-viewer-fruit');
    const mechEl = document.getElementById('modal-tip-viewer-mechanism');
    const adviceEl = document.getElementById('modal-tip-viewer-advice');
    const btnShort = document.getElementById('modal-tip-viewer-short-btn');

    if (titleEl) titleEl.textContent = tip.title;
    if (organEl && tip.fruit) organEl.textContent = tip.fruit.targetOrgan;
    if (fruitEl && tip.fruit) fruitEl.textContent = `${tip.fruit.icon} ${tip.fruit.name} • ${tip.fruit.keyNutrient}`;
    if (mechEl && tip.fruit) mechEl.textContent = tip.fruit.mechanism;
    if (adviceEl) adviceEl.textContent = tip.frankAdvice;

    if (btnShort && tip.metabolismoTvShort) {
      btnShort.onclick = () => {
        window.open(tip.metabolismoTvShort.youtubeUrl || 'https://www.youtube.com/@MetabolismoTV/shorts', '_blank');
      };
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeTipModal() {
    const modal = document.getElementById('tip-viewer-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  refreshFeedManual() {
    if (window.soundEngine) window.soundEngine.playTap();
    const btn = document.getElementById('btn-refresh-tips-feed');
    if (btn) {
      btn.classList.add('animate-spin');
      setTimeout(() => btn.classList.remove('animate-spin'), 1000);
    }
    this.fetchRemoteFeed();
    if (window.reminderManager && typeof window.reminderManager.showToast === 'function') {
      window.reminderManager.showToast('🔄 Comprobando novedades frescas en la nube...');
    }
  }

  shareTodayTip() {
    if (!this.activeTip) return;
    const text = `💡 Novedad Saludable de Hoy en HabitFlow:
"${this.activeTip.title}"
${this.activeTip.fruit ? this.activeTip.fruit.icon + ' Para tu: ' + this.activeTip.fruit.targetOrgan : ''}
Consejo de Frank Suárez: ${this.activeTip.frankAdvice}
Miralo en HabitFlow Mobile.`;

    if (navigator.share) {
      navigator.share({
        title: this.activeTip.title,
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      if (window.reminderManager && typeof window.reminderManager.showToast === 'function') {
        window.reminderManager.showToast('📋 ¡Tip copiado al portapapeles!');
      }
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

window.tipsManager = new TipsManager();
