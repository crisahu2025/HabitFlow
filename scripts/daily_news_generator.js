/**
 * HabitFlow - Generador Autónomo Diario de Novedades y Tips de Metabolismo TV
 * Code Ahumada • Director General Atlas
 * 
 * Se ejecuta automáticamente todos los días a las 06:00 AM (09:00 UTC) mediante GitHub Actions
 * o bajo demanda por el Agente Atlas.
 * 
 * Actualiza data/daily_tips.json con la fruta y órgano del día, consejo de Frank Suárez y Short de YouTube.
 */

const fs = require('fs');
const path = require('path');

const TIPS_POOL = [
  {
    title: 'La Palta y el Corazón: Cómo Calmar el Cortisol y Quemar Grasa',
    category: 'Fruta y Órgano del Día',
    badge: '🥑 Fruta & Órgano',
    fruit: {
      name: 'Palta / Aguacate',
      icon: '🥑',
      targetOrgan: '❤️ Corazón y Glándulas Suprarrenales',
      keyNutrient: 'Potasio Natural (800mg) + Ácido Oleico (Omega-9)',
      mechanism: 'El potasio de la palta contrarresta el sodio celular y desactiva el exceso de cortisol (la hormona del estrés), permitiendo que el cuerpo desinflame el sistema cardiovascular y queme grasa abdominal profunda.'
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
  },
  {
    title: 'El Coco y la Tiroides: Aceite de Coco y Grasa como Combustible',
    category: 'Fruta y Órgano del Día',
    badge: '🥥 Fruta & Órgano',
    fruit: {
      name: 'Coco y Aceite de Coco Virgen',
      icon: '🥥',
      targetOrgan: '🦋 Glándula Tiroides y Metabolismo Basal',
      keyNutrient: 'Ácido Láurico + Triglicéridos de Cadena Media (MCT)',
      mechanism: 'Los MCT del coco van directamente por la vena porta hacia el hígado, donde se convierten en cetonas y energía limpia sin requerir insulina, reactivando la tiroides perezosa.'
    },
    metabolismoTvShort: {
      title: 'El aceite de coco no engorda: despierta tu tiroides',
      youtubeUrl: 'https://www.youtube.com/@MetabolismoTV/shorts',
      caption: 'Frank Suárez explica por qué el aceite de coco es el acelerador metabólico por excelencia.'
    },
    frankAdvice: 'Empezá con 1/2 cucharadita por la mañana con tu café o té. Aumentará tu temperatura corporal porque tu metabolismo empieza a quemar.',
    quickAction: 'Sumá 1/2 cucharadita de aceite de coco a tu desayuno metabólico de hoy.'
  },
  {
    title: 'La Sandía y los Riñones: Limpieza y Eliminación de Ácido Úrico',
    category: 'Fruta y Órgano del Día',
    badge: '🍉 Fruta & Órgano',
    fruit: {
      name: 'Sandía Fresca',
      icon: '🍉',
      targetOrgan: '💧 Riñones y Vías Urinarias',
      keyNutrient: 'Citrulina + 92% Agua Biológica Estructurada',
      mechanism: 'La citrulina se transforma en L-arginina, promoviendo la dilatación vascular en los glomérulos renales y ayudando a barrer sedimentos y exceso de ácido úrico.'
    },
    metabolismoTvShort: {
      title: 'La citrulina: el aminoácido para la circulación',
      youtubeUrl: 'https://www.youtube.com/@MetabolismoTV/shorts',
      caption: 'Frank Suárez explica cómo mejorar el flujo sanguíneo hacia los riñones y extremidades.'
    },
    frankAdvice: 'La sandía es muy diurética pero tiene índice glucémico moderado. Comé un triángulo pequeño solo después de una comida rica en proteínas.',
    quickAction: 'Disfrutá de 1 rodaja fina de sandía bien fría como postre medido de tu almuerzo.'
  }
];

function generateDailyTip() {
  const filePath = path.resolve(__dirname, '..', 'data', 'daily_tips.json');
  let currentFeed = { updatedAt: '', renewalHour: 6, todayTip: null, pastTips: [] };

  if (fs.existsSync(filePath)) {
    try {
      currentFeed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.warn('Error leyendo feed existente:', e.message);
    }
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Calcular índice según el día del año para que rote coherentemente
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const tipTemplate = TIPS_POOL[dayOfYear % TIPS_POOL.length];

  const newTodayTip = {
    id: `tip-${todayStr}`,
    date: todayStr,
    title: tipTemplate.title,
    category: tipTemplate.category,
    badge: tipTemplate.badge,
    fruit: tipTemplate.fruit,
    metabolismoTvShort: tipTemplate.metabolismoTvShort,
    frankAdvice: tipTemplate.frankAdvice,
    quickAction: tipTemplate.quickAction
  };

  // Si ya existía un todayTip y es de una fecha anterior, archivarlo en pastTips
  if (currentFeed.todayTip && currentFeed.todayTip.date !== todayStr) {
    if (!Array.isArray(currentFeed.pastTips)) currentFeed.pastTips = [];
    // Evitar duplicados
    currentFeed.pastTips = currentFeed.pastTips.filter(t => t.id !== currentFeed.todayTip.id);
    currentFeed.pastTips.unshift(currentFeed.todayTip);
    if (currentFeed.pastTips.length > 14) currentFeed.pastTips.pop(); // Retener 14 días
  }

  currentFeed.updatedAt = now.toISOString();
  currentFeed.renewalHour = 6;
  currentFeed.channel = 'Metabolismo TV (Frank Suárez)';
  currentFeed.todayTip = newTodayTip;

  fs.writeFileSync(filePath, JSON.stringify(currentFeed, null, 2), 'utf-8');
  console.log(`✨ Novedad del día generada exitosamente para ${todayStr}: "${newTodayTip.title}"`);
}

generateDailyTip();
