import { isSolidTile } from '../game/constants.js';
import { getExitHitRect } from '../game/exitZone.js';

/**
 * Stable 0..1 hash for decoration placement (no per-frame flicker).
 * @param {number} tx
 * @param {number} salt
 * @param {number} levelIndex
 */
function rand01(tx, salt, levelIndex) {
  const v = (tx * 374761393 + salt * 668265263 + levelIndex * 1597334677) >>> 0;
  return (v % 10000) / 10000;
}

/**
 * @param {import('./TileMap.js').TileMap} tileMap
 * @param {number} tx tile column
 * @returns {{ groundY: number } | null}
 */
function groundSurfaceAt(tileMap, tx) {
  const ts = tileMap.tileSize;
  const w = tileMap.width;
  const h = tileMap.height;
  if (tx < 0 || tx >= w) return null;
  for (let ty = h - 1; ty >= 0; ty--) {
    const row = tileMap.tiles[ty];
    if (!row) continue;
    const id = row[tx];
    if (id != null && isSolidTile(id)) {
      return { groundY: ty * ts };
    }
  }
  return null;
}

/**
 * Parallax backgrounds + per-level decorative overlays (non-colliding).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} levelIndex 0-5
 * @param {{ x: number; y: number }} camera
 * @param {number} frame
 */
export function drawSkyGradient(ctx, w, h, levelIndex) {
  const skies = [
    ['#87CEEB', '#E0F4FF'],
    ['#F4A460', '#FFDAB9'],
    ['#2C4A6E', '#4A6B8A'],
    ['#1a1a2e', '#2d2d44'],
    ['#006994', '#003d52'],
    ['#FF8C42', '#FFD280'],
  ];
  const [top, bot] = skies[levelIndex % skies.length] || skies[0];
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} levelIndex
 * @param {{ x: number; y: number }} camera
 * @param {number} frame
 */
export function drawParallaxFar(ctx, w, h, levelIndex, camera, frame) {
  const scroll = camera.x * 0.2;
  const maxMtn = h * 0.25;
  ctx.save();
  ctx.translate(-(scroll % w), 0);
  const drawTwice = () => {
    if (levelIndex === 0) {
      ctx.fillStyle = '#6B4F7A';
      for (let i = 0; i < 12; i++) {
        const x = i * 180;
        const groundY = h;
        const peakY = h - maxMtn;
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 90, peakY);
        ctx.lineTo(x + 180, groundY);
        ctx.closePath();
        ctx.fill();
      }
    } else if (levelIndex === 1) {
      ctx.fillStyle = '#C4A574';
      for (let i = 0; i < 14; i++) {
        const x = i * 140;
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.quadraticCurveTo(x + 70, h - maxMtn * 0.92, x + 140, h);
        ctx.closePath();
        ctx.fill();
      }
    } else if (levelIndex === 2) {
      ctx.fillStyle = 'rgba(30,40,55,0.7)';
      for (let i = 0; i < 10; i++) {
        const x = i * 200 + Math.sin(frame * 0.02 + i) * 8;
        ctx.beginPath();
        ctx.ellipse(x + 80, h - maxMtn * 0.55, 70, maxMtn * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (levelIndex === 3) {
      ctx.strokeStyle = 'rgba(80,80,100,0.5)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 20; i++) {
        const x = i * 45 + (scroll * 0.5) % 45;
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x - 10 + Math.sin(i) * 5, h - maxMtn);
        ctx.stroke();
      }
    } else if (levelIndex === 4) {
      ctx.fillStyle = 'rgba(0,80,90,0.4)';
      for (let i = 0; i < 16; i++) {
        const x = i * 100;
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.quadraticCurveTo(x + 30, h - maxMtn * 0.75, x + 60, h);
        ctx.quadraticCurveTo(x + 80, h - maxMtn * 0.5, x + 100, h);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#5C4A3A';
      for (let i = 0; i < 8; i++) {
        const x = i * 250;
        ctx.fillRect(x, h - maxMtn, 40, maxMtn);
        ctx.fillRect(x + 180, h - maxMtn * 1.05, 50, maxMtn * 1.05);
      }
    }
  };
  drawTwice();
  ctx.translate(w, 0);
  drawTwice();
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} levelIndex
 * @param {{ x: number; y: number }} camera
 * @param {number} frame
 */
export function drawParallaxNear(ctx, w, h, levelIndex, camera, frame) {
  const scroll = camera.x * 0.5;
  const maxHill = h * 0.15;
  ctx.save();
  ctx.translate(-(scroll % (w * 2)), 0);
  const drawLayer = () => {
    if (levelIndex === 0) {
      ctx.fillStyle = '#4a8a3c';
      for (let i = 0; i < 16; i++) {
        const x = i * 120;
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.quadraticCurveTo(x + 60, h - maxHill, x + 120, h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#2d5018';
        ctx.beginPath();
        ctx.arc(x + 40, h - maxHill * 0.55, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4a8a3c';
      }
    } else if (levelIndex === 1) {
      ctx.fillStyle = '#C2A060';
      for (let i = 0; i < 18; i++) {
        const x = i * 100;
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x + 50, h - maxHill);
        ctx.lineTo(x + 100, h);
        ctx.fill();
      }
      ctx.strokeStyle = '#5a8a3c';
      ctx.lineWidth = 4;
      for (let i = 0; i < 12; i++) {
        const x = i * 160;
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x, h - maxHill * 1.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 15, h - maxHill * 1.05, 14, 0, Math.PI * 2);
        ctx.arc(x + 15, h - maxHill * 1.1, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#4a9a4a';
        ctx.fill();
      }
    } else if (levelIndex === 2) {
      ctx.fillStyle = 'rgba(180,200,255,0.35)';
      for (let k = 0; k < 30; k++) {
        const rx = ((k * 97 + frame * 2) % w) + (scroll % 200);
        const bw = 16;
        const peakY = h - maxHill * 1.2;
        ctx.beginPath();
        ctx.moveTo(rx, h);
        ctx.lineTo(rx + bw / 2, peakY);
        ctx.lineTo(rx + bw, h);
        ctx.closePath();
        ctx.fill();
      }
    } else if (levelIndex === 3) {
      for (let i = 0; i < 8; i++) {
        const x = i * 200 + Math.sin(frame * 0.05 + i) * 6;
        const pulse = maxHill * 1.2 + Math.sin(frame * 0.08 + i) * (maxHill * 0.3);
        const grd = ctx.createRadialGradient(x, h - maxHill, 5, x, h - maxHill, pulse);
        grd.addColorStop(0, 'rgba(255,160,60,0.45)');
        grd.addColorStop(1, 'rgba(255,100,20,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, h - maxHill, pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (levelIndex === 4) {
      ctx.fillStyle = 'rgba(255,255,200,0.15)';
      for (let i = 0; i < 12; i++) {
        const baseX = i * 180 + w * 0.08;
        const triW = 48;
        const groundY = h;
        const peakY = h - maxHill * 1.1;
        ctx.beginPath();
        ctx.moveTo(baseX, groundY);
        ctx.lineTo(baseX + triW / 2, peakY);
        ctx.lineTo(baseX + triW, groundY);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#D4A84B';
      for (let i = 0; i < 20; i++) {
        const x = i * 55;
        const sway = Math.sin(frame * 0.04 + i * 0.5) * 4;
        ctx.fillRect(x + sway, h - 16, 4, 16);
      }
      for (let i = 0; i < 6; i++) {
        const x = i * 300;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 40, h - maxHill * 2.2, 6, maxHill * 2.2);
        ctx.fillStyle = '#C44';
        ctx.fillRect(x + 20, h - maxHill * 2.5, 50, maxHill * 1.1);
      }
    }
  };
  drawLayer();
  ctx.translate(w * 2, 0);
  drawLayer();
  ctx.restore();
}

/**
 * Level-specific FX (full screen / world-agnostic overlays in screen space where noted)
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} levelIndex
 * @param {number} frame
 * @param {{ lightning: number }} [state]
 */
export function drawLevelAmbientFX(ctx, w, h, levelIndex, frame, state = {}) {
  if (levelIndex === 1) {
    const wave = Math.sin(frame * 0.08) * 3;
    ctx.fillStyle = 'rgba(255,220,180,0.08)';
    ctx.fillRect(0, h * 0.62 + wave, w, 12);
  }
  if (levelIndex === 2) {
    if (state.lightning > 0) {
      ctx.fillStyle = `rgba(255,255,255,${state.lightning * 0.4})`;
      ctx.fillRect(0, 0, w, h);
    }
  }
  if (levelIndex === 3) {
    const t = frame * 0.02;
    ctx.fillStyle = 'rgba(255,220,100,0.15)';
    for (let i = 0; i < 6; i++) {
      const open = Math.sin(t + i * 1.2) > 0.85 ? 1 : 0.2;
      ctx.globalAlpha = open;
      ctx.fillRect(80 + i * 120, h * 0.2, 8, 8);
      ctx.fillRect(88 + i * 120, h * 0.22, 8, 8);
      ctx.globalAlpha = 1;
    }
  }
}

/**
 * World-space decorations on ground surface only (sparse).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number }} camera
 * @param {number} levelIndex
 * @param {number} frame
 * @param {number} mapWpx
 * @param {number} mapHpx
 * @param {import('./TileMap.js').TileMap} tileMap
 */
export function drawWorldDecorations(ctx, camera, levelIndex, frame, mapWpx, mapHpx, tileMap) {
  const ts = tileMap.tileSize;
  const startTx = Math.max(0, Math.floor(camera.x / ts) - 2);
  const endTx = Math.min(tileMap.width, Math.ceil((camera.x + ctx.canvas.width) / ts) + 2);

  let treesSeen = 0;
  let flowersSeen = 0;
  let rocksSeen = 0;

  for (let tx = startTx; tx < endTx; tx++) {
    const g = groundSurfaceAt(tileMap, tx);
    if (!g) continue;
    const { groundY } = g;
    const wx = tx * ts;
    const sx = wx - camera.x;
    const groundScreenY = groundY - camera.y;
    if (sx < -100 || sx > ctx.canvas.width + 80) continue;
    if (groundScreenY < -80 || groundScreenY > ctx.canvas.height + 120) continue;

    const r1 = rand01(tx, 1, levelIndex);
    const r2 = rand01(tx, 2, levelIndex);
    const r3 = rand01(tx, 3, levelIndex);

    let tree = false;
    if (treesSeen < 20 && tx % 6 === 0 && r1 > 0.4 && (tx >>> 1) % 5 !== 0) {
      tree = true;
      treesSeen++;
    }

    let flower = false;
    if (!tree && flowersSeen < 15 && tx % 8 === 0 && r2 > 0.42) {
      flower = true;
      flowersSeen++;
    }

    let rock = false;
    if (!tree && !flower && rocksSeen < 8 && tx % 12 === 0 && r3 > 0.48) {
      rock = true;
      rocksSeen++;
    }

    if (levelIndex === 0) {
      if (tree) drawOakOnGround(ctx, sx, groundScreenY);
      if (flower) drawWildflowers(ctx, sx + 18, groundScreenY - 4);
      if (rock) drawRockDecor(ctx, sx + 8, groundScreenY - 6);
    } else if (levelIndex === 1) {
      if (tree) drawPalmOnGround(ctx, sx, groundScreenY);
      if (flower) drawCactusDecor(ctx, sx + 16, groundScreenY - 24);
      if (rock) drawRockDecor(ctx, sx + 10, groundScreenY - 8);
    } else if (levelIndex === 2) {
      if (flower && tx % 10 === 0) drawBubble(ctx, sx + 16, groundScreenY - 20, frame);
      if (rock) drawRockDecor(ctx, sx + 8, groundScreenY - 4);
    } else if (levelIndex === 3) {
      if (flower) drawBone(ctx, sx + 10, groundScreenY - 8);
      if (rock && tx % 14 === 0) drawStalactite(ctx, sx + 12, groundScreenY - 40);
    } else if (levelIndex === 4) {
      if (flower) drawSeaweed(ctx, sx, groundScreenY - 8, frame);
      if (tree && tx % 7 === 0) drawFishBg(ctx, sx + 20, groundScreenY - 16, frame);
    } else {
      if (flower) drawFlowerJoshua(ctx, sx + 12, groundScreenY - 6);
      if (rock && tx % 9 === 0) {
        drawMusicNote(ctx, sx + (frame % 40), groundScreenY - 50 - Math.sin(frame * 0.05) * 6, frame);
      }
    }
  }

  if (levelIndex === 0) {
    const streamY = Math.floor(mapWpx / ts / 2) * ts;
    drawStreamWaves(ctx, camera, streamY, frame, mapWpx);
  }
}

/** Trunk base sits on ground surface (screen-space groundY is top of solid tile). */
function drawOakOnGround(ctx, x, groundScreenY) {
  const trunkH = 28;
  const baseTop = groundScreenY - trunkH;
  ctx.fillStyle = '#5c3d1e';
  ctx.fillRect(x + 12, baseTop, 10, trunkH);
  ctx.fillStyle = '#2d6b2d';
  ctx.beginPath();
  ctx.arc(x + 17, baseTop - 4, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawPalmOnGround(ctx, x, groundScreenY) {
  const trunkH = 36;
  const baseTop = groundScreenY - trunkH;
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x + 14, baseTop, 8, trunkH);
  ctx.strokeStyle = '#3a8a3a';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(x + 18, baseTop);
    ctx.lineTo(x + 18 + Math.cos(a) * 28, baseTop + Math.sin(a) * 28);
    ctx.stroke();
  }
}

function drawRockDecor(ctx, x, y) {
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(x, y - 10, 14, 10);
}

function drawWildflowers(ctx, x, y) {
  const cols = ['#e040a0', '#ffd700', '#6a9cff'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = cols[i % 3];
    ctx.fillRect(x + i * 5, y, 3, 3);
  }
}

function drawCactusDecor(ctx, x, y) {
  ctx.fillStyle = '#3a9a4a';
  ctx.fillRect(x + 8, y, 10, 24);
  ctx.fillRect(x, y + 8, 8, 8);
  ctx.fillRect(x + 18, y + 10, 8, 8);
}

function drawBubble(ctx, x, y, frame) {
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(x, y, 4 + (frame % 3), 0, Math.PI * 2);
  ctx.stroke();
}

function drawBone(ctx, x, y) {
  ctx.fillStyle = '#e8e0d8';
  ctx.fillRect(x, y, 18, 6);
  ctx.beginPath();
  ctx.arc(x, y + 3, 4, 0, Math.PI * 2);
  ctx.arc(x + 18, y + 3, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawStalactite(ctx, x, y) {
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 16, y);
  ctx.lineTo(x + 8, y + 22);
  ctx.closePath();
  ctx.fill();
}

function drawSeaweed(ctx, x, y, frame) {
  ctx.strokeStyle = '#2a8a4a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const sway = Math.sin(frame * 0.1 + x) * 6;
  ctx.moveTo(x + 10, y + 30);
  ctx.quadraticCurveTo(x + 10 + sway, y + 10, x + 10, y);
  ctx.stroke();
}

function drawFishBg(ctx, x, y, frame) {
  ctx.fillStyle = 'rgba(255,180,100,0.6)';
  ctx.beginPath();
  ctx.ellipse(x + (frame % 100) * 0.2, y, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlowerJoshua(ctx, x, y) {
  ctx.fillStyle = '#ff6b9d';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMusicNote(ctx, x, y, frame) {
  ctx.fillStyle = 'rgba(255,220,100,0.8)';
  ctx.font = '16px sans-serif';
  ctx.fillText('♪', x % 200, y);
}

function drawStreamWaves(ctx, camera, streamY, frame, mapWpx) {
  ctx.strokeStyle = 'rgba(80,160,255,0.6)';
  ctx.lineWidth = 2;
  const y = streamY - camera.y + 16;
  if (y < -10 || y > ctx.canvas.height + 10) return;
  for (let x = 0; x < ctx.canvas.width + 40; x += 20) {
    const wx = x + camera.x;
    const wave = Math.sin(wx * 0.05 + frame * 0.1) * 3;
    ctx.beginPath();
    ctx.moveTo(x - 20, y + wave);
    ctx.quadraticCurveTo(x, y + wave + 4, x + 20, y + wave);
    ctx.stroke();
  }
}

/**
 * Golden exit gate — same world rect as Game._winLose / getExitHitRect().
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number }} camera
 * @param {number} exitX
 * @param {number} exitY
 * @param {number} frame
 */
export function drawExitGate(ctx, camera, exitX, exitY, frame) {
  const r = getExitHitRect({ exitX, exitY });
  const sx = r.x - camera.x;
  const sy = r.y - camera.y;
  const w = r.w;
  const h = r.h;
  const pulse = 0.5 + Math.sin(frame * 0.1) * 0.35;
  ctx.save();
  ctx.globalAlpha = Math.min(1, pulse + 0.2);
  ctx.fillStyle = '#B8860B';
  ctx.fillRect(sx, sy, 12, h);
  ctx.fillRect(sx + w - 12, sy, 12, h);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(sx + 10, sy + 12, w - 20, h - 12);
  ctx.fillStyle = 'rgba(255,248,220,0.4)';
  ctx.fillRect(sx + 14, sy + 18, w - 28, 10);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#fff8dc';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 10, sy + 12, w - 20, h - 14);
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1a1206';
  ctx.fillText('EXIT', sx + w / 2, sy + 28);
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('➡️', sx + w + 4, sy + h * 0.45);
  ctx.restore();
}

/**
 * Screen-space hint at start of level (fades out).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} alpha 0..1
 */
export function drawGoalHint(ctx, alpha) {
  if (alpha <= 0) return;
  const w = ctx.canvas.width;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('➡️', w / 2 - 100, 88);
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000';
  ctx.strokeText('Reach the golden gate! →', w / 2, 92);
  ctx.fillStyle = '#fff';
  ctx.fillText('Reach the golden gate! →', w / 2, 92);
  ctx.restore();
}
