/**
 * HabitFlow - Módulo de Publicidad y Monetización No Invasiva (Google AdMob)
 * Code Ahumada • Director Cristian
 * 
 * ============================================================================
 * GUÍA PARA ACTIVAR Y CONFIGURAR TU CUENTA DE ADMOB EN EL FUTURO:
 * ============================================================================
 * 1. Ingresá a https://admob.google.com con tu cuenta de Google y registrate.
 * 2. Creá una nueva App ("HabitFlow", plataforma Android).
 * 3. Copiá tu "ID de Aplicación" (App ID, formato: ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX).
 * 4. Creá un Bloque de Anuncios tipo "Banner" (320x50 adaptativo).
 * 5. Copiá el "ID del bloque de anuncios" (Ad Unit ID, formato: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX).
 * 6. En este archivo:
 *      - Cambiá `ENABLED: false` a `ENABLED: true`.
 *      - Cambiá `TEST_MODE: true` a `TEST_MODE: false` cuando salgas a producción.
 *      - Pegá tus IDs reales en `ADMOB_APP_ID` y `BANNER_AD_ID`.
 * ============================================================================
 */

const ADS_CONFIG = {
  // Bandera maestra: mantenelo en false hasta que decidas activar la monetización
  ENABLED: false,

  // Modo de prueba: usa los IDs de test oficiales de Google para evitar penalizaciones
  TEST_MODE: true,

  // Tu ID de aplicación de AdMob (reemplazar con el tuyo al activarlo)
  ADMOB_APP_ID: 'ca-app-pub-3940256099942544~3347511713', // ID de prueba oficial de Google

  // ID del bloque de anuncios Banner inferior
  BANNER_AD_ID: 'ca-app-pub-3940256099942544/6300978111', // ID de prueba oficial de Google (Banner Android)

  // Pestañas donde está PERMITIDO mostrar el banner (NO invasivo: excluye 'water' y 'settings')
  ALLOWED_TABS: ['progress', 'habits'],

  // Altura estimada del banner para ajustar el padding si es necesario (px)
  BANNER_HEIGHT: 50
};

class AdsManager {
  constructor() {
    this.isInitialized = false;
    this.isBannerVisible = false;
    this.currentTab = 'water';
    this.admobPlugin = null;
  }

  /**
   * Inicializa el sistema de anuncios si está habilitado
   */
  async init() {
    if (!ADS_CONFIG.ENABLED) {
      console.log('ℹ️ HabitFlow Ads: Módulo preparado pero DESACTIVADO (ENABLED = false).');
      return;
    }

    try {
      // 1. Detectar si estamos en Capacitor nativo con el plugin de AdMob instalado
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
        this.admobPlugin = window.Capacitor.Plugins.AdMob;
        await this.admobPlugin.initialize({
          requestTrackingAuthorization: true,
          testingDevices: ADS_CONFIG.TEST_MODE ? ['EMULATOR'] : [],
          initializeForTesting: ADS_CONFIG.TEST_MODE
        });
        this.isInitialized = true;
        console.log('✓ HabitFlow Ads: Plugin AdMob nativo inicializado con éxito.');
      } else {
        // Modo PWA / Web: Inicializar contenedor web ligero si está activado
        this.isInitialized = true;
        this.createWebBannerContainer();
        console.log('✓ HabitFlow Ads: Modo Web preparado.');
      }
    } catch (err) {
      console.warn('⚠️ HabitFlow Ads: Error al inicializar AdMob:', err);
    }
  }

  /**
   * Manejador de cambio de pestaña para asegurar que el banner
   * NUNCA aparezca en la pantalla de Agua ni entorpezca la toma rápida.
   */
  onTabChange(tabId) {
    this.currentTab = tabId;
    if (!ADS_CONFIG.ENABLED || !this.isInitialized) return;

    if (ADS_CONFIG.ALLOWED_TABS.includes(tabId)) {
      this.showBanner();
    } else {
      this.hideBanner();
    }
  }

  /**
   * Muestra el banner inferior chico
   */
  async showBanner() {
    if (!ADS_CONFIG.ENABLED || !this.isInitialized || this.isBannerVisible) return;

    try {
      if (this.admobPlugin) {
        // Banner nativo de Capacitor (anclado abajo al centro)
        await this.admobPlugin.showBanner({
          adId: ADS_CONFIG.BANNER_AD_ID,
          adSize: 'BANNER', // 320x50 no invasivo
          position: 'BOTTOM_CENTER',
          margin: 60, // Margen para no tapar la barra inferior de navegación
          isTesting: ADS_CONFIG.TEST_MODE
        });
        this.isBannerVisible = true;
      } else {
        // Banner en modo Web / PWA
        const container = document.getElementById('habitflow-web-ad-banner');
        if (container) {
          container.classList.remove('hidden');
          container.classList.add('flex');
          this.isBannerVisible = true;
        }
      }
    } catch (e) {
      console.warn('⚠️ HabitFlow Ads: Error mostrando banner:', e);
    }
  }

  /**
   * Oculta el banner inferior
   */
  async hideBanner() {
    if (!ADS_CONFIG.ENABLED || !this.isBannerVisible) return;

    try {
      if (this.admobPlugin) {
        await this.admobPlugin.hideBanner();
        this.isBannerVisible = false;
      } else {
        const container = document.getElementById('habitflow-web-ad-banner');
        if (container) {
          container.classList.add('hidden');
          container.classList.remove('flex');
          this.isBannerVisible = false;
        }
      }
    } catch (e) {
      console.warn('⚠️ HabitFlow Ads: Error ocultando banner:', e);
    }
  }

  /**
   * Crea el contenedor del banner para modo Web / PWA (solo visible si ENABLED = true)
   */
  createWebBannerContainer() {
    if (document.getElementById('habitflow-web-ad-banner')) return;

    const bannerDiv = document.createElement('div');
    bannerDiv.id = 'habitflow-web-ad-banner';
    bannerDiv.className = 'hidden fixed bottom-16 left-0 right-0 max-w-md mx-auto z-40 items-center justify-center p-1';
    
    // Contenido del placeholder del banner
    bannerDiv.innerHTML = `
      <div class="w-full max-w-[320px] h-[50px] bg-slate-900/90 border border-slate-700/60 rounded-xl flex items-center justify-between px-3 text-[11px] text-slate-400 shadow-lg backdrop-blur-sm">
        <div class="flex items-center gap-2">
          <span class="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">Anuncio</span>
          <span class="text-slate-300 font-medium truncate max-w-[170px]">Espacio publicitario AdMob</span>
        </div>
        <span class="text-sky-400 text-xs">💧</span>
      </div>
    `;

    document.body.appendChild(bannerDiv);
  }
}

// Instancia global del gestor de anuncios
window.adsManager = new AdsManager();
