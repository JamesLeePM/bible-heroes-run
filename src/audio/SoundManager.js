export class SoundManager {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
  }

  _ctx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = AC ? new AC() : null;
    }
    return this.ctx;
  }

  _tone(freq, dur, type = 'sine', slide = 0) {
    const c = this._ctx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    if (slide !== 0) {
      o.frequency.exponentialRampToValueAtTime(
        Math.max(40, freq + slide),
        c.currentTime + dur,
      );
    }
    g.gain.setValueAtTime(0.12, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  }

  jump() {
    this._tone(220, 0.15, 'square', 220);
  }

  land() {
    this._tone(80, 0.05, 'triangle', -20);
  }

  collectStar() {
    const c = this._ctx();
    if (!c) return;
    const notes = [261.63, 329.63, 392, 523.25];
    let t = 0;
    for (const f of notes) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.1, c.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + t + 0.08);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime + t);
      o.stop(c.currentTime + t + 0.08);
      t += 0.075;
    }
  }

  collectScroll() {
    this._tone(523, 0.4, 'sine', 0);
  }

  takeDamage() {
    this._tone(200, 0.2, 'sawtooth', -120);
  }

  enemyDeath() {
    this._tone(180, 0.12, 'sawtooth', -100);
  }

  bossHit() {
    this._tone(80, 0.15, 'square', 0);
  }

  levelComplete() {
    const c = this._ctx();
    if (!c) return;
    const notes = [261.63, 329.63, 392, 523.25];
    let t = 0;
    for (const f of notes) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'square';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.08, c.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + t + 0.2);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime + t);
      o.stop(c.currentTime + t + 0.2);
      t += 0.12;
    }
  }

  specialAbility() {
    this._tone(300, 0.3, 'sine', 500);
  }

  menuSelect() {
    this._tone(440, 0.05, 'sine', 0);
  }
}
