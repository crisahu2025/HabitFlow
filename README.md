# 💧 HabitFlow — Hidratación y Hábitos Saludables

**Code Ahumada**  
*Desarrollado para el Director Cristian*

---

## 🌟 Descripción General

**HabitFlow** es una aplicación móvil (PWA / APK) de hidratación inteligente, recordatorios adaptables y hábitos saludables basada en los principios científicos de los libros de **Frank Suárez** (*El Poder del Metabolismo* y *Metabolismo TV*).

La aplicación cuenta con una interfaz móvil ultra-rápida, estética oscura con acentos cian/aqua, gráficos interactivos con oleaje animado, síntesis de sonido de gota de agua mediante **Web Audio API** (100% offline), vibración háptica para celulares y compatibilidad total con **PWABuilder** para exportar archivos `.apk` de Android en 2 clics.

---

## 🚀 Funcionalidades Principales

### 1. 💧 Módulo Central de Hidratación
- **Esfera con Oleaje Animado**: Gráfico circular con olas senoidales fluidas y nivel de agua que sube dinámicamente según el porcentaje alcanzado.
- **Calculadora Frank Suárez**: Permite ingresar tu peso en kg y aplica la fórmula oficial:
  $$\text{Vasos de 250 ml} = \frac{\text{Peso en kg}}{7}$$
  $$\text{Mililitros recomendados} = \left(\frac{\text{Peso en kg}}{7}\right) \times 250$$
- **Botones Rápidos de Ingesta**:
  - `+200 ml` (Vaso chico)
  - `+250 ml` (Vaso estándar de Frank)
  - `+500 ml` (Botella)
  - `+750 ml` (Termo / Botellón)
  - `☕ Compensación Café/Mate` (+250 ml extra por el efecto diurético)
  - `+ Cantidad libre` (Modal para registrar mililitros personalizados)
- **Historial Diario Detallado**: Registro cronológico de cada ingesta con hora exacta y opción de deshacer o eliminar.
- **Contador de Racha Activa**: Indicador con fueguito 🔥 de días consecutivos cumpliendo la meta.

### 2. ⏰ Horarios y Alarmas Adaptables
- **Horario predefinido pero 100% modificable y adaptable**:
  - **Modo Intervalo Dinámico**: Permite definir hora de inicio (ej: `08:00`), hora de fin (ej: `22:00`) y frecuencia de recordatorio (cada 30 min, 45 min, 1h, 1.5h, 2h, 3h).
  - **Modo Horarios Fijos**: Permite añadir, editar y eliminar alarmas exactas personalizadas (ej: `08:30`, `10:30`, `12:30`, etc.).
- **Temporizador en Vivo**: Contador regresivo en tiempo real que indica: *"Próximo vaso a las XX:XX hs (en XXm XXs)"*.
- **Pausa Digestiva de Frank Suárez**: Opción para silenciar recordatorios durante la digestión del almuerzo (13:00 a 14:00) para no diluir el ácido gástrico.
- **Botón "Probar Notificación y Sonido Ahora"**: Dispara de inmediato la alerta nativa, la vibración y el sintetizador de gota para verificar el correcto funcionamiento.

### 3. 🔊 Motor de Audio y Háptica 100% Offline
- **Síntesis con Web Audio API**: Sin archivos mp3 externos propensos a errores 404 o caídas de red.
  - *Gota de agua ("Bloop")*: Modulación de frecuencia de 500Hz a 1250Hz.
  - *Trago refrescante*: Doble onda senoidal armónica.
  - *Celebración de Meta*: Acorde C-Major 7th cristalino al alcanzar el 100% de la meta diaria.
- **Vibración Háptica**: Pulsos táctiles con `navigator.vibrate()` para celulares.

### 4. 📊 Estadísticas y Progreso Semanal
- **Gráfico de Barras Interactivo**: Visualización de los últimos 7 días con barras que cambian a verde esmeralda al alcanzar el 100% de la meta.
- **Métricas Clave**: Total litros consumidos, promedio diario en ml, racha actual y días con meta cumplida.
- **Energía Celular Producida (ATP)**: Estimación didáctica de la hidrólisis de ATP generada por el agua consumida según Frank Suárez.

### 5. ⚡ Hábitos y Consejos de Frank Suárez
- **4 Grandes Consejos de Metabolismo**:
  1. *El agua multiplica tu energía (ATP x 10)*
  2. *La regla de oro con las comidas (no diluir el ácido clorhídrico)*
  3. *La trampa del café y el mate (compensación diurética)*
  4. *Agua de manantial celular (sal marina/rosada y limón para reactivar la bomba celular)*
- **Hábitos Complementarios Code Ahumada**: Pausas activas, magnesio y potasio, caminata de 8.000 pasos y desconexión nocturna.

### 6. 📱 PWA y Preparación para APK
- `manifest.json` con `display: standalone`, tema `#0284c7`, orientación vertical y shortcuts.
- `sw.js` con cache-v1.0, `skipWaiting()` y `clients.claim()`.
- `pwa.js` con captura de `beforeinstallprompt`, banner de instalación y auto-recarga.
- Iconos generados en `192x192`, `512x512`, `maskable` y `SVG`.
- Guía detallada en `COMO_GENERAR_APK.md`.

---

## 📂 Estructura del Proyecto

```
HabitFlow/
├── css/
│   └── styles.css          # Animación de oleaje, glassmorphism y estilos móviles
├── js/
│   ├── app.js              # Controlador principal y gestión de interfaz
│   ├── audio.js            # Sintetizador Web Audio API y respuesta háptica
│   ├── habits.js           # Consejos de Frank Suárez y hábitos saludables
│   ├── pwa.js              # Registro de Service Worker e instalador
│   ├── reminders.js        # Horarios dinámicos, reloj regresivo y notificaciones
│   └── storage.js          # Persistencia en localStorage y fórmula de Frank
├── icons/
│   ├── icon.svg            # Icono vectorial escalable
│   ├── icon-192.png        # Icono PNG 192x192
│   ├── icon-512.png        # Icono PNG 512x512
│   ├── icon-maskable-512.png # Icono PNG con zona segura para Android
│   └── make_icons.ps1      # Generador de alta fidelidad con System.Drawing
├── COMO_GENERAR_APK.md     # Manual paso a paso para Cristian para exportar el APK
├── index.html              # Estructura semántica, tabs y modales interactivos
├── manifest.json           # Web App Manifest para PWA y PWABuilder
├── README.md               # Documentación general
└── sw.js                   # Service Worker offline con soporte de notificaciones
```
