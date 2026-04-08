import { TileId } from '../game/constants.js';
import { EnemyType } from '../game/constants.js';
import { ItemType } from '../game/constants.js';
import { LevelMode } from '../game/constants.js';
import { generateLevel } from './ProceduralEngine.js';

function emptyMap(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(TileId.AIR));
}

function fillRect(map, x0, y0, x1, y1, id) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (map[y] && x >= 0 && x < map[y].length) map[y][x] = id;
    }
  }
}

function grassTop(map, groundY, x0, x1) {
  for (let x = x0; x <= x1; x++) {
    map[groundY][x] = TileId.GRASS;
    for (let y = groundY + 1; y < map.length; y++) {
      map[y][x] = TileId.STONE;
    }
  }
}

function bedrockFloor(map, w, h) {
  for (let x = 0; x < w; x++) map[h - 1][x] = TileId.STONE;
}

/**
 * @returns {import('./Level.js').LevelData}
 */
export function getLevelDefinition(index) {
  switch (index) {
    case 0:
      return levelDavid();
    case 1:
      return levelMoses();
    case 2:
      return levelNoah();
    case 3:
      return levelDaniel();
    case 4:
      return levelJonah();
    case 5:
      return levelJericho();
    case 6:
      return levelGarden();
    case 7:
      return levelBabel();
    case 8:
      return levelAbraham();
    case 9:
      return levelJoseph();
    case 10:
      return levelBabyMoses();
    case 11:
      return levelBurningBush();
    case 12:
      return levelManna();
    case 13:
      return levelGideon();
    case 14:
      return levelSamson();
    case 15:
      return levelRuth();
    case 16:
      return levelElijah();
    case 17:
      return levelWalkingWater();
    case 18:
      return levelFeeding5000();
    case 19:
      return levelEasterMorning();
    default:
      try {
        return generateLevel(index);
      } catch (e) {
        console.error('Level gen failed:', e);
        return cloneLevelAsFallback(index);
      }
  }
}

/**
 * Safe playable level if procedural generation throws.
 * @param {number} index
 * @returns {import('./Level.js').LevelData}
 */
function cloneLevelAsFallback(index) {
  const base = getLevelDefinition(0);
  return {
    ...base,
    index,
    name: `Level ${index + 1}`,
    tiles: base.tiles.map((row) => [...row]),
  };
}

/** Main walk row: five above bottom leaves four rows for water / bedrock / deep layers. */
function gyFor(h) {
  return h - 5;
}

function levelDavid() {
  const w = 120;
  const h = 15;
  const map = emptyMap(w, h);
  const rowGround = 10;

  for (let x = 0; x < w; x++) {
    map[rowGround][x] = TileId.GRASS;
  }
  fillRect(map, 0, 11, w - 1, 14, TileId.STONE);
  fillRect(map, 44, 10, 56, 13, TileId.WATER);

  for (let x = 88; x < 102; x++) map[8][x] = TileId.BRICK;
  for (let x = 30; x < 50; x += 8) map[7][x] = TileId.STONE;
  for (let x = 60; x < 85; x += 10) map[6][x] = TileId.STONE;

  return {
    index: 0,
    name: "David's Valley",
    bibleStory:
      'David trusted God and defeated Goliath with just a sling and five smooth stones!',
    character: 'david',
    width: w,
    height: h,
    tiles: map,
    startX: 3 * 32,
    startY: 8 * 32,
    exitX: (w - 4) * 32,
    exitY: 8 * 32,
    mode: LevelMode.DAVID,
    enemies: [
      { type: EnemyType.PHILISTINE, x: 400, y: 8 * 32, patrolL: 320, patrolR: 560 },
      { type: EnemyType.PHILISTINE, x: 1900, y: 8 * 32, patrolL: 1700, patrolR: 2100 },
      {
        type: EnemyType.GOLIATH,
        x: 100 * 32,
        y: 8 * 32,
        patrolL: 92 * 32,
        patrolR: 112 * 32,
      },
    ],
    items: [
      ...[18, 34, 48, 72, 88].map((tx) => ({
        type: ItemType.STONE,
        x: tx * 32,
        y: 7 * 32,
      })),
      { type: ItemType.HEART, x: 420, y: 7 * 32 },
      { type: ItemType.HEART, x: 900, y: 7 * 32 },
      { type: ItemType.HEART, x: 1400, y: 7 * 32 },
      { type: ItemType.SCROLL, x: 620, y: 6 * 32 },
      { type: ItemType.SCROLL, x: 1500, y: 6 * 32 },
    ],
    background: { skyTop: '#87ceeb', skyBot: '#b8e0ff', parallax: 'hills' },
  };
}

function levelMoses() {
  const w = 150;
  const h = 22;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);

  for (let x = 0; x < w; x++) {
    const bump = x % 9 === 0 ? -1 : 0;
    grassTop(map, gy + bump, x, x);
  }

  fillRect(map, 58, gy - 2, 96, gy, TileId.WATER);
  fillRect(map, 58, gy + 1, 96, h - 2, TileId.SAND);

  fillRect(map, 6, gy - 4, 12, gy - 2, TileId.WOOD);
  for (let x = 20; x < w - 10; x += 25) {
    map[gy - 3][x] = TileId.STONE;
    map[gy - 3][x + 1] = TileId.STONE;
  }

  return {
    index: 1,
    name: 'Desert of Exodus',
    bibleStory: "God led Moses and His people through the desert with a pillar of fire!",
    character: 'moses',
    width: w,
    height: h,
    tiles: map,
    startX: 160,
    startY: (gy - 3) * 32,
    exitX: (w - 3) * 32,
    exitY: (gy - 2) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [
      { type: EnemyType.PHARAOH, x: 2200, y: (gy - 2) * 32, patrolL: 2000, patrolR: 2800 },
      { type: EnemyType.PHARAOH, x: 2500, y: (gy - 2) * 32, patrolL: 2300, patrolR: 3000 },
      { type: EnemyType.SNAKE, x: 500, y: (gy - 1) * 32, patrolL: 400, patrolR: 700 },
      { type: EnemyType.SNAKE, x: 1300, y: (gy - 1) * 32, patrolL: 1100, patrolR: 1500 },
    ],
    items: [
      { type: ItemType.BREAD, x: 400, y: (gy - 4) * 32 },
      { type: ItemType.BREAD, x: 1000, y: (gy - 4) * 32 },
      { type: ItemType.SCROLL, x: 750, y: (gy - 5) * 32 },
      { type: ItemType.SCROLL, x: 1600, y: (gy - 5) * 32 },
    ],
    background: { skyTop: '#f4a460', skyBot: '#ffd9a0', parallax: 'desert' },
    flags: { redSeaX0: 58 * 32, redSeaX1: 96 * 32 },
  };
}

function levelNoah() {
  const w = 100;
  const h = 26;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);

  for (let x = 0; x < w; x++) grassTop(map, gy, x, x);

  fillRect(map, 0, gy + 1, w - 1, h - 2, TileId.WATER);
  for (let x = 0; x < w; x++) map[h - 1][x] = TileId.STONE;

  for (let x = 8; x < w - 8; x += 14) {
    map[gy - 2][x] = TileId.WOOD;
    map[gy - 2][x + 1] = TileId.WOOD;
    map[gy - 3][x] = TileId.WOOD;
  }
  for (let x = 12; x < 88; x += 22) {
    map[gy - 5][x] = TileId.STONE;
    map[gy - 5][x + 1] = TileId.STONE;
  }

  return {
    index: 2,
    name: "Noah's Flood",
    bibleStory:
      'God told Noah to build an ark. Noah trusted God and saved his family and the animals!',
    character: 'noah',
    width: w,
    height: h,
    tiles: map,
    startX: 140,
    startY: (gy - 4) * 32,
    exitX: (w - 4) * 32,
    exitY: (gy - 5) * 32,
    mode: LevelMode.NOAH,
    enemies: [
      { type: EnemyType.SNAKE, x: 600, y: (gy - 2) * 32, patrolL: 400, patrolR: 900 },
      { type: EnemyType.SNAKE, x: 1500, y: (gy - 2) * 32, patrolL: 1300, patrolR: 1800 },
    ],
    items: [
      ...[10, 26, 42, 58, 74].map((tx) => ({ type: ItemType.ARK, x: tx * 32, y: (gy - 5) * 32 })),
      ...[14, 24, 36, 48, 58, 68, 78, 86].map((tx, i) => ({
        type: ItemType.ANIMAL,
        x: tx * 32,
        y: (gy - 4) * 32 - i * 4,
      })),
      { type: ItemType.DOVE, x: 50 * 32, y: (gy - 7) * 32 },
    ],
    background: { skyTop: '#2a3d54', skyBot: '#5a6b7c', parallax: 'storm' },
    flags: { waterRise: true },
  };
}

function levelDaniel() {
  const w = 80;
  const h = 22;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);

  for (let x = 0; x < w; x++) grassTop(map, gy, x, x);

  for (let x = 4; x < w - 4; x += 9) {
    map[gy - 3][x] = TileId.STONE;
    map[gy - 3][x + 1] = TileId.STONE;
  }
  for (let x = 8; x < w - 8; x += 14) {
    map[gy - 5][x] = TileId.STONE;
  }

  return {
    index: 3,
    name: "Daniel's Lions Den",
    bibleStory:
      'Daniel prayed to God even when it was dangerous. God shut the lions mouths!',
    character: 'daniel',
    width: w,
    height: h,
    tiles: map,
    startX: 80,
    startY: (gy - 4) * 32,
    exitX: (w - 4) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.DANIEL,
    enemies: [
      { type: EnemyType.LION, x: 500, y: (gy - 2) * 32, patrolL: 300, patrolR: 900 },
      { type: EnemyType.LION, x: 1000, y: (gy - 2) * 32, patrolL: 800, patrolR: 1200 },
      { type: EnemyType.LION, x: 1600, y: (gy - 2) * 32, patrolL: 1400, patrolR: 1900 },
      { type: EnemyType.PHARAOH, x: 350, y: (gy - 2) * 32, patrolL: 250, patrolR: 550 },
    ],
    items: [
      { type: ItemType.SCROLL, x: 600, y: (gy - 5) * 32 },
      { type: ItemType.SCROLL, x: 1300, y: (gy - 5) * 32 },
      { type: ItemType.HEART, x: 950, y: (gy - 4) * 32 },
    ],
    prayerSpots: [
      { x: 400, y: (gy - 1) * 32 },
      { x: 1100, y: (gy - 1) * 32 },
      { x: 1800, y: (gy - 1) * 32 },
    ],
    background: { skyTop: '#1a1a2e', skyBot: '#2d2d44', parallax: 'cave' },
  };
}

function levelJonah() {
  const w = 120;
  const h = 24;
  const map = emptyMap(w, h);
  for (let x = 0; x < w; x++) map[h - 1][x] = TileId.STONE;

  const waterTop = h - 5;
  fillRect(map, 0, waterTop, w - 1, h - 2, TileId.WATER);

  fillRect(map, 2, 11, 17, 13, TileId.WOOD);

  for (let x = 22; x < w - 22; x += 18) {
    map[14][x] = TileId.STONE;
    map[14][x + 1] = TileId.STONE;
    map[16][x + 7] = TileId.STONE;
  }

  fillRect(map, w - 28, waterTop - 3, w - 4, waterTop - 2, TileId.SAND);

  for (let x = 18; x < w - 32; x += 15) {
    map[waterTop - 2][x] = TileId.STONE;
    map[waterTop - 2][x + 1] = TileId.STONE;
  }

  for (let x = 26; x < w - 26; x += 24) {
    map[h - 3][x] = TileId.STONE;
    map[h - 3][x + 1] = TileId.STONE;
  }

  return {
    index: 4,
    name: "Jonah's Ocean",
    bibleStory:
      'Jonah ran from God, but God sent a great fish. Inside the fish, Jonah prayed and obeyed!',
    character: 'jonah',
    width: w,
    height: h,
    tiles: map,
    startX: 6 * 32,
    startY: 9 * 32,
    exitX: (w - 6) * 32,
    exitY: (waterTop - 4) * 32,
    mode: LevelMode.JONAH,
    enemies: [
      { type: EnemyType.WHALE, x: 45 * 32, y: (h - 3) * 32, patrolL: 32 * 32, patrolR: 90 * 32 },
      { type: EnemyType.JELLYFISH, x: 800, y: (h - 3) * 32, patrolL: 600, patrolR: 1200 },
      { type: EnemyType.JELLYFISH, x: 1800, y: (h - 3) * 32, patrolL: 1600, patrolR: 2200 },
    ],
    items: [
      { type: ItemType.SCROLL, x: 600, y: (waterTop - 4) * 32 },
      { type: ItemType.FISH, x: 900, y: (h - 3) * 32 },
      { type: ItemType.BUBBLE, x: 1400, y: (h - 2) * 32 },
    ],
    background: { skyTop: '#1e5799', skyBot: '#0a2342', parallax: 'ocean' },
  };
}

function levelJericho() {
  const w = 200;
  const h = 22;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);

  for (let x = 0; x < w; x++) grassTop(map, gy, x, x);

  for (let x = 0; x < w; x++) {
    if (x % 28 < 5) map[gy - 5][x] = TileId.BRICK;
  }
  for (let x = 10; x < w - 10; x += 30) {
    map[gy - 4][x] = TileId.STONE;
    map[gy - 4][x + 1] = TileId.STONE;
  }

  return {
    index: 5,
    name: "Joshua's Jericho",
    bibleStory:
      'Joshua and the Israelites marched around Jericho for 7 days. On day 7, they shouted and the walls came tumbling down!',
    character: 'joshua_hero',
    width: w,
    height: h,
    tiles: map,
    startX: 140,
    startY: (gy - 3) * 32,
    exitX: (w - 5) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.JERICHO,
    enemies: [
      { type: EnemyType.ARCHER, x: 800, y: (gy - 6) * 32, patrolL: 700, patrolR: 900 },
      { type: EnemyType.ARCHER, x: 1400, y: (gy - 6) * 32, patrolL: 1300, patrolR: 1500 },
      { type: EnemyType.ARCHER, x: 2200, y: (gy - 6) * 32, patrolL: 2100, patrolR: 2300 },
      { type: EnemyType.ARCHER, x: 3200, y: (gy - 6) * 32, patrolL: 3100, patrolR: 3300 },
      { type: EnemyType.GUARD, x: 1100, y: (gy - 2) * 32, patrolL: 1000, patrolR: 1300 },
      { type: EnemyType.GUARD, x: 3200, y: (gy - 2) * 32, patrolL: 3000, patrolR: 3400 },
    ],
    items: [
      ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({
        type: ItemType.TRUMPET,
        x: (18 + i * 26) * 32,
        y: (gy - 4) * 32,
      })),
      { type: ItemType.SCROLL, x: 1600, y: (gy - 5) * 32 },
      { type: ItemType.CROWN, x: 3600, y: (gy - 4) * 32 },
    ],
    background: { skyTop: '#ff9e40', skyBot: '#ffd280', parallax: 'sunset' },
    flags: { jericho: true },
  };
}

function levelGarden() {
  const w = 80;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) grassTop(map, gy, x, x);
  fillRect(map, 34, gy - 1, 46, gy, TileId.WATER);
  for (let ty = 3; ty <= 10; ty++) {
    for (let tx = 38; tx <= 42; tx++) map[ty][tx] = TileId.WOOD;
  }
  for (let x = 10; x < w - 10; x += 14) {
    map[gy - 2][x] = TileId.STONE;
    map[gy - 2][x + 1] = TileId.STONE;
  }
  return {
    index: 6,
    name: 'Garden of Eden',
    bibleStory: 'God created a beautiful garden for Adam and Eve to enjoy! — Genesis 1:31',
    character: 'mary',
    width: w,
    height: h,
    tiles: map,
    startX: 4 * 32,
    startY: (gy - 3) * 32,
    exitX: (w - 4) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [
      { type: EnemyType.SNAKE, x: 1200, y: (gy - 1) * 32, patrolL: 900, patrolR: 1500 },
      { type: EnemyType.SNAKE, x: 2000, y: (gy - 1) * 32, patrolL: 1800, patrolR: 2300 },
    ],
    items: [
      { type: ItemType.HEART, x: 500, y: (gy - 4) * 32 },
      { type: ItemType.HEART, x: 1100, y: (gy - 4) * 32 },
      { type: ItemType.HEART, x: 1700, y: (gy - 4) * 32 },
      { type: ItemType.SCROLL, x: 900, y: (gy - 5) * 32 },
      { type: ItemType.SCROLL, x: 1600, y: (gy - 5) * 32 },
    ],
    background: { skyTop: '#228B22', skyBot: '#90EE90', parallax: 'hills' },
  };
}

function levelBabel() {
  const w = 60;
  const h = 20;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) map[gy][x] = TileId.SAND;
  for (let x = 0; x < w; x++) {
    for (let y = gy + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
  for (let i = 0; i < 10; i++) {
    const row = gy - 1 - i;
    const x0 = 6 + (i % 2) * 14;
    if (row > 3) {
      map[row][x0] = TileId.BRICK;
      map[row][x0 + 1] = TileId.BRICK;
      map[row][x0 + 2] = TileId.BRICK;
      map[row][x0 + 3] = TileId.BRICK;
    }
  }
  for (let x = 18; x < 44; x++) map[3][x] = TileId.BRICK;
  return {
    index: 7,
    name: 'Tower of Babel',
    bibleStory: 'People tried to build a tower to reach heaven. God gave them different languages! — Genesis 11:4',
    character: 'noah',
    width: w,
    height: h,
    tiles: map,
    startX: 4 * 32,
    startY: (gy - 2) * 32,
    exitX: 28 * 32,
    exitY: 2 * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [],
    items: [
      { type: ItemType.SCROLL, x: 800, y: 5 * 32 },
      { type: ItemType.HEART, x: 1200, y: 8 * 32 },
    ],
    background: { skyTop: '#4a5568', skyBot: '#718096', parallax: 'storm' },
    flags: { windLeft: true },
  };
}

function levelAbraham() {
  const w = 150;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < 50; x++) {
    map[gy][x] = TileId.SAND;
    for (let y = gy + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
  for (let x = 50; x < 100; x++) {
    map[gy][x] = TileId.STONE;
    for (let y = gy + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
  for (let x = 100; x < w; x++) grassTop(map, gy, x, x);
  for (let x = 20; x < w - 20; x += 30) {
    map[gy - 3][x] = TileId.WOOD;
    map[gy - 3][x + 1] = TileId.WOOD;
  }
  return {
    index: 8,
    name: "Abraham's Journey",
    bibleStory:
      'God told Abraham to leave his home and follow Him to a new land! — Genesis 12:1',
    character: 'david',
    width: w,
    height: h,
    tiles: map,
    startX: 120,
    startY: (gy - 3) * 32,
    exitX: (w - 4) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [
      { type: EnemyType.SNAKE, x: 800, y: (gy - 1) * 32, patrolL: 600, patrolR: 1100 },
    ],
    items: [
      { type: ItemType.STAR, x: 900, y: (gy - 5) * 32 },
      { type: ItemType.STAR, x: 1500, y: (gy - 6) * 32 },
      { type: ItemType.STAR, x: 2200, y: (gy - 5) * 32 },
      { type: ItemType.SCROLL, x: 1800, y: (gy - 4) * 32 },
      { type: ItemType.SCROLL, x: 3200, y: (gy - 4) * 32 },
    ],
    background: { skyTop: '#E8C170', skyBot: '#87CEEB', parallax: 'desert' },
  };
}

function levelJoseph() {
  const w = 80;
  const h = 20;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  fillRect(map, 0, gy, w - 1, h - 2, TileId.STONE);
  fillRect(map, 8, 8, 72, 14, TileId.STONE);
  for (let x = 12; x < 70; x += 10) {
    map[12][x] = TileId.WOOD;
    map[12][x + 1] = TileId.WOOD;
  }
  map[6][10] = TileId.WOOD;
  map[6][11] = TileId.WOOD;
  return {
    index: 9,
    name: "Joseph's Pit",
    bibleStory:
      "Joseph's brothers threw him in a pit, but God had a great plan for Joseph's life! — Genesis 50:20",
    character: 'jonah',
    width: w,
    height: h,
    tiles: map,
    startX: 10 * 32,
    startY: 5 * 32,
    exitX: (w - 4) * 32,
    exitY: 4 * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [],
    items: [
      { type: ItemType.CROWN, x: 400, y: 10 * 32 },
      { type: ItemType.CROWN, x: 900, y: 11 * 32 },
      { type: ItemType.SCROLL, x: 1400, y: 9 * 32 },
    ],
    background: { skyTop: '#3d2914', skyBot: '#5c4033', parallax: 'cave' },
  };
}

function levelBabyMoses() {
  const w = 100;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  fillRect(map, 0, gy - 2, w - 1, gy + 2, TileId.WATER);
  for (let x = 0; x < w; x++) {
    map[gy - 4][x] = TileId.SAND;
    map[gy - 3][x] = TileId.SAND;
  }
  for (let x = 8; x < w - 8; x += 16) {
    map[gy - 3][x] = TileId.WOOD;
    map[gy - 3][x + 1] = TileId.WOOD;
  }
  return {
    index: 10,
    name: 'Baby Moses (Nile)',
    bibleStory:
      "Moses' mother put him in a basket in the river to keep him safe from Pharaoh! — Exodus 2:3",
    character: 'mary',
    width: w,
    height: h,
    tiles: map,
    startX: 4 * 32,
    startY: (gy - 5) * 32,
    exitX: (w - 4) * 32,
    exitY: (gy - 5) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [
      { type: EnemyType.PHARAOH, x: 1200, y: (gy - 5) * 32, patrolL: 900, patrolR: 1600 },
      { type: EnemyType.PHARAOH, x: 2200, y: (gy - 5) * 32, patrolL: 1900, patrolR: 2600 },
    ],
    items: [
      { type: ItemType.SCROLL, x: 800, y: (gy - 6) * 32 },
      { type: ItemType.HEART, x: 1500, y: (gy - 6) * 32 },
    ],
    background: { skyTop: '#4a90d9', skyBot: '#87CEEB', parallax: 'desert' },
  };
}

function levelBurningBush() {
  const w = 90;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) {
    map[gy][x] = TileId.SAND;
    for (let y = gy + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
  fillRect(map, 40, gy - 4, 48, gy - 1, TileId.WOOD);
  fillRect(map, 42, gy - 5, 46, gy - 4, TileId.GOLD);
  return {
    index: 11,
    name: 'Burning Bush',
    bibleStory: 'God spoke to Moses from a bush that burned but was not consumed! — Exodus 3:2',
    character: 'moses',
    width: w,
    height: h,
    tiles: map,
    startX: 5 * 32,
    startY: (gy - 3) * 32,
    exitX: (w - 4) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [{ type: EnemyType.SNAKE, x: 600, y: (gy - 1) * 32, patrolL: 400, patrolR: 900 }],
    items: [
      { type: ItemType.SCROLL, x: 1200, y: (gy - 5) * 32 },
      { type: ItemType.SCROLL, x: 2000, y: (gy - 5) * 32 },
    ],
    background: { skyTop: '#d4a574', skyBot: '#f4e4c1', parallax: 'desert' },
  };
}

function levelManna() {
  const w = 100;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) {
    map[gy][x] = TileId.SAND;
    for (let y = gy + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
  for (let x = 5; x < w - 5; x += 18) {
    map[gy - 2][x] = TileId.STONE;
    map[gy - 2][x + 1] = TileId.STONE;
  }
  return {
    index: 12,
    name: 'Manna from Heaven',
    bibleStory:
      'God fed His people in the desert with bread from heaven called manna! — Exodus 16:31',
    character: 'moses',
    width: w,
    height: h,
    tiles: map,
    startX: 120,
    startY: (gy - 3) * 32,
    exitX: (w - 4) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [],
    items: [
      { type: ItemType.SCROLL, x: 800, y: (gy - 5) * 32 },
      { type: ItemType.SCROLL, x: 2000, y: (gy - 5) * 32 },
    ],
    background: { skyTop: '#FFCBA4', skyBot: '#ffd4a8', parallax: 'desert' },
    flags: { mannaRain: true, mannaBread: true },
  };
}

function levelGideon() {
  const w = 120;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) grassTop(map, gy, x, x);
  for (let x = 8; x < w - 8; x += 22) {
    map[gy - 3][x] = TileId.STONE;
    map[gy - 4][x + 2] = TileId.STONE;
  }
  return {
    index: 13,
    name: "Gideon's 300",
    bibleStory:
      'Gideon trusted God and defeated a huge army with just 300 men and torches! — Judges 7:20',
    character: 'joshua',
    width: w,
    height: h,
    tiles: map,
    startX: 120,
    startY: (gy - 3) * 32,
    exitX: (w - 5) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [
      { type: EnemyType.PHARAOH, x: 900, y: (gy - 2) * 32, patrolL: 700, patrolR: 1200 },
      { type: EnemyType.PHARAOH, x: 2000, y: (gy - 2) * 32, patrolL: 1700, patrolR: 2400 },
    ],
    items: [...[12, 22, 32, 42, 52, 62, 72].map((tx) => ({ type: ItemType.CROWN, x: tx * 32, y: (gy - 4) * 32 }))],
    background: { skyTop: '#0a0a2e', skyBot: '#1a1a4e', parallax: 'cave' },
    flags: { needCrowns: 7 },
  };
}

function levelSamson() {
  const w = 80;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) grassTop(map, gy, x, x);
  for (let x = 10; x < 30; x++) map[gy - 2][x] = TileId.BRICK;
  for (let x = 45; x < 65; x++) map[gy - 2][x] = TileId.BRICK;
  return {
    index: 14,
    name: "Samson's Strength",
    bibleStory: 'God gave Samson incredible strength to protect His people! — Judges 16:28',
    character: 'joshua',
    width: w,
    height: h,
    tiles: map,
    startX: 100,
    startY: (gy - 3) * 32,
    exitX: (w - 4) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [
      { type: EnemyType.LION, x: 900, y: (gy - 2) * 32, patrolL: 700, patrolR: 1200 },
      { type: EnemyType.LION, x: 1500, y: (gy - 2) * 32, patrolL: 1300, patrolR: 1800 },
    ],
    items: [
      { type: ItemType.BREAD, x: 600, y: (gy - 5) * 32 },
      { type: ItemType.BREAD, x: 1400, y: (gy - 6) * 32 },
      { type: ItemType.SCROLL, x: 1100, y: (gy - 5) * 32 },
    ],
    background: { skyTop: '#D4843C', skyBot: '#f0a868', parallax: 'sunset' },
  };
}

function levelRuth() {
  const w = 120;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) grassTop(map, gy, x, x);
  for (let x = 5; x < w - 5; x += 8) map[gy - 2][x] = TileId.GRASS;
  return {
    index: 15,
    name: "Ruth's Fields",
    bibleStory:
      'Ruth worked hard in the fields and God blessed her with a loving family! — Ruth 2:12',
    character: 'esther',
    width: w,
    height: h,
    tiles: map,
    startX: 100,
    startY: (gy - 3) * 32,
    exitX: (w - 5) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [{ type: EnemyType.GUARD, x: 1500, y: (gy - 2) * 32, patrolL: 1200, patrolR: 2000 }],
    items: [
      ...[10, 22, 34, 46, 58, 70, 82, 94].map((tx) => ({
        type: ItemType.STAR,
        x: tx * 32,
        y: (gy - 4) * 32,
      })),
      { type: ItemType.SCROLL, x: 1800, y: (gy - 5) * 32 },
    ],
    background: { skyTop: '#F4C842', skyBot: '#ffe08a', parallax: 'hills' },
  };
}

function levelElijah() {
  const w = 80;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) {
    map[gy][x] = TileId.SAND;
    for (let y = gy + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
  fillRect(map, 35, gy - 1, 45, gy, TileId.WATER);
  fillRect(map, 20, gy - 5, 28, gy - 3, TileId.STONE);
  return {
    index: 16,
    name: "Elijah's Ravens",
    bibleStory:
      'God sent ravens to bring Elijah food when he was hiding in the desert! — 1 Kings 17:6',
    character: 'moses',
    width: w,
    height: h,
    tiles: map,
    startX: 4 * 32,
    startY: (gy - 3) * 32,
    exitX: (w - 4) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [
      { type: EnemyType.PHARAOH, x: 900, y: (gy - 2) * 32, patrolL: 700, patrolR: 1300 },
    ],
    items: [
      { type: ItemType.DOVE, x: 600, y: (gy - 4) * 32 },
      { type: ItemType.DOVE, x: 1200, y: (gy - 5) * 32 },
      { type: ItemType.BREAD, x: 900, y: (gy - 4) * 32 },
      { type: ItemType.SCROLL, x: 1600, y: (gy - 5) * 32 },
    ],
    background: { skyTop: '#c45c3e', skyBot: '#f4a574', parallax: 'desert' },
  };
}

function levelWalkingWater() {
  const w = 100;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  fillRect(map, 0, gy - 3, w - 1, h - 2, TileId.WATER);
  fillRect(map, 0, gy - 4, w - 1, gy - 3, TileId.SAND);
  for (let x = 4; x < 14; x++) {
    map[gy - 5][x] = TileId.WOOD;
    map[gy - 5][x + 1] = TileId.WOOD;
  }
  for (let x = w - 16; x < w - 4; x++) {
    map[gy - 5][x] = TileId.SAND;
  }
  return {
    index: 17,
    name: 'Walking on Water',
    bibleStory:
      'Peter walked on water toward Jesus — but when he looked at the waves he sank! — Matthew 14:29',
    character: 'jonah',
    width: w,
    height: h,
    tiles: map,
    startX: 6 * 32,
    startY: (gy - 6) * 32,
    exitX: (w - 6) * 32,
    exitY: (gy - 6) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [],
    items: [
      { type: ItemType.SCROLL, x: 1200, y: (gy - 7) * 32 },
      { type: ItemType.HEART, x: 2000, y: (gy - 6) * 32 },
    ],
    background: { skyTop: '#1a2a4e', skyBot: '#2a3d6e', parallax: 'ocean' },
    flags: { faithWater: true },
  };
}

function levelFeeding5000() {
  const w = 100;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) grassTop(map, gy, x, x);
  for (let x = 8; x < w - 8; x += 12) {
    map[gy - 3][x] = TileId.STONE;
  }
  return {
    index: 18,
    name: 'Feeding the 5000',
    bibleStory:
      'Jesus took 5 loaves and 2 fish and fed over 5000 people with leftovers! — John 6:11',
    character: 'mary',
    width: w,
    height: h,
    tiles: map,
    startX: 100,
    startY: (gy - 3) * 32,
    exitX: (w - 5) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [],
    items: [
      ...[14, 22, 30, 38, 46].map((tx) => ({ type: ItemType.BREAD, x: tx * 32, y: (gy - 4) * 32 })),
      { type: ItemType.FISH, x: 54 * 32, y: (gy - 4) * 32 },
      { type: ItemType.FISH, x: 60 * 32, y: (gy - 4) * 32 },
      { type: ItemType.DOVE, x: 800, y: (gy - 5) * 32 },
      { type: ItemType.DOVE, x: 1600, y: (gy - 5) * 32 },
      { type: ItemType.SCROLL, x: 2400, y: (gy - 5) * 32 },
    ],
    background: { skyTop: '#87CEEB', skyBot: '#b8e8ff', parallax: 'hills' },
    flags: { feeding5000: true },
  };
}

function levelEasterMorning() {
  const w = 80;
  const h = 15;
  const map = emptyMap(w, h);
  const gy = gyFor(h);
  bedrockFloor(map, w, h);
  for (let x = 0; x < w; x++) grassTop(map, gy, x, x);
  fillRect(map, 4, gy - 5, 12, gy - 2, TileId.STONE);
  map[gy - 2][14] = TileId.STONE;
  map[gy - 2][15] = TileId.STONE;
  map[gy - 2][16] = TileId.STONE;
  return {
    index: 19,
    name: 'Easter Morning',
    bibleStory:
      'On the third day, Jesus rose from the dead! The tomb was empty — He is alive! — Luke 24:6',
    character: 'mary',
    width: w,
    height: h,
    tiles: map,
    startX: 3 * 32,
    startY: (gy - 3) * 32,
    exitX: (w - 3) * 32,
    exitY: (gy - 3) * 32,
    mode: LevelMode.REACH_EXIT,
    enemies: [],
    items: [
      { type: ItemType.DOVE, x: 400, y: (gy - 5) * 32 },
      { type: ItemType.HEART, x: 900, y: (gy - 4) * 32 },
      { type: ItemType.HEART, x: 1400, y: (gy - 4) * 32 },
      { type: ItemType.SCROLL, x: 2000, y: (gy - 5) * 32 },
    ],
    background: { skyTop: '#ffb6c1', skyBot: '#ffd700', parallax: 'hills' },
  };
}
