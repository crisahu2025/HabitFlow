/**
 * HabitFlow - Motor de Actualización Automática Híbrido:
 *   1. Parches en Caliente OTA (Capgo / ZIP): 1 Clic, sin APK, sin Play Protect, reinicio instantáneo
 *   2. Actualizador Nativo APK: Fallback para cambios de sistema operativo
 * 
 * Code Ahumada • Director Cristian
 */

const CURRENT_VERSION = 'v1.0.22';
const CURRENT_VERSION_CODE = 22;
const GITHUB_REPO_API = 'https://api.github.com/repos/crisahu2025/HabitFlow/releases/latest';

class UpdateManager {
  constructor() {
    this.latestRelease = null;
    this.isDownloading = false;
  }

  init() {
    this.setupListeners();
    // 0. Sincronizar dinámicamente los badges de versión en la interfaz
    this.getEffectiveVersion();

    // 1. Notificar al motor de parches que el bundle actual cargó exitosamente
    this.notifyAppReady();

    // NOTA MANDATO CRISTIAN: Cero verificaciones automáticas al iniciar.
    // La comprobación de actualizaciones es 100% manual desde Ajustes para evitar carteles intrusivos.
  }

  /**
   * Confirma al plugin Capgo que la app abrió bien para evitar rollbacks
   */
  async notifyAppReady() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater) {
      try {
        await window.Capacitor.Plugins.CapacitorUpdater.notifyAppReady();
        console.log('✓ HabitFlow OTA: Bundle web confirmado con notifyAppReady()');
      } catch (e) {
        console.warn('Capgo notifyAppReady:', e);
      }
    }
  }

  /**
   * Sincroniza dinámicamente el texto de la versión en todos los elementos de la interfaz
   */
  updateUIVersionLabels(ver) {
    const badge = document.getElementById('apk-installed-version-badge');
    if (badge) badge.textContent = ver;

    const installedText = document.getElementById('apk-installed-version-text');
    if (installedText) installedText.textContent = `${ver} (Android APK Nativo)`;

    const modalInstalled = document.getElementById('modal-update-installed-version');
    if (modalInstalled) modalInstalled.textContent = ver;
  }

  /**
   * Obtiene la versión real del paquete nativo instalado en el dispositivo si está en Capacitor
   */
  async getEffectiveVersion() {
    let ver = CURRENT_VERSION;
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      try {
        const info = await window.Capacitor.Plugins.App.getInfo();
        if (info && info.version) {
          ver = info.version.startsWith('v') ? info.version : `v${info.version}`;
        }
      } catch (e) {
        console.warn('No se pudo consultar App.getInfo() nativo:', e);
      }
    }
    this.updateUIVersionLabels(ver);
    return ver;
  }

  async checkUpdate({ silent = false } = {}) {
    const statusLabel = document.getElementById('update-status-label');
    const btnUpdateText = document.getElementById('btn-update-text');

    if (!silent && statusLabel) {
      statusLabel.textContent = 'Buscando parche o actualización...';
      statusLabel.className = 'font-medium text-sky-400 animate-pulse';
    }

    try {
      const response = await fetch(GITHUB_REPO_API, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Buscar si hay paquete de parche OTA (dist.zip)
      const zipAsset = data.assets && data.assets.find(a => a.name.endsWith('.zip'));
      const otaUrl = zipAsset 
        ? zipAsset.browser_download_url 
        : `https://github.com/crisahu2025/HabitFlow/releases/download/${data.tag_name}/dist.zip`;

      // Buscar instalador APK como fallback
      const apkAsset = data.assets && data.assets.find(a => a.name.endsWith('.apk'));
      const apkUrl = apkAsset 
        ? apkAsset.browser_download_url 
        : `https://github.com/crisahu2025/HabitFlow/releases/download/${data.tag_name}/HabitFlow.apk`;

      this.latestRelease = {
        tag: data.tag_name,
        name: data.name || data.tag_name,
        body: data.body || 'Mejoras continuas de rendimiento y diseño.',
        apkUrl: apkUrl,
        otaUrl: otaUrl,
        hasOta: !!zipAsset || true
      };

      const currentVer = await this.getEffectiveVersion();
      const hasNewVersion = this.compareVersions(this.latestRelease.tag, currentVer);

      if (hasNewVersion) {
        if (statusLabel) {
          statusLabel.textContent = `¡Nueva versión ${this.latestRelease.tag} disponible!`;
          statusLabel.className = 'font-bold text-amber-400 animate-pulse';
        }
        if (btnUpdateText) {
          btnUpdateText.textContent = `⚡ Aplicar Parche ${this.latestRelease.tag}`;
        }

        // Modal SOLO si fue solicitado explícitamente por el usuario (!silent)
        if (!silent) {
          this.showUpdateModal(this.latestRelease);
        }
      } else {
        if (statusLabel) {
          statusLabel.textContent = 'App al día (Última versión)';
          statusLabel.className = 'font-medium text-emerald-400';
        }
        if (btnUpdateText) {
          btnUpdateText.textContent = 'Comprobar Actualización';
        }
        // Limpiar descartados si ya está en la última versión
        localStorage.removeItem('habitflow_dismissed_update');
        localStorage.removeItem('habitflow_downloaded_version');

        if (!silent && window.reminderManager) {
          window.reminderManager.showToast('✅ ¡Ya tenés instalada la última versión de HabitFlow!');
        }
      }
    } catch (err) {
      console.warn('Error al verificar actualizaciones:', err);
      if (!silent) {
        if (statusLabel) {
          statusLabel.textContent = 'Error al comprobar';
          statusLabel.className = 'font-medium text-rose-400';
        }
        if (window.reminderManager) {
          window.reminderManager.showToast('⚠️ No se pudo comprobar actualización. Verificá tu conexión.');
        }
      }
    }
  }

  compareVersions(latest, current) {
    try {
      const parse = (v) => v.replace(/^v/, '').split('.').map(Number);
      const [lMajor = 0, lMinor = 0, lPatch = 0] = parse(latest);
      const [cMajor = 0, cMinor = 0, cPatch = 0] = parse(current);

      if (lMajor > cMajor) return true;
      if (lMajor === cMajor && lMinor > cMinor) return true;
      if (lMajor === cMajor && lMinor === cMinor && lPatch > cPatch) return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  showUpdateModal(release) {
    const modal = document.getElementById('apk-update-modal');
    if (!modal) return;

    const elTitle = document.getElementById('modal-update-title');
    const elNotes = document.getElementById('modal-update-notes');
    const elNewVersion = document.getElementById('modal-update-version-label');
    const btnAction = document.getElementById('btn-modal-install-update');

    if (elTitle) elTitle.textContent = `¡Nuevo Parche ${release.tag} Disponible!`;
    if (elNewVersion) elNewVersion.textContent = release.tag;
    if (elNotes) elNotes.textContent = release.body;

    if (btnAction) {
      const span = btnAction.querySelector('span');
      if (span) {
        span.textContent = '⚡ Aplicar Parche en 1 Clic (Sin Reinstalar)';
      }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  async startDownloadAndInstall(release) {
    if (this.isDownloading) return;
    this.isDownloading = true;

    localStorage.setItem('habitflow_downloaded_version', release.tag);

    const progressContainers = [
      document.getElementById('apk-download-progress-container'),
      document.getElementById('modal-download-progress-container')
    ];
    const progressBars = [
      document.getElementById('apk-download-bar'),
      document.getElementById('modal-download-bar')
    ];
    const progressPercents = [
      document.getElementById('apk-download-percent-text'),
      document.getElementById('modal-download-percent-text')
    ];
    const statusTexts = [
      document.getElementById('apk-download-status-text'),
      document.getElementById('modal-download-status-text')
    ];

    progressContainers.forEach(c => c && c.classList.remove('hidden'));
    statusTexts.forEach(s => s && (s.textContent = 'Descargando parche en 1 clic...'));

    const updateProgress = (pct) => {
      progressBars.forEach(b => b && (b.style.width = `${pct}%`));
      progressPercents.forEach(p => p && (p.textContent = `${pct}%`));
    };

    updateProgress(0);

    // ========================================================
    // MÉTODO 1: PARCHE EN CALIENTE OTA (Capgo - CERO Play Protect)
    // ========================================================
    const hasCapgo = window.Capacitor && 
      window.Capacitor.isPluginAvailable && 
      window.Capacitor.isPluginAvailable('CapacitorUpdater');

    if (hasCapgo && release.otaUrl) {
      try {
        const { CapacitorUpdater } = window.Capacitor.Plugins;

        CapacitorUpdater.addListener('download', (info) => {
          const pct = Math.min(100, Math.max(0, Math.round(info.percent || 0)));
          updateProgress(pct);
          if (pct >= 100) {
            statusTexts.forEach(s => s && (s.textContent = '¡Parche listo! Reiniciando app...'));
          }
        });

        if (window.reminderManager) {
          window.reminderManager.showToast('⚡ Descargando parche liviano...');
        }

        const bundle = await CapacitorUpdater.download({
          url: release.otaUrl,
          version: release.tag
        });

        updateProgress(100);
        statusTexts.forEach(s => s && (s.textContent = '¡Parche aplicado! Reiniciando...'));

        // Aplicar bundle y reiniciar la app automáticamente
        setTimeout(async () => {
          await CapacitorUpdater.set(bundle);
        }, 600);

        return;
      } catch (errOta) {
        console.warn('Fallo en parche OTA, intentando fallback nativo APK:', errOta);
      }
    }

    // ========================================================
    // MÉTODO 2: FALLBACK INSTALADOR NATIVO APK
    // ========================================================
    const hasCapacitorAppUpdate = window.Capacitor && 
      window.Capacitor.isPluginAvailable && 
      window.Capacitor.isPluginAvailable('AppUpdate');

    if (hasCapacitorAppUpdate) {
      const { AppUpdate } = window.Capacitor.Plugins;

      AppUpdate.addListener('downloadProgress', (data) => {
        const pct = Math.min(100, Math.max(0, data.progress || 0));
        updateProgress(pct);
        if (pct >= 100) {
          statusTexts.forEach(s => s && (s.textContent = '¡Descarga lista! Abriendo instalador...'));
        }
      });

      try {
        if (window.reminderManager) {
          window.reminderManager.showToast('📥 Descargando e iniciando instalador nativo...');
        }
        await AppUpdate.installApk({ url: release.apkUrl });
      } catch (err) {
        console.error('Error nativo al instalar APK:', err);
        statusTexts.forEach(s => s && (s.textContent = 'Error en descarga'));
        if (window.reminderManager) {
          window.reminderManager.showToast('Error al descargar: ' + err.message);
        }
        window.open(release.apkUrl, '_blank');
      } finally {
        this.isDownloading = false;
      }
    } else {
      // Fallback para navegador web / PWA
      updateProgress(100);
      statusTexts.forEach(s => s && (s.textContent = 'Iniciando descarga en navegador...'));
      window.location.href = release.apkUrl;
      this.isDownloading = false;
    }
  }

  setupListeners() {
    // Botón en Ajustes
    const btnCheckAndUpdate = document.getElementById('btn-check-and-update-apk');
    if (btnCheckAndUpdate) {
      btnCheckAndUpdate.addEventListener('click', async () => {
        const currentVer = await this.getEffectiveVersion();
        if (this.latestRelease && this.compareVersions(this.latestRelease.tag, currentVer)) {
          this.startDownloadAndInstall(this.latestRelease);
        } else {
          this.checkUpdate({ silent: false });
        }
      });
    }

    // Botón en Modal
    const btnModalInstall = document.getElementById('btn-modal-install-update');
    if (btnModalInstall) {
      btnModalInstall.addEventListener('click', () => {
        if (this.latestRelease) {
          this.startDownloadAndInstall(this.latestRelease);
        }
      });
    }

    // Botón Posponer en Modal
    const btnModalDismiss = document.getElementById('btn-modal-dismiss-update');
    if (btnModalDismiss) {
      btnModalDismiss.addEventListener('click', () => {
        if (this.latestRelease) {
          localStorage.setItem('habitflow_dismissed_update', this.latestRelease.tag);
        }
        const modal = document.getElementById('apk-update-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    }

    // Cerrar modal y recordar descarte para no acosar al usuario
    const modalCloseBtn = document.querySelector('#apk-update-modal .btn-close-modal');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        if (this.latestRelease) {
          localStorage.setItem('habitflow_dismissed_update', this.latestRelease.tag);
        }
      });
    }
  }
}

// Inicialización global
window.updateManager = new UpdateManager();
document.addEventListener('DOMContentLoaded', () => {
  window.updateManager.init();
});
