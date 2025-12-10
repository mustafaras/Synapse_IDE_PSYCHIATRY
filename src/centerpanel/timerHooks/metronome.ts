

export type MetronomeState = { on: boolean; bpm: number; subdivision: 1|2|4; volume: number };

export class Metronome {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private nextTime = 0;
  private lookaheadId: number | null = null;
  private intervalMs = 25;
  private scheduleAhead = 0.15;
  private pulseCounter = 0;

  private getStateFn: () => MetronomeState;
  private onPulse: ((major: boolean, whenCtxTime: number) => void) | null = null;
  constructor(getState: () => MetronomeState, onPulse?: (major: boolean, whenCtxTime: number) => void) {
    this.getStateFn = getState;
    if (onPulse) this.onPulse = onPulse;
  }

  setOnPulse(cb: (major: boolean, whenCtxTime: number) => void) { this.onPulse = cb; }

  private ensureContext() {
    if (this.ctx) return;

    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) throw new Error('no-audio-context');
    this.ctx = new AC();
    const ctx = this.ctx as AudioContext;
    const g = ctx.createGain();
    g.connect(ctx.destination);

    try { g.gain.value = Math.max(0, Math.min(1, this.getStateFn().volume)); } catch {}
    this.gain = g;
  }


  resumeContext() {
    try { if (this.ctx && (this.ctx as any).state === 'suspended' && (this.ctx as any).resume) { (this.ctx as any).resume(); } } catch {}
  }


  setVolume(vol: number) {
    const v = Math.max(0, Math.min(1, vol));
    if (this.gain && this.ctx) {
      try { this.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.01); } catch { try { this.gain.gain.value = v; } catch {} }
    }
  }

  start() {
    this.ensureContext();
    if (!this.ctx || !this.gain) return;

    try { if ((this.ctx as any).state === 'suspended' && (this.ctx as any).resume) { (this.ctx as any).resume(); } } catch {}
    this.nextTime = this.ctx.currentTime + 0.05;
    this.pulseCounter = 0;
    const loop = () => {
      const state = this.getStateFn();
      if (!state.on) { this.stop(); return; }
      const secondsPerBeat = 60.0 / Math.max(1, state.bpm);

      while (this.nextTime < (this.ctx!.currentTime + this.scheduleAhead)) {

        const major = (this.pulseCounter % state.subdivision) === 0;
        this.clickAt(this.nextTime, major);
        this.pulseCounter++;
        this.nextTime += secondsPerBeat / state.subdivision;
      }
      this.lookaheadId = window.setTimeout(loop, this.intervalMs) as unknown as number;
    };
    loop();
  }

  restart() {

    const running = this.getStateFn().on;
    this.stop();
    if (running) this.start();
  }

  stop() {
    if (this.lookaheadId != null) { window.clearTimeout(this.lookaheadId); this.lookaheadId = null; }
  }

  private clickAt(when: number, major: boolean) {
    if (!this.ctx || !this.gain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    const base = 0.2;
    g.gain.value = major ? base : base * 0.6;
    osc.type = 'sine';
    osc.frequency.value = major ? 880 : 660;
    const dur = 0.02;
    osc.connect(g);
    g.connect(this.gain);
    osc.start(when);
    g.gain.setValueAtTime(g.gain.value, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.stop(when + dur);

    if (this.onPulse) {
      const delay = Math.max(0, Math.round((when - this.ctx.currentTime) * 1000));
      window.setTimeout(() => { try { this.onPulse && this.onPulse(major, when); } catch {} }, delay);
    }

    osc.onended = () => { try { g.disconnect(); osc.disconnect(); } catch {} };
  }
}
