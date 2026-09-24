/**
 * HabitFlow - Motor de Actualización Automática Nativa en 1 Toque
 * Code Ahumada
 */

const CURRENT_VERSION = 'v1.0.8';
const CURRENT_VERSION_CODE = 8;
const GITHUB_REPO_API = 'https://api.github.com/repos/crisahu2025/HabitFlow/releases/latest';

class UpdateManager {
  constructor() {
    this.latestRelease = null;
    this.isDownloading = false;
  }

  init() {
    this.setupListeners();
    // Verificación silenciosa en segundo plano al iniciar la app tras 2.5s
    setTimeout(() => {
      this.checkUpdate({ silent: true });
    }, 2500);
  }

  async checkUpdate({ silent = false } = {}) {
    const statusLabel = document.getElementById('update-status-label');
    const btnUpdateText = document.getElementById('btn-update-text');

    if (!silent && statusLabel) {
      statusLabel.textContent = 'Buscando actualización...';
      statusLabel.className = 'font-medium text-sky-400 animate-pulse';
    }

    try {
      const response = await fetch(GITHUB_REPO_API, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const apkAsset = data.assets && data.assets.find(a => a.name.endsWith('.apk'));
      const apkUrl = apkAsset ? apkAsset.browser_download_url : `https://github.com/crisahu2025/HabitFlow/releases/download/${data.tag_name}/HabitFlow.apk`;

      this.latestRelease = {
        tag: data.tag_name,
        name: data.name || data.tag_name,
        body: data.body || 'Mejoras continuas de rendimiento y diseño.',
        apkUrl: apkUrl
      };

      const hasNewVersion = this.compareVersions(this.latestRelease.tag, CURRENT_VERSION);

      if (hasNewVersion) {
        if (statusLabel) {
          statusLabel.textContent = `¡Nueva versión ${this.latestRelease.tag} disponible!`;
          statusLabel.className = 'font-bold text-amber-400 animate-pulse';
        }
        if (btnUpdateText) {
          btnUpdateText.textContent = `Actualizar a ${this.latestRelease.tag} en 1 Toque`;
        }
        this.showUpdateModal(this.latestRelease);
      } else {
        if (statusLabel) {
          statusLabel.textContent = 'App al día (Última versión)';
          statusLabel.className = 'font-medium text-emerald-400';
        }
        if (btnUpdateText) {
          btnUpdateText.textContent = 'Comprobar Actualización';
        }
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
      const [lMajor, lMinor, lPatch] = parse(latest);
      const [cMajor, cMinor, cPatch] = parse(current);

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

    if (elTitle) elTitle.textContent = `¡Nueva Versión ${release.tag} Disponible!`;
    if (elNewVersion) elNewVersion.textContent = release.tag;
    if (elNotes) elNotes.textContent = release.body;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  async startDownloadAndInstall(release) {
    if (this.isDownloading) return;
    this.isDownloading = true;

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
    statusTexts.forEach(s => s && (s.textContent = 'Descargando actualización...'));

    const updateProgress = (pct) => {
      progressBars.forEach(b => b && (b.style.width = `${pct}%`));
      progressPercents.forEach(p => p && (p.textContent = `${pct}%`));
    };

    updateProgress(0);

    // Detección de Capacitor Android Nativo
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
        // Fallback directo a descarga de navegador
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
      btnCheckAndUpdate.addEventListener('click', () => {
        if (this.latestRelease && this.compareVersions(this.latestRelease.tag, CURRENT_VERSION)) {
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
  }
}

// Inicialización global
window.updateManager = new UpdateManager();
document.addEventListener('DOMContentLoaded', () => {
  window.updateManager.init();
});
