/**
 * HabitFlow - Módulos de Hábitos y Consejos de Bienestar
 * Code Ahumada
 */

const WELLNESS_TIPS = [
  {
    id: 'ep-734',
    title: 'La Clave de una Buena Hidratación',
    tag: 'Hidratación',
    icon: '💧',
    summary: 'Consumir la cantidad adecuada de agua según tu peso corporal mantiene tu cuerpo en equilibrio.',
    content: 'Cada célula del cuerpo necesita agua para sus funciones vitales y el transporte de nutrientes. Mantener un consumo adecuado a tu contextura física previene la fatiga, mejora la concentración mental y optimiza el funcionamiento general de tu organismo.'
  },
  {
    id: 'ep-535',
    title: 'Hidratación y Descanso Nocturno',
    tag: 'Descanso',
    icon: '🌙',
    summary: 'El último vaso abundante de agua es ideal tomarlo 1 o 2 horas antes de dormir.',
    content: 'Ingerir grandes volúmenes de líquido justo antes de acostarse puede fragmentar el sueño profundo por la necesidad de orinar. Un descanso continuo favorece la recuperación celular y el equilibrio hormonal. Por ello se aconseja moderar los líquidos en las dos horas previas al sueño.'
  },
  {
    id: 'ep-848',
    title: 'Temperatura del Agua y Digestión',
    tag: 'Digestión',
    icon: '🌡️',
    summary: 'El agua a temperatura ambiente o fresca es la más amigable para tu sistema digestivo.',
    content: 'El agua a temperatura ambiente es asimilada con gran facilidad por el cuerpo sin causar contrastes térmicos bruscos. Facilita la absorción intestinal y acompaña la rutina diaria con total naturalidad.'
  },
  {
    id: 'ep-639',
    title: 'Construir el Hábito Progresivamente',
    tag: 'Hábitos',
    icon: '🧗‍♂️',
    summary: 'Si no solés tomar suficiente agua, aumentá la cantidad de a poco cada día.',
    content: 'Crear un nuevo hábito es un proceso gradual. Si no acostumbras beber suficiente agua diariamente, sumá un vaso adicional cada dos o tres días. En poco tiempo tu cuerpo se habituará a la hidratación natural sin sensación de pesadez.'
  },
  {
    id: 'atp-energy',
    title: 'El Agua y tus Niveles de Energía',
    tag: 'Energía',
    icon: '⚡',
    summary: 'Una hidratación adecuada reduce la fatiga y optimiza la vitalidad diaria.',
    content: 'El agua es el medio biológico en el que se generan los procesos de energía celular. Cuando el cuerpo está bien hidratado, el rendimiento físico y mental se sostiene alto a lo largo de toda la jornada.'
  },
  {
    id: 'meals-rule',
    title: 'Pausas Durante las Comidas',
    tag: 'Digestión',
    icon: '🍽️',
    summary: 'Moderar el líquido durante los platos principales facilita la digestión.',
    content: 'Durante el almuerzo o la cena es preferible no beber cantidades excesivas de agua, de modo que los jugos gástricos actúen de manera óptima sobre los alimentos. Lo más recomendable es beber agua hasta 30 minutos antes de comer o esperar 1 hora después.'
  },
  {
    id: 'diuretic-trap',
    title: 'Café, Mate e Infusiones',
    tag: 'Compensación',
    icon: '☕',
    summary: 'Las infusiones diuréticas requieren un vaso de agua extra para mantener el balance.',
    content: 'Bebidas como el café o el mate poseen propiedades diuréticas naturales. Para asegurar una hidratación corporal neta y positiva, recordá acompañar cada taza de infusión con un vaso de agua fresca.'
  },
  {
    id: 'electrolytes-cell',
    title: 'Minerales y Balance Electrolítico',
    tag: 'Electrolitos',
    icon: '🍋',
    summary: 'El equilibrio de minerales como sodio, potasio y magnesio favorece la hidratación celular.',
    content: 'Para que el agua se distribuya y aproveche eficazmente en los tejidos, el cuerpo necesita electrolitos esenciales. Una alimentación balanceada con frutas, vegetales y sales minerales naturales asegura una absorción celular óptima.'
  }
];

const FRANK_TIPS = WELLNESS_TIPS; // Alias de compatibilidad

class HabitsManager {
  constructor() {
    this.tips = WELLNESS_TIPS;
  }

  renderTipsList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.textContent = ''; // Limpiar de forma segura

    this.tips.forEach((tip) => {
      const card = document.createElement('article');
      card.className = 'glass-card p-4 rounded-2xl border border-sky-900/30 hover:border-sky-500/50 transition-all duration-200 cursor-pointer flex flex-col gap-2 relative overflow-hidden group';
      
      const badge = document.createElement('span');
      badge.className = 'text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 w-fit border border-sky-400/20';
      badge.textContent = tip.tag;

      const header = document.createElement('div');
      header.className = 'flex items-center gap-2.5';

      const iconSpan = document.createElement('span');
      iconSpan.className = 'text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 group-hover:scale-110 transition-transform';
      iconSpan.textContent = tip.icon;

      const title = document.createElement('h4');
      title.className = 'font-semibold text-white text-sm leading-snug';
      title.textContent = tip.title;

      header.appendChild(iconSpan);
      header.appendChild(title);

      const desc = document.createElement('p');
      desc.className = 'text-xs text-slate-300 leading-relaxed pl-1';
      desc.textContent = tip.summary;

      const readMore = document.createElement('div');
      readMore.className = 'text-[11px] font-medium text-sky-400 flex items-center gap-1 mt-1 group-hover:translate-x-1 transition-transform';
      readMore.innerHTML = `<span>Leer consejo completo</span> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;

      card.appendChild(badge);
      card.appendChild(header);
      card.appendChild(desc);
      card.appendChild(readMore);

      card.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playTap();
        this.openTipDetailModal(tip);
      });

      container.appendChild(card);
    });
  }

  openTipDetailModal(tip) {
    const modal = document.getElementById('tip-detail-modal');
    const title = document.getElementById('modal-tip-title');
    const badge = document.getElementById('modal-tip-badge');
    const content = document.getElementById('modal-tip-content');
    const icon = document.getElementById('modal-tip-icon');

    if (!modal) return;

    if (title) title.textContent = tip.title;
    if (badge) badge.textContent = tip.tag;
    if (content) content.textContent = tip.content;
    if (icon) icon.textContent = tip.icon;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  renderHabitsList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const habits = window.storageManager.getExtraHabits();
    container.textContent = '';

    habits.forEach((habit) => {
      const card = document.createElement('div');
      card.className = 'glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3';

      const left = document.createElement('div');
      left.className = 'flex items-center gap-3 min-w-0';

      const iconBox = document.createElement('div');
      iconBox.className = `w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
        habit.active ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-slate-800/80 text-slate-500 border border-slate-700/40'
      }`;

      // Iconos SVG según id
      iconBox.innerHTML = this.getHabitSvg(habit.id);

      const info = document.createElement('div');
      info.className = 'min-w-0';

      const rowTitle = document.createElement('div');
      rowTitle.className = 'flex items-center gap-2';

      const h4 = document.createElement('h4');
      h4.className = 'text-sm font-semibold text-white truncate';
      h4.textContent = habit.title;

      const stateBadge = document.createElement('span');
      stateBadge.className = `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
        habit.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
      }`;
      stateBadge.textContent = habit.active ? 'Activo' : 'Pausado';

      rowTitle.appendChild(h4);
      rowTitle.appendChild(stateBadge);

      const p = document.createElement('p');
      p.className = 'text-xs text-slate-400 truncate';
      p.textContent = habit.subtitle;

      info.appendChild(rowTitle);
      info.appendChild(p);

      left.appendChild(iconBox);
      left.appendChild(info);

      // Switch interactivo
      const switchBtn = document.createElement('button');
      switchBtn.type = 'button';
      switchBtn.className = `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        habit.active ? 'bg-sky-500' : 'bg-slate-700'
      }`;
      switchBtn.setAttribute('role', 'switch');
      switchBtn.setAttribute('aria-checked', habit.active ? 'true' : 'false');

      const circle = document.createElement('span');
      circle.className = `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
        habit.active ? 'translate-x-5' : 'translate-x-0'
      }`;

      switchBtn.appendChild(circle);

      switchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.soundEngine) window.soundEngine.playTap();
        window.storageManager.toggleHabitActive(habit.id);
        this.renderHabitsList(containerId);
      });

      card.appendChild(left);
      card.appendChild(switchBtn);

      container.appendChild(card);
    });
  }

  getHabitSvg(id) {
    if (id === 'posture') {
      return `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`;
    }
    if (id === 'electrolytes') {
      return `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
    }
    if (id === 'steps') {
      return `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>`;
    }
    // sleep
    return `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
  }
}

window.habitsManager = new HabitsManager();
