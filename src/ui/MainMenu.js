import { loadStars, loadUnlockedMax, allLevelsComplete, loadScores } from '../game/storage.js';
import { TOTAL_LEVELS } from '../game/constants.js';
import { settings } from './SettingsMenu.js';
import { drawCharacter, CHAR_DRAW_H } from '../assets/SpriteSheet.js';

const FACTS = [
  'David: With God, even a sling can defeat a giant!',
  'Moses: God makes a way — even through the sea!',
  'Noah: Trust God and build what He asks!',
  'Mary: Saying yes to God changes everything!',
  'Daniel: Prayer first — God handles the lions!',
  'Esther: Courage can save a whole nation!',
  'Jonah: Running from God never works for long!',
  'Joshua: Be strong and courageous — God is with you!',
];

function canvasCoords(canvas, clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((clientX - r.left) * canvas.width) / r.width,
    y: ((clientY - r.top) * canvas.height) / r.height,
  };
}

/** @param {number} w @param {number} minPx @param {number} vwFrac @param {number} maxPx */
function clampFont(w, minPx, vwFrac, maxPx) {
  return Math.min(maxPx, Math.max(minPx, w * vwFrac));
}

/**
 * @param {number} w
 * @param {number} h
 */
function titleScreenLayout(w, h) {
  const titleFont = clampFont(w, 52, 0.1, 80);
  const subFont = clampFont(w, 10, 0.02, 14);
  const btnFont = clampFont(w, 13, 0.025, 17);
  const scoreFont = clampFont(w, 8, 0.015, 10);
  const verseFont = clampFont(w, 9, 0.018, 12);
  const bw = Math.min(420, w * 0.85);
  let bh = 58;
  let gap = 10;
  const left = (w - bw) / 2;
  const subY = h * 0.38;
  const subBottom = subY + subFont * 0.55;
  const runnerBandTop = h < 560 ? h * 0.85 : h * 0.82;
  const footerH = Math.max(verseFont + scoreFont + 36, h * 0.11);
  const maxBtnBottom = Math.min(runnerBandTop - 6, h - footerH);
  const minBtnTop = subBottom + 12;
  let btnStartY = Math.max(h * 0.45, subBottom + 24);
  const stackH = () => 6 * (bh + gap);
  while (btnStartY + stackH() > maxBtnBottom && bh > 30) {
    bh -= 2;
    gap = Math.max(3, gap - 1);
  }
  if (btnStartY + stackH() > maxBtnBottom) {
    btnStartY = maxBtnBottom - stackH();
  }
  if (btnStartY < minBtnTop) {
    btnStartY = minBtnTop;
    while (btnStartY + stackH() > maxBtnBottom && bh > 28) {
      bh -= 2;
      gap = Math.max(2, gap - 1);
    }
    if (btnStartY + stackH() > maxBtnBottom) {
      btnStartY = Math.max(h * 0.06 + titleFont * 2.2, maxBtnBottom - stackH());
    }
  }
  const titleTop = h * 0.08;
  const yBible = titleTop + titleFont * 0.55;
  const yRun = yBible + titleFont * 1.12;
  return {
    titleFont,
    subFont,
    btnFont,
    scoreFont,
    verseFont,
    bw,
    bh,
    gap,
    left,
    subY,
    btnStartY,
    yBible,
    yRun,
    runnerBandTop,
  };
}

export class MainMenu {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this._t = 0;
    this._stars = [];
    for (let i = 0; i < 40; i++) {
      this._stars.push({
        x: Math.random(),
        y: Math.random() * 0.45,
        tw: Math.random() * Math.PI * 2,
        s: 0.5 + Math.random() * 1.5,
      });
    }
    this._clouds = [
      { x: 0.05, y: 0.07, s: 1.45 },
      { x: 0.42, y: 0.11, s: 1.65 },
      { x: 0.78, y: 0.08, s: 1.5 },
    ];
    /** Joshua (blue), Caleb (green), David (brown) — loop L→R on grass */
    this._runners = [
      { id: 'joshua', x: 0.08, t: 0 },
      { id: 'caleb', x: 0.38, t: 1.4 },
      { id: 'david', x: 0.68, t: 2.8 },
    ];
    this.screen = 'title';
    /** @type {number | null} */
    this._hoverBtn = null;
    this.onPlay = null;
    this.onCoop = null;
    this.onLevelChosen = null;
    this._bind();
  }

  show() {
    this.screen = 'title';
  }

  showLevelSelect() {
    this.showLevelSelectDOM((lvlIdx) => {
      this.onLevelChosen?.(lvlIdx);
    });
  }

  /**
   * Full-screen treasure-map style level picker (DOM overlay).
   * @param {(levelIndex: number) => void} onSelect
   */
  showLevelSelectDOM(onSelect) {
    document.getElementById('level-select')?.remove();

    const screen = document.createElement('div');
    screen.id = 'level-select';
    screen.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 8000;
      background: linear-gradient(
        180deg, #1a0a3e 0%, #2d1b6e 50%,
        #1a3a1a 100%
      );
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      font-family: 'Press Start 2P', monospace;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px);
      padding: 16px;
      text-align: center;
      border-bottom: 3px solid #FFD700;
    `;
    header.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 900px;
        margin: 0 auto;
      ">
        <button id="level-back" style="
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(9px,1.8vw,12px);
          padding: 10px 16px;
          background: rgba(255,255,255,0.1);
          color: #FFD700;
          border: 2px solid #FFD700;
          border-radius: 10px;
          cursor: pointer;
          touch-action: manipulation;
        ">← BACK</button>

        <div>
          <div style="
            font-size: clamp(14px,3vw,20px);
            color: #FFD700;
            text-shadow: 2px 2px 0 #000;
          ">🗺️ BIBLE ADVENTURE MAP</div>
          <div style="
            font-size: clamp(7px,1.3vw,9px);
            color: #aaa;
            margin-top: 4px;
          ">Choose your next Bible adventure!</div>
        </div>

        <div style="
          font-size: clamp(8px,1.5vw,10px);
          color: #FFD700;
          text-align: right;
        ">
          <div id="total-stars-display"></div>
        </div>
      </div>
    `;
    screen.appendChild(header);

    const starsRaw = loadStars();
    const maxUnlocked = loadUnlockedMax();

    const starAt = (idx) => starsRaw[idx] ?? starsRaw[String(idx)] ?? 0;
    let totalStars = 0;
    for (let i = 0; i < TOTAL_LEVELS; i++) totalStars += starAt(i);

    const starEl = header.querySelector('#total-stars-display');
    if (starEl) starEl.textContent = `⭐ ${totalStars} stars`;

    const BASE_WORLDS = [
      {
        name: '🌍 World 1 — In The Beginning',
        color: '#2d5a27',
        border: '#5a8a3c',
        levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        names: [
          "David's Valley",
          'Desert of Exodus',
          "Noah's Flood",
          "Daniel's Den",
          "Jonah's Ocean",
          "Joshua's Jericho",
          'Garden of Eden',
          'Tower of Babel',
          "Abraham's Journey",
          "Joseph's Pit",
        ],
      },
      {
        name: '🔥 World 2 — Moses & Exodus',
        color: '#5a2d00',
        border: '#cc8800',
        levels: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        names: [
          'Baby Moses',
          'Burning Bush',
          'Manna from Heaven',
          "Gideon's 300",
          "Samson's Strength",
          "Ruth's Fields",
          "Elijah's Ravens",
          'Walking on Water',
          'Feeding 5000',
          'Easter Morning',
        ],
      },
      {
        name: '⚔️ World 3 — Promised Land',
        color: '#1a1a4e',
        border: '#4488ff',
        levels: Array.from({ length: 10 }, (_, i) => i + 20),
        names: Array.from({ length: 10 }, (_, i) => `Level ${i + 21}`),
      },
      {
        name: '👑 World 4 — Kingdom',
        color: '#4e1a1a',
        border: '#cc4444',
        levels: Array.from({ length: 10 }, (_, i) => i + 30),
        names: Array.from({ length: 10 }, (_, i) => `Level ${i + 31}`),
      },
      {
        name: '🦁 World 5 — Prophets',
        color: '#2d1a4e',
        border: '#9b59b6',
        levels: Array.from({ length: 10 }, (_, i) => i + 40),
        names: Array.from({ length: 10 }, (_, i) => `Level ${i + 41}`),
      },
      {
        name: '⭐ World 6 — Jesus is Born',
        color: '#1a2d4e',
        border: '#87ceeb',
        levels: Array.from({ length: 10 }, (_, i) => i + 50),
        names: Array.from({ length: 10 }, (_, i) => `Level ${i + 51}`),
      },
      {
        name: '✨ World 7 — Miracles',
        color: '#2d4e1a',
        border: '#44cc44',
        levels: Array.from({ length: 10 }, (_, i) => i + 60),
        names: Array.from({ length: 10 }, (_, i) => `Level ${i + 61}`),
      },
      {
        name: '✝️ World 8 — Holy Week',
        color: '#4e2d1a',
        border: '#ff6b35',
        levels: Array.from({ length: 10 }, (_, i) => i + 70),
        names: Array.from({ length: 10 }, (_, i) => `Level ${i + 71}`),
      },
      {
        name: '🕊️ World 9 — Early Church',
        color: '#1a4e4e',
        border: '#00bfff',
        levels: Array.from({ length: 10 }, (_, i) => i + 80),
        names: Array.from({ length: 10 }, (_, i) => `Level ${i + 81}`),
      },
      {
        name: '🌈 World 10 — Revelation',
        color: '#4e4e1a',
        border: '#ffd700',
        levels: Array.from({ length: 10 }, (_, i) => i + 90),
        names: Array.from({ length: 10 }, (_, i) => `Level ${i + 91}`),
      },
    ];

    const WORLDS = [...BASE_WORLDS];
    let wNum = 11;
    for (let start = 100; start < TOTAL_LEVELS; start += 10) {
      const n = Math.min(10, TOTAL_LEVELS - start);
      WORLDS.push({
        name: `📜 World ${wNum} — Journey`,
        color: '#2a2a4e',
        border: '#6699cc',
        levels: Array.from({ length: n }, (_, i) => start + i),
        names: Array.from({ length: n }, (_, i) => `Level ${start + i + 1}`),
      });
      wNum++;
    }

    const content = document.createElement('div');
    content.style.cssText = `
      max-width: 900px;
      margin: 0 auto;
      padding: 16px;
    `;

    WORLDS.forEach((world) => {
      const levelsInWorld = world.levels.filter((lvl) => lvl < TOTAL_LEVELS);
      if (levelsInWorld.length === 0) return;

      const section = document.createElement('div');
      section.style.cssText = `
        margin-bottom: 24px;
        background: linear-gradient(
          135deg, ${world.color}cc, ${world.color}66
        );
        border: 3px solid ${world.border};
        border-radius: 16px;
        overflow: hidden;
      `;

      const worldHeader = document.createElement('div');
      worldHeader.style.cssText = `
        padding: 12px 16px;
        background: rgba(0,0,0,0.4);
        border-bottom: 2px solid ${world.border}66;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;

      const worldStars = levelsInWorld.reduce((sum, lvl) => sum + starAt(lvl), 0);
      const maxWorldStars = levelsInWorld.length * 3;

      worldHeader.innerHTML = `
        <span style="
          font-size: clamp(9px,1.8vw,12px);
          color: ${world.border};
          text-shadow: 1px 1px 0 #000;
        ">${world.name}</span>
        <span style="
          font-size: clamp(8px,1.5vw,10px);
          color: #FFD700;
        ">⭐ ${worldStars}/${maxWorldStars}</span>
      `;
      section.appendChild(worldHeader);

      const grid = document.createElement('div');
      grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
        padding: 12px;
      `;

      levelsInWorld.forEach((lvlIdx, i) => {
        const locked = lvlIdx > maxUnlocked;
        const lvlStars = starAt(lvlIdx);
        const completed = lvlStars > 0;
        const name = world.names[i] ?? `Level ${lvlIdx + 1}`;

        const cell = document.createElement('div');
        cell.style.cssText = `
          background: ${
            locked
              ? 'rgba(0,0,0,0.5)'
              : completed
                ? `linear-gradient(135deg,${world.color},${world.border}44)`
                : 'rgba(255,255,255,0.1)'
          };
          border: 2px solid ${
            locked ? '#333' : completed ? world.border : 'rgba(255,255,255,0.2)'
          };
          border-radius: 10px;
          padding: 8px 4px;
          text-align: center;
          cursor: ${locked ? 'default' : 'pointer'};
          touch-action: manipulation;
          opacity: ${locked ? '0.5' : '1'};
          transition: transform 0.1s;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        `;

        cell.innerHTML = `
          <div style="
            font-size: clamp(14px,2.5vw,20px);
            margin-bottom: 4px;
          ">${locked ? '🔒' : completed ? '✅' : '▶️'}</div>

          <div style="
            font-size: clamp(5px,1vw,7px);
            color: ${locked ? '#666' : '#eee'};
            line-height: 1.4;
            word-break: break-word;
          ">${locked ? '???' : name}</div>

          <div style="
            font-size: clamp(8px,1.5vw,10px);
            margin-top: 4px;
            color: #FFD700;
          ">${locked ? '' : '⭐'.repeat(lvlStars) + '☆'.repeat(3 - lvlStars)}</div>
        `;

        if (!locked) {
          let picked = false;
          const doSelect = (e) => {
            e.preventDefault();
            if (picked) return;
            picked = true;
            screen.remove();
            onSelect(lvlIdx);
          };
          cell.addEventListener('click', doSelect);
          cell.addEventListener(
            'touchend',
            (e) => {
              doSelect(e);
              cell.style.transform = '';
            },
            { passive: false },
          );
          cell.addEventListener(
            'touchstart',
            () => {
              cell.style.transform = 'scale(0.95)';
            },
            { passive: true },
          );
        }

        grid.appendChild(cell);
      });

      section.appendChild(grid);
      content.appendChild(section);
    });

    const spacer = document.createElement('div');
    spacer.style.height = '32px';
    content.appendChild(spacer);

    screen.appendChild(content);
    document.body.appendChild(screen);

    const backBtn = screen.querySelector('#level-back');
    const doBack = () => {
      screen.remove();
    };
    backBtn?.addEventListener('click', doBack);
    backBtn?.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        doBack();
      },
      { passive: false },
    );
  }

  _bind() {
    const runClick = (clientX, clientY) => {
      const { x, y } = canvasCoords(this.canvas, clientX, clientY);
      this._click(x, y);
    };
    this.canvas.addEventListener('click', (e) => {
      runClick(e.clientX, e.clientY);
    });
    this.canvas.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        const t = e.changedTouches[0];
        runClick(t.clientX, t.clientY);
      },
      { passive: false },
    );
    this.canvas.addEventListener('mousemove', (e) => {
      const { x, y } = canvasCoords(this.canvas, e.clientX, e.clientY);
      this._hoverBtn = this._hitTestButton(x, y);
    });
  }

  /** @returns {number | null} */
  _hitTestButton(x, y) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const { bw, bh, gap, left, btnStartY } = titleScreenLayout(w, h);
    for (let i = 0; i < 6; i++) {
      const top = btnStartY + i * (bh + gap);
      if (x >= left && x <= left + bw && y >= top && y <= top + bh) return i;
    }
    return null;
  }

  /** @param {number} x @param {number} y */
  _click(x, y) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (this.screen === 'title') {
      const btn = this._hitTestButton(x, y);
      if (btn === 0 && this.onPlay) this.onPlay();
      else if (btn === 1) this.showLevelSelect();
      else if (btn === 2) this.screen = 'facts';
      else if (btn === 3 && allLevelsComplete()) this.screen = 'secret';
      else if (btn === 4 && this.onCoop) this.onCoop();
      else if (btn === 5) settings.show();
      return;
    }
    if (this.screen === 'facts' || this.screen === 'secret') {
      if (x < 120 && y < 52) this.screen = 'title';
    }
  }

  /** @param {number} dt */
  update(dt) {
    this._t += dt;
    for (const c of this._clouds) {
      c.x -= 0.0003 * (dt * 60);
      if (c.x < -0.2) c.x += 1.4;
    }
    for (const r of this._runners) {
      r.x += 0.00035 * (dt * 60);
      if (r.x > 1.15) r.x = -0.15;
      r.t += dt * 8;
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this._drawBackground(ctx, w, h);
    this._drawGroundAndHills(ctx, w, h);
    this._drawRunners(ctx, w, h);

    if (this.screen === 'title') {
      this._drawTitle(ctx, w, h);
      this._drawMenuButtons(ctx, w, h);
      this._drawTitleHighScoresAndVerse(ctx, w, h);
    } else if (this.screen === 'facts') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      let y = 90;
      for (const line of FACTS) {
        ctx.fillText(line, 40, y);
        y += 24;
      }
      ctx.fillText('← BACK', 20, 44);
    } else if (this.screen === 'secret') {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffd700';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SECRET UNLOCKED', w / 2, h * 0.38);
      ctx.fillStyle = '#fff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('Thanks for finishing every level!', w / 2, h * 0.48);
      ctx.fillText('Joshua & Caleb: You are world-changers!', w / 2, h * 0.55);
      ctx.textAlign = 'left';
      ctx.fillText('← BACK', 20, 44);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   */
  _drawBackground(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.85);
    g.addColorStop(0, '#5B9BD5');
    g.addColorStop(1, '#87CEEB');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const night = (Math.sin(this._t * 0.1) + 1) * 0.5;
    if (night > 0.72) {
      const veil = (night - 0.72) * 0.85;
      ctx.fillStyle = `rgba(15,25,55,${veil})`;
      ctx.fillRect(0, 0, w, h * 0.58);
      for (const s of this._stars) {
        const tw = 0.35 + Math.sin(this._t * 1.6 + s.tw) * 0.2;
        ctx.globalAlpha = Math.min(1, tw * veil * 2.2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(s.x * w, s.y * h, s.s, s.s);
        ctx.globalAlpha = 1;
      }
    }

    for (const c of this._clouds) {
      const cx = c.x * w;
      const cy = c.y * h;
      const cs = c.s * 130;
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      ctx.beginPath();
      ctx.arc(cx, cy, cs * 0.48, 0, Math.PI * 2);
      ctx.arc(cx + cs * 0.42, cy, cs * 0.58, 0, Math.PI * 2);
      ctx.arc(cx + cs * 0.88, cy, cs * 0.46, 0, Math.PI * 2);
      ctx.arc(cx + cs * 0.35, cy - cs * 0.22, cs * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   */
  _drawGroundAndHills(ctx, w, h) {
    const groundY = h < 560 ? h * 0.85 : h * 0.82;
    const treeGreen = '#1a4d1a';
    const scroll = (this._t * 18) % 200;
    for (let i = -1; i < Math.ceil(w / 140) + 2; i++) {
      const bx = i * 140 - scroll;
      ctx.fillStyle = treeGreen;
      ctx.beginPath();
      ctx.moveTo(bx + 70, groundY);
      ctx.lineTo(bx + 40, groundY - 52);
      ctx.lineTo(bx + 100, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0f3d0f';
      ctx.fillRect(bx + 62, groundY - 8, 16, 10);
    }
    ctx.fillStyle = '#2d6b2d';
    for (let i = 0; i < 8; i++) {
      const x = (i * 260 - (this._t * 22) % 260) - 60;
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.lineTo(x + 110, groundY - 28);
      ctx.lineTo(x + 220, h);
      ctx.fill();
    }
    ctx.fillStyle = '#3d7a3d';
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, groundY, w, 3);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   */
  _drawRunners(ctx, w, h) {
    const { runnerBandTop } = titleScreenLayout(w, h);
    const baseY = runnerBandTop;
    const scale = (96 / CHAR_DRAW_H) * (w < 480 ? 0.85 : 1);
    for (const r of this._runners) {
      const x = r.x * w;
      const bounce = Math.sin(r.t) * 5;
      ctx.save();
      ctx.translate(x, baseY + bounce);
      ctx.scale(scale, scale);
      drawCharacter(ctx, r.id, 0, -CHAR_DRAW_H, 'right', Math.floor(this._t * 6) % 4, {});
      ctx.restore();
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   */
  _drawTitle(ctx, w, h) {
    const { titleFont, subFont, subY, yBible, yRun } = titleScreenLayout(w, h);
    const bounce = Math.sin(this._t * 2.8) * 5;
    const glowPulse = 0.55 + Math.sin(this._t * 2.2) * 0.35;
    const cx = w / 2;

    const drawGoldTitle = (text, y, fontPx) => {
      ctx.save();
      ctx.font = `${fontPx}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000';
      ctx.shadowBlur = 0;
      ctx.strokeText(text, cx, y);
      const gg = ctx.createLinearGradient(cx, y - fontPx * 0.55, cx, y + fontPx * 0.55);
      gg.addColorStop(0, '#FFE44D');
      gg.addColorStop(1, '#CC8800');
      ctx.fillStyle = gg;
      ctx.fillText(text, cx, y);
      ctx.shadowColor = `rgba(255, 215, 0, ${0.72 * glowPulse})`;
      ctx.shadowBlur = 20 + glowPulse * 16;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillText(text, cx, y);
      ctx.restore();
    };

    drawGoldTitle('BIBLE', yBible + bounce, titleFont);
    drawGoldTitle('RUN', yRun + bounce, titleFont);

    ctx.save();
    ctx.font = `${subFont}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const sub = '✝ Adventures of Joshua & Caleb ✝';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.strokeText(sub, cx, subY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#fff';
    ctx.fillText(sub, cx, subY);
    ctx.restore();
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   */
  _drawMenuButtons(ctx, w, h) {
    const labels = [
      '▶ PLAY',
      '🗺 LEVELS',
      '📖 BIBLE FACTS',
      allLevelsComplete() ? '🔒 SECRET LEVEL' : '🔒 LOCKED',
      '👫 CO-OP MODE',
      '⚙️ SETTINGS',
    ];
    const { bw, bh, gap, left, btnStartY, btnFont } = titleScreenLayout(w, h);

    for (let i = 0; i < 6; i++) {
      const top = btnStartY + i * (bh + gap);
      const hover = this._hoverBtn === i;
      ctx.save();
      ctx.translate(left, top);
      const g = ctx.createLinearGradient(0, 0, 0, bh);
      g.addColorStop(0, hover ? '#FFE44D' : '#FFD700');
      g.addColorStop(1, hover ? '#D49420' : '#CC8800');
      ctx.fillStyle = g;
      ctx.shadowColor = '#8B5E00';
      ctx.shadowOffsetY = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowBlur = 0;
      const rad = Math.min(18, bh * 0.28);
      ctx.beginPath();
      ctx.moveTo(rad, 0);
      ctx.arcTo(bw, 0, bw, bh, rad);
      ctx.arcTo(bw, bh, 0, bh, rad);
      ctx.arcTo(0, bh, 0, 0, rad);
      ctx.arcTo(0, 0, bw, 0, rad);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.font = `${btnFont}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000';
      ctx.strokeText(labels[i], bw / 2, bh / 2);
      ctx.fillStyle = '#fff';
      ctx.fillText(labels[i], bw / 2, bh / 2);
      ctx.restore();
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   */
  _drawTitleHighScoresAndVerse(ctx, w, h) {
    const L = titleScreenLayout(w, h);
    const sc = loadScores();
    const padX = 12;
    const padY = 8;
    const lines = [`Joshua ⭐ ${sc.joshua}`, `Caleb ⭐ ${sc.caleb}`, `Dad ⭐ ${sc.dad}`];
    const crown =
      sc.joshua > sc.caleb ? 'Joshua' : sc.caleb > sc.joshua ? 'Caleb' : '';
    if (crown) lines.push(`👑 ${crown}`);
    ctx.save();
    ctx.font = `${L.scoreFont}px "Press Start 2P", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    let maxTw = 0;
    for (const line of lines) {
      maxTw = Math.max(maxTw, ctx.measureText(line).width);
    }
    const boxW = maxTw + padX * 2;
    const lineH = L.scoreFont * 1.35;
    const boxH = padY * 2 + lineH * lines.length;

    const verseY = h - Math.max(8, h * 0.01);
    const boxBottom = verseY - L.verseFont - 12;
    const boxTop = Math.max(4, boxBottom - boxH);
    const boxLeft = 10;

    const rr = 8;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(boxLeft + rr, boxTop);
    ctx.arcTo(boxLeft + boxW, boxTop, boxLeft + boxW, boxTop + boxH, rr);
    ctx.arcTo(boxLeft + boxW, boxTop + boxH, boxLeft, boxTop + boxH, rr);
    ctx.arcTo(boxLeft, boxTop + boxH, boxLeft, boxTop, rr);
    ctx.arcTo(boxLeft, boxTop, boxLeft + boxW, boxTop, rr);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    let ly = boxTop + padY;
    for (const line of lines) {
      ctx.fillText(line, boxLeft + padX, ly);
      ly += lineH;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `${L.verseFont}px "Press Start 2P", monospace`;
    ctx.fillStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    const verse = 'Be strong and courageous! — Joshua 1:9';
    ctx.strokeText(verse, w / 2, verseY);
    ctx.fillText(verse, w / 2, verseY);
    ctx.restore();
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   */
  _drawLevelSelect(_ctx, _w, _h) {
    /* Replaced by showLevelSelectDOM */
  }
}
