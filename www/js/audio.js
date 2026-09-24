/**
 * HabitFlow - Motor de Audio y Respuesta Háptica
 * Síntesis nativa vía Web Audio API (100% Offline, sin archivos externos)
 * Code Ahumada
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.hapticEnabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('Web Audio API no soportado en este dispositivo:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.initAudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = !!enabled;
  }

  setHapticEnabled(enabled) {
    this.hapticEnabled = !!enabled;
  }

  /**
   * Vibración háptica nativa para celulares
   */
  vibrate(pattern = [50]) {
    if (!this.hapticEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Fallback silencioso en navegadores restrictivos
      }
    }
  }

  /**
   * Síntesis de sonido de gota de agua ("Bloop")
   * Frecuencia sinusoidal con modulación de pitch ascendente rápido y decaimiento suave
   */
  playWaterDrop() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Filtro pasa-bajos cálido
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);

      // Oscilador seno
      osc.type = 'sine';
      // Efecto "bloop" de gota: sube de 550Hz a 1150Hz en milisegundos
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1250, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);

      // Envelope de volumen
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.45, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);

      this.vibrate([70]);
    } catch (err) {
      console.warn('Error al reproducir gota de agua:', err);
    }
  }

  /**
   * Sonido refrescante de vaso servido / trago
   */
  playDrinkWater() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Doble gota armónica
      [0, 0.09, 0.17].forEach((delay, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = 480 + (index * 120);
        const endFreq = 950 + (index * 160);

        osc.frequency.setValueAtTime(startFreq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + delay + 0.06);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.3 - (index * 0.06), now + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.13);
      });

      this.vibrate([60, 40, 80]);
    } catch (err) {
      console.warn('Error al reproducir trago:', err);
    }
  }

  /**
   * Fanfarria cristalina de victoria al cumplir el 100% de la meta diaria
   * Acorde C-Major 7th brillante y relajante
   */
  playGoalCelebration() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Do5, Mi5, Sol5, Si5, Do6
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + (i * 0.10);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.28, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.46);
      });

      this.vibrate([100, 50, 100, 50, 200]);
    } catch (err) {
      console.warn('Error en sonido de celebración:', err);
    }
  }

  /**
   * Sonido sutil para botones y tabs
   */
  playTap() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);

      this.vibrate([30]);
    } catch (e) {
      // Ignorar
    }
  }
}

// Instancia única global
window.soundEngine = new SoundEngine();
