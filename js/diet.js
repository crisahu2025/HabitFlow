/**
 * HabitFlow - Módulo de Nutrición y Dieta 3x1 de Frank Suárez
 * Code Ahumada • Director Cristian
 * 
 * Basado en las investigaciones de Frank Suárez (NaturalSlim / Metabolismo TV):
 * - 3/4 partes (75%) del plato: Alimentos Tipo A (Amigos que Adelgazan / poca glucosa e insulina).
 * - 1/4 parte (25%) del plato: Alimentos Tipo E (Enemigos que Engordan / mucha glucosa e insulina).
 * 
 * Funcionalidades:
 * 1. Escáner y análisis fotográfico de platos con estimación de calorías y proporción 3x1 (Offline y Gemini Vision opcional).
 * 2. Recetario metabólico saludable clasificado por Desayunos, Almuerzos, Meriendas y Cenas.
 * 3. Gráfico interactivo del plato 3x1 y catálogo de alimentos Tipo A vs Tipo E.
 * 4. Registro diario de comidas con sumatoria de calorías y balance metabólico.
 */

const DIET_RECIPES = [
  // ==========================================
  // DESAYUNOS 3x1
  // ==========================================
  {
    id: 'rec_desayuno_1',
    category: 'desayuno',
    title: 'Omelette de Espinaca, Champiñones y Queso con Tostada Integral',
    emoji: '🍳',
    prepTime: '12 min',
    calories: 380,
    protein: 26,
    carbs: 16,
    fat: 24,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Desayuno proteico de alto impacto metabólico para despertar la quema de grasa sin picos de insulina.',
    itemsA: [
      '3 huevos de campo enteros',
      '1 taza de espinacas frescas picadas',
      '1/2 taza de champiñones salteados',
      '40g de queso mozzarella o cuartirolo',
      '1 cucharada de aceite de oliva virgen extra'
    ],
    itemsE: [
      '1 rebanada fina de pan integral o masa madre tostada'
    ],
    instructions: [
      'Batir los 3 huevos en un bol con una pizca de sal marina y pimienta.',
      'En una sartén antiadherente con aceite de oliva, saltear los champiñones y las espinacas durante 2 minutos hasta que reduzcan.',
      'Verter los huevos batidos sobre los vegetales y cocinar a fuego medio-bajo.',
      'Cuando empiece a cuajar, colocar el queso en una mitad y doblar el omelette en media luna.',
      'Servir caliente acompañado por la única rebanada de pan integral tostada (el 25% Tipo E).'
    ],
    frankTip: 'El desayuno es sagrado en el sistema 3x1. Comer huevos y proteínas de calidad temprano activa la tiroides y suprime la hormona grelina (hormona del hambre) por el resto del día.'
  },
  {
    id: 'rec_desayuno_2',
    category: 'desayuno',
    title: 'Huevos Revueltos, Panceta Crocante, Media Palta y Frutillas',
    emoji: '🥓',
    prepTime: '10 min',
    calories: 420,
    protein: 24,
    carbs: 11,
    fat: 32,
    typeAPercent: 80,
    typeEPercent: 20,
    summary: 'Keto-friendly y metabólico. Grasas saludables y proteínas densas que brindan saciedad prolongada.',
    itemsA: [
      '2 a 3 huevos revueltos con manteca clarificada',
      '2 tiras de panceta o tocino natural crocante',
      '1/2 palta fileteada con sal marina y limón'
    ],
    itemsE: [
      '4 a 5 frutillas / fresas frescas picadas (carbohidrato natural controlado)'
    ],
    instructions: [
      'Dorar la panceta en la sartén hasta que quede crocante y reservar.',
      'En la misma sartén con el fuego bajo, revolver los huevos suavemente hasta lograr una textura cremosa.',
      'Filetear la media palta y rociarla con gotas de jugo de limón y sal marina.',
      'Emplatar: 3/4 del plato ocupado por los huevos, la panceta y la palta (Tipo A), y en la esquina restante las frutillas frescas (Tipo E).'
    ],
    frankTip: 'La palta es un superalimento para el metabolismo porque es rica en potasio y magnesio, dos minerales que calman el sistema nervioso excitado y estabilizan la glucosa.'
  },
  {
    id: 'rec_desayuno_3',
    category: 'desayuno',
    title: 'Batido Metabólico de Proteína, Leche de Almendras y Frutos Rojos',
    emoji: '🥤',
    prepTime: '5 min',
    calories: 310,
    protein: 28,
    carbs: 14,
    fat: 15,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Ideal para mañanas con poco tiempo. Rápido, fresco y con aceite de coco para estimular el hígado y la tiroides.',
    itemsA: [
      '1 scoop (30g) de proteína isolate de suero o vegetal',
      '250 ml de leche de almendras sin azúcar añadida',
      '1 cucharadita de aceite de coco virgen',
      '1 cucharada de semillas de chía hidratadas'
    ],
    itemsE: [
      '1/3 taza de frutos rojos (arándanos o frambuesas)'
    ],
    instructions: [
      'Colocar en la licuadora la leche de almendras fría y la proteína.',
      'Añadir el aceite de coco y las semillas de chía.',
      'Incorporar los frutos rojos.',
      'Licuar a máxima potencia durante 45 segundos hasta obtener una consistencia sedosa y homogénea.',
      'Beber de inmediato en sorbos pausados.'
    ],
    frankTip: 'Los triglicéridos de cadena media (MCT) del aceite de coco van directo al hígado para producir energía celular inmediata en lugar de almacenarse como grasa.'
  },
  {
    id: 'rec_desayuno_4',
    category: 'desayuno',
    title: 'Tostón 3x1 con Pasta de Palta, Huevos Poché y Semillas',
    emoji: '🥑',
    prepTime: '15 min',
    calories: 360,
    protein: 18,
    carbs: 18,
    fat: 23,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'El clásico moderno adaptado al plato 3x1. La yema líquida aporta colina y nutrientes esenciales.',
    itemsA: [
      '2 huevos poché o pasados por agua',
      '1/2 palta pisada con aceite de oliva virgen extra',
      '1 cucharada de mix de semillas (sésamo, chía y girasol)',
      'Hojas de rúcula fresca'
    ],
    itemsE: [
      '1 rebanada de pan de semillas o centeno tostada'
    ],
    instructions: [
      'Tostar la rebanada de pan de semillas hasta que quede bien crocante.',
      'Pisar la palta con un tenedor agregando aceite de oliva, sal marina y pimienta.',
      'Untar la palta generosamente sobre la tostada y cubrir con las hojas de rúcula.',
      'Cocinar los 2 huevos poché en agua tibia con un chorrito de vinagre durante 3 minutos.',
      'Montar los huevos sobre la palta y espolvorear con las semillas tostadas.'
    ],
    frankTip: 'Las semillas aportan fibra soluble que ralentiza la digestión de los carbohidratos, evitando que la glucosa en sangre se dispare de golpe.'
  },

  // ==========================================
  // ALMUERZOS 3x1
  // ==========================================
  {
    id: 'rec_almuerzo_1',
    category: 'almuerzo',
    title: 'Pechuga a las Hierbas con Ensalada César Metabólica y Puré Rústico',
    emoji: '🍗',
    prepTime: '20 min',
    calories: 490,
    protein: 44,
    carbs: 22,
    fat: 24,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Pechuga tierna y jugosa con hojas verdes crujientes y una porción justa de puré de batata o calabaza.',
    itemsA: [
      '180g de pechuga de pollo marinada con orégano y limón',
      '2 tazas de lechuga romana o criolla fresca',
      '30g de queso parmesano en lascas finas',
      'Aderezo a base de yogur griego natural, aceite de oliva y mostaza'
    ],
    itemsE: [
      '1/2 taza pequeña de puré de batata o calabaza asada (1/4 del plato)'
    ],
    instructions: [
      'Cocinar la pechuga de pollo a la plancha a fuego medio 6 minutos por lado para que conserve los jugos.',
      'Lavar y cortar la lechuga romana en trozos grandes. Mezclar con el aderezo de yogur, oliva y parmesano.',
      'Hervir o asar la batata/calabaza y pisarla con una pizca de manteca y nuez moscada.',
      'Armar el plato: llenar 3/4 partes con el pollo en rodajas y la ensalada César (Tipo A), y el 1/4 restante con el puré (Tipo E).'
    ],
    frankTip: 'En el almuerzo, masticar despacio y comer primero la proteína y las verduras hace que el estómago secrete ácido clorhídrico adecuadamente, facilitando una digestión ligera.'
  },
  {
    id: 'rec_almuerzo_2',
    category: 'almuerzo',
    title: 'Bife de Lomo con Salteado de Vegetales al Wok y Arroz Integral',
    emoji: '🥩',
    prepTime: '18 min',
    calories: 520,
    protein: 46,
    carbs: 24,
    fat: 26,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Carne vacuna rica en hierro y zinc con brócoli, morrones salteados y una porción medida de arroz.',
    itemsA: [
      '180g de bife de lomo, cuadril o bife angosto',
      '1 taza de floretes de brócoli al vapor',
      '1 taza de pimientos rojos, cebolla morada y zapallitos salteados al wok',
      '1 cucharada de aceite de oliva virgen extra'
    ],
    itemsE: [
      '3 cucharadas soperas colmadas (1/4 plato) de arroz integral o yamani'
    ],
    instructions: [
      'Saltear los vegetales en un wok o sartén bien caliente con aceite de oliva y sal hasta que queden al dente.',
      'Cocinar el bife a la plancha bien caliente al punto deseado (jugoso o a punto).',
      'Servir el arroz integral en un solo cuadrante del plato (1/4).',
      'Completar el resto del plato con la carne cortada en tiras y el abundate salteado de vegetales crocantes.'
    ],
    frankTip: 'El brócoli contiene sulforafano y clorofila que ayudan al hígado a desintoxicar estrógenos y metales pesados, mejorando la respuesta metabólica a la insulina.'
  },
  {
    id: 'rec_almuerzo_3',
    category: 'almuerzo',
    title: 'Filet de Pescado con Espárragos Grillados, Tomates y Papa al Horno',
    emoji: '🐟',
    prepTime: '22 min',
    calories: 460,
    protein: 38,
    carbs: 21,
    fat: 23,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Pescado liviano de rápida asimilación con espárragos depurativos y papines con piel al romero.',
    itemsA: [
      '200g de filet de merluza, lenguado o salmón fresco',
      '1 manojo de espárragos verdes grillados con ajo picado',
      '1 taza de tomates cherry asados con orégano y aceite de oliva'
    ],
    itemsE: [
      '1 papa chica al horno con piel cortada en gajos y pimentón ahumado'
    ],
    instructions: [
      'Hornear la papa chica en gajos con piel rociada con oliva y pimentón a 200°C por 20 minutos.',
      'En una sartén con oliva dorar los espárragos y los tomates cherry por 5 minutos.',
      'Cocinar el filet de pescado a la plancha vuelta y vuelta con gotas de limón.',
      'Distribuir el pescado, los espárragos y los tomates en 3/4 del plato. Colocar los gajos de papa en el 1/4 restante.'
    ],
    frankTip: 'Comer la papa con piel conserva su fibra y reduce su índice glucémico. El pescado es la proteína más amigable para personas con sistema nervioso excitado.'
  },
  {
    id: 'rec_almuerzo_4',
    category: 'almuerzo',
    title: 'Guisado de Pollo y Vegetales Sin Almidón con Porción de Mandioca o Arroz',
    emoji: '🍲',
    prepTime: '25 min',
    calories: 440,
    protein: 38,
    carbs: 24,
    fat: 18,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Plato tradicional reconfortante donde los vegetales verdes y la carne forman la base y el almidón se limita.',
    itemsA: [
      '180g de cubos de pechuga o muslo de pollo sin piel',
      '1 taza de zapallitos verdes (zucchini) cortados en cubos',
      '1/2 taza de zanahoria en rodajas finas',
      '1 taza de salsa de tomates naturales triturados con cebolla y apio'
    ],
    itemsE: [
      '1 trozo chico de mandioca hervida o 1/4 taza de arroz blanco cocido'
    ],
    instructions: [
      'Dorar el pollo en cubos con una pizca de pimentón, comino y sal.',
      'Agregar la cebolla, el apio, los zapallitos y la zanahoria picada.',
      'Incorporar la salsa de tomate natural y cocinar tapado a fuego lento durante 15 minutos.',
      'Servir en plato hondo: 3/4 del plato con el guisado de pollo y verduras, y 1/4 con la mandioca o el arroz.'
    ],
    frankTip: 'En un guiso tradicional se suele abusar de la papa y el arroz. Al reemplazar la mayor parte con zapallitos y apio, obtenés el mismo sabor pero con una fracción de la glucosa.'
  },

  // ==========================================
  // MERIENDAS 3x1
  // ==========================================
  {
    id: 'rec_merienda_1',
    category: 'merienda',
    title: 'Yogur Griego Natural con Nueces, Canela y Arándanos',
    emoji: '🫐',
    prepTime: '3 min',
    calories: 260,
    protein: 19,
    carbs: 14,
    fat: 14,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'La merienda perfecta para evitar la ansiedad por dulces a media tarde. Fresco, cremoso y saciante.',
    itemsA: [
      '1 pote (150g) de yogur griego natural sin azúcar añadido',
      '1 puñado (20g) de nueces y almendras troceadas',
      '1 pizca abundante de canela de Ceilán en polvo'
    ],
    itemsE: [
      '1/4 taza de arándanos frescos o 1 cucharadita de miel pura'
    ],
    instructions: [
      'Servir el yogur griego bien frío en un cuenco o copa de vidrio.',
      'Espolvorear la canela de Ceilán sobre el yogur.',
      'Añadir las nueces y almendras crocantes por encima.',
      'Decorar con los arándanos frescos (el componente Tipo E de la merienda).'
    ],
    frankTip: 'La canela tiene propiedades comprobadas para imitar la acción de la insulina a nivel celular, ayudando a que las células absorban la glucosa sin necesidad de que el páncreas trabaje de más.'
  },
  {
    id: 'rec_merienda_2',
    category: 'merienda',
    title: 'Rollitos de Jamón Natural y Queso con Bastones de Pepino y Grisines',
    emoji: '🧀',
    prepTime: '5 min',
    calories: 240,
    protein: 20,
    carbs: 12,
    fat: 13,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Snack salado de digestión rápida. Ideal para llevar al trabajo o estudio.',
    itemsA: [
      '3 fetas de jamón cocido natural de primera calidad',
      '3 bastones de queso gouda, provolone o dambo',
      '1 taza de bastones de pepino fresco y apio crujiente con queso crema'
    ],
    itemsE: [
      '2 grisines integrales o 2 galletas de arroz'
    ],
    instructions: [
      'Enrollar cada feta de jamón cocido alrededor de un bastón de queso.',
      'Cortar el pepino y el apio en bastones largos.',
      'Servir los rollitos de jamón y queso con los bastones frescos (Tipo A).',
      'Acompañar con solo 2 grisines integrales para cumplir la regla del 25% Tipo E.'
    ],
    frankTip: 'Si a media tarde sentís un bajón de energía, muchas veces no es hambre sino deshidratación celular. Tomá un buen vaso de agua con limón 10 minutos antes de merendar.'
  },
  {
    id: 'rec_merienda_3',
    category: 'merienda',
    title: 'Pudín de Chía con Leche de Coco y Frutas Frescas',
    emoji: '🥥',
    prepTime: '5 min (reposo previo)',
    calories: 230,
    protein: 8,
    carbs: 13,
    fat: 16,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Rico en omega 3 y fibra prebiótica. Favorece el tránsito intestinal y la salud digestiva.',
    itemsA: [
      '2 cucharadas soperas de semillas de chía',
      '150 ml de leche de coco sin azúcar',
      '1 cucharadita de extracto de vainilla puro',
      '1 cucharada de nueces pecanas picadas'
    ],
    itemsE: [
      '1/2 kiwi o 3 frutillas cortadas en rodajas finas'
    ],
    instructions: [
      'Mezclar en un vaso la leche de coco con las semillas de chía y la vainilla. Dejar reposar en heladera al menos 30 minutos (o toda la noche).',
      'Una vez que las semillas hayan gelificado formando el pudín, retirar del frío.',
      'Añadir las nueces pecanas por encima.',
      'Completar con las rodajas de kiwi o frutilla en la superficie.'
    ],
    frankTip: 'El mucílago que desprenden las semillas de chía protege las paredes gástricas e impide la absorción violenta de carbohidratos en el torrente sanguíneo.'
  },
  {
    id: 'rec_merienda_4',
    category: 'merienda',
    title: 'Café o Té con Crema, Almendras Tostadas y Chocolate 70%',
    emoji: '☕',
    prepTime: '4 min',
    calories: 210,
    protein: 6,
    carbs: 9,
    fat: 18,
    typeAPercent: 80,
    typeEPercent: 20,
    summary: 'Placer gourmet metabólico. La grasa de la crema suaviza la cafeína y brinda claridad mental.',
    itemsA: [
      '1 taza de café espresso o té verde recién infusionado',
      '2 cucharadas de crema de leche espesa (nata pura)',
      '15 almendras tostadas sin sal agregada'
    ],
    itemsE: [
      '1 cuadrado (15g) de chocolate amargo al 70% u 80% cacao'
    ],
    instructions: [
      'Preparar el café o té caliente a gusto.',
      'Añadir la crema de leche y mezclar con cuchara hasta integrar (sin azúcar ni endulzantes artificiales agresivos).',
      'Servir en un plato las 15 almendras tostadas.',
      'Disfrutar del cuadrado de chocolate amargo saboreándolo lentamente con el café.'
    ],
    frankTip: 'La crema de leche contiene grasa pura que no estimula la producción de insulina. Por eso es mucho más favorable para el metabolismo que la leche descremada, que está cargada de lactosa (azúcar).'
  },

  // ==========================================
  // CENAS LIGERAS 3x1
  // ==========================================
  {
    id: 'rec_cena_1',
    category: 'cena',
    title: 'Ensalada Tibia de Atún, Huevos Duros, Rúcula y Crutones',
    emoji: '🥗',
    prepTime: '10 min',
    calories: 410,
    protein: 38,
    carbs: 15,
    fat: 22,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Cena rápida y ultra liviana. Favorece un sueño profundo al no sobrecargar el hígado por la noche.',
    itemsA: [
      '1 lata (160g) de atún al natural o en aceite de oliva escurrido',
      '2 huevos duros cortados en cuartos',
      '2 tazas de hojas de rúcula y espinaca baby',
      '6 tomates cherry y 4 aceitunas negras',
      '1 cucharada de aceite de oliva virgen extra y sal marina'
    ],
    itemsE: [
      '1 puñadito pequeño (20g) de crutones de pan integral tostados con orégano'
    ],
    instructions: [
      'Disponer la base de hojas verdes en un plato hondo o ensaladera.',
      'Distribuir el atún desmenuzado, los tomates cherry y las aceitunas negras.',
      'Colocar los cuartos de huevo duro.',
      'Condimentar con abundante aceite de oliva y sal marina.',
      'Coronar con los crutones de pan integral crocantes (Tipo E).'
    ],
    frankTip: 'Por la noche el metabolismo entra en fase de reparación. Una cena rica en magnesio (hojas verdes) y triptófano (huevos y atún) induce la producción natural de melatonina para descansar como un bebé.'
  },
  {
    id: 'rec_cena_2',
    category: 'cena',
    title: 'Medallones de Carne Caseros con Queso, Ensalada y Choclo Asado',
    emoji: '🍔',
    prepTime: '15 min',
    calories: 470,
    protein: 44,
    carbs: 18,
    fat: 24,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Hamburguesa al plato sin pan. Todo el sabor de la carne asada con queso fundido y vegetales frescos.',
    itemsA: [
      '2 medallones caseros de carne vacuna picada magra con especias',
      '2 fetas de queso gouda o mozzarella derretido sobre la carne',
      'Ensalada fresca de lechuga, cebolla morada y pepino con aceite de oliva'
    ],
    itemsE: [
      '1/3 de mazorca de choclo o maíz asado a la plancha'
    ],
    instructions: [
      'Dorar los medallones de carne en plancha caliente 4 minutos por lado.',
      'Colocar las fetas de queso encima en el último minuto y tapar para que fundan.',
      'En una esquina de la plancha, dorar el tercio de choclo.',
      'Armar la ensalada fresca con lechuga, cebolla y pepino rociada con oliva.',
      'Servir en el plato: 3/4 partes con las hamburguesas con queso y la ensalada, y 1/4 con el choclo asado.'
    ],
    frankTip: 'Comer la hamburguesa sin el pan tradicional elimina el 80% de los carbohidratos refinados de la comida sin sacrificar nada del sabor.'
  },
  {
    id: 'rec_cena_3',
    category: 'cena',
    title: 'Revuelto Gramajo Saludable 3x1 con Papas Rústicas al Horno',
    emoji: '🍳',
    prepTime: '18 min',
    calories: 390,
    protein: 28,
    carbs: 21,
    fat: 20,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Versión adaptada del clásico rioplatense. Papas horneadas en cubitos controladas al 25% y mucho huevo y jamón.',
    itemsA: [
      '3 huevos de campo batidos',
      '80g de jamón cocido natural cortado en tiritas',
      '1/2 taza de arvejas frescas cocidas',
      '1 planta de cebolla de verdeo rehogada con oliva'
    ],
    itemsE: [
      '1/2 papa chica cortada en cubitos horneada con pimentón (no frita)'
    ],
    instructions: [
      'Hornear los cubitos de papa con una cucharadita de oliva a fuego fuerte hasta que estén dorados y tiernos.',
      'En una sartén antiadherente saltear la cebolla de verdeo y las tiritas de jamón.',
      'Agregar las arvejas y los cubitos de papa horneados.',
      'Bajar el fuego a mínimo, volcar los huevos batidos y revolver lentamente hasta que queden húmedos y cremosos.',
      'Retirar del fuego de inmediato y servir caliente con perejil fresco picado.'
    ],
    frankTip: 'En el revuelto tradicional las papas fritas dominan todo el plato. Al hornearlas y mantenerlas en el 25% del volumen total, transformás un plato pesado en una cena metabólica perfecta.'
  },
  {
    id: 'rec_cena_4',
    category: 'cena',
    title: 'Tacos en Hoja de Lechuga con Carne Especiada, Palta y Tortilla de Maíz',
    emoji: '🌮',
    prepTime: '15 min',
    calories: 430,
    protein: 36,
    carbs: 19,
    fat: 23,
    typeAPercent: 75,
    typeEPercent: 25,
    summary: 'Estilo tex-mex saludable. Hojas de lechuga crocantes que reemplazan las harinas con guacamole casero.',
    itemsA: [
      '180g de carne molida magra o pollo desmechado con comino, ajo y pimentón',
      '4 hojas grandes de lechuga mantecosa o capuchina como base',
      '1/2 palta pisada con tomate en cubos y cilantro (guacamole)',
      '30g de queso rallado'
    ],
    itemsE: [
      '1 tortilla pequeña de maíz tostada cortada en triángulos (nachos caseros)'
    ],
    instructions: [
      'Cocinar la carne con las especias mexicanas hasta que esté dorada y bien sabrosa.',
      'Lavar y secar con cuidado las hojas de lechuga para que sirvan de barquitas o wraps.',
      'Rellenar las hojas de lechuga con la carne caliente, una cucharada de guacamole y queso rallado.',
      'Servir los 4 wraps de lechuga ocupando los 3/4 del plato, y en el cuarto restante los triángulos de tortilla de maíz.'
    ],
    frankTip: 'Usar hojas de lechuga como envoltorio te permite comer tacos deliciosos cuantas veces quieras sin elevar la glucosa en sangre.'
  }
];

const FOOD_CATALOG = {
  typeA: [
    { name: 'Pechuga de Pollo y Pavo', icon: '🍗', desc: 'Proteína magra de alto valor biológico.' },
    { name: 'Carne Vacuna Magra y Cerdo', icon: '🥩', desc: 'Ricas en hierro, carnitina y zinc.' },
    { name: 'Pescados Blancos y Azules', icon: '🐟', desc: 'Merluza, salmón, atún, ricos en Omega-3.' },
    { name: 'Huevos Enteros de Campo', icon: '🥚', desc: 'Proteína perfecta con colina para el cerebro.' },
    { name: 'Quesos Enteros', icon: '🧀', desc: 'Gouda, parmesano, mozzarella, cuartirolo.' },
    { name: 'Hojas Verdes y Ensaladas', icon: '🥬', desc: 'Espinaca, rúcula, lechuga, acelga, kale.' },
    { name: 'Vegetales Sin Almidón', icon: '🥦', desc: 'Brócoli, coliflor, espárragos, zapallitos, apio.' },
    { name: 'Palta / Aguacate', icon: '🥑', desc: 'Potasio, magnesio y grasas monoinsaturadas.' },
    { name: 'Aceite de Oliva y Coco', icon: '🫒', desc: 'Grasas que activan el metabolismo celular.' },
    { name: 'Frutos Secos y Semillas', icon: '🥜', desc: 'Almendras, nueces, semillas de chía, sésamo.' }
  ],
  typeE: [
    { name: 'Pan Blanco e Integral', icon: '🍞', desc: 'Gran concentrador de glucosa en sangre.' },
    { name: 'Pastas y Harinas de Trigo', icon: '🍝', desc: 'Fideos, masas de tarta, empanadas, pizzas.' },
    { name: 'Arroz Blanco y Granos', icon: '🍚', desc: 'Eleva con rapidez la insulina.' },
    { name: 'Papas y Batatas', icon: '🥔', desc: 'Tubérculos ricos en almidón rápido.' },
    { name: 'Maíz y Choclo', icon: '🌽', desc: 'Fructosa y carbohidratos densos.' },
    { name: 'Gaseosas y Jugos Dulces', icon: '🥤', desc: 'Líquidos con alta carga de azúcar o jarabes.' },
    { name: 'Dulces, Tortas y Helados', icon: '🍰', desc: 'Combinación grasa + azúcar de rápido almacenaje.' }
  ]
};

class DietManager {
  constructor() {
    this.currentSubTab = 'scanner'; // 'scanner' | 'plate' | 'recipes' | 'log'
    this.selectedRecipeCategory = 'all';
    this.currentSearchQuery = '';
    this.scannedImageBase64 = null;
    this.analysisResult = null;
    this.activeDetectedItems = {
      itemsA: [],
      itemsE: []
    };
  }

  init() {
    this.setupListeners();
    this.renderDietSection();
  }

  setupListeners() {
    // Input de foto de plato
    const photoInput = document.getElementById('diet-photo-input');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.handlePhotoSelected(e));
    }

    // Buscador de recetas en vivo
    const searchInput = document.getElementById('diet-recipe-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearchQuery = e.target.value.toLowerCase().trim();
        this.renderRecipeList();
      });
    }
  }

  renderDietSection() {
    this.renderTodaySummaryCard();
    this.renderSubTabNavigation();
    this.renderTodayMealLog();
    this.renderRecipeList();
    this.renderFoodCatalog();
  }

  // --- Resumen de Hoy y Barra de Progreso Metabólico ---
  renderTodaySummaryCard() {
    if (!window.storageManager) return;
    const mealsData = window.storageManager.getTodayMeals();
    const meals = mealsData.meals || [];

    const totalCals = meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
    const avgTypeA = meals.length > 0
      ? Math.round(meals.reduce((sum, m) => sum + (Number(m.typeAPercent) || 75), 0) / meals.length)
      : 75;
    const avgTypeE = 100 - avgTypeA;

    const elTotalCals = document.getElementById('diet-today-calories');
    const elRatioBarA = document.getElementById('diet-ratio-bar-a');
    const elRatioBarE = document.getElementById('diet-ratio-bar-e');
    const elRatioLabelA = document.getElementById('diet-ratio-label-a');
    const elRatioLabelE = document.getElementById('diet-ratio-label-e');
    const elCountBadge = document.getElementById('diet-meals-count-badge');

    if (elTotalCals) elTotalCals.textContent = `${totalCals.toLocaleString('es-AR')} kcal`;
    if (elCountBadge) elCountBadge.textContent = `${meals.length} comida${meals.length === 1 ? '' : 's'}`;

    if (elRatioBarA) elRatioBarA.style.width = `${avgTypeA}%`;
    if (elRatioBarE) elRatioBarE.style.width = `${avgTypeE}%`;
    if (elRatioLabelA) elRatioLabelA.textContent = `${avgTypeA}% Tipo A`;
    if (elRatioLabelE) elRatioLabelE.textContent = `${avgTypeE}% Tipo E`;
  }

  // --- Sub-navegación interna ---
  renderSubTabNavigation() {
    document.querySelectorAll('.diet-subtab-btn').forEach(btn => {
      const tab = btn.getAttribute('data-subtab');
      const isActive = tab === this.currentSubTab;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.classList.add('bg-sky-500', 'text-white', 'shadow-md');
        btn.classList.remove('text-slate-400', 'hover:text-white', 'bg-slate-800/60');
      } else {
        btn.classList.remove('bg-sky-500', 'text-white', 'shadow-md');
        btn.classList.add('text-slate-400', 'hover:text-white', 'bg-slate-800/60');
      }
    });

    // Mostrar contenedor correspondiente
    document.querySelectorAll('.diet-subtab-content').forEach(container => {
      const isTarget = container.id === `diet-view-${this.currentSubTab}`;
      container.classList.toggle('hidden', !isTarget);
    });
  }

  switchSubTab(subTabName) {
    if (window.soundEngine) window.soundEngine.playTap();
    this.currentSubTab = subTabName;
    this.renderSubTabNavigation();
  }

  // ==========================================
  // ESCÁNER Y ANÁLISIS DE FOTO
  // ==========================================
  triggerPhotoPicker() {
    if (window.soundEngine) window.soundEngine.playTap();
    const input = document.getElementById('diet-photo-input');
    if (input) {
      input.value = '';
      input.click();
    }
  }

  handlePhotoSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.compressAndProcessImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  compressAndProcessImage(base64DataUrl) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 720;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Comprimir a JPEG ligero (máximo ~70KB) para que sea instantáneo y liviano
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
      this.scannedImageBase64 = compressedDataUrl;

      // Abrir modal de análisis con animación de escaneo láser
      this.openScannerModal(compressedDataUrl, ctx, width, height);
    };
    img.src = base64DataUrl;
  }

  openScannerModal(imageDataUrl, canvasCtx, width, height) {
    const modal = document.getElementById('diet-scanner-modal');
    const previewImg = document.getElementById('diet-scanner-preview');
    const laser = document.getElementById('diet-scanner-laser');
    const statusText = document.getElementById('diet-scanner-status-text');
    const resultCard = document.getElementById('diet-scanner-results');

    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (previewImg) previewImg.src = imageDataUrl;
    if (laser) laser.classList.remove('hidden');
    if (resultCard) resultCard.classList.add('hidden');
    if (statusText) {
      statusText.textContent = 'Analizando distribución y componentes del plato 3x1...';
      statusText.className = 'text-xs font-semibold text-sky-400 animate-pulse text-center';
    }

    // Iniciar escaneo: Si hay Gemini API Key configurada, usar IA Vision. De lo contrario, usar motor inteligente local.
    const geminiKey = window.storageManager ? window.storageManager.getGeminiApiKey() : '';

    setTimeout(async () => {
      let analysis = null;

      if (geminiKey) {
        try {
          if (statusText) statusText.textContent = 'Conectando con Google Gemini Vision...';
          analysis = await this.analyzeWithGeminiVision(imageDataUrl, geminiKey);
        } catch (e) {
          console.warn('[Diet Gemini Vision Fallback]', e);
          analysis = this.analyzeWithLocalEngine(canvasCtx, width, height);
        }
      } else {
        analysis = this.analyzeWithLocalEngine(canvasCtx, width, height);
      }

      this.analysisResult = analysis;
      this.activeDetectedItems = {
        itemsA: [...analysis.itemsA],
        itemsE: [...analysis.itemsE]
      };

      if (laser) laser.classList.add('hidden');
      if (statusText) {
        statusText.textContent = '✓ Plato analizado con éxito';
        statusText.className = 'text-xs font-bold text-emerald-400 text-center';
      }

      this.renderScannerResultsUI(analysis);
    }, 1200);
  }

  closeScannerModal() {
    const modal = document.getElementById('diet-scanner-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // --- Analizador Local Inteligente (Offline y Rápido) ---
  analyzeWithLocalEngine(ctx, width, height) {
    // Muestreo de colores en el canvas para detectar verdes (vegetales), tonos cálidos (proteínas/carnes) y claros/almidones
    let greenPixels = 0;
    let warmPixels = 0;
    let palePixels = 0;

    try {
      const imgData = ctx.getImageData(0, 0, width, height).data;
      const step = 4 * 16; // muestreo cada 16 píxeles para velocidad instantánea
      for (let i = 0; i < imgData.length; i += step) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];

        // Detección de vegetales verdes
        if (g > r + 15 && g > b + 15) {
          greenPixels++;
        }
        // Detección de proteínas doradas/carnes
        else if (r > 120 && g > 60 && b < 100 && r > g) {
          warmPixels++;
        }
        // Detección de harinas/arroz/almidones claros
        else if (r > 170 && g > 160 && b > 140 && Math.abs(r - g) < 25) {
          palePixels++;
        }
      }
    } catch (e) {
      // En caso de bloqueo por cross-origin o fallback
    }

    const totalSamples = greenPixels + warmPixels + palePixels || 1;
    const greenRatio = greenPixels / totalSamples;
    const warmRatio = warmPixels / totalSamples;
    const paleRatio = palePixels / totalSamples;

    const detectedA = [];
    const detectedE = [];

    // Inferir alimentos Tipo A
    if (warmRatio > 0.25 || greenRatio < 0.2) {
      detectedA.push('Proteína animal (Pollo / Carne / Pescado / Huevos)');
    } else {
      detectedA.push('Proteína magra a la plancha');
    }

    if (greenRatio > 0.15 || warmRatio < 0.5) {
      detectedA.push('Vegetales verdes y ensalada fresca con aceite de oliva');
    } else {
      detectedA.push('Guarnición de verduras al vapor');
    }

    detectedA.push('Grasa saludable (Aceite de oliva / Palta / Queso)');

    // Inferir alimentos Tipo E
    if (paleRatio > 0.3) {
      detectedE.push('Porción de almidón (Arroz / Papa / Pan / Fideos)');
    } else {
      detectedE.push('Porción controlada de carbohidrato (1/4 del plato)');
    }

    // Estimación calórica promedio para un plato equilibrado 3x1
    const baseCalories = Math.round(420 + (warmRatio * 150) + (paleRatio * 120));
    const protein = Math.round(35 + (warmRatio * 15));
    const carbs = Math.round(18 + (paleRatio * 15));
    const fat = Math.round(20 + (warmRatio * 8));

    return {
      title: 'Plato Saludable 3x1 Detectado',
      calories: baseCalories,
      protein: protein,
      carbs: carbs,
      fat: fat,
      typeAPercent: 75,
      typeEPercent: 25,
      itemsA: detectedA,
      itemsE: detectedE,
      frankAdvice: '¡Excelente combinación metabólica! 3/4 partes de Alimentos Tipo A mantendrán tu insulina baja y permitirán que tu cuerpo utilice la grasa acumulada como energía.'
    };
  }

  // --- Analizador con Google Gemini Vision (Opcional si Cristian ingresa API Key) ---
  async analyzeWithGeminiVision(base64DataUrl, apiKey) {
    const cleanBase64 = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Actúa como Frank Suárez, experto en metabolismo y creador de la Dieta 3x1.
Analiza esta fotografía de comida. 
Identifica los alimentos visibles clasificándolos estrictamente en:
- Alimentos Tipo A (Amigos que Adelgazan: carnes, pollo, pescado, huevos, quesos, vegetales, ensaladas, frutos secos, palta, aceite de oliva).
- Alimentos Tipo E (Enemigos que Engordan: pan, harinas, pastas, arroz, papa, maíz, batata, dulces, gaseosas).

Calcula la proporción visual (porcentaje 0 a 100 de A y E, ideal 75% A y 25% E), calorías estimadas del plato entero (kcal) y macronutrientes aproximados en gramos (proteínas, carbohidratos, grasas).

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta (sin comillas invertidas de markdown):
{
  "title": "Nombre descriptivo y apetitoso del plato",
  "calories": 480,
  "protein": 38,
  "carbs": 22,
  "fat": 24,
  "typeAPercent": 75,
  "typeEPercent": 25,
  "itemsA": ["Pechuga de pollo a la plancha", "Ensalada verde de lechuga y rúcula con oliva"],
  "itemsE": ["1/4 taza de arroz blanco"],
  "frankAdvice": "Un consejo breve de 1 frase estilo Frank Suárez sobre el balance metabólico de este plato."
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: cleanBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error en API Gemini: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta inválida de Gemini');

    return JSON.parse(jsonMatch[0]);
  }

  // --- Renderizar Resultados del Escaneo en el Modal ---
  renderScannerResultsUI(analysis) {
    const resultCard = document.getElementById('diet-scanner-results');
    if (!resultCard) return;

    resultCard.classList.remove('hidden');

    const titleEl = document.getElementById('diet-scan-result-title');
    const calsEl = document.getElementById('diet-scan-result-calories');
    const proteinEl = document.getElementById('diet-scan-result-protein');
    const carbsEl = document.getElementById('diet-scan-result-carbs');
    const fatEl = document.getElementById('diet-scan-result-fat');
    const barA = document.getElementById('diet-scan-bar-a');
    const barE = document.getElementById('diet-scan-bar-e');
    const ratioText = document.getElementById('diet-scan-ratio-text');
    const adviceEl = document.getElementById('diet-scan-advice');
    const listA = document.getElementById('diet-scan-items-a');
    const listE = document.getElementById('diet-scan-items-e');

    if (titleEl) titleEl.textContent = analysis.title || 'Plato Analizado';
    if (calsEl) calsEl.textContent = `${analysis.calories || 450} kcal`;
    if (proteinEl) proteinEl.textContent = `${analysis.protein || 30}g`;
    if (carbsEl) carbsEl.textContent = `${analysis.carbs || 20}g`;
    if (fatEl) fatEl.textContent = `${analysis.fat || 22}g`;

    const aPct = analysis.typeAPercent !== undefined ? analysis.typeAPercent : 75;
    const ePct = 100 - aPct;

    if (barA) barA.style.width = `${aPct}%`;
    if (barE) barE.style.width = `${ePct}%`;
    if (ratioText) {
      const isGood = aPct >= 70;
      ratioText.textContent = isGood
        ? `🏆 Proporción 3x1 Perfecta (${aPct}% Tipo A / ${ePct}% Tipo E)`
        : `⚠️ Alerta de Insulina: ${ePct}% Tipo E (Recomendamos reducir a 25%)`;
      ratioText.className = isGood ? 'text-xs font-bold text-emerald-400' : 'text-xs font-bold text-amber-400';
    }

    if (adviceEl) adviceEl.textContent = analysis.frankAdvice || 'Comer 3 partes de Tipo A mantiene tu glucosa estable.';

    // Renderizar tags de alimentos A
    if (listA) {
      listA.innerHTML = '';
      (this.activeDetectedItems.itemsA || []).forEach(item => {
        const chip = document.createElement('span');
        chip.className = 'text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1';
        chip.innerHTML = `🟢 ${this.escapeHtml(item)}`;
        listA.appendChild(chip);
      });
    }

    // Renderizar tags de alimentos E
    if (listE) {
      listE.innerHTML = '';
      (this.activeDetectedItems.itemsE || []).forEach(item => {
        const chip = document.createElement('span');
        chip.className = 'text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1';
        chip.innerHTML = `🟠 ${this.escapeHtml(item)}`;
        listE.appendChild(chip);
      });
    }
  }

  // --- Guardar el Plato Escaneado en el Registro de Hoy ---
  saveScannedMealToToday() {
    if (!this.analysisResult || !window.storageManager) return;

    const mealTypeSelect = document.getElementById('diet-scan-meal-type');
    const mealType = mealTypeSelect ? mealTypeSelect.value : 'almuerzo';

    const meal = {
      type: mealType,
      title: this.analysisResult.title || 'Plato 3x1 con Foto',
      calories: this.analysisResult.calories || 450,
      protein: this.analysisResult.protein || 30,
      carbs: this.analysisResult.carbs || 20,
      fat: this.analysisResult.fat || 22,
      typeAPercent: this.analysisResult.typeAPercent || 75,
      typeEPercent: this.analysisResult.typeEPercent || 25,
      itemsA: this.activeDetectedItems.itemsA || [],
      itemsE: this.activeDetectedItems.itemsE || [],
      photoUrl: this.scannedImageBase64 || null
    };

    window.storageManager.addMealEntry(meal);

    if (window.soundEngine) window.soundEngine.playSuccess();
    this.closeScannerModal();
    this.renderDietSection();

    if (window.reminderManager && typeof window.reminderManager.showToast === 'function') {
      window.reminderManager.showToast(`🍽️ ¡${meal.title} guardado en tu día! (+${meal.calories} kcal)`);
    }
  }

  // ==========================================
  // REGISTRO DE COMIDAS DE HOY (DIARIO 3x1)
  // ==========================================
  renderTodayMealLog() {
    if (!window.storageManager) return;
    const mealsData = window.storageManager.getTodayMeals();
    const meals = mealsData.meals || [];

    const container = document.getElementById('diet-today-meals-container');
    if (!container) return;

    if (meals.length === 0) {
      container.innerHTML = `
        <div class="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center gap-3">
          <span class="text-3xl p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">🍽️</span>
          <div>
            <h4 class="text-xs font-bold text-white">Todavía no registraste comidas hoy</h4>
            <p class="text-[11px] text-slate-400 mt-1">Tomale una foto a tu plato o elegí una receta saludable para comenzar.</p>
          </div>
          <button type="button" onclick="window.dietManager.triggerPhotoPicker()" class="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Escanear Mi Primera Comida
          </button>
        </div>
      `;
      return;
    }

    const typeIcons = {
      desayuno: '🌅',
      almuerzo: '☀️',
      merienda: '☕',
      cena: '🌙'
    };

    container.innerHTML = meals.map(m => `
      <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-sm hover:border-sky-500/30 transition-all">
        <div class="flex items-center gap-3 min-w-0">
          ${m.photoUrl 
            ? `<img src="${m.photoUrl}" alt="${this.escapeHtml(m.title)}" class="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow flex-shrink-0">`
            : `<span class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl flex-shrink-0">${typeIcons[m.type] || '🍽️'}</span>`
          }
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
                ${typeIcons[m.type] || ''} ${m.type}
              </span>
              <span class="text-[10px] text-slate-400 font-medium">${m.time || ''}</span>
            </div>
            <h4 class="text-xs font-bold text-white truncate mt-0.5">${this.escapeHtml(m.title)}</h4>
            <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span class="font-bold text-emerald-400">${m.calories} kcal</span>
              <span>•</span>
              <span class="text-sky-300">${m.typeAPercent}% Tipo A</span>
              <span>•</span>
              <span class="text-amber-300">${m.typeEPercent}% Tipo E</span>
            </div>
          </div>
        </div>
        <button type="button" onclick="window.dietManager.removeMeal('${m.id}')" class="p-2 text-slate-500 hover:text-rose-400 active:scale-95 transition-colors flex-shrink-0" title="Eliminar registro">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  removeMeal(mealId) {
    if (!window.storageManager) return;
    if (confirm('¿Querés eliminar esta comida del registro de hoy?')) {
      window.storageManager.removeMealEntry(mealId);
      if (window.soundEngine) window.soundEngine.playTap();
      this.renderDietSection();
    }
  }

  // ==========================================
  // RECETARIO SALUDABLE 3x1
  // ==========================================
  filterRecipeCategory(category) {
    if (window.soundEngine) window.soundEngine.playTap();
    this.selectedRecipeCategory = category;

    document.querySelectorAll('.diet-recipe-pill').forEach(btn => {
      const cat = btn.getAttribute('data-category');
      const active = cat === category;
      btn.classList.toggle('active', active);
      if (active) {
        btn.classList.add('bg-sky-500', 'text-white', 'shadow');
        btn.classList.remove('text-slate-400', 'hover:text-white', 'bg-slate-800');
      } else {
        btn.classList.remove('bg-sky-500', 'text-white', 'shadow');
        btn.classList.add('text-slate-400', 'hover:text-white', 'bg-slate-800');
      }
    });

    this.renderRecipeList();
  }

  renderRecipeList() {
    const container = document.getElementById('diet-recipe-cards-container');
    if (!container) return;

    let filtered = DIET_RECIPES;

    // Filtro por categoría
    if (this.selectedRecipeCategory !== 'all') {
      filtered = filtered.filter(r => r.category === this.selectedRecipeCategory);
    }

    // Filtro por buscador
    if (this.currentSearchQuery) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(this.currentSearchQuery) ||
        r.summary.toLowerCase().includes(this.currentSearchQuery) ||
        r.itemsA.some(item => item.toLowerCase().includes(this.currentSearchQuery)) ||
        r.itemsE.some(item => item.toLowerCase().includes(this.currentSearchQuery))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center text-slate-400 text-xs">
          No encontramos recetas con el término "<strong>${this.escapeHtml(this.currentSearchQuery)}</strong>".
        </div>
      `;
      return;
    }

    const categoryBadges = {
      desayuno: { label: 'Desayuno', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
      almuerzo: { label: 'Almuerzo', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      merienda: { label: 'Merienda', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
      cena: { label: 'Cena Ligera', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' }
    };

    container.innerHTML = filtered.map(recipe => {
      const cat = categoryBadges[recipe.category] || categoryBadges.desayuno;
      return `
        <div class="glass-card p-4 rounded-3xl border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between gap-3 shadow-md group">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cat.bg}">
                ${cat.label}
              </span>
              <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                <span>⏱️ ${recipe.prepTime}</span>
                <span>•</span>
                <span class="text-emerald-400 font-bold">${recipe.calories} kcal</span>
              </div>
            </div>

            <div class="flex items-start gap-2.5">
              <span class="text-2xl p-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 group-hover:scale-105 transition-transform">
                ${recipe.emoji}
              </span>
              <div>
                <h4 class="text-xs font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                  ${this.escapeHtml(recipe.title)}
                </h4>
                <p class="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  ${this.escapeHtml(recipe.summary)}
                </p>
              </div>
            </div>
          </div>

          <!-- Desglose Rápido 3x1 -->
          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div class="flex items-center gap-2 text-[10px]">
              <span class="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold">3/4 Tipo A</span>
              <span class="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold">1/4 Tipo E</span>
            </div>
            <button type="button" onclick="window.dietManager.openRecipeModal('${recipe.id}')" class="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-xs font-bold active:scale-95 transition-all">
              Ver Receta →
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Modal de Detalle de Receta ---
  openRecipeModal(recipeId) {
    const recipe = DIET_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    if (window.soundEngine) window.soundEngine.playTap();

    const modal = document.getElementById('recipe-detail-modal');
    if (!modal) return;

    const elTitle = document.getElementById('modal-recipe-title');
    const elEmoji = document.getElementById('modal-recipe-emoji');
    const elTime = document.getElementById('modal-recipe-time');
    const elCals = document.getElementById('modal-recipe-calories');
    const elProtein = document.getElementById('modal-recipe-protein');
    const elCarbs = document.getElementById('modal-recipe-carbs');
    const elFat = document.getElementById('modal-recipe-fat');
    const elItemsA = document.getElementById('modal-recipe-items-a');
    const elItemsE = document.getElementById('modal-recipe-items-e');
    const elSteps = document.getElementById('modal-recipe-steps');
    const elTip = document.getElementById('modal-recipe-frank-tip');
    const btnRegister = document.getElementById('btn-register-recipe-meal');

    if (elTitle) elTitle.textContent = recipe.title;
    if (elEmoji) elEmoji.textContent = recipe.emoji;
    if (elTime) elTime.textContent = recipe.prepTime;
    if (elCals) elCals.textContent = `${recipe.calories} kcal`;
    if (elProtein) elProtein.textContent = `${recipe.protein}g`;
    if (elCarbs) elCarbs.textContent = `${recipe.carbs}g`;
    if (elFat) elFat.textContent = `${recipe.fat}g`;

    if (elItemsA) {
      elItemsA.innerHTML = recipe.itemsA.map(item => `
        <li class="flex items-start gap-2 text-xs text-slate-200">
          <span class="text-emerald-400 font-bold mt-0.5">✓</span>
          <span>${this.escapeHtml(item)}</span>
        </li>
      `).join('');
    }

    if (elItemsE) {
      elItemsE.innerHTML = recipe.itemsE.map(item => `
        <li class="flex items-start gap-2 text-xs text-amber-200">
          <span class="text-amber-400 font-bold mt-0.5">!</span>
          <span>${this.escapeHtml(item)}</span>
        </li>
      `).join('');
    }

    if (elSteps) {
      elSteps.innerHTML = recipe.instructions.map((step, idx) => `
        <div class="flex items-start gap-2.5 text-xs text-slate-300">
          <span class="w-5 h-5 rounded-full bg-slate-800 text-sky-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-700">
            ${idx + 1}
          </span>
          <p class="leading-relaxed">${this.escapeHtml(step)}</p>
        </div>
      `).join('');
    }

    if (elTip) {
      elTip.textContent = recipe.frankTip;
    }

    if (btnRegister) {
      btnRegister.onclick = () => {
        this.registerRecipeAsMeal(recipe);
        this.closeRecipeModal();
      };
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeRecipeModal() {
    const modal = document.getElementById('recipe-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  registerRecipeAsMeal(recipe) {
    if (!window.storageManager) return;

    const meal = {
      type: recipe.category,
      title: recipe.title,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      typeAPercent: recipe.typeAPercent,
      typeEPercent: recipe.typeEPercent,
      itemsA: recipe.itemsA,
      itemsE: recipe.itemsE,
      photoUrl: null
    };

    window.storageManager.addMealEntry(meal);

    if (window.soundEngine) window.soundEngine.playSuccess();
    this.renderDietSection();

    if (window.reminderManager && typeof window.reminderManager.showToast === 'function') {
      window.reminderManager.showToast(`🍽️ ¡${recipe.title} registrado en tu día!`);
    }
  }

  // ==========================================
  // CATÁLOGO DE ALIMENTOS TIPO A vs TIPO E
  // ==========================================
  renderFoodCatalog() {
    const containerA = document.getElementById('diet-catalog-list-a');
    const containerE = document.getElementById('diet-catalog-list-e');

    if (containerA) {
      containerA.innerHTML = FOOD_CATALOG.typeA.map(item => `
        <div class="p-2.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2.5">
          <span class="text-xl p-1.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30">${item.icon}</span>
          <div class="min-w-0">
            <h5 class="text-xs font-bold text-emerald-200 truncate">${this.escapeHtml(item.name)}</h5>
            <p class="text-[10px] text-emerald-400/80 truncate">${this.escapeHtml(item.desc)}</p>
          </div>
        </div>
      `).join('');
    }

    if (containerE) {
      containerE.innerHTML = FOOD_CATALOG.typeE.map(item => `
        <div class="p-2.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-center gap-2.5">
          <span class="text-xl p-1.5 rounded-xl bg-amber-900/40 border border-amber-500/30">${item.icon}</span>
          <div class="min-w-0">
            <h5 class="text-xs font-bold text-amber-200 truncate">${this.escapeHtml(item.name)}</h5>
            <p class="text-[10px] text-amber-400/80 truncate">${this.escapeHtml(item.desc)}</p>
          </div>
        </div>
      `).join('');
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

window.dietManager = new DietManager();
