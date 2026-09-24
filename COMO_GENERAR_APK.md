# 📱 Cómo Generar el Archivo APK de HabitFlow y Usarla en Celular

> **Guía Oficial para el Director Cristian y el equipo de Code Ahumada**  
> *HabitFlow: Aplicación de Hidratación Inteligente, Recordatorios y Sabiduría de Frank Suárez.*

---

## 🚀 Método 1: Generar el archivo `.apk` con PWABuilder (En 2 clics y sin programar)

**PWABuilder** es la herramienta oficial respaldada por Microsoft y Google para convertir cualquier Progressive Web App (PWA) moderna en un archivo ejecutable **`.apk` de Android** listo para instalar en cualquier teléfono celular.

### Paso 1: Publicar HabitFlow en un servidor HTTPS
PWABuilder necesita una URL segura (`https://`). Podés usar cualquiera de las siguientes opciones gratuitas en 1 minuto:
- **GitHub Pages**: Subí la carpeta de HabitFlow a un repositorio de GitHub y activá Pages en `Settings > Pages`.
- **Vercel / Netlify**: Arrastrá la carpeta `HabitFlow` en [vercel.com](https://vercel.com) o [netlify.com](https://netlify.com) y te dará un enlace como `https://habitflow.vercel.app` en 10 segundos.

### Paso 2: Generar el APK en PWABuilder
1. Abrí tu navegador y entrá a: **[https://www.pwabuilder.com](https://www.pwabuilder.com)**
2. En la barra de búsqueda, pegá la URL HTTPS de HabitFlow (ej: `https://habitflow.vercel.app`) y tocá el botón **"Start"**.
3. PWABuilder analizará la app:
   - ✅ **Manifest**: 100% aprobado (nombre, colores, orientación portrait y shortcuts configurados).
   - ✅ **Service Worker**: 100% aprobado (`sw.js` con cache offline y auto-recarga).
   - ✅ **Iconos**: 100% aprobado (iconos PNG en `192x192`, `512x512` y maskable ya generados).
4. Hacé clic en el botón verde **"Package for Stores"**.
5. En la tarjeta de **Android**, hacé clic en **"Generate"** o **"Package for Android"**:
   - Podés elegir descargar el paquete para prueba directa (**Signed APK / Debug APK**).
6. ¡Listo! Se descargará un archivo comprimido `.zip` que contiene el archivo **`.apk`** listo para tu celular.

### Paso 3: Instalar el APK en tu celular Android
1. Enviate el archivo `.apk` a tu celular por WhatsApp, Telegram, Google Drive o cable USB.
2. Abrí el archivo `.apk` en el celular.
3. Si el teléfono te pide confirmación de seguridad para "instalar aplicaciones de orígenes desconocidos", dale **Permitir**.
4. Tocá **Instalar** y ¡HabitFlow quedará instalada como una app nativa con su icono de gota azul y sin barra de navegador!

---

## 📲 Método 2: Instalación Directa e Instantánea como PWA Nativa (Sin compilar APK)

Las PWA modernas funcionan exactamente igual que una app nativa de Android o iOS: no tienen barra de direcciones, tienen su propio icono en el inicio, funcionan sin internet (offline) y reciben notificaciones.

### En Android (Chrome / Brave / Edge):
1. Abrí la URL de HabitFlow en Google Chrome en tu celular.
2. Al ingresar, verás un cartel flotante que dice: **"📲 Instalar HabitFlow en tu celular"**.
3. Tocá el botón **"Instalar"**.
4. Si no aparece el cartel, tocá los **3 puntos verticales** arriba a la derecha en Chrome y seleccioná **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
5. HabitFlow se instalará automáticamente en tu pantalla de inicio con su icono y animación de inicio.

### En iPhone / iPad (iOS Safari):
1. Abrí la URL de HabitFlow en **Safari**.
2. Tocá el botón de **Compartir** (el cuadrado con la flecha hacia arriba en la barra inferior).
3. Deslizá hacia abajo y seleccioná **"Agregar a pantalla de inicio"** (o *Add to Home Screen*).
4. Tocá **"Agregar"**. La app se abrirá en pantalla completa como app nativa.

---

## ⚙️ Características Técnicas Incluidas en HabitFlow

- **Fórmula Oficial de Frank Suárez**: Cálculo exacto `Peso (kg) / 7 = Vasos de 250 ml`.
- **Síntesis Web Audio 100% Offline**: Sonido de gota de agua sintetizado por osciladores matemáticos nativos (cero archivos de audio externos que puedan fallar).
- **Vibración Háptica**: Pulsos táctiles con `navigator.vibrate()` para confirmaciones de tomas y alarmas.
- **Web Notifications API**: Alertas nativas de recordatorio en segundo plano.
- **Pausa Digestiva**: Función de Frank Suárez para pausar avisos entre 13:00 y 14:00 hs para no diluir el ácido estomacal.
- **Control de Caché y Service Worker**: Versionado `habitflow-v1.0` con auto-purga y auto-recarga ante actualizaciones (`skipWaiting` + `controllerchange`).
