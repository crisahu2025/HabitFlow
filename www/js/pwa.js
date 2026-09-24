/**
 * HabitFlow - Registro PWA, Control de Caché e Instalador Móvil
 * Code Ahumada
 */

let deferredInstallPrompt = null;

// Registro de Service Worker con auto-recarga ante actualizaciones
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        // Escuchar actualizaciones pendientes
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('HabitFlow: Nueva versión disponible, actualizando...');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('Error al registrar Service Worker:', err);
      });

    // Protocolo Code Ahumada: auto-recarga ante controllerchange
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

// Escucha de mensajes desde el Service Worker (ej: acción de notificación)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'QUICK_ADD_WATER') {
      if (window.app) {
        window.app.addWater(event.data.amount || 250, 'Notificación');
      }
    }
  });
}

// Captura del evento de instalación nativa (Android / Chrome)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  // Si no está ya instalada en modo standalone, mostrar el banner
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (!isStandalone) {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('hidden');
    }
  }
});

// Listener de app instalada con éxito
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.classList.add('hidden');
  if (window.reminderManager) {
    window.reminderManager.showToast('¡HabitFlow se instaló correctamente en tu celular!');
  }
});

/**
 * Disparar el diálogo de instalación nativa
 */
async function triggerPwaInstall() {
  if (!deferredInstallPrompt) {
    // Si no está el prompt nativo disponible (ej: iOS Safari o ya instalada)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      alert('Para instalar en iPhone/iPad: Tocá el botón "Compartir" en Safari y seleccioná "Agregar a pantalla de inicio" 📲');
    } else {
      alert('HabitFlow ya está listo. Podés agregar la app tocando los 3 puntos del navegador y eligiendo "Instalar aplicación" o "Agregar a la pantalla principal".');
    }
    return;
  }

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  if (choice.outcome === 'accepted') {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.classList.add('hidden');
  }
  deferredInstallPrompt = null;
}

function dismissPwaBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.classList.add('hidden');
}

window.triggerPwaInstall = triggerPwaInstall;
window.dismissPwaBanner = dismissPwaBanner;
