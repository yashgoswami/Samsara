/**
 * Samsara - Ambient Space Music
 *
 * Plays a local ambient track from /audio/ on loop with fade-in.
 * Call start() from a user gesture (click) to satisfy browser autoplay policy.
 */

const TRACK = 'audio/nastelbom-ambient-487003.mp3';

export class AmbientMusic {
  constructor() {
    this.audio = null;
    this.playing = false;
    this.volume = 0.35;
    this.analyser = null;
    this.freqData = null;
    this._audioCtx = null;
  }

  /** Start playback — must be called from a user gesture (click/tap). */
  start() {
    if (this.playing) return;
    this.playing = true;

    const audio = new Audio(TRACK);
    audio.loop = true;
    audio.volume = 0;
    this.audio = audio;

    audio.play()
      .then(() => {
        console.log('[Samsara] Ambient music playing');
        this._fadeIn(audio, this.volume, 3000);
        this._initAnalyser(audio);
      })
      .catch((err) => {
        console.warn('[Samsara] Audio play blocked:', err.message);
        this.playing = false;
      });
  }

  /** Connect a Web Audio AnalyserNode so the visualizer can read frequency data. */
  _initAnalyser(audio) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      this._audioCtx = ctx;
      this.analyser = analyser;
      this.freqData = new Uint8Array(analyser.frequencyBinCount);
    } catch (e) {
      console.warn('[Samsara] Analyser init failed:', e.message);
    }
  }

  /** Get current frequency data (0-255 per bin). Returns null if not ready. */
  getFrequencyData() {
    if (!this.analyser || !this.freqData) return null;
    this.analyser.getByteFrequencyData(this.freqData);
    return this.freqData;
  }

  /** Set volume (0-1). */
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.audio) this.audio.volume = this.volume;
  }

  /** Stop with fade-out. */
  stop() {
    if (!this.playing || !this.audio) return;
    this.playing = false;
    this._fadeOut(this.audio, 2000);
    if (this._audioCtx) {
      this._audioCtx.close().catch(() => {});
      this._audioCtx = null;
      this.analyser = null;
      this.freqData = null;
    }
  }

  /* ── internal helpers ─────────────────────────────────────────── */

  _fadeIn(audio, target, ms) {
    const steps = 30;
    const dt = ms / steps;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      audio.volume = Math.min(target, (i / steps) * target);
      if (i >= steps) clearInterval(iv);
    }, dt);
  }

  _fadeOut(audio, ms) {
    const start = audio.volume;
    const steps = 30;
    const dt = ms / steps;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      audio.volume = Math.max(0, start * (1 - i / steps));
      if (i >= steps) {
        clearInterval(iv);
        audio.pause();
        audio.currentTime = 0;
      }
    }, dt);
  }
}
