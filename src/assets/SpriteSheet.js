/**
 * Procedural 512×512 sprite atlas. Tile grid cells are 32×32 for terrain;
 * characters use 16×32 within row 1; Goliath uses 48×48 at row 2 col 0.
 *
 * All art uses Canvas 2D vector ops only (fill/stroke/drawImage) — no ImageData
 * or pixel buffers, for iOS WebKit compatibility.
 */

const ATLAS_SIZE = 512;
const TILE = 32;

/** @type {HTMLCanvasElement | null} */
let _atlas = null;
const ATLAS_BUILD = 3;
let _atlasBuildCached = -1;

function ensureAtlas() {
  if (_atlas && _atlasBuildCached === ATLAS_BUILD) return _atlas;
  const c = document.createElement('canvas');
  c.width = ATLAS_SIZE;
  c.height = ATLAS_SIZE;
  const g = c.getContext('2d');
  if (!g) return c;
  g.imageSmoothingEnabled = false;
  drawTerrainRow(g);
  drawCharacterRow(g);
  drawEnemyRow(g);
  drawItemRow(g);
  drawDecorRow(g);
  _atlasBuildCached = ATLAS_BUILD;
  _atlas = c;
  return c;
}

function drawTerrainRow(g) {
  for (let i = 0; i < 8; i++) {
    const x = i * TILE;
    g.save();
    g.translate(x, 0);
    if (i === 0) drawSandTile(g);
    else if (i === 1) drawGrassTile(g);
    else if (i === 2) drawStoneTileTerrain(g);
    else if (i === 3) drawWoodTileTerrain(g);
    else if (i === 4) drawWaterTileTerrain(g);
    else if (i === 5) drawGoldTileTerrain(g);
    else if (i === 6) drawCloudTileTerrain(g);
    else drawBrickTileTerrain(g);
    g.restore();
  }
}

function drawSandTile(g) {
  g.fillStyle = '#D4A853';
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle = '#C4944A';
  for (let i = 0; i < 5; i++) {
    g.fillRect(
      (i * TILE) / 5 + 1,
      TILE * 0.3 + (i % 2) * 4,
      2,
      2,
    );
  }
  for (let n = 0; n < 8; n++) {
    g.fillRect((n * 19) % 28, (n * 11) % 26, 2, 2);
  }
}

function drawGrassTile(g) {
  g.fillStyle = '#8B5E3C';
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle = '#5a8a3c';
  g.fillRect(0, 0, TILE, TILE * 0.25);
  g.fillStyle = '#4a7a2c';
  for (let i = 0; i < 4; i++) {
    g.fillRect(i * (TILE / 4) + 2, TILE * 0.1, 3, 3);
  }
  g.fillStyle = '#5fcc3a';
  g.fillRect(0, 0, TILE, 4);
}

function drawStoneTileTerrain(g) {
  g.fillStyle = '#888888';
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle = '#666666';
  g.fillRect(0, TILE / 2, TILE, 2);
  g.fillRect(TILE / 2, 0, 2, TILE / 2);
  for (let i = 0; i < 5; i++) {
    g.fillRect((i * 13) % 26, (i * 9) % 24, 5, 5);
  }
}

function drawWoodTileTerrain(g) {
  g.fillStyle = '#8B4513';
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle = '#7A3B10';
  for (let i = 0; i < 4; i++) {
    g.fillRect(0, i * (TILE / 4), TILE, 1);
  }
}

function drawWaterTileTerrain(g) {
  g.fillStyle = '#1a6fa8';
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle = '#2a7fb8';
  const waveOffset = 0;
  g.fillRect(0, TILE / 3 + waveOffset, TILE, 3);
  g.fillRect(0, TILE * 0.66 + waveOffset, TILE, 3);
  g.fillStyle = 'rgba(255,255,255,0.25)';
  g.fillRect(4, 8, TILE - 8, 2);
  g.fillRect(2, 20, TILE - 4, 2);
}

function drawGoldTileTerrain(g) {
  g.fillStyle = '#ffd700';
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle = '#fff8b0';
  g.fillRect(6, 6, 10, 4);
  g.fillStyle = '#e6c200';
  g.fillRect(10, 14, 8, 6);
}

function drawCloudTileTerrain(g) {
  g.fillStyle = '#b8d4ff';
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(10, 18, 10, 0, Math.PI * 2);
  g.arc(22, 16, 12, 0, Math.PI * 2);
  g.arc(16, 22, 8, 0, Math.PI * 2);
  g.fill();
}

function drawBrickTileTerrain(g) {
  g.fillStyle = '#C1440E';
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle = '#999999';
  g.fillRect(0, TILE / 2, TILE, 2);
  g.fillRect(TILE / 2, 0, 2, TILE / 2);
  g.fillRect(TILE / 4, TILE / 2, 2, TILE / 2);
}

function drawCharacterRow(g) {
  const y0 = TILE;
  const heroes = [
    drawDavidMini,
    drawMosesMini,
    drawNoahMini,
    drawMaryMini,
    drawDanielMini,
    drawEstherMini,
    drawJonahMini,
    drawJoshuaHeroMini,
  ];
  for (let i = 0; i < 8; i++) {
    g.save();
    g.translate(i * TILE + 8, y0);
    heroes[i](g);
    g.restore();
  }
}

const SKIN = '#FDBCB4';

function drawDavidMini(g) {
  const tunic = '#8B4513';
  g.fillStyle = SKIN;
  g.fillRect(4, 4, 8, 8);
  g.fillStyle = '#3d2817';
  g.fillRect(4, 2, 8, 4);
  g.fillStyle = tunic;
  g.fillRect(2, 10, 12, 14);
  g.fillRect(0, 12, 4, 10);
  g.fillRect(12, 12, 4, 10);
  g.fillRect(3, 22, 4, 8);
  g.fillRect(9, 22, 4, 8);
  g.fillStyle = '#654321';
  g.fillRect(12, 14, 3, 2);
}

function drawMosesMini(g) {
  g.fillStyle = '#FFFFFF';
  g.fillRect(2, 8, 12, 16);
  g.fillStyle = SKIN;
  g.fillRect(4, 4, 8, 8);
  g.fillStyle = '#888888';
  g.fillRect(5, 10, 2, 6);
  g.fillRect(11, 8, 2, 12);
  g.fillRect(4, 2, 8, 4);
}

function drawNoahMini(g) {
  const clothes = '#6B4226';
  g.fillStyle = SKIN;
  g.fillRect(4, 4, 8, 8);
  g.fillStyle = '#5c4033';
  g.fillRect(4, 2, 8, 4);
  g.fillStyle = clothes;
  g.fillRect(2, 10, 12, 14);
  g.fillRect(0, 12, 4, 10);
  g.fillRect(12, 12, 4, 10);
  g.fillRect(3, 22, 4, 8);
  g.fillRect(9, 22, 4, 8);
  g.fillStyle = '#888888';
  g.fillRect(10, 12, 4, 2);
}

function drawMaryMini(g) {
  g.fillStyle = '#1E90FF';
  g.fillRect(1, 8, 14, 16);
  g.fillStyle = SKIN;
  g.fillRect(4, 4, 8, 8);
  g.fillStyle = '#d4c4a8';
  g.fillRect(3, 3, 10, 4);
}

function drawDanielMini(g) {
  g.fillStyle = '#6A0DAD';
  g.fillRect(2, 10, 12, 14);
  g.fillStyle = SKIN;
  g.fillRect(4, 4, 8, 8);
  g.fillStyle = '#3d2817';
  g.fillRect(4, 2, 8, 4);
}

function drawEstherMini(g) {
  g.fillStyle = '#8B008B';
  g.fillRect(1, 10, 14, 14);
  g.fillStyle = '#ffd700';
  g.fillRect(5, 2, 6, 4);
  g.fillStyle = SKIN;
  g.fillRect(4, 6, 8, 8);
}

function drawJonahMini(g) {
  g.fillStyle = '#4169E1';
  g.fillRect(2, 10, 12, 14);
  g.fillStyle = SKIN;
  g.fillRect(4, 4, 8, 8);
  g.fillStyle = '#3d2817';
  g.fillRect(4, 2, 8, 4);
  g.fillStyle = '#4a90c0';
  g.fillRect(12, 18, 6, 4);
}

function drawJoshuaHeroMini(g) {
  g.fillStyle = '#B8860B';
  g.fillRect(2, 10, 12, 14);
  g.fillStyle = SKIN;
  g.fillRect(4, 4, 8, 8);
  g.fillStyle = '#3d2817';
  g.fillRect(4, 2, 8, 4);
  g.fillStyle = '#c9a227';
  g.fillRect(0, 12, 4, 10);
  g.fillRect(12, 10, 3, 8);
}

function drawCalebMini(g) {
  g.fillStyle = '#228B22';
  g.fillRect(2, 10, 12, 14);
  g.fillStyle = SKIN;
  g.fillRect(4, 4, 8, 8);
  g.fillStyle = '#4a3728';
  g.fillRect(4, 2, 8, 4);
  g.fillStyle = '#ffd700';
  g.fillRect(3, 8, 10, 3);
}

function drawJoshuaSonMini(g) {
  g.fillStyle = '#4169E1';
  g.fillRect(2, 10, 12, 14);
  g.fillStyle = SKIN;
  g.fillRect(4, 4, 8, 8);
  g.fillStyle = '#3d2817';
  g.fillRect(4, 2, 8, 4);
  g.fillRect(0, 12, 3, 8);
  g.fillRect(13, 12, 3, 8);
}

function drawEnemyRow(g) {
  g.save();
  g.translate(0, TILE * 2);
  drawGoliathAtlas(g);
  g.restore();
  const enemies = [null, drawPharaohAtlas, drawLionAtlas, drawSnakeAtlas, drawWhaleAtlas];
  for (let i = 1; i < 5; i++) {
    g.save();
    g.translate(i * TILE, TILE * 2);
    enemies[i](g);
    g.restore();
  }
}

function drawGoliathAtlas(g) {
  g.fillStyle = '#777777';
  g.fillRect(4, 0, 40, 48);
  g.fillStyle = '#555555';
  g.fillRect(8, 8, 32, 32);
  g.fillStyle = '#cc4444';
  g.fillRect(10, 40, 28, 8);
  g.fillStyle = SKIN;
  g.fillRect(16, 4, 16, 12);
}

function drawPharaohAtlas(g) {
  g.fillStyle = '#cc4444';
  g.fillRect(4, 6, 24, 22);
  g.fillStyle = '#ffd700';
  g.fillRect(8, 2, 16, 8);
  g.fillStyle = SKIN;
  g.fillRect(10, 10, 12, 8);
  g.fillStyle = '#888888';
  g.fillRect(26, 14, 8, 2);
}

function drawLionAtlas(g) {
  g.fillStyle = '#e09020';
  g.fillRect(4, 10, 24, 18);
  g.fillRect(2, 14, 8, 8);
  g.fillStyle = '#3d2817';
  g.fillRect(8, 6, 16, 8);
}

function drawSnakeAtlas(g) {
  g.fillStyle = '#3a8f3a';
  g.fillRect(4, 18, 22, 8);
  g.beginPath();
  g.arc(8, 20, 6, 0, Math.PI * 2);
  g.fill();
}

function drawWhaleAtlas(g) {
  g.fillStyle = '#2a5a8a';
  g.fillRect(2, 8, 28, 18);
  g.fillStyle = '#1a3a5a';
  g.fillRect(22, 12, 8, 12);
  g.fillStyle = '#ffffff';
  g.fillRect(24, 14, 4, 3);
}

function drawItemRow(g) {
  const y = TILE * 3;
  const drawers = [
    drawStarItem,
    drawHeartItem,
    drawScrollItem,
    drawBreadItem,
    drawKeyItem,
    drawCrownItem,
    drawDoveItem,
    drawShieldItem,
  ];
  for (let i = 0; i < 8; i++) {
    g.save();
    g.translate(i * TILE, y);
    drawers[i](g);
    g.restore();
  }
}

function drawStarItem(g) {
  g.fillStyle = '#ffd700';
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = 16 + Math.cos(a) * 12;
    const y = 16 + Math.sin(a) * 12;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fill();
}

function drawHeartItem(g) {
  g.fillStyle = '#e04040';
  g.beginPath();
  g.moveTo(16, 22);
  g.bezierCurveTo(6, 12, 6, 6, 16, 10);
  g.bezierCurveTo(26, 6, 26, 12, 16, 22);
  g.fill();
}

function drawScrollItem(g) {
  g.fillStyle = '#f5e6c8';
  g.fillRect(8, 8, 16, 18);
  g.strokeStyle = '#8b7355';
  g.lineWidth = 1;
  g.strokeRect(8, 8, 16, 18);
}

function drawBreadItem(g) {
  g.fillStyle = '#d4a574';
  g.fillRect(8, 14, 18, 10);
}

function drawKeyItem(g) {
  g.fillStyle = '#ffd700';
  g.fillRect(10, 8, 4, 14);
  g.beginPath();
  g.arc(12, 8, 6, 0, Math.PI * 2);
  g.fill();
}

function drawCrownItem(g) {
  g.fillStyle = '#ffd700';
  g.fillRect(6, 16, 20, 6);
  for (let i = 0; i < 5; i++) {
    g.fillRect(6 + i * 4, 10 - (i % 2) * 4, 4, 8);
  }
}

function drawDoveItem(g) {
  g.fillStyle = '#eeeeee';
  g.fillRect(10, 12, 14, 10);
  g.fillRect(6, 14, 8, 6);
}

function drawShieldItem(g) {
  g.fillStyle = '#6a8fc4';
  g.fillRect(10, 8, 12, 18);
  g.fillStyle = '#ffd700';
  g.fillRect(14, 12, 4, 8);
}

function drawDecorRow(g) {
  const y = TILE * 4;
  const fns = [
    drawPalmTrunk,
    drawPalmTop,
    drawRock,
    drawCactus,
    drawBurningBush,
    drawArkPiece,
    drawPillar,
    drawGate,
  ];
  for (let i = 0; i < 8; i++) {
    g.save();
    g.translate(i * TILE, y);
    fns[i](g);
    g.restore();
  }
}

function drawPalmTrunk(g) {
  g.fillStyle = '#8b6914';
  g.fillRect(12, 4, 8, 28);
}

function drawPalmTop(g) {
  g.fillStyle = '#3a8a3c';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const cx = 16 + Math.cos(a) * 6;
    const cy = 16 + Math.sin(a) * 6;
    g.fillRect(cx - 3, cy - 10, 6, 20);
  }
  g.fillStyle = '#2d7030';
  g.fillRect(12, 12, 8, 8);
}

function drawRock(g) {
  g.fillStyle = '#7a7a7a';
  g.beginPath();
  g.moveTo(4, 28);
  g.lineTo(10, 8);
  g.lineTo(24, 12);
  g.lineTo(28, 28);
  g.closePath();
  g.fill();
}

function drawCactus(g) {
  g.fillStyle = '#2d8a3a';
  g.fillRect(12, 8, 8, 22);
  g.fillRect(6, 14, 8, 6);
}

function drawBurningBush(g) {
  g.fillStyle = '#4a8a2a';
  g.fillRect(8, 12, 16, 16);
  g.fillStyle = '#ff6a20';
  for (let i = 0; i < 8; i++) {
    g.fillRect(8 + (i * 5) % 14, 8 + (i * 3) % 10, 3, 6);
  }
}

function drawArkPiece(g) {
  g.fillStyle = '#8b5a2b';
  g.fillRect(4, 12, 24, 12);
  g.fillStyle = '#654321';
  g.fillRect(4, 8, 24, 6);
}

function drawPillar(g) {
  g.fillStyle = '#d4c4a8';
  g.fillRect(10, 4, 12, 26);
  g.fillRect(6, 4, 20, 6);
}

function drawGate(g) {
  g.fillStyle = '#ffd700';
  g.fillRect(6, 8, 20, 22);
  g.fillStyle = '#1a1a1a';
  g.fillRect(14, 16, 4, 8);
}

const TILE_ID_TO_ATLAS = {
  1: [0, 0],
  2: [1, 0],
  3: [2, 0],
  4: [4, 0],
  5: [3, 0],
  6: [5, 0],
  7: [6, 0],
  8: [7, 0],
};

export function getSpriteSheet() {
  return ensureAtlas();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} tileId
 * @param {number} destX
 * @param {number} destY
 * @param {number} scale
 */
export function drawTile(ctx, tileId, destX, destY, scale = 1) {
  const atlas = ensureAtlas();
  const pair = TILE_ID_TO_ATLAS[tileId];
  if (!pair) return;
  const [tx, ty] = pair;
  const sx = tx * TILE;
  const sy = ty * TILE;
  const ds = TILE * scale;
  ctx.drawImage(atlas, sx, sy, TILE, TILE, destX, destY, ds, ds);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(destX + 0.5, destY + 0.5, ds - 1, ds - 1);
}

export const CHAR_DRAW_W = 100;
export const CHAR_DRAW_H = 160;

/** Tight bbox around S=20 hero art (Daniel lion left, Esther crown up, feet down). */
const HERO_BBOX_X0 = -80;
const HERO_BBOX_Y0 = -70;
const HERO_BBOX_W = 256;
const HERO_BBOX_H = 306;

/**
 * @param {string} hex
 * @param {number} amount 0..1 subtract from each channel
 */
export function darkenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount * 255);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount * 255);
  const b = Math.max(0, (num & 0xff) - amount * 255);
  return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
}

export function getHairColor(charId) {
  const hair = {
    david: '#4a2c0a',
    moses: '#DDDDDD',
    noah: '#AAAAAA',
    mary: '#2a1a0a',
    daniel: '#2a1a0a',
    esther: '#2a1a0a',
    jonah: '#4a2c0a',
    joshua_hero: '#2a1a0a',
    joshua: '#2a1a0a',
    caleb: '#8B4513',
  };
  return hair[charId] || '#4a2c0a';
}

export function getCharacterColor(charId) {
  const colors = {
    david: '#8B4513',
    moses: '#EEEEEE',
    noah: '#6B4226',
    mary: '#1E90FF',
    daniel: '#6A0DAD',
    esther: '#8B008B',
    jonah: '#4169E1',
    joshua_hero: '#B8860B',
    joshua: '#1E3A8A',
    caleb: '#166534',
  };
  return colors[charId] || '#8B4513';
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} S
 * @param {string} color
 * @param {string} hairColor
 */
function drawFemaleBody(ctx, x, y, S, color, hairColor) {
  ctx.fillStyle = hairColor;
  ctx.fillRect(x + S * 0.7, y - S * 0.5, S * 3.6, S * 0.9);

  ctx.fillStyle = '#FDBCB4';
  ctx.fillRect(x + S * 0.8, y, S * 3.4, S * 3);
  ctx.fillRect(x + S * 0.5, y + S * 0.5, S * 0.5, S * 1.5);
  ctx.fillRect(x + S * 4, y + S * 0.5, S * 0.5, S * 1.5);

  ctx.fillStyle = '#222';
  ctx.fillRect(x + S * 1.2, y + S * 0.9, S * 0.8, S * 0.6);
  ctx.fillRect(x + S * 2.8, y + S * 0.9, S * 0.8, S * 0.6);
  ctx.fillRect(x + S * 1.0, y + S * 0.7, S * 0.3, S * 0.3);
  ctx.fillRect(x + S * 2.6, y + S * 0.7, S * 0.3, S * 0.3);
  ctx.fillRect(x + S * 1.9, y + S * 0.7, S * 0.3, S * 0.3);
  ctx.fillRect(x + S * 3.4, y + S * 0.7, S * 0.3, S * 0.3);

  ctx.fillStyle = 'rgba(255,150,150,0.4)';
  ctx.fillRect(x + S * 0.8, y + S * 1.5, S * 0.8, S * 0.6);
  ctx.fillRect(x + S * 3.4, y + S * 1.5, S * 0.8, S * 0.6);

  ctx.fillStyle = '#cc6644';
  ctx.fillRect(x + S * 1.6, y + S * 2.1, S * 1.8, S * 0.3);

  const dress = color;
  ctx.fillStyle = dress;
  ctx.fillRect(x + S * 0.8, y + S * 3, S * 3.4, S * 2);
  ctx.fillRect(x + S * 0.4, y + S * 5, S * 4.2, S * 2);
  ctx.fillRect(x + S * 0.0, y + S * 7, S * 5.0, S * 2);

  ctx.fillStyle = darkenColor(dress, 0.3);
  ctx.fillRect(x + S * 0.8, y + S * 4.8, S * 3.4, S * 0.5);

  ctx.fillStyle = '#FDBCB4';
  ctx.fillRect(x - S * 0.3, y + S * 3, S * 1.0, S * 3.5);
  ctx.fillRect(x + S * 4.3, y + S * 3, S * 1.0, S * 3.5);

  ctx.fillRect(x - S * 0.4, y + S * 6, S * 1.2, S * 1.0);
  ctx.fillRect(x + S * 4.2, y + S * 6, S * 1.2, S * 1.0);

  ctx.fillStyle = '#FDBCB4';
  ctx.fillRect(x + S * 0.8, y + S * 8.8, S * 1.2, S * 0.6);
  ctx.fillRect(x + S * 3.0, y + S * 8.8, S * 1.2, S * 0.6);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} S
 * @param {string} color
 * @param {string} hairColor
 * @param {number} frame
 */
function drawMaleBody(ctx, x, y, S, color, hairColor, frame) {
  ctx.fillStyle = hairColor;
  ctx.fillRect(x + S * 0.85, y - S * 0.55, S * 2.9, S * 0.95);

  ctx.fillStyle = '#FDBCB4';
  ctx.fillRect(x + S, y, S * 3, S * 3);
  ctx.fillRect(x + S * 0.7, y + S * 1.5, S * 0.4, S * 1.5);
  ctx.fillRect(x + S * 3.9, y + S * 1.5, S * 0.4, S * 1.5);

  ctx.fillStyle = '#4a2c0a';
  ctx.fillRect(x + S * 1.1, y + S * 0.6, S * 0.9, S * 0.35);
  ctx.fillRect(x + S * 2.8, y + S * 0.6, S * 0.9, S * 0.35);

  ctx.fillStyle = '#222';
  ctx.fillRect(x + S * 1.2, y + S * 1.0, S * 0.7, S * 0.6);
  ctx.fillRect(x + S * 2.9, y + S * 1.0, S * 0.7, S * 0.6);

  ctx.fillStyle = '#cc6644';
  ctx.fillRect(x + S * 1.3, y + S * 2.1, S * 2.4, S * 0.4);
  ctx.fillRect(x + S * 1.3, y + S * 2.5, S * 0.4, S * 0.3);
  ctx.fillRect(x + S * 3.3, y + S * 2.5, S * 0.4, S * 0.3);

  ctx.fillStyle = color;
  ctx.fillRect(x + S * 0.2, y + S * 3, S * 4.6, S * 1.2);
  ctx.fillRect(x + S * 0.5, y + S * 4, S * 4.0, S * 4);

  ctx.fillStyle = darkenColor(color, 0.3);
  ctx.fillRect(x + S * 0.5, y + S * 5.5, S * 4, S * 0.6);

  ctx.fillStyle = color;
  ctx.fillRect(x - S * 0.6, y + S * 3, S * 1.3, S * 3.5);
  ctx.fillRect(x + S * 4.3, y + S * 3, S * 1.3, S * 3.5);
  ctx.fillStyle = '#FDBCB4';
  ctx.fillRect(x - S * 0.6, y + S * 5.5, S * 1.3, S * 2);
  ctx.fillRect(x + S * 4.3, y + S * 5.5, S * 1.3, S * 2);

  ctx.fillRect(x - S * 0.7, y + S * 7, S * 1.5, S * 1.2);
  ctx.fillRect(x + S * 4.2, y + S * 7, S * 1.5, S * 1.2);

  const legOffset = Math.sin(frame * 0.8) * S * 0.4;
  ctx.fillStyle = darkenColor(color, 0.3);
  ctx.fillRect(x + S * 0.5, y + S * 8, S * 1.8, S * 3 + legOffset);
  ctx.fillRect(x + S * 2.7, y + S * 8, S * 1.8, S * 3 - legOffset);

  ctx.fillStyle = '#6B3A2A';
  ctx.fillRect(x + S * 0.3, y + S * 11, S * 2.2, S * 0.8);
  ctx.fillRect(x + S * 2.5, y + S * 11, S * 2.2, S * 0.8);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} charId
 * @param {number} x
 * @param {number} y
 * @param {number} S
 * @param {number} frame
 */
function addCharacterAccessories(ctx, charId, x, y, S, frame) {
  const color = getCharacterColor(charId);
  const idle = Math.sin(frame * 0.12) * 0.15;

  if (charId === 'mary') {
    ctx.fillStyle = '#1E90FF';
    ctx.fillRect(x + S * 0.2, y - S * 0.5, S * 4.6, S * 1.1);
    ctx.fillRect(x - S * 0.2, y + S * 0.2, S * 1.0, S * 3.2);
    ctx.fillRect(x + S * 4.2, y + S * 0.2, S * 1.0, S * 3.2);
    ctx.fillRect(x + S * 0.1, y + S * 2.8, S * 4.8, S * 0.45);
    ctx.strokeStyle = 'rgba(255,215,0,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + S * 2.5, y + S * 0.35, S * 2.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#FDBCB4';
    const cx = x + S * 2.5 + idle * S;
    ctx.fillRect(cx - S * 0.5, y + S * 3.8, S * 0.45, S * 1.1);
    ctx.fillRect(cx + S * 0.05, y + S * 3.8, S * 0.45, S * 1.1);
  }

  if (charId === 'esther') {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + S * 0.3, y + S * 4.2, S * 4.4, S * 0.35);
    ctx.fillRect(x + S * 0.1, y + S * 6.2, S * 4.8, S * 0.4);
    ctx.fillRect(x + S * 0.2, y + S * 7.4, S * 2.2, S * 0.35);
    ctx.fillRect(x + S * 2.6, y + S * 7.4, S * 2.2, S * 0.35);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + S * 0.6, y - S * 2.2, S * 3.8, S * 1.6);
    ctx.fillRect(x + S * 1.0, y - S * 3.2, S * 0.7, S * 1.4);
    ctx.fillRect(x + S * 2.15, y - S * 3.8, S * 0.7, S * 2);
    ctx.fillRect(x + S * 3.3, y - S * 3.2, S * 0.7, S * 1.4);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + S * 2.35, y - S * 2.0, S * 0.45, S * 0.45);
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(x + S * 4.6, y + S * 4.5, S * 0.35, S * 2.2);
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + S * 4.6, y + S * 4.5, S * 0.35, S * 2.2);
    ctx.fillStyle = '#00CED1';
    ctx.fillRect(x + S * 1.2, y + S * 5.2, S * 0.25, S * 0.25);
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(x + S * 3.5, y + S * 6.0, S * 0.25, S * 0.25);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + S * 2.2, y + S * 7.1, S * 0.25, S * 0.25);
  }

  if (charId === 'moses') {
    ctx.fillStyle = '#6B3A2A';
    ctx.fillRect(x + S * 5.5, y - S * 2, S * 0.6, S * 14);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + S * 5.2, y - S * 2.5, S * 1.2, S * 0.8);
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(x + S * 1, y + S * 2.5, S * 3, S * 2);
    ctx.fillRect(x + S * 1.5, y + S * 4, S * 2, S * 1.5);
    ctx.fillStyle = '#DDDDDD';
    ctx.fillRect(x + S * 0.9, y - S * 0.55, S * 3.2, S * 0.85);
  }

  if (charId === 'david') {
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(x + S * 5.5, y + S * 6, S * 2, S * 0.3);
    ctx.fillRect(x + S * 7, y + S * 6, S * 0.3, S * 1.5);
    ctx.fillStyle = '#888';
    ctx.fillRect(x + S * 6.8, y + S * 7.5, S * 0.7, S * 0.7);
  }

  if (charId === 'daniel') {
    const lionX = x - S * 4;
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(lionX, y + S * 8, S * 3, S * 2);
    ctx.fillRect(lionX + S * 0.5, y + S * 6.5, S * 2, S * 1.8);
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(lionX + S * 0.2, y + S * 6, S * 2.6, S * 2.5);
    ctx.fillRect(lionX + S * 0.7, y + S * 5.5, S * 1.6, S * 0.8);
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(lionX + S * 0.8, y + S * 6.3, S * 1.4, S * 1.5);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(lionX + S, y + S * 6.5, S * 0.4, S * 0.4);
    ctx.fillRect(lionX + S * 1.6, y + S * 6.5, S * 0.4, S * 0.4);
  }

  if (charId === 'noah') {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + S * 5.5, y + S * 4, S * 0.5, S * 4);
    ctx.fillStyle = '#555';
    ctx.fillRect(x + S * 5.0, y + S * 4, S * 1.5, S * 1.2);
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(x + S * 1.2, y + S * 2.5, S * 2.6, S * 1.8);
  }

  if (charId === 'jonah') {
    ctx.fillStyle = darkenColor(color, 0.4);
    ctx.fillRect(x + S * 0.5, y + S * 6, S * 4, S * 2);
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(x + S * 5.5, y + S * 7, S * 3, S * 1.5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + S * 5.6, y + S * 7.2, S * 0.4, S * 0.4);
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(x + S * 8, y + S * 6.8, S * 0.8, S * 1.9);
  }

  if (charId === 'joshua' || charId === 'joshua_hero') {
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(x - S * 2, y + S * 3, S * 1.8, S * 2.5);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x - S * 1.8, y + S * 3.2, S * 1.4, S * 2);
    ctx.fillStyle = '#1E3A8A';
    ctx.font = `bold ${S}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('J', x - S * 1.1, y + S * 4.25);
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + S * 5.5, y + S * 3, S * 0.5, S * 5);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + S * 5.0, y + S * 5, S * 1.5, S * 0.8);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + S * 5.2, y + S * 2.5, S * 0.8, S * 0.8);
  }

  if (charId === 'caleb') {
    ctx.fillStyle = '#166534';
    ctx.fillRect(x - S * 2, y + S * 3, S * 1.8, S * 2.5);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x - S * 1.8, y + S * 3.2, S * 1.4, S * 2);
    ctx.fillStyle = '#166534';
    ctx.font = `bold ${S}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', x - S * 1.1, y + S * 4.25);
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} charId
 * @param {number} x
 * @param {number} y
 * @param {number} frame
 */
function drawHeroBody(ctx, charId, x, y, frame) {
  const S = 20;
  const color = getCharacterColor(charId);
  const hairColor = getHairColor(charId);
  const isFemale = charId === 'mary' || charId === 'esther';

  if (isFemale) {
    drawFemaleBody(ctx, x, y, S, color, hairColor);
  } else {
    drawMaleBody(ctx, x, y, S, color, hairColor, frame);
  }

  addCharacterAccessories(ctx, charId, x, y, S, frame);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} charId
 * @param {number} destX
 * @param {number} destY
 * @param {'left'|'right'} facing
 * @param {number} frame
 * @param {{ hurt?: boolean; jump?: boolean; label?: string; portrait?: boolean }} [opts]
 */
export function drawCharacter(ctx, charId, destX, destY, facing, frame, opts = {}) {
  const dw = opts.portrait ? 40 : CHAR_DRAW_W;
  const dh = opts.portrait ? 40 : CHAR_DRAW_H;
  const hurt = opts.hurt;
  const jump = opts.jump;
  const label = opts.label;
  const frameNum = frame ?? 0;

  const drawLabel = () => {
    if (!label) return;
    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.strokeText(label, destX + dw / 2, destY - 12);
    ctx.fillStyle = 'white';
    ctx.fillText(label, destX + dw / 2, destY - 12);
  };

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (hurt) ctx.filter = 'brightness(1.35) saturate(1.8) hue-rotate(-10deg)';

  const jy = jump ? -10 : 0;
  ctx.translate(destX, destY + jy);

  const sx = dw / HERO_BBOX_W;
  const sy = dh / HERO_BBOX_H;
  const scale = Math.min(sx, sy);
  const scaledW = HERO_BBOX_W * scale;
  const scaledH = HERO_BBOX_H * scale;
  ctx.translate((dw - scaledW) / 2, (dh - scaledH) / 2);
  ctx.scale(scale, scale);
  ctx.translate(-HERO_BBOX_X0, -HERO_BBOX_Y0);

  const S = 20;
  const x = 0;
  const y = 0;
  if (facing === 'left') {
    const pivot = x + S * 2.5;
    ctx.translate(pivot, 0);
    ctx.scale(-1, 1);
    ctx.translate(-pivot, 0);
  }

  drawHeroBody(ctx, charId, x, y, frameNum);

  ctx.filter = 'none';
  ctx.restore();
  drawLabel();
}

const ENEMY_ATLAS = {
  goliath: { sx: 0, sy: 64, w: 48, h: 48 },
  philistine: { sx: 32, sy: 64, w: 32, h: 32 },
  pharaoh: { sx: 32, sy: 64, w: 32, h: 32 },
  lion: { sx: 64, sy: 64, w: 32, h: 32 },
  snake: { sx: 96, sy: 64, w: 32, h: 32 },
  whale: { sx: 128, sy: 64, w: 32, h: 32 },
  jellyfish: { sx: 128, sy: 64, w: 32, h: 32 },
  archer: { sx: 32, sy: 64, w: 32, h: 32 },
  guard: { sx: 32, sy: 64, w: 32, h: 32 },
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} enemyKey
 * @param {number} destX
 * @param {number} destY
 * @param {number} frame
 */
export function drawEnemy(ctx, enemyKey, destX, destY, frame) {
  const atlas = ensureAtlas();
  const def = ENEMY_ATLAS[enemyKey] || ENEMY_ATLAS.philistine;
  const bob = enemyKey === 'jellyfish' ? Math.sin(frame * 0.2) * 4 : 0;
  ctx.drawImage(atlas, def.sx, def.sy, def.w, def.h, destX, destY + bob, def.w, def.h);
}

const ITEM_COL = {
  star: 0,
  heart: 1,
  scroll: 2,
  bread: 3,
  key: 4,
  crown: 5,
  dove: 6,
  shield: 7,
  stone: 0,
  ark: 5,
  animal: 6,
  trumpet: 5,
  bubble: 4,
  fish: 6,
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} itemKey
 * @param {number} destX
 * @param {number} destY
 * @param {number} frame
 */
export function drawItem(ctx, itemKey, destX, destY, frame) {
  const atlas = ensureAtlas();
  const col = ITEM_COL[itemKey] ?? 0;
  const sx = col * TILE;
  const sy = TILE * 3;
  const cx = destX + 16;
  const cy = destY + 16;
  const starRot = frame * 0.05;
  ctx.save();
  ctx.translate(cx, cy);
  if (itemKey === 'scroll') {
    ctx.translate(0, Math.sin(frame * 0.06) * 3);
  }
  if (itemKey === 'heart') {
    const sc = 0.95 + Math.sin(frame * 0.12) * 0.08;
    ctx.scale(sc, sc);
  }
  if (itemKey === 'star') {
    ctx.rotate(starRot);
    ctx.shadowColor = 'rgba(255,255,255,0.95)';
    ctx.shadowBlur = 12;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.fillStyle = 'rgba(255,230,120,0.65)';
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 16, Math.sin(a) * 16);
      ctx.lineTo(Math.cos(a + 0.15) * 8, Math.sin(a + 0.15) * 8);
      ctx.lineTo(Math.cos(a - 0.15) * 8, Math.sin(a - 0.15) * 8);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  ctx.shadowColor = 'rgba(255,255,255,0.85)';
  ctx.shadowBlur = itemKey === 'star' ? 8 : 6;
  const size = itemKey === 'star' ? 24 : itemKey === 'heart' || itemKey === 'scroll' ? 22 : 20;
  const half = size / 2;
  ctx.drawImage(atlas, sx, sy, TILE, TILE, -half, -half, size, size);
  ctx.shadowBlur = 0;
  ctx.restore();
}
