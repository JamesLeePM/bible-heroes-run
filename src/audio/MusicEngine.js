export class MusicEngine {
  constructor() {
    this.actx = null;
    this.masterGain = null;
    this.playing = false;
    this.loopTimer = null;
    this.volume = 0.35;
  }

  init() {
    if (this.actx) return;
    try {
      this.actx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.actx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.actx.destination);
    } catch {
      // Production build — logs removed
    }
  }

  resume() {
    this.actx?.resume();
  }

  note(freq, start, dur, type = 'square', vol = 0.12) {
    if (!freq || !this.actx || !this.masterGain) return;
    try {
      const o = this.actx.createOscillator();
      const g = this.actx.createGain();
      o.connect(g);
      g.connect(this.masterGain);
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.01);
      g.gain.linearRampToValueAtTime(0, start + dur - 0.01);
      o.start(start);
      o.stop(start + dur);
    } catch (e) {}
  }

  hz(n) {
    const F = {
      C2: 65.41,
      D2: 73.42,
      Eb2: 77.78,
      E2: 82.41,
      F2: 87.31,
      G2: 98.0,
      Ab2: 103.83,
      A2: 110.0,
      Bb2: 116.54,
      B2: 123.47,
      C3: 130.8,
      D3: 146.8,
      E3: 164.8,
      F3: 174.6,
      G3: 196.0,
      A3: 220.0,
      B3: 246.9,
      Eb3: 155.56,
      Bb3: 233.08,
      C4: 261.6,
      D4: 293.7,
      E4: 329.6,
      F4: 349.2,
      G4: 392.0,
      A4: 440.0,
      B4: 493.9,
      Eb4: 311.13,
      Bb4: 466.16,
      Ab4: 415.3,
      Gb4: 369.99,
      C5: 523.3,
      D5: 587.3,
      E5: 659.3,
      F5: 698.5,
      G5: 784.0,
      A5: 880.0,
      B5: 987.8,
      Eb5: 622.25,
      Bb5: 932.33,
      C6: 1046.5,
      R: 0,
    };
    return F[n] || 0;
  }

  bps(bpm) {
    return 60 / bpm;
  }

  SONGS = {
    MENU: {
      bpm: 140,
      mel: [
        ['E5', 0.25],
        ['E5', 0.25],
        ['R', 0.25],
        ['E5', 0.25],
        ['R', 0.25],
        ['C5', 0.25],
        ['E5', 0.5],
        ['G5', 0.5],
        ['R', 0.5],
        ['G4', 0.5],
        ['R', 0.5],
        ['C5', 0.5],
        ['R', 0.25],
        ['G4', 0.25],
        ['R', 0.5],
        ['E4', 0.5],
        ['A4', 0.5],
        ['B4', 0.5],
        ['A4', 0.5],
        ['G4', 0.5],
        ['E5', 0.33],
        ['G5', 0.33],
        ['A5', 0.33],
        ['F5', 0.25],
        ['G5', 0.25],
        ['E5', 0.5],
        ['C5', 0.25],
        ['D5', 0.25],
        ['B4', 0.75],
        ['R', 0.25],
      ],
      bas: [
        ['C3', 0.5],
        ['G3', 0.5],
        ['A3', 0.5],
        ['F3', 0.5],
        ['C3', 0.5],
        ['G3', 0.5],
        ['F3', 0.5],
        ['G3', 0.5],
      ],
    },
    DESERT: {
      bpm: 128,
      mel: [
        ['A4', 0.25],
        ['R', 0.25],
        ['A4', 0.25],
        ['G4', 0.25],
        ['A4', 0.5],
        ['F4', 0.5],
        ['E4', 0.5],
        ['D4', 0.25],
        ['E4', 0.25],
        ['F4', 0.25],
        ['E4', 0.25],
        ['D4', 0.5],
        ['C4', 0.5],
        ['D4', 0.5],
        ['E4', 0.5],
        ['A3', 1.0],
        ['R', 0.5],
      ],
      bas: [
        ['A2', 0.5],
        ['A2', 0.5],
        ['E3', 0.5],
        ['D3', 0.5],
        ['A2', 0.5],
        ['E3', 0.5],
        ['A2', 1.0],
      ],
    },
    STORM: {
      bpm: 160,
      mel: [
        ['E4', 0.25],
        ['F4', 0.25],
        ['G4', 0.25],
        ['G4', 0.25],
        ['F4', 0.25],
        ['E4', 0.25],
        ['D4', 0.25],
        ['C4', 0.25],
        ['C4', 0.25],
        ['D4', 0.25],
        ['E4', 0.25],
        ['E4', 0.5],
        ['D4', 0.5],
        ['D4', 1.0],
      ],
      bas: [
        ['C3', 0.25],
        ['G3', 0.25],
        ['C3', 0.25],
        ['G3', 0.25],
        ['A2', 0.25],
        ['E3', 0.25],
        ['A2', 0.25],
        ['E3', 0.25],
      ],
    },
    BATTLE: {
      bpm: 150,
      mel: [
        ['G4', 0.25],
        ['G4', 0.25],
        ['G4', 0.25],
        ['Eb4', 0.5],
        ['Bb4', 0.25],
        ['G4', 0.5],
        ['Eb4', 0.25],
        ['Bb4', 0.25],
        ['G4', 1.0],
        ['D5', 0.25],
        ['D5', 0.25],
        ['D5', 0.25],
        ['Eb5', 0.5],
        ['Bb4', 0.25],
        ['F4', 0.5],
        ['Eb4', 0.25],
        ['Bb4', 0.25],
        ['G4', 1.0],
      ],
      bas: [
        ['G2', 0.5],
        ['D3', 0.5],
        ['Eb3', 0.5],
        ['Bb2', 0.5],
        ['G2', 0.5],
        ['D3', 0.5],
        ['C3', 0.5],
        ['G2', 0.5],
      ],
    },
    OCEAN: {
      bpm: 110,
      mel: [
        ['C5', 0.5],
        ['B4', 0.25],
        ['A4', 0.25],
        ['G4', 0.5],
        ['F4', 0.5],
        ['E4', 0.5],
        ['D4', 0.5],
        ['C4', 1.0],
        ['R', 0.5],
        ['E4', 0.5],
        ['G4', 0.5],
        ['A4', 0.5],
        ['C5', 0.5],
        ['G4', 1.0],
        ['R', 0.5],
      ],
      bas: [
        ['C3', 0.5],
        ['G3', 0.5],
        ['F3', 0.5],
        ['C3', 0.5],
        ['A2', 0.5],
        ['E3', 0.5],
        ['F2', 0.5],
        ['G2', 0.5],
      ],
    },
    CAVE: {
      bpm: 80,
      mel: [
        ['D4', 0.5],
        ['R', 0.25],
        ['D4', 0.25],
        ['Eb4', 0.5],
        ['D4', 0.5],
        ['C4', 0.5],
        ['R', 0.5],
        ['B3', 0.5],
        ['C4', 0.5],
        ['D4', 1.0],
        ['R', 0.5],
      ],
      bas: [
        ['D2', 1.0],
        ['A2', 1.0],
        ['G2', 1.0],
        ['A2', 1.0],
      ],
    },
    GARDEN: {
      bpm: 95,
      mel: [
        ['G4', 0.5],
        ['A4', 0.5],
        ['B4', 0.5],
        ['C5', 1.0],
        ['B4', 0.5],
        ['A4', 0.5],
        ['G4', 0.5],
        ['E4', 0.5],
        ['D4', 1.0],
        ['R', 0.5],
        ['E4', 0.5],
        ['G4', 0.5],
        ['A4', 1.0],
        ['G4', 0.5],
        ['F4', 0.5],
        ['E4', 0.5],
        ['D4', 0.5],
        ['C4', 1.0],
      ],
      bas: [
        ['C3', 1.0],
        ['G3', 1.0],
        ['A3', 1.0],
        ['F3', 1.0],
        ['C3', 1.0],
        ['G3', 1.0],
        ['F3', 1.0],
        ['G3', 1.0],
      ],
    },
    HOLY: {
      bpm: 80,
      mel: [
        ['E4', 1.0],
        ['D4', 0.5],
        ['E4', 0.5],
        ['F4', 1.0],
        ['E4', 1.0],
        ['D4', 2.0],
        ['E4', 1.0],
        ['F4', 0.5],
        ['G4', 0.5],
        ['A4', 1.0],
        ['G4', 1.0],
        ['F4', 2.0],
      ],
      bas: [
        ['C3', 1.0],
        ['G3', 1.0],
        ['A3', 1.0],
        ['F3', 1.0],
        ['C3', 1.0],
        ['G3', 1.0],
        ['F3', 1.0],
        ['G3', 1.0],
      ],
    },
    VICTORY: {
      bpm: 180,
      once: true,
      mel: [
        ['C5', 0.25],
        ['C5', 0.25],
        ['C5', 0.25],
        ['C5', 0.5],
        ['G4', 0.25],
        ['Bb4', 0.25],
        ['A4', 0.25],
        ['Ab4', 0.25],
        ['G4', 0.5],
        ['Eb4', 0.25],
        ['E4', 0.5],
        ['G4', 0.25],
        ['G4', 0.25],
        ['G4', 0.25],
        ['C5', 1.0],
      ],
      bas: [
        ['C3', 0.5],
        ['G3', 0.5],
        ['C3', 0.5],
        ['Eb3', 0.5],
        ['F3', 0.5],
        ['G3', 0.5],
        ['C3', 1.0],
      ],
    },
    GAMEOVER: {
      bpm: 60,
      once: true,
      mel: [
        ['C5', 0.5],
        ['B4', 0.5],
        ['Bb4', 0.5],
        ['A4', 0.5],
        ['Ab4', 0.5],
        ['G4', 0.5],
        ['Gb4', 1.0],
      ],
      bas: [],
    },
  };

  getSongForLevel(ld) {
    const p = ld?.background?.parallax || '';
    const n = ld?.name || '';
    if (n.includes('Easter') || n.includes('Risen')) return 'HOLY';
    if (
      n.includes('Jericho') ||
      n.includes('Goliath') ||
      n.includes('Battle') ||
      n.includes('Samson')
    )
      return 'BATTLE';
    if (p === 'cave' || n.includes('Lion') || n.includes('Daniel') || n.includes('Prison')) return 'CAVE';
    if (p === 'ocean' || n.includes('Jonah') || n.includes('Ocean') || n.includes('Water')) return 'OCEAN';
    if (p === 'storm' || n.includes('Flood') || n.includes('Storm') || n.includes('Noah')) return 'STORM';
    if (p === 'desert' || n.includes('Desert') || n.includes('Moses') || n.includes('Egypt')) return 'DESERT';
    if (p === 'hills' || n.includes('Garden') || n.includes('Eden')) return 'GARDEN';
    if (n.includes('Jesus') || n.includes('Holy') || n.includes('Prayer')) return 'HOLY';
    return 'MENU';
  }

  playSong(name, vol) {
    this.init();
    if (!this.actx) return;
    this.stop();
    if (vol !== undefined) {
      this.volume = vol;
      if (this.masterGain) this.masterGain.gain.value = vol;
    }
    this.actx.resume();
    this.playing = true;
    this._loop(name);
  }

  _loop(name) {
    if (!this.playing || !this.actx) return;
    const song = this.SONGS[name];
    if (!song) return;

    const bps = this.bps(song.bpm);
    let t = this.actx.currentTime + 0.05;
    let bassT = t;

    song.mel.forEach(([n, dur]) => {
      const f = this.hz(n);
      const d = dur * bps;
      if (f) this.note(f, t, d, 'square', 0.1);
      t += d;
    });

    song.bas?.forEach(([n, dur]) => {
      const f = this.hz(n);
      const d = dur * bps;
      if (f) this.note(f, bassT, d, 'triangle', 0.07);
      bassT += d;
    });

    if (!song.once) {
      const loopLen = Math.max(t, bassT) - this.actx.currentTime;
      this.loopTimer = setTimeout(() => this._loop(name), (loopLen - 0.3) * 1000);
    }
  }

  stop() {
    this.playing = false;
    clearTimeout(this.loopTimer);
    this.loopTimer = null;
  }

  setVolume(v) {
    this.volume = v;
    if (this.masterGain && this.actx) {
      this.masterGain.gain.linearRampToValueAtTime(v, this.actx.currentTime + 0.1);
    }
  }
}

export const musicEngine = new MusicEngine();
