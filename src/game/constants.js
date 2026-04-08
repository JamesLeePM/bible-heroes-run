/** Total story levels (indices 0 .. TOTAL_LEVELS - 1). Hand-crafted 0–19; procedural 20–999. */
export const TOTAL_LEVELS = 1000;

/** @enum {number} */
export const TileId = {
  AIR: 0,
  SAND: 1,
  GRASS: 2,
  STONE: 3,
  WATER: 4,
  WOOD: 5,
  GOLD: 6,
  CLOUD: 7,
  BRICK: 8,
};

export const SOLID_TILES = [1, 2, 3, 5, 6, 7, 8];

/** @param {number} id */
export function isSolidTile(id) {
  return SOLID_TILES.includes(id);
}

/** @enum {string} */
export const CharId = {
  DAVID: 'david',
  MOSES: 'moses',
  NOAH: 'noah',
  MARY: 'mary',
  DANIEL: 'daniel',
  ESTHER: 'esther',
  JONAH: 'jonah',
  JOSHUA_HERO: 'joshua_hero',
  JOSHUA: 'joshua',
  CALEB: 'caleb',
};

export const STORY_CHARACTERS = [
  CharId.DAVID,
  CharId.MOSES,
  CharId.NOAH,
  CharId.MARY,
  CharId.DANIEL,
  CharId.ESTHER,
  CharId.JONAH,
  CharId.JOSHUA_HERO,
];

export const EnemyType = {
  PHILISTINE: 'philistine',
  PHARAOH: 'pharaoh',
  LION: 'lion',
  SNAKE: 'snake',
  JELLYFISH: 'jellyfish',
  ARCHER: 'archer',
  GUARD: 'guard',
  GOLIATH: 'goliath',
  WHALE: 'whale',
};

export const ItemType = {
  STAR: 'star',
  HEART: 'heart',
  SCROLL: 'scroll',
  BREAD: 'bread',
  KEY: 'key',
  CROWN: 'crown',
  DOVE: 'dove',
  SHIELD: 'shield',
  STONE: 'stone',
  ARK: 'ark',
  ANIMAL: 'animal',
  TRUMPET: 'trumpet',
  BUBBLE: 'bubble',
  FISH: 'fish',
};

export const LevelMode = {
  REACH_EXIT: 'reach_exit',
  DAVID: 'david',
  NOAH: 'noah',
  DANIEL: 'daniel',
  JERICHO: 'jericho',
  JONAH: 'jonah',
};
