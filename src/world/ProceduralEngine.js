import { TileId, EnemyType, ItemType, LevelMode, CharId } from '../game/constants.js';

const TILE = 32;

/** @returns {number[][]} */
function emptyMap(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(TileId.AIR));
}

/**
 * Deterministic PRNG for reproducible levels from index.
 * @param {number} seed
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromIndex(index) {
  return (index * 1103515245 + 12345) >>> 0;
}

/**
 * @param {number[][]} map
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 */
function bedrockFloor(map, w, h) {
  for (let x = 0; x < w; x++) map[h - 1][x] = TileId.STONE;
}

/**
 * Flat grass + stone below.
 * @param {number[][]} map
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 * @param {number} surface
 */
function buildFlat(map, w, h, gy, surface = TileId.GRASS) {
  for (let x = 0; x < w; x++) {
    map[gy][x] = surface;
    for (let y = gy + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
}

/**
 * Rolling hills (sine bump on ground row).
 * @param {number[][]} map
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 * @param {number} surface
 */
function buildHills(map, w, h, gy, surface = TileId.GRASS) {
  for (let x = 0; x < w; x++) {
    const bump = Math.round(Math.sin(x * 0.15) * 2);
    const row = Math.min(gy, Math.max(gy - 4, gy + bump));
    map[row][x] = surface;
    for (let y = row + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
}

/**
 * Flat with optional pit gaps filled with water below.
 * @param {number[][]} map
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 * @param {{ x: number; w: number }[]} gaps
 * @param {number} surface
 */
function buildGaps(map, w, h, gy, gaps, surface = TileId.GRASS) {
  for (let x = 0; x < w; x++) {
    const inGap = gaps.some((g) => x >= g.x && x < g.x + g.w);
    if (!inGap) {
      map[gy][x] = surface;
      for (let y = gy + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
    } else {
      for (let y = gy; y < h - 1; y++) map[y][x] = TileId.WATER;
    }
  }
}

/**
 * Stair-step terrain.
 * @param {number[][]} map
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 * @param {number} surface
 */
function buildSteps(map, w, h, gy, surface = TileId.GRASS) {
  let step = gy;
  for (let x = 0; x < w; x++) {
    if (x % 5 === 0) step = Math.max(gy - 4, step - 1);
    map[step][x] = surface;
    for (let y = step + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
}

/**
 * Mixed noise-like surface.
 * @param {number[][]} map
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 * @param {number} surface
 */
function buildMixed(map, w, h, gy, surface = TileId.GRASS) {
  for (let x = 0; x < w; x++) {
    const noise = Math.sin(x * 0.1) * 2 + Math.sin(x * 0.3);
    const row = gy + Math.round(noise);
    const r = Math.min(gy, Math.max(gy - 4, row));
    map[r][x] = surface;
    for (let y = r + 1; y < h - 1; y++) map[y][x] = TileId.STONE;
  }
}

/**
 * Desert sand columns.
 * @param {number[][]} map
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 */
function buildDesert(map, w, h, gy) {
  for (let x = 0; x < w; x++) {
    map[gy][x] = TileId.SAND;
    for (let y = gy + 1; y < h - 1; y++) map[y][x] = TileId.SAND;
  }
}

/**
 * Floating platforms (brick).
 * @param {number[][]} map
 * @param {{ x: number; y: number; w: number; tile?: number }[]} platforms
 */
function addPlatforms(map, platforms) {
  for (const p of platforms) {
    const tile = p.tile ?? TileId.BRICK;
    for (let x = p.x; x < p.x + p.w && x < map[0].length; x++) {
      if (x >= 0 && map[p.y]) map[p.y][x] = tile;
    }
  }
}

/**
 * @typedef {'FLAT'|'HILLS'|'GAPS'|'STEPS'|'MIXED'|'DESERT'} TerrainKind
 */

/**
 * @param {TerrainKind} kind
 * @param {number[][]} map
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 * @param {() => number} rnd
 * @param {number} surface
 */
function generateTerrain(kind, map, w, h, gy, rnd, surface) {
  bedrockFloor(map, w, h);
  switch (kind) {
    case 'FLAT':
      buildFlat(map, w, h, gy, surface);
      break;
    case 'HILLS':
      buildHills(map, w, h, gy, surface);
      break;
    case 'GAPS': {
      const ng = 1 + Math.floor(rnd() * 3);
      const gaps = [];
      for (let g = 0; g < ng; g++) {
        const gw = 4 + Math.floor(rnd() * 8);
        const gx = 20 + Math.floor(rnd() * Math.max(10, w - gw - 40));
        gaps.push({ x: gx, w: gw });
      }
      buildGaps(map, w, h, gy, gaps, surface);
      break;
    }
    case 'STEPS':
      buildSteps(map, w, h, gy, surface);
      break;
    case 'MIXED':
      buildMixed(map, w, h, gy, surface);
      break;
    case 'DESERT':
      buildDesert(map, w, h, gy);
      break;
    default:
      buildFlat(map, w, h, gy, surface);
  }
}

const HERO_IDS = [
  CharId.DAVID,
  CharId.MOSES,
  CharId.NOAH,
  CharId.MARY,
  CharId.DANIEL,
  CharId.ESTHER,
  CharId.JONAH,
  CharId.JOSHUA_HERO,
  CharId.JOSHUA,
  CharId.CALEB,
];

const STORY_TEMPLATES = [
  {
    name: "Faith's Journey",
    bibleStory: 'God is always with us on every journey!',
  },
  {
    name: 'Walk by Faith',
    bibleStory: 'Trust in the Lord with all your heart!',
  },
  {
    name: "God's Promise",
    bibleStory: 'His plans for us are good — hope and a future!',
  },
  {
    name: 'Courage Run',
    bibleStory: 'Be strong and courageous — the Lord goes with you!',
  },
  {
    name: 'Light in the Dark',
    bibleStory: 'God’s Word is a lamp to our feet!',
  },
  {
    name: 'Shepherd Path',
    bibleStory: 'The Lord is my shepherd — I shall not want!',
  },
  {
    name: 'Living Water',
    bibleStory: 'Whoever drinks the water He gives will never thirst!',
  },
  {
    name: 'Bread of Life',
    bibleStory: 'Jesus is the bread of life for everyone who believes!',
  },
  {
    name: 'Peace Run',
    bibleStory: 'Peace that passes understanding guards our hearts!',
  },
  {
    name: 'Hope Ahead',
    bibleStory: 'We have a living hope through Jesus Christ!',
  },
];

const VERSES = [
  'Psalm 23:1',
  'Psalm 119:105',
  'Proverbs 3:5',
  'Joshua 1:9',
  'Philippians 4:13',
  'Romans 8:28',
  'John 3:16',
  'Matthew 5:16',
  'Isaiah 41:10',
  'Jeremiah 29:11',
];

const BIOMES = [
  { skyTop: '#87CEEB', skyBot: '#E0F4FF', parallax: 'hills', ground: TileId.GRASS },
  { skyTop: '#F4A460', skyBot: '#FFD9A0', parallax: 'desert', ground: TileId.SAND },
  { skyTop: '#006994', skyBot: '#004060', parallax: 'ocean', ground: TileId.STONE },
  { skyTop: '#1a1a2e', skyBot: '#2d2d44', parallax: 'cave', ground: TileId.STONE },
  { skyTop: '#2C3E6E', skyBot: '#5a6b7c', parallax: 'storm', ground: TileId.GRASS },
  { skyTop: '#0a0a2e', skyBot: '#1a1a4e', parallax: 'cave', ground: TileId.GRASS },
  { skyTop: '#FF8C42', skyBot: '#FFD280', parallax: 'sunset', ground: TileId.GRASS },
  { skyTop: '#228B22', skyBot: '#90EE90', parallax: 'hills', ground: TileId.GRASS },
];

const TERRAIN_KINDS = /** @type {const} */ ([
  'FLAT',
  'HILLS',
  'GAPS',
  'STEPS',
  'MIXED',
  'DESERT',
]);

const ENEMY_POOL = [
  EnemyType.PHILISTINE,
  EnemyType.PHARAOH,
  EnemyType.SNAKE,
  EnemyType.LION,
  EnemyType.GUARD,
  EnemyType.ARCHER,
];

const ITEM_POOL = [ItemType.SCROLL, ItemType.HEART, ItemType.STAR, ItemType.BREAD];

/**
 * @param {number} index Level index 20–999
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 * @param {() => number} rnd
 * @returns {object[]}
 */
function placeEnemies(index, w, h, gy, rnd) {
  const enemies = [];
  const worldTier = Math.floor((index - 20) / 50);
  const count = Math.min(12, 1 + worldTier + Math.floor(rnd() * 4));
  const groundY = (gy - 1) * TILE;
  const patrolRange = 160;

  for (let i = 0; i < count; i++) {
    const t = ENEMY_POOL[Math.floor(rnd() * ENEMY_POOL.length)];
    const x = 120 + Math.floor(rnd() * Math.max(80, w * TILE - 360));
    const patrolL = Math.max(32, x - patrolRange);
    const patrolR = Math.min(w * TILE - 64, x + patrolRange);
    enemies.push({
      type: t,
      x,
      y: groundY,
      patrolL,
      patrolR,
    });
  }
  return enemies;
}

/**
 * @param {number} index
 * @param {number} w
 * @param {number} h
 * @param {number} gy
 * @param {() => number} rnd
 * @returns {object[]}
 */
function placeItems(index, w, h, gy, rnd) {
  const items = [];
  const n = 3 + Math.floor(rnd() * 5);
  const groundY = (gy - 2) * TILE;

  for (let i = 0; i < n; i++) {
    const type = ITEM_POOL[Math.floor(rnd() * ITEM_POOL.length)];
    const baseX = Math.floor(((i + 0.7) / n) * (w * TILE - 200)) + 80;
    const jitter = Math.floor(rnd() * 80) - 40;
    const x = Math.max(64, Math.min(w * TILE - 64, baseX + jitter));
    const floating = rnd() > 0.55;
    const y = floating ? groundY - 48 - Math.floor(rnd() * 56) : groundY;
    items.push({ type, x, y });
  }
  return items;
}

/**
 * Procedural level for indices 20–999. Deterministic from `index`.
 * @param {number} index
 * @returns {import('./Level.js').LevelData}
 */
export function generateLevel(index) {
  const rnd = mulberry32(seedFromIndex(index));
  const h = 15;
  const w = 80 + Math.floor(rnd() * 8) * 10;
  const gy = h - 5;
  const map = emptyMap(w, h);

  const biome = BIOMES[index % BIOMES.length];
  const terrainKind = TERRAIN_KINDS[index % TERRAIN_KINDS.length];
  const surface = biome.ground;

  generateTerrain(terrainKind, map, w, h, gy, rnd, surface);

  if (terrainKind !== 'GAPS' && rnd() > 0.4) {
    const plats = [];
    const np = 1 + Math.floor(rnd() * 3);
    for (let p = 0; p < np; p++) {
      plats.push({
        x: 15 + Math.floor(rnd() * (w - 30)),
        y: gy - 3 - Math.floor(rnd() * 3),
        w: 3 + Math.floor(rnd() * 4),
      });
    }
    addPlatforms(map, plats);
  }

  const enemies = placeEnemies(index, w, h, gy, rnd);
  const items = placeItems(index, w, h, gy, rnd);

  const tmpl = STORY_TEMPLATES[index % STORY_TEMPLATES.length];
  const verse = VERSES[index % VERSES.length];
  const hero = HERO_IDS[index % HERO_IDS.length];
  const worldNum = Math.floor(index / 50) + 1;
  const levelInWorld = (index % 50) + 1;

  const name = `${tmpl.name} ${worldNum}-${levelInWorld}`;

  return {
    index,
    name,
    bibleStory: tmpl.bibleStory,
    character: hero,
    width: w,
    height: h,
    tiles: map,
    startX: 3 * TILE,
    startY: (gy - 3) * TILE,
    exitX: (w - 4) * TILE,
    exitY: (gy - 3) * TILE,
    mode: LevelMode.REACH_EXIT,
    enemies,
    items,
    background: {
      skyTop: biome.skyTop,
      skyBot: biome.skyBot,
      parallax: biome.parallax,
    },
    flags: {
      procedural: true,
      bibleVerse: verse,
      terrain: terrainKind,
    },
  };
}
