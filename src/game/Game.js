import { musicEngine } from '../audio/MusicEngine.js';
import { GameLoop } from '../engine/GameLoop.js';
import { Camera } from '../engine/Camera.js';
import { input, inputP2, initKeyboard, resetAllFrameInput } from '../engine/Input.js';
import { ParticleSystem } from '../engine/Particles.js';
import { SoundManager } from '../audio/SoundManager.js';
import { Level } from '../world/Level.js';
import { Player } from '../characters/Player.js';
import { spawnEnemies } from '../characters/Enemies.js';
import { MainMenu } from '../ui/MainMenu.js';
import { CharacterSelect } from '../ui/CharacterSelect.js';
import { HUD } from '../ui/HUD.js';
import { TouchControls } from '../ui/TouchControls.js';
import { GabrielGuide } from '../ui/GabrielGuide.js';
import { drawItem } from '../assets/SpriteSheet.js';
import {
  drawSkyGradient,
  drawParallaxFar,
  drawParallaxNear,
  drawLevelAmbientFX,
  drawWorldDecorations,
  drawExitGate,
  drawGoalHint,
} from '../world/BackgroundLayers.js';
import { ItemType, LevelMode, EnemyType, CharId, TOTAL_LEVELS, TileId } from '../game/constants.js';
import {
  saveStars,
  saveUnlockedMax,
  setAllLevelsComplete,
  saveScores,
  loadScores,
  saveNoDamage,
} from './storage.js';
import { CoopMode } from '../modes/CoopMode.js';
import { getExitHitRect } from './exitZone.js';
import { settings } from '../ui/SettingsMenu.js';

/** @param {number} base */
function damageFromDifficulty(base) {
  const m = { EASY: 0.5, NORMAL: 1.0, HARD: 2.0 }[settings.settings.difficulty] ?? 1.0;
  const raw = base * m;
  if (raw < 1) return Math.random() < raw ? 1 : 0;
  return Math.min(3, Math.round(raw));
}

function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** iOS-safe: never Object.assign onto element.style */
function applyDomStyles(el, styles) {
  Object.keys(styles).forEach((k) => {
    el.style[k] = styles[k];
  });
}

/**
 * DOM pause overlay (tappable on iOS; not canvas).
 * @param {Game} game
 */
function showPauseMenu(game) {
  document.getElementById('pause-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'pause-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.75);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  `;

  const levelNum = game.savedLevelIndex + 1;
  overlay.innerHTML = `
    <div style="
      background: linear-gradient(180deg,#2d2418,#1a1510);
      border: 4px solid #FFD700;
      border-radius: 20px;
      padding: 32px 48px;
      text-align: center;
      min-width: 280px;
    ">
      <h2 style="
        font-family:'Press Start 2P',monospace;
        color:#FFD700;
        font-size:clamp(14px,3vw,20px);
        margin:0 0 8px;
        text-shadow:2px 2px 0 #000;
      ">PAUSED ⏸</h2>
      <p style="
        font-family:'Press Start 2P',monospace;
        font-size:8px;
        color:#aaa;
        margin:0 0 24px;
      ">Level ${levelNum} of ${TOTAL_LEVELS}</p>

      <div style="display:flex;flex-direction:column;gap:12px;">
        <button id="pause-resume" type="button" style="
          font-family:'Press Start 2P',monospace;
          font-size:clamp(10px,2vw,13px);
          padding:14px 28px;
          background:#44CC44;
          color:#fff;
          border:4px solid #228B22;
          border-radius:14px;
          cursor:pointer;
          touch-action:manipulation;
          -webkit-tap-highlight-color:transparent;
        ">▶ RESUME</button>

        <button id="pause-levels" type="button" style="
          font-family:'Press Start 2P',monospace;
          font-size:clamp(10px,2vw,13px);
          padding:14px 28px;
          background:#4488CC;
          color:#fff;
          border:4px solid #224488;
          border-radius:14px;
          cursor:pointer;
          touch-action:manipulation;
          -webkit-tap-highlight-color:transparent;
        ">🗺 LEVELS</button>

        <button id="pause-menu" type="button" style="
          font-family:'Press Start 2P',monospace;
          font-size:clamp(10px,2vw,13px);
          padding:14px 28px;
          background:#CC4444;
          color:#fff;
          border:4px solid #882222;
          border-radius:14px;
          cursor:pointer;
          touch-action:manipulation;
          -webkit-tap-highlight-color:transparent;
        ">🏠 MAIN MENU</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const resumeBtn = overlay.querySelector('#pause-resume');
  const doResume = () => {
    overlay.remove();
    game.paused = false;
  };
  resumeBtn.addEventListener('click', doResume);
  resumeBtn.addEventListener(
    'touchend',
    (e) => {
      e.preventDefault();
      doResume();
    },
    { passive: false },
  );

  const levelsBtn = overlay.querySelector('#pause-levels');
  const doLevels = () => {
    overlay.remove();
    game._exitPauseToLevelSelect();
  };
  levelsBtn.addEventListener('click', doLevels);
  levelsBtn.addEventListener(
    'touchend',
    (e) => {
      e.preventDefault();
      doLevels();
    },
    { passive: false },
  );

  const menuBtn = overlay.querySelector('#pause-menu');
  const doMenu = () => {
    overlay.remove();
    game._exitPauseToMainMenu();
    // Production build — logs removed
  };
  menuBtn.addEventListener('click', doMenu);
  menuBtn.addEventListener(
    'touchend',
    (e) => {
      e.preventDefault();
      doMenu();
    },
    { passive: false },
  );
}

/** Recommended first level per hero when opening from main menu PLAY. */
const RECOMMENDED_LEVEL = {
  [CharId.DAVID]: 8,
  [CharId.MOSES]: 11,
  [CharId.NOAH]: 7,
  [CharId.MARY]: 19,
  [CharId.DANIEL]: 3,
  [CharId.ESTHER]: 15,
  [CharId.JONAH]: 16,
  [CharId.JOSHUA_HERO]: 5,
  [CharId.JOSHUA]: 13,
  [CharId.CALEB]: 0,
};

export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.state = 'MENU';
    this.pendingLevel = 0;
    /** True when user picked a level from the map (use that index); false when coming from main PLAY (use recommended level per hero). */
    this.levelFromMap = false;
    this.coop = false;

    this.mainMenu = new MainMenu(canvas, ctx);
    this.mainMenu.onPlay = () => {
      this.pendingLevel = 0;
      this.levelFromMap = false;
      this.state = 'CHAR';
    };
    this.mainMenu.onCoop = () => {
      this.pendingLevel = 0;
      CoopMode.enter(this);
    };
    this.mainMenu.onLevelChosen = (idx) => {
      this.pendingLevel = idx;
      this.levelFromMap = true;
      this.state = 'CHAR';
    };

    this.characterSelect = new CharacterSelect(canvas);
    this.characterSelect.onPick = (id) => {
      // Production build — logs removed
      const levelIdx = this._resolveStartLevelIndex(id);
      this.startLevel(levelIdx, id);
    };
    this.characterSelect.onBack = () => {
      this.state = 'MENU';
    };

    this.hud = new HUD(canvas);

    this.touch = new TouchControls();
    this.gabriel = new GabrielGuide();
    this.gabriel.onDone = null;

    this.camera = new Camera();
    this.camera2 = new Camera();
    this.particles = new ParticleSystem();
    this.sound = new SoundManager();
    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.draw(),
    );

    /** @type {Level | null} */
    this.level = null;
    /** @type {Player | null} */
    this.player = null;
    /** @type {Player | null} */
    this.player2 = null;
    /** @type {Enemy[]} */
    this.enemies = [];
    /** @type {object[]} */
    this.items = [];
    this.paused = false;
    this.frame = 0;
    this.shake = 0;
    /** Amplitude for screen shake (pixels, scaled in draw). */
    this._shakeIntensity = 6;
    this.mosesPlatforms = 0;
    this.floodTimer = 0;
    this.floodRow = 0;
    this.jerichoLap = 0;
    this.jerichoLastX = 0;
    this.prayerTimer = 0;
    this.levelDamageTaken = false;
    this.totalScrolls = 0;
    this.collectedScrolls = 0;
    this.redSeaDry = 0;
    this.brotherMsgTimer = 0;
    this.brotherMsg = '';
    /** @type {Set<string>} */
    this.prayedSpots = new Set();
    this.sharedStars = 0;
    /** @type {'complete' | 'gameover' | null} */
    this.overlay = null;
    this.overlayStars = 0;
    this.overlayVerse = '';
    this.overlayLevelIdx = 0;
    this.overlayFrame = 0;
    this.savedCharId = CharId.DAVID;
    this.savedLevelIndex = 0;
    this.lightningFlash = 0;
    /** Seconds until goal hint at top fades */
    this.goalHintTimer = 0;
    /** Extra chances before DON'T GIVE UP (void or health). */
    this.lives = 3;
    /** Frames until game-over overlay after last life (2s at ~60fps). */
    this.gameOverDelay = null;
    /** @type {HTMLButtonElement | null} */
    this._lcNext = null;
    /** @type {HTMLButtonElement | null} */
    this._lcMenu = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._celebrationTimer = null;
    /** @type {HTMLDivElement | null} */
    this._celebrationOverlayEl = null;
    /** @type {HTMLButtonElement | null} */
    this._pauseBtnEl = null;
    /** Manna level: bread pieces collected toward win. */
    this._mannaBreadCollected = 0;
    /** Feeding 5000: whether miracle hearts were spawned. */
    this._feedingHeartsSpawned = false;
    /** Seconds accumulated for manna rain spawns. */
    this._mannaSpawnAcc = 0;
    /** Screen shake amplitude when `shake` frames > 0 */
    this._shakeIntensity = 6;

    initKeyboard();

    document.addEventListener(
      'touchstart',
      () => {
        musicEngine.init();
        musicEngine.actx?.resume();
      },
      { once: true },
    );

    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'hud-pause-btn';
    pauseBtn.type = 'button';
    pauseBtn.textContent = '⏸';
    pauseBtn.setAttribute('aria-label', 'Pause');
    applyDomStyles(pauseBtn, {
      position: 'fixed',
      top: '8px',
      right: '8px',
      width: '56px',
      height: '56px',
      minWidth: '56px',
      minHeight: '56px',
      zIndex: '1000',
      fontSize: '24px',
      lineHeight: '1',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      background: '#1a1510',
      color: '#fff',
      border: '4px solid #FFD700',
      borderRadius: '12px',
      cursor: 'pointer',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    });
    const onPauseActivate = () => {
      this.togglePause();
    };
    pauseBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      onPauseActivate();
    }, { passive: false });
    pauseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      onPauseActivate();
    });
    document.body.appendChild(pauseBtn);
    this._pauseBtnEl = pauseBtn;

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && (this.state === 'PLAYING' || this.state === 'COOP')) {
        e.preventDefault();
        this.togglePause();
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const r = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) * this.canvas.width) / r.width;
      const y = ((e.clientY - r.top) * this.canvas.height) / r.height;
      const h = this.canvas.height;
      if (this.overlay === 'complete') {
        if (y > h * 0.68 && y < h * 0.78) {
          const next = this.overlayLevelIdx + 1;
          this._clearOverlay();
          if (next < TOTAL_LEVELS) this.startLevel(next, this.savedCharId);
          else this._goMenu();
        } else if (y > h * 0.78) {
          this._goMenu();
        }
        return;
      }
      if (this.overlay === 'gameover') {
        if (y > h * 0.58 && y < h * 0.68) {
          this._clearOverlay();
          this.startLevel(this.savedLevelIndex, this.savedCharId);
        } else if (y > h * 0.68) {
          this._goMenu();
        }
        return;
      }
      if (
        (this.state === 'PLAYING' || this.state === 'COOP') &&
        this._gabrielHintsEnabled() &&
        this.gabriel.isActive()
      ) {
        this.gabriel.tap(x, y);
        return;
      }
    });
  }

  start() {
    this.loop.start();
  }

  _clearOverlay() {
    this._removeLevelCompleteButtons();
    this._removeCelebrationDom();
    this.overlay = null;
    this.overlayFrame = 0;
    this.level = null;
    this.player = null;
    this.player2 = null;
    this.enemies = [];
    this.items = [];
    this.touch.hide();
  }

  _goMenu() {
    try {
      musicEngine.playSong('MENU', 0.35);
    } catch (_) {}
    this._removeLevelCompleteButtons();
    this._removeCelebrationDom();
    this.state = 'MENU';
    this.coop = false;
    this.touch.hide();
    this.level = null;
    this.player = null;
    this.player2 = null;
    this.overlay = null;
  }

  _pauseTeardownGameplay() {
    this._removeLevelCompleteButtons();
    this._removeCelebrationDom();
    this.coop = false;
    this.touch.hide();
    this.level = null;
    this.player = null;
    this.player2 = null;
    this.enemies = [];
    this.items = [];
    this.overlay = null;
    this.particles.clear();
    document.getElementById('mission-banner')?.remove();
    document.getElementById('level-complete-overlay')?.remove();
    document.getElementById('next-level-btn')?.remove();
    document.getElementById('menu-btn')?.remove();
  }

  _exitPauseToLevelSelect() {
    this.paused = false;
    this._pauseTeardownGameplay();
    this.state = 'MENU';
    this.mainMenu.showLevelSelect();
  }

  _exitPauseToMainMenu() {
    this.paused = false;
    this._pauseTeardownGameplay();
    this.state = 'MENU';
    this.mainMenu.show();
  }

  _gabrielHintsEnabled() {
    const s = settings.settings;
    return s.showHints && s.difficulty !== 'HARD';
  }

  togglePause() {
    if (!(this.state === 'PLAYING' || this.state === 'COOP')) return;
    if (this.overlay) return;
    if (this.paused) {
      document.getElementById('pause-overlay')?.remove();
      this.paused = false;
    } else {
      this.paused = true;
      showPauseMenu(this);
    }
  }

  _syncPauseButton() {
    const btn = this._pauseBtnEl;
    if (!btn) return;
    const show = (this.state === 'PLAYING' || this.state === 'COOP') && !this.overlay;
    btn.style.display = show ? 'flex' : 'none';
  }

  _removeLevelCompleteButtons() {
    this._lcNext?.remove();
    this._lcMenu?.remove();
    this._lcNext = null;
    this._lcMenu = null;
  }

  _removeCelebrationDom() {
    this._celebrationOverlayEl?.remove();
    this._celebrationOverlayEl = null;
    if (this._celebrationTimer != null) {
      clearTimeout(this._celebrationTimer);
      this._celebrationTimer = null;
    }
  }

  /**
   * @param {string} charId
   * @returns {number}
   */
  _resolveStartLevelIndex(charId) {
    if (this.levelFromMap) return this.pendingLevel;
    return RECOMMENDED_LEVEL[charId] ?? 0;
  }

  /** @param {number} dt */
  _updateLevelCompleteCelebration(dt) {
    const p = this.player;
    const lv = this.level;
    if (!p || !lv) return;
    this.frame++;
    const inp = input;
    const idx = lv.data.index;
    const pFlags = {};
    if (idx === 7) pFlags.windLeft = true;
    if (idx === 17) pFlags.faithWater = true;
    p.update(inp, lv.tileMap, dt, pFlags);
    if (this.player2) {
      const inp2 = inputP2;
      this.player2.update(inp2, lv.tileMap, dt, pFlags);
    }
    this.particles.update();
    const viewW = this.coop ? this.canvas.width / 2 : this.canvas.width;
    const viewH = this.canvas.height;
    this.camera.update(p, viewW, viewH, lv.widthPx, lv.heightPx);
    if (this.coop && this.player2) {
      this.camera2.update(this.player2, viewW, viewH, lv.widthPx, lv.heightPx);
    }
    if (this.shake > 0) this.shake--;
  }

  _beginLevelCompleteSequence() {
    if (this.state === 'COMPLETE') return;
    if (!this.level || !this.player) return;

    const idx = this.level.data.index;
    const scrollsCollected = this.player.scrolls;
    const tookNoDamage = !this.levelDamageTaken && this.player.health === this.player.maxHealth;
    const stars = 1 + (scrollsCollected >= 2 ? 1 : 0) + (tookNoDamage ? 1 : 0);

    saveStars(idx, stars);
    saveUnlockedMax(idx + 1);
    if (idx === TOTAL_LEVELS - 1) setAllLevelsComplete();
    saveNoDamage(idx, tookNoDamage);

    const sc = loadScores();
    const add = this.player ? this.player.stars : 0;
    if (this.coop) {
      saveScores({
        joshua: sc.joshua + Math.floor(add / 2),
        caleb: sc.caleb + Math.ceil(add / 2),
      });
    } else {
      saveScores({ dad: sc.dad + add });
    }

    this.overlayStars = stars;
    this.overlayVerse = this.level.data.bibleStory;
    this.overlayLevelIdx = idx;

    this.state = 'COMPLETE';
    this.enemies.forEach((e) => {
      e.frozen = true;
    });

    this.player.vy = -12;
    this.player.celebrateFrames = 120;
    this.player.winFreeze = false;
    if (this.player2) {
      this.player2.vy = -12;
      this.player2.celebrateFrames = 120;
      this.player2.winFreeze = false;
    }

    this.sound.levelComplete();
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    for (let i = 0; i < 40; i++) {
      this.particles.emit(px, py, {
        kind: 'confetti',
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 90,
        size: Math.random() * 8 + 4,
      });
    }

    this._removeCelebrationDom();
    this._celebrationTimer = setTimeout(() => {
      this._celebrationTimer = null;
      this.showCelebrationScreen();
    }, 1500);
  }

  showCelebrationScreen() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(0, 0, w, h);

    const overlay = document.createElement('div');
    overlay.id = 'level-complete-overlay';
    this._celebrationOverlayEl = overlay;
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      background: rgba(0,0,0,0.5);
    `;

    const scrollsCollected = this.player ? this.player.scrolls : 0;
    const tookNoDamage =
      this.player && !this.levelDamageTaken && this.player.health === this.player.maxHealth;
    const stars = 1 + (scrollsCollected >= 2 ? 1 : 0) + (tookNoDamage ? 1 : 0);

    const levelName = this.level ? this.level.data.name : '';
    const verses = [
      '"The Lord is my shepherd" — Psalm 23:1',
      '"Be strong and courageous!" — Joshua 1:9',
      '"Trust in the Lord" — Proverbs 3:5',
      '"I can do all things" — Phil 4:13',
      '"God so loved the world" — John 3:16',
      '"With God all things are possible" — Matt 19:26',
    ];
    const verse = verses[this.savedLevelIndex % verses.length];

    overlay.innerHTML = `
    <div style="
      background: linear-gradient(180deg, #FFD700, #CC8800);
      border: 6px solid #886600;
      border-radius: 24px;
      padding: 32px 48px;
      text-align: center;
      max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    ">
      <div style="font-size: 28px; margin-bottom: 8px;">🎉</div>
      <h1 style="
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(14px, 3vw, 22px);
        color: #fff;
        text-shadow: 2px 2px 0 #000;
        margin: 0 0 16px;
      ">LEVEL COMPLETE!</h1>
      <p style="font-family:'Press Start 2P',monospace;font-size:clamp(8px,1.5vw,11px);color:#fff;margin:0 0 8px;">${levelName}</p>
      <div style="font-size: clamp(24px, 5vw, 36px); margin: 12px 0;">
        ${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}
      </div>
      <p style="
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(7px, 1.5vw, 10px);
        color: #fff;
        line-height: 1.8;
        margin: 16px 0;
        max-width: 300px;
      ">${verse}</p>
      <div style="display: flex; gap: 16px; justify-content: center; margin-top: 24px;">
        <button id="next-level-btn" type="button" style="
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(10px, 2vw, 14px);
          padding: 14px 28px;
          background: #44CC44;
          color: white;
          border: 4px solid #228B22;
          border-radius: 16px;
          cursor: pointer;
          touch-action: manipulation;
        ">NEXT ▶</button>
        <button id="menu-btn" type="button" style="
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(10px, 2vw, 14px);
          padding: 14px 28px;
          background: #4488CC;
          color: white;
          border: 4px solid #224488;
          border-radius: 16px;
          cursor: pointer;
          touch-action: manipulation;
        ">MENU</button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    const cleanup = () => {
      overlay.remove();
      this._celebrationOverlayEl = null;
    };

    const nextBtn = overlay.querySelector('#next-level-btn');
    const menuBtn = overlay.querySelector('#menu-btn');

    const goNext = () => {
      cleanup();
      const next = this.savedLevelIndex + 1;
      this._clearOverlay();
      if (next < TOTAL_LEVELS) {
        this.startLevel(next, this.savedCharId);
      } else {
        this.showGameComplete();
      }
    };

    const goMenu = () => {
      cleanup();
      this._goMenu();
    };

    nextBtn.addEventListener('click', goNext);
    nextBtn.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        goNext();
      },
      { passive: false },
    );

    menuBtn.addEventListener('click', goMenu);
    menuBtn.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        goMenu();
      },
      { passive: false },
    );
  }

  showGameComplete() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: linear-gradient(180deg, #1a0a3e, #4a1a8e);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center; padding: 32px;
    `;
    overlay.innerHTML = `
    <div style="font-size: 48px">🏆✝️🏆</div>
    <h1 style="
      font-family: 'Press Start 2P', monospace;
      color: #FFD700; font-size: clamp(16px, 3vw, 24px);
      margin: 16px 0; text-shadow: 2px 2px 0 #000;
    ">YOU DID IT!</h1>
    <p style="
      font-family: 'Press Start 2P', monospace;
      color: white; font-size: clamp(8px, 1.5vw, 12px);
      line-height: 2; max-width: 400px;
    ">
      Joshua & Caleb — you completed<br>
      all the Bible adventures!<br><br>
      "I can do all things through<br>
      Christ who strengthens me"<br>
      — Philippians 4:13
    </p>
    <button id="play-again-btn" type="button" style="
      margin-top: 32px;
      font-family: 'Press Start 2P', monospace;
      font-size: 14px; padding: 16px 32px;
      background: #FFD700; color: #000;
      border: 4px solid #CC8800;
      border-radius: 16px; cursor: pointer;
    ">PLAY AGAIN! 🎮</button>
  `;
    document.body.appendChild(overlay);
    overlay.querySelector('#play-again-btn').addEventListener('click', () => {
      overlay.remove();
      this._clearOverlay();
      this.state = 'MENU';
    });
  }

  startCoop() {
    document.getElementById('pause-overlay')?.remove();
    this.paused = false;
    this._removeLevelCompleteButtons();
    this._removeCelebrationDom();
    // Production build — logs removed
    this.coop = true;
    this.state = 'COOP';
    this.savedLevelIndex = this.pendingLevel;
    this.touch.setCoop(true);
    this.touch.show();
    this.level = new Level(this.pendingLevel);
    this.player = new Player(this.level.data.startX, this.level.data.startY, CharId.JOSHUA);
    this._settlePlayer(this.player);
    this.player2 = new Player(this.level.data.startX + 40, this.level.data.startY, CharId.CALEB);
    this._settlePlayer(this.player2);
    this.enemies = spawnEnemies(this.level.data.enemies);
    this._initItems();
    this.jerichoLastX = this.player.x;
    this.jerichoWallsGone = false;
    this.levelDamageTaken = false;
    this.prayedSpots = new Set();
    this.sharedStars = 0;
    this._countScrolls();
    this.goalHintTimer = 5;
    this.lives = 3;
    this.gameOverDelay = null;
    this._mannaBreadCollected = 0;
    this._feedingHeartsSpawned = false;
    this._mannaSpawnAcc = 0;
    try {
      musicEngine.playSong(musicEngine.getSongForLevel(this.level.data), 0.35);
    } catch {
      // Production build — logs removed
    }
  }

  /**
   * @param {Player} player
   */
  _settlePlayer(player) {
    if (!this.level?.tileMap) return;
    player.vy = 0;
    player.vx = 0;
    player.onGround = false;

    for (let i = 0; i < 80; i++) {
      player.vy = Math.min(player.vy + 0.8, 14);
      player.y += player.vy;

      const feetY = player.y + player.height;
      const cx = player.x + player.width / 2;
      const tx = Math.floor(cx / 32);
      const ty = Math.floor(feetY / 32);
      const id = this.level.tileMap.getTileAtTile(tx, ty);

      if (id > 0 && id !== 5) {
        player.y = ty * 32 - player.height;
        player.vy = 0;
        player.onGround = true;
        return;
      }
    }

    const tx2 = Math.floor((player.x + player.width / 2) / 32);
    for (let ty = 0; ty < this.level.data.height; ty++) {
      const id = this.level.tileMap.getTileAtTile(tx2, ty);
      if (id > 0 && id !== 5) {
        player.y = ty * 32 - player.height;
        player.vy = 0;
        player.onGround = true;
        return;
      }
    }
  }

  /**
   * @param {number} index
   * @param {string} charId
   */
  startLevel(index, charId) {
    const displayName =
      charId === CharId.JOSHUA_HERO
        ? 'JOSHUA'
        : charId.replace(/_/g, ' ').toUpperCase();
    // Production build — logs removed
    document.getElementById('pause-overlay')?.remove();
    this.paused = false;
    this._removeLevelCompleteButtons();
    this._removeCelebrationDom();
    this.coop = false;
    this.overlay = null;
    this.savedCharId = charId;
    this.savedLevelIndex = index;
    this.touch.setCoop(false);
    this.touch.show();
    this.state = 'PLAYING';
    this.level = new Level(index);
    this.player = new Player(this.level.data.startX, this.level.data.startY, charId);
    this._settlePlayer(this.player);
    this.player2 = null;
    this.enemies = spawnEnemies(this.level.data.enemies);
    this._initItems();
    this.paused = false;
    this.mosesPlatforms = 0;
    this.floodTimer = 0;
    this.floodRow = this.level.data.height - 2;
    this.jerichoLap = 0;
    this.jerichoLastX = this.player.x;
    this.jerichoWallsGone = false;
    this.prayerTimer = 0;
    this.levelDamageTaken = false;
    this.redSeaDry = 0;
    this.prayedSpots = new Set();
    this.sharedStars = 0;
    this._countScrolls();
    this.goalHintTimer = 5;
    this.lives = 3;
    this.gameOverDelay = null;
    this._mannaBreadCollected = 0;
    this._feedingHeartsSpawned = false;
    this._mannaSpawnAcc = 0;
    try {
      musicEngine.playSong(musicEngine.getSongForLevel(this.level.data), 0.35);
    } catch {
      // Production build — logs removed
    }
  }

  _countScrolls() {
    if (!this.level) return;
    this.totalScrolls = this.level.data.items.filter((i) => i.type === ItemType.SCROLL).length;
    this.collectedScrolls = 0;
  }

  _initItems() {
    if (!this.level) return;
    this.items = this.level.data.items.map((it) => ({ ...it, collected: false }));
  }

  /** @param {number} dt */
  update(dt) {
    if (this.state === 'MENU') {
      this.mainMenu.update(dt);
      this.frame++;
      return;
    }
    if (this.state === 'CHAR') {
      this.frame++;
      return;
    }
    if (this.state === 'COMPLETE') {
      this._updateLevelCompleteCelebration(dt);
      return;
    }
    if (this.touch) this.touch.updateHints();
    if ((this.state === 'PLAYING' || this.state === 'COOP') && this.overlay) {
      this.overlayFrame++;
      return;
    }
    if (this.paused) {
      return;
    }

    this.frame++;

    const p = this.player;
    const lv = this.level;
    if (!p || !lv) return;

    if (p.specialCooldown > 0) p.specialCooldown--;
    if (this.player2?.specialCooldown > 0) this.player2.specialCooldown--;
    if (p.waterBreath > 0) p.waterBreath--;
    if (this.player2?.waterBreath > 0) this.player2.waterBreath--;

    if (this.state === 'PLAYING' || this.state === 'COOP') {
      if (this.goalHintTimer > 0) this.goalHintTimer -= dt;
      if (this._gabrielHintsEnabled()) this.gabriel.tick(dt);
    }

    const idx = lv.data.index;
    if (idx === 2 && this.frame % (8 * 60) === 0) {
      this.lightningFlash = 1;
    }
    if (this.lightningFlash > 0) {
      this.lightningFlash = Math.max(0, this.lightningFlash - 0.08);
    }

    const inp = input;
    const inp2 = inputP2;

    const pFlags = {};
    if (idx === 7) pFlags.windLeft = true;
    if (idx === 17) pFlags.faithWater = true;

    if (inp.jumpJustPressed && (p.onGround || p.coyoteTimer > 0)) this.sound.jump();
    if (this.coop && inp2.jumpJustPressed && (this.player2?.onGround || this.player2?.coyoteTimer > 0)) {
      this.sound.jump();
    }

    p.update(inp, lv.tileMap, dt, pFlags);
    if (this.player2) this.player2.update(inp2, lv.tileMap, dt, pFlags);

    const fl = lv.data.flags || {};
    if (fl.mannaRain) {
      this._mannaSpawnAcc = (this._mannaSpawnAcc || 0) + dt;
      if (this._mannaSpawnAcc >= 2) {
        this._mannaSpawnAcc = 0;
        const rx = 32 + Math.random() * Math.max(32, lv.widthPx - 64);
        this.items.push({
          type: ItemType.BREAD,
          x: rx,
          y: 48,
          collected: false,
        });
      }
    }

    const killY = lv.heightPx + 200;
    if (this.gameOverDelay == null && !this.overlay) {
      if (this.coop && this.player2) {
        if (p.y > killY || this.player2.y > killY) this._handleLifeLoss();
      } else if (p.y > killY) {
        this._handleLifeLoss();
      }
    }

    if (this.state === 'PLAYING' && inp.specialJustPressed) {
      this._doSpecial(p);
    }
    if (this.coop && (inp.specialJustPressed || inp2.specialJustPressed)) {
      if (inp.specialJustPressed) this._doSpecial(p);
      if (inp2.specialJustPressed && this.player2) this._doSpecial(this.player2);
      if (inp.specialJustPressed && inp2.specialJustPressed) {
        this.enemies.forEach((e) => {
          e.stun = 120;
        });
        this.particles.emit(p.x, p.y, { kind: 'boss' });
        this.sound.specialAbility();
      }
    }

    this._updateProjectiles();
    this._updateEnemies();
    this._pickups(p);
    if (this.player2) this._pickups(this.player2);
    this._feedingMiracleCheck();

    this._flood();
    this._jericho();
    this._prayer();

    if (p.landShakeFrames > 0) this.shake = Math.max(this.shake, 6);
    if (this.player2?.landShakeFrames > 0) this.shake = Math.max(this.shake, 6);
    if (this.shake > 0) this.shake--;

    this.particles.update();

    const viewW = this.coop ? this.canvas.width / 2 : this.canvas.width;
    const viewH = this.canvas.height;
    this.camera.update(p, viewW, viewH, lv.widthPx, lv.heightPx);
    if (this.coop && this.player2) {
      this.camera2.update(this.player2, viewW, viewH, lv.widthPx, lv.heightPx);
    }

    if (this.state === 'PLAYING' || this.state === 'COOP') {
      this._winLose();
    }

    if (this.gameOverDelay != null && this.gameOverDelay > 0) {
      this.gameOverDelay--;
      if (this.gameOverDelay === 0) {
        this.overlay = 'gameover';
        this.overlayFrame = 0;
        this.gameOverDelay = null;
      }
    }

    if (this.frame % 120 === 0 && this.coop) {
      const msgs = [
        'Joshua and Caleb trusted God together! Just like you two!',
        "The real Joshua and Caleb said 'We can do it!' — Numbers 13:30",
        'Brothers who pray together, WIN together!',
      ];
      this.brotherMsg = msgs[(this.frame / 120) % msgs.length];
      this.brotherMsgTimer = 90;
    }
    if (this.brotherMsgTimer > 0) this.brotherMsgTimer--;

    if (this.coop && this.player2 && this.level) {
      const H = this.level.heightPx;
      const revive = (a, b) => {
        if (a.y > H + 200) {
          a.x = b.x;
          a.y = b.y - 48;
          a.vy = 0;
          a.health = Math.max(1, a.health);
        }
      };
      revive(p, this.player2);
      revive(this.player2, p);
    }
    resetAllFrameInput();
  }

  /** @param {Player} pl */
  _doSpecial(pl) {
    if (pl.specialCooldown > 0) return;

    this.sound.specialAbility();
    this.particles.emit(pl.x + pl.width / 2, pl.y, { kind: 'special' });
    this._showPowerText(pl);

    const ch = pl.character;

    if (ch === CharId.DAVID) {
      pl.projectiles.push({
        x: pl.x + pl.width / 2,
        y: pl.y + 10,
        vx: pl.facing === 'right' ? 14 : -14,
        vy: -1,
        active: true,
      });
      for (let i = 0; i < 6; i++) {
        this.particles.emit(pl.x + pl.width / 2, pl.y + 10, {
          kind: 'special',
          color: '#FFD700',
        });
      }
      pl.specialCooldown = 90;
    } else if (ch === CharId.MOSES) {
      const d = this.level?.data?.flags;
      if (d?.redSeaX0 != null && this.level) {
        this.redSeaDry = 420;
        const map = this.level.tileMap.tiles;
        for (let ty = 0; ty < this.level.data.height; ty++) {
          for (let tx = 0; tx < this.level.data.width; tx++) {
            const wx = tx * 32;
            if (wx >= d.redSeaX0 && wx <= d.redSeaX1 && map[ty][tx] === TileId.WATER) {
              map[ty][tx] = TileId.SAND;
            }
          }
        }
      } else if (this.level) {
        const px = Math.floor(pl.x / 32);
        const map = this.level.tileMap.tiles;
        const H = this.level.data.height;
        for (let tx = px - 5; tx <= px + 5; tx++) {
          for (let ty = 0; ty < H; ty++) {
            if (map[ty]?.[tx] === TileId.WATER) {
              map[ty][tx] = TileId.SAND;
              const ttx = tx;
              const tty = ty;
              setTimeout(() => {
                if (map[tty]?.[ttx] === TileId.SAND) map[tty][ttx] = TileId.WATER;
              }, 5000);
            }
          }
        }
      }
      this._screenShake(8, 30);
      for (let i = 0; i < 20; i++) {
        this.particles.emit(pl.x + (Math.random() - 0.5) * 200, pl.y, {
          kind: 'special',
          color: '#4488FF',
        });
      }
      pl.specialCooldown = 300;
    } else if (ch === CharId.NOAH) {
      let nearest = null;
      let nearDist = 250;
      for (const e of this.enemies) {
        if (e.dead) continue;
        const dist = Math.abs(e.x - pl.x);
        if (dist < nearDist) {
          nearDist = dist;
          nearest = e;
        }
      }
      if (nearest) {
        nearest.vy = -14;
        nearest.vx = pl.facing === 'right' ? 10 : -10;
        nearest.stun = 240;
        this.particles.emit(nearest.x, nearest.y, { kind: 'special', color: '#DAA520' });
        this._screenShake(6, 15);
      } else {
        pl.vy = -20;
      }
      pl.specialCooldown = 180;
    } else if (ch === CharId.MARY) {
      for (const e of this.enemies) {
        e.stun = 180;
        e._graceSlow = 120;
      }
      if (pl.health < pl.maxHealth) pl.heal(1);
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        this.particles.emit(pl.x + Math.cos(angle) * 80, pl.y + Math.sin(angle) * 80, {
          kind: 'special',
          color: '#FFD700',
        });
      }
      pl.specialCooldown = 240;
    } else if (ch === CharId.DANIEL) {
      let hasLion = false;
      for (const e of this.enemies) {
        if (e.type === EnemyType.LION) {
          e.friendly = true;
          e.friendTimer = 480;
          hasLion = true;
        }
      }
      if (!hasLion) {
        for (const e of this.enemies) e.stun = 120;
      }
      this.particles.emit(pl.x, pl.y, { kind: 'special', color: '#DAA520' });
      pl.specialCooldown = 300;
    } else if (ch === CharId.ESTHER) {
      for (const e of this.enemies) {
        if (!e.dead) e.stun = 300;
      }
      for (let i = 0; i < 16; i++) {
        const delay = i * 60;
        setTimeout(() => {
          this.particles.emit(
            this.camera.x + Math.random() * this.canvas.width,
            this.camera.y + 50,
            { kind: 'star', color: '#FFD700' },
          );
        }, delay);
      }
      pl.specialCooldown = 360;
    } else if (ch === CharId.JONAH) {
      for (const e of this.enemies) {
        if (e.dead) continue;
        const dist = Math.hypot(e.x - pl.x, e.y - pl.y);
        if (dist < 300) {
          this.particles.emit(e.x, e.y, { kind: 'special', color: '#1E90FF' });
          e.dead = true;
        }
      }
      pl.waterBreath = 600;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.particles.emit(pl.x, pl.y, { kind: 'special', color: '#1E90FF' });
        }, i * 200);
      }
      pl.specialCooldown = 300;
    } else if (ch === CharId.JOSHUA_HERO) {
      this._screenShake(18, 45);
      for (const e of this.enemies) {
        if (!e.dead) e.stun = 240;
      }
      const px = Math.floor(pl.x / 32);
      const py = Math.floor(pl.y / 32);
      const map = this.level?.tileMap?.tiles;
      if (map && this.level) {
        for (let tx = px - 5; tx <= px + 5; tx++) {
          for (let ty = py - 3; ty <= py + 3; ty++) {
            if (ty < 0 || ty >= this.level.data.height) continue;
            if (map[ty]?.[tx] === TileId.BRICK) {
              map[ty][tx] = TileId.AIR;
              this.particles.emit(tx * 32, ty * 32, { kind: 'special', color: '#C1440E' });
            }
          }
        }
      }
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        this.particles.emit(pl.x + Math.cos(angle) * 100, pl.y + Math.sin(angle) * 100, {
          kind: 'special',
          color: '#FFD700',
        });
      }
      pl.specialCooldown = 300;
    } else if (ch === CharId.JOSHUA) {
      this._screenShake(10, 25);
      for (const e of this.enemies) {
        if (!e.dead) e.stun = 180;
      }
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        this.particles.emit(pl.x + Math.cos(angle) * 60, pl.y + Math.sin(angle) * 60, {
          kind: 'special',
          color: '#88CCFF',
        });
      }
      pl.specialCooldown = 240;
    } else if (ch === CharId.CALEB) {
      for (const item of this.items || []) {
        if (item.collected) continue;
        const dist = Math.hypot(item.x - pl.x, item.y - pl.y);
        if (dist < 250) {
          item.collected = true;
          pl.stars = (pl.stars || 0) + 2;
          this.particles.emit(item.x, item.y, { kind: 'star', color: '#FFD700' });
        }
      }
      if (!pl.onGround) pl.vy = -16;
      for (let i = 0; i < 12; i++) {
        this.particles.emit(pl.x + (Math.random() - 0.5) * 100, pl.y + 20, {
          kind: 'special',
          color: '#44CC44',
        });
      }
      pl.specialCooldown = 240;
    } else {
      for (const e of this.enemies) e.stun = 90;
      pl.vy = -18;
      pl.specialCooldown = 120;
    }
  }

  _screenShake(intensity, frames) {
    this.shake = Math.max(this.shake || 0, frames);
    this._shakeIntensity = intensity;
  }

  /** @param {Player} pl */
  _showPowerText(pl) {
    const names = {
      [CharId.DAVID]: '⚡ SLING SHOT!',
      [CharId.MOSES]: '🌊 WATERS PART!',
      [CharId.NOAH]: '🔨 SUPER THROW!',
      [CharId.MARY]: '✨ GRACE AURA!',
      [CharId.DANIEL]: '🦁 LION FRIEND!',
      [CharId.ESTHER]: '👑 ROYAL DECREE!',
      [CharId.JONAH]: '🐋 WHALE CALL!',
      [CharId.JOSHUA_HERO]: '📯 BATTLE SHOUT!',
      [CharId.JOSHUA]: '❄️ BATTLE CRY!',
      [CharId.CALEB]: '⭐ WHOLEHEARTED!',
    };
    const colors = {
      [CharId.DAVID]: '#FFD700',
      [CharId.MOSES]: '#4488FF',
      [CharId.NOAH]: '#DAA520',
      [CharId.MARY]: '#87CEEB',
      [CharId.DANIEL]: '#DAA520',
      [CharId.ESTHER]: '#FF69B4',
      [CharId.JONAH]: '#1E90FF',
      [CharId.JOSHUA_HERO]: '#FFD700',
      [CharId.JOSHUA]: '#88CCFF',
      [CharId.CALEB]: '#44CC44',
    };

    const text = names[pl.character] || '✨ POWER!';
    const color = colors[pl.character] || '#FFD700';

    document.getElementById('power-popup')?.remove();

    const el = document.createElement('div');
    el.id = 'power-popup';
    el.style.cssText = `
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(16px, 4vw, 28px);
    color: ${color};
    text-shadow: 3px 3px 0 #000,
                 0 0 30px ${color};
    z-index: 5000;
    pointer-events: none;
    white-space: nowrap;
    transition: all 1.5s ease-out;
  `;
    el.textContent = text;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.top = '25%';
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 1500);
  }

  _updateProjectiles() {
    const p = this.player;
    if (!p || !this.level) return;
    for (const pr of p.projectiles) {
      if (!pr.active) continue;
      pr.x += pr.vx;
      pr.y += pr.vy || 0;
      pr.vy = (pr.vy || 0) + 0.25;
      for (const e of this.enemies) {
        if (e.dead) continue;
        const ew = e.width || 48;
        const eh = e.height || 48;
        if (aabb(pr.x - 10, pr.y - 10, 20, 20, e.x, e.y, ew, eh)) {
          const killed = e.onHit(1);
          if (e.type === EnemyType.GOLIATH) this.sound.bossHit();
          else if (killed) this.sound.enemyDeath();
          pr.active = false;
          this.shake = 20;
        }
      }
    }
    p.projectiles = p.projectiles.filter(
      (pr) =>
        pr.active &&
        pr.x > 0 &&
        pr.x < this.level.widthPx &&
        pr.y > -80 &&
        pr.y < this.level.heightPx + 80,
    );
  }

  _updateEnemies() {
    const p = this.player;
    if (!p || !this.level) return;
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (p.character === CharId.DANIEL && e.type === EnemyType.LION) {
        const pull = e.friendly ? 0.06 : 0.02;
        e.x += (p.x - e.x) * pull;
        continue;
      }
      e.update(p, this.level.tileMap);
      if (
        !e.friendly &&
        !p.invincible &&
        aabb(p.x, p.y, p.width, p.height, e.x, e.y, e.width, e.height)
      ) {
        const dmg = damageFromDifficulty(1);
        if (dmg > 0 && p.takeDamage(dmg)) {
          this.sound.takeDamage();
          this.levelDamageTaken = true;
        }
      }
      if (this.player2 && !this.player2.invincible && !e.friendly) {
        const p2 = this.player2;
        if (aabb(p2.x, p2.y, p2.width, p2.height, e.x, e.y, e.width, e.height)) {
          const dmg2 = damageFromDifficulty(1);
          if (dmg2 > 0 && p2.takeDamage(dmg2)) this.sound.takeDamage();
        }
      }
    }
  }

  /** @param {Player} pl */
  _pickups(pl) {
    if (!this.level) return;
    const collectRadius = pl.character === CharId.CALEB ? 36 : 22;
    for (const it of this.items) {
      if (it.collected) continue;
      const dx = pl.x + pl.width / 2 - it.x;
      const dy = pl.y + pl.height / 2 - it.y;
      if (dx * dx + dy * dy < collectRadius * collectRadius) {
        it.collected = true;
        if (it.type === ItemType.STAR) {
          pl.stars++;
          if (this.coop) this.sharedStars++;
          this.sound.collectStar();
          this.particles.emit(it.x, it.y, { kind: 'star' });
        } else if (it.type === ItemType.SCROLL) {
          pl.scrolls++;
          this.collectedScrolls++;
          this.sound.collectScroll();
          this.particles.emit(it.x, it.y, { kind: 'scroll' });
        } else if (it.type === ItemType.HEART || it.type === ItemType.BUBBLE) {
          pl.heal(1);
        } else if (it.type === ItemType.BREAD) {
          pl.heal(1);
          if (this.level.data.flags?.mannaBread) this._mannaBreadCollected++;
        } else if (it.type === ItemType.FISH) {
          pl.heal(1);
        } else if (it.type === ItemType.STONE) {
          pl.stonesCollected++;
        } else if (it.type === ItemType.ARK) {
          pl.arkPieces++;
        } else if (it.type === ItemType.DOVE || it.type === ItemType.CROWN) {
          pl.heal(1);
          this.sound.collectStar();
        }
      }
    }
  }

  _feedingMiracleCheck() {
    if (!this.level?.data.flags?.feeding5000 || this._feedingHeartsSpawned) return;
    const breads = this.items.filter((i) => i.type === ItemType.BREAD && i.collected).length;
    const fish = this.items.filter((i) => i.type === ItemType.FISH && i.collected).length;
    if (breads >= 5 && fish >= 2) {
      this._feedingHeartsSpawned = true;
      const w = this.level.widthPx;
      const mapH = this.level.heightPx;
      for (let i = 0; i < 20; i++) {
        this.items.push({
          type: ItemType.HEART,
          x: 80 + (i % 10) * ((Math.max(320, w) - 160) / 9),
          y: mapH * 0.12 + Math.floor(i / 10) * 90,
          collected: false,
        });
      }
      this.sound.collectStar();
    }
  }

  _flood() {
    if (!this.level?.data.flags?.waterRise) return;
    this.floodTimer++;
    if (this.floodTimer % 1800 === 0 && this.floodRow > 4) {
      this.floodRow--;
      const map = this.level.tileMap.tiles;
      for (let x = 0; x < this.level.data.width; x++) {
        if (map[this.floodRow]) map[this.floodRow][x] = 4;
      }
    }
  }

  _jericho() {
    if (!this.level || this.level.data.mode !== LevelMode.JERICHO) return;
    const p = this.player;
    const lapW = (this.level.data.width * 32) / 7;
    const lap = Math.min(6, Math.floor(p.x / lapW));
    if (lap > this.jerichoLap) this.jerichoLap = lap;
    if (!this.jerichoWallsGone && this.jerichoLap >= 5 && input.specialJustPressed) {
      this.jerichoWallsGone = true;
      this.particles.emit(p.x, p.y, { kind: 'wall' });
      const map = this.level.tileMap.tiles;
      for (let x = 0; x < this.level.data.width; x++) {
        for (let y = 0; y < this.level.data.height; y++) {
          if (map[y][x] === 8) map[y][x] = 0;
        }
      }
    }
  }

  _prayer() {
    if (!this.level?.data.prayerSpots) return;
    const p = this.player;
    for (const spot of this.level.data.prayerSpots) {
      const key = `${spot.x},${spot.y}`;
      const dx = p.x - spot.x;
      const dy = p.y - spot.y;
      if (dx * dx + dy * dy < 48 * 48) {
        this.prayerTimer++;
        if (this.prayerTimer > 60 && !this.prayedSpots.has(key)) {
          this.prayedSpots.add(key);
          p.prayersDone = Math.min(3, p.prayersDone + 1);
          this.prayerTimer = 0;
        }
        this.enemies.forEach((e) => {
          if (e.type === EnemyType.LION) e.stun = 300;
        });
      }
    }
  }

  _winLose() {
    if (this.overlay) return;
    if (this.state === 'COMPLETE') return;
    const p = this.player;
    if (!p || !this.level) return;
    const d = this.level.data;
    const er = getExitHitRect(d);
    const atExit = aabb(p.x, p.y, p.width, p.height, er.x, er.y, er.w, er.h);

    // Production build — logs removed

    const fl = d.flags || {};
    let win = false;
    if (fl.mannaBread) {
      win = atExit && this._mannaBreadCollected >= 10;
    } else if (fl.needCrowns) {
      const n = this.items.filter((i) => i.type === ItemType.CROWN && i.collected).length;
      win = atExit && n >= fl.needCrowns;
    } else if (fl.feeding5000) {
      const breads = this.items.filter((i) => i.type === ItemType.BREAD && i.collected).length;
      const fish = this.items.filter((i) => i.type === ItemType.FISH && i.collected).length;
      win = atExit && breads >= 5 && fish >= 2;
    } else if (d.mode === LevelMode.DAVID) {
      win = atExit;
    } else if (d.mode === LevelMode.NOAH) {
      win = atExit;
    } else if (d.mode === LevelMode.DANIEL) {
      win = atExit;
    } else if (d.mode === LevelMode.JERICHO) {
      win = atExit;
    } else {
      win = atExit;
    }

    if (win) {
      // Production build — logs removed
      this.onLevelComplete();
      return;
    }
    if (
      !this.overlay &&
      this.gameOverDelay == null &&
      (p.health <= 0 || (this.player2 && this.player2.health <= 0))
    ) {
      this._handleLifeLoss();
    }
  }

  _handleLifeLoss() {
    if (this.overlay != null || this.gameOverDelay != null) return;
    const lv = this.level;
    const p = this.player;
    if (!lv || !p) return;
    this.lives--;
    const d = lv.data;
    if (this.lives > 0) {
      p.health = p.maxHealth;
      p.x = d.startX;
      p.y = d.startY;
      p.invincible = 120;
      this._settlePlayer(p);
      if (this.coop && this.player2) {
        this.player2.health = this.player2.maxHealth;
        this.player2.x = d.startX + 40;
        this.player2.y = d.startY;
        this.player2.invincible = 120;
        this._settlePlayer(this.player2);
      }
    } else {
      p.health = Math.max(1, p.health);
      p.invincible = 120;
      p.x = d.startX;
      p.y = d.startY;
      this._settlePlayer(p);
      if (this.player2) {
        this.player2.health = Math.max(1, this.player2.health);
        this.player2.x = d.startX + 40;
        this.player2.y = d.startY;
        this.player2.invincible = 120;
        this._settlePlayer(this.player2);
      }
      this.gameOverDelay = 120;
    }
  }

  /** Level won — idempotent wrapper */
  onLevelComplete() {
    if (this.state === 'COMPLETE') return;
    try {
      musicEngine.stop();
      musicEngine.playSong('VICTORY', 0.5);
    } catch (_) {}
    this._beginLevelCompleteSequence();
  }

  draw() {
    this._syncPauseButton();
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    if (this.state === 'MENU') {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      this.mainMenu.draw();
      return;
    }
    if (this.state === 'CHAR') {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      this.characterSelect.draw(ctx);
      return;
    }

    const lv = this.level;
    const p = this.player;
    if (!lv || !p) return;

    const levelIdx = lv.data.index;
    drawSkyGradient(ctx, w, h, levelIdx);
    drawParallaxFar(ctx, w, h, levelIdx, this.camera, this.frame);
    drawParallaxNear(ctx, w, h, levelIdx, this.camera, this.frame);
    drawLevelAmbientFX(ctx, w, h, levelIdx, this.frame, {
      lightning: this.lightningFlash,
    });

    ctx.save();
    const shakeAmp = Math.min(20, this._shakeIntensity ?? 6);
    const shakeX = this.shake ? Math.sin(this.frame * 0.8) * shakeAmp : 0;
    ctx.translate(shakeX, 0);

    if (this.coop && this.state === 'COOP' && this.player2) {
      const half = w / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, half, h);
      ctx.clip();
      this._drawWorld(ctx, p, this.camera, half, h);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.rect(half, 0, half, h);
      ctx.clip();
      this._drawWorld(ctx, this.player2, this.camera2, half, h, half);
      ctx.restore();
      ctx.strokeStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(half, 0);
      ctx.lineTo(half, h);
      ctx.stroke();
    } else {
      this._drawWorld(ctx, p, this.camera, w, h);
    }

    ctx.restore();

    if (this.goalHintTimer > 0 && !this.overlay && this.state !== 'COMPLETE') {
      drawGoalHint(ctx, Math.min(1, this.goalHintTimer / 5));
    }

    this.hud.draw(ctx, {
      player: p,
      levelName: lv.data.name,
      coopStars: this.coop ? this.sharedStars : undefined,
      frame: this.frame,
      lives: this.lives,
    });
    if (this.coop && this.state === 'COOP' && this.player2) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(`P2 ❤ ${this.player2.health}`, w - 120, 70);
    }

    this.particles.draw(ctx);

    if (
      (this.state === 'PLAYING' || this.state === 'COOP') &&
      this._gabrielHintsEnabled() &&
      this.gabriel.isActive()
    ) {
      this.gabriel.draw(ctx, this.canvas);
    }

    if (this.brotherMsgTimer > 0 && this.coop) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(16, h * 0.35, w - 32, 48);
      ctx.fillStyle = '#fff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(this.brotherMsg, w / 2, h * 0.38);
    }

    if (this.overlay) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, w, h);
    }
    if (this.overlay === 'gameover') {
      this.hud.drawGameOver(ctx, this.overlayFrame);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {Player} player
   * @param {Camera} cam
   * @param {number} vw
   * @param {number} vh
   * @param {number} [offsetX]
   */
  _drawWorld(ctx, player, cam, vw, vh, offsetX = 0) {
    if (!this.level) return;
    ctx.save();
    ctx.translate(offsetX, 0);
    const ox = cam.x;
    const oy = cam.y;
    this.level.tileMap.render(ctx, cam);
    drawWorldDecorations(
      ctx,
      cam,
      this.level.data.index,
      this.frame,
      this.level.widthPx,
      this.level.heightPx,
      this.level.tileMap,
    );
    drawExitGate(ctx, cam, this.level.data.exitX, this.level.data.exitY, this.frame);
    for (const it of this.items) {
      if (it.collected) continue;
      drawItem(ctx, it.type, it.x - ox, it.y - oy, this.frame);
    }
    player.draw(ctx, cam);
    for (const e of this.enemies) e.draw(ctx, cam);
    for (const pr of player.projectiles) {
      ctx.fillStyle = '#deb887';
      ctx.fillRect(pr.x - ox, pr.y - oy, 6, 6);
    }
    ctx.restore();
  }
}
