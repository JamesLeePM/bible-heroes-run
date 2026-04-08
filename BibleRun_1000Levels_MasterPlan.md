# ⚔️ BibleRun — 1000 Levels Master Plan
> The most comprehensive Bible game ever made
> Every story. Every hero. Every lesson.
> For Joshua, Caleb & children everywhere 🙏

---

## 🗺️ THE BIG PICTURE — 20 Worlds × 50 Levels

| World | Theme | Levels | Books Covered |
|-------|-------|--------|---------------|
| 1 | Creation & Eden | 1-50 | Genesis 1-11 |
| 2 | Patriarchs | 51-100 | Genesis 12-50 |
| 3 | Moses & Exodus | 101-150 | Exodus |
| 4 | Wilderness | 151-200 | Numbers, Leviticus |
| 5 | Promised Land | 201-250 | Joshua, Judges |
| 6 | Kingdom of Israel | 251-300 | Samuel, Kings |
| 7 | Prophets | 301-350 | Isaiah, Jeremiah, Daniel |
| 8 | Wisdom & Psalms | 351-400 | Psalms, Proverbs, Job |
| 9 | Minor Prophets | 401-450 | Jonah, Esther, Ruth |
| 10 | Return from Exile | 451-500 | Ezra, Nehemiah |
| 11 | Jesus is Born | 501-550 | Matthew, Luke |
| 12 | Jesus' Ministry | 551-600 | Mark, John |
| 13 | Miracles | 601-650 | All Gospels |
| 14 | Parables | 651-700 | All Gospels |
| 15 | Holy Week | 701-750 | All Gospels |
| 16 | Early Church | 751-800 | Acts |
| 17 | Paul's Letters | 801-850 | Romans-Philippians |
| 18 | Faith & Wisdom | 851-900 | Hebrews, James |
| 19 | Revelation | 901-950 | Revelation |
| 20 | Special & Bonus | 951-1000 | All Books |

---

## 🚀 PROMPT 1 — Procedural Level Engine (THE BIG ONE)

```
Create a powerful procedural level generation engine
that can generate 1000 unique Bible levels.

Create src/world/ProceduralEngine.js:

The key insight: we don't hand-code 1000 levels.
Instead we define RECIPES and the engine BAKES them.

═══════════════════════════════════════
LEVEL RECIPE SYSTEM
═══════════════════════════════════════

Each level is defined by a compact recipe object:

const RECIPE = {
  id: 42,
  name: "Moses Parts the Red Sea",
  story: "God parted the sea so His people could walk through!",
  verse: "Exodus 14:21",
  mission: "Run through before the waters close!",
  character: 'moses',
  
  // Visual theme
  biome: 'OCEAN',
  skyTop: '#006994',
  skyBot: '#004060',
  
  // Level shape
  type: 'JOURNEY',    // or CLIMB, COLLECT, SURVIVE, RACE, BOSS
  width: 120,
  height: 15,
  
  // Terrain features
  terrain: {
    ground: 'FLAT',   // FLAT, HILLS, STEPS, GAPS, MIXED
    gaps: [           // water/pit gaps
      { x: 40, w: 20 },
      { x: 80, w: 20 },
    ],
    platforms: [      // floating platforms
      { x: 30, y: 8, w: 6 },
      { x: 55, y: 7, w: 4 },
    ],
    special: 'PARTING_SEA', // triggers water-wall effect
  },
  
  // Enemies
  enemies: [
    { type: 'PHARAOH', count: 3, placement: 'PATROL' },
    { type: 'SNAKE',   count: 2, placement: 'RANDOM' },
  ],
  
  // Collectibles
  items: [
    { type: 'SCROLL', count: 3 },
    { type: 'HEART',  count: 2 },
  ],
  
  // Win condition
  win: 'REACH_EXIT',  // or COLLECT_ALL, DEFEAT_BOSS, SURVIVE_TIME
  
  // Difficulty 1-5
  difficulty: 3,
};

═══════════════════════════════════════
TERRAIN GENERATORS
═══════════════════════════════════════

function generateTerrain(recipe, map, w, h) {
  const gy = h - 5; // ground row
  
  switch(recipe.terrain.ground) {
    case 'FLAT':
      // Simple flat ground
      for (let x = 0; x < w; x++) {
        map[gy][x] = TileId.GRASS;
        for (let y = gy+1; y < h; y++) 
          map[y][x] = TileId.STONE;
      }
      break;
      
    case 'HILLS':
      // Rolling hills using sine wave
      for (let x = 0; x < w; x++) {
        const bump = Math.round(
          Math.sin(x * 0.15) * 2
        );
        const row = gy + bump;
        map[row][x] = TileId.GRASS;
        for (let y = row+1; y < h; y++)
          map[y][x] = TileId.STONE;
      }
      break;
      
    case 'STEPS':
      // Ascending/descending staircases
      let step = gy;
      for (let x = 0; x < w; x++) {
        if (x % 4 === 0) step = Math.max(gy-4, step-1);
        map[step][x] = TileId.GRASS;
        for (let y = step+1; y < h; y++)
          map[y][x] = TileId.STONE;
      }
      break;
      
    case 'GAPS':
      // Flat ground with pit gaps
      for (let x = 0; x < w; x++) {
        const inGap = recipe.terrain.gaps?.some(
          g => x >= g.x && x < g.x + g.w
        );
        if (!inGap) {
          map[gy][x] = TileId.GRASS;
          for (let y = gy+1; y < h; y++)
            map[y][x] = TileId.STONE;
        }
      }
      break;
      
    case 'MIXED':
      // Combination of all above
      // Use noise function for natural variation
      for (let x = 0; x < w; x++) {
        const noise = Math.sin(x*0.1)*2 + 
                      Math.sin(x*0.3)*1;
        const row = gy + Math.round(noise);
        map[row][x] = TileId.GRASS;
        for (let y = row+1; y < h; y++)
          map[y][x] = TileId.STONE;
      }
      break;
      
    case 'DESERT':
      for (let x = 0; x < w; x++) {
        map[gy][x] = TileId.SAND;
        for (let y = gy+1; y < h; y++)
          map[y][x] = TileId.SAND;
      }
      break;
      
    case 'CAVE':
      // Stone ceiling and floor
      for (let x = 0; x < w; x++) {
        // Floor
        map[gy][x] = TileId.STONE;
        // Ceiling with stalactites
        map[2][x] = TileId.STONE;
        if (x % 5 === 0) {
          map[3][x] = TileId.STONE;
          map[4][x] = TileId.STONE;
        }
      }
      break;
      
    case 'OCEAN':
      // Water base with rock islands
      for (let x = 0; x < w; x++) {
        // Water fills bottom
        for (let y = gy; y < h-1; y++)
          map[y][x] = TileId.WATER;
        // Rock islands every 15 tiles
        if (x % 15 < 5) {
          map[gy-1][x] = TileId.STONE;
          map[gy-2][x] = TileId.STONE;
        }
      }
      break;
  }
  
  // Add platforms from recipe
  recipe.terrain.platforms?.forEach(p => {
    for (let x = p.x; x < p.x + p.w; x++) {
      map[p.y][x] = p.tile || TileId.BRICK;
    }
  });
  
  // Add gaps from recipe (override with air)
  recipe.terrain.gaps?.forEach(g => {
    for (let x = g.x; x < g.x + g.w; x++) {
      for (let y = gy; y < gy + 3; y++) {
        map[y][x] = TileId.AIR;
      }
      // Water in gaps
      map[gy+1][x] = TileId.WATER;
      map[gy+2][x] = TileId.WATER;
    }
  });
}

═══════════════════════════════════════
ENEMY PLACEMENT SYSTEM
═══════════════════════════════════════

function placeEnemies(recipe, w, h, gy) {
  const enemies = [];
  const groundY = (gy - 1) * 32;
  
  recipe.enemies?.forEach(spec => {
    for (let i = 0; i < spec.count; i++) {
      let x;
      switch(spec.placement) {
        case 'PATROL':
          // Space evenly across level
          x = Math.floor(w * 32 * (i+1) / (spec.count+1));
          break;
        case 'RANDOM':
          // Random but not too close to start
          x = 200 + Math.floor(Math.random() * (w*32 - 400));
          break;
        case 'END':
          // Cluster near the exit
          x = w*32 - 400 + i*100;
          break;
        case 'GUARD':
          // Guard specific checkpoints
          x = spec.positions?.[i] * 32 || 500 * (i+1);
          break;
      }
      
      const patrolRange = 200;
      enemies.push({
        type: spec.type,
        x,
        y: groundY,
        patrolL: x - patrolRange,
        patrolR: x + patrolRange,
      });
    }
  });
  
  return enemies;
}

═══════════════════════════════════════
ITEM PLACEMENT SYSTEM
═══════════════════════════════════════

function placeItems(recipe, w, h, gy) {
  const items = [];
  const groundY = (gy - 2) * 32;
  
  recipe.items?.forEach(spec => {
    for (let i = 0; i < spec.count; i++) {
      // Space items evenly, slightly random
      const baseX = Math.floor(
        w * 32 * (i+0.5) / spec.count
      );
      const jitter = Math.floor(Math.random() * 64) - 32;
      items.push({
        type: spec.type,
        x: Math.max(100, baseX + jitter),
        y: spec.floating 
          ? groundY - 64 - Math.random() * 64
          : groundY,
      });
    }
  });
  
  return items;
}

═══════════════════════════════════════
BIOME VISUAL SYSTEM
═══════════════════════════════════════

const BIOMES = {
  GARDEN:   { skyTop: '#87CEEB', skyBot: '#E0F4FF', 
              ground: TileId.GRASS,  parallax: 'hills' },
  DESERT:   { skyTop: '#F4A460', skyBot: '#FFD9A0', 
              ground: TileId.SAND,   parallax: 'desert' },
  OCEAN:    { skyTop: '#006994', skyBot: '#004060', 
              ground: TileId.STONE,  parallax: 'ocean' },
  CAVE:     { skyTop: '#1a1a2e', skyBot: '#2d2d44', 
              ground: TileId.STONE,  parallax: 'cave' },
  PALACE:   { skyTop: '#8B6914', skyBot: '#C4A35A', 
              ground: TileId.GOLD,   parallax: 'palace' },
  SKY:      { skyTop: '#87CEEB', skyBot: '#FFFFFF', 
              ground: TileId.CLOUD,  parallax: 'clouds' },
  STORM:    { skyTop: '#2C3E6E', skyBot: '#5a6b7c', 
              ground: TileId.STONE,  parallax: 'storm' },
  NIGHT:    { skyTop: '#0a0a2e', skyBot: '#1a1a4e', 
              ground: TileId.GRASS,  parallax: 'stars' },
  SUNSET:   { skyTop: '#FF8C42', skyBot: '#FFD280', 
              ground: TileId.GRASS,  parallax: 'sunset' },
  DAWN:     { skyTop: '#FF6B35', skyBot: '#FFD700', 
              ground: TileId.GRASS,  parallax: 'sunrise' },
  FIRE:     { skyTop: '#8B0000', skyBot: '#FF4500', 
              ground: TileId.STONE,  parallax: 'fire' },
  HEAVEN:   { skyTop: '#FFD700', skyBot: '#FFF9C4', 
              ground: TileId.GOLD,   parallax: 'clouds' },
  SNOW:     { skyTop: '#B0C4DE', skyBot: '#E8F4FD', 
              ground: TileId.STONE,  parallax: 'snow' },
  JUNGLE:   { skyTop: '#228B22', skyBot: '#90EE90', 
              ground: TileId.GRASS,  parallax: 'jungle' },
  MOUNTAIN: { skyTop: '#708090', skyBot: '#B0C4DE', 
              ground: TileId.STONE,  parallax: 'mountains' },
};

Export the main function:
export function generateLevel(index) {
  const recipe = LEVEL_RECIPES[index];
  if (!recipe) return generateDefaultLevel(index);
  
  const w = recipe.width || 100;
  const h = recipe.height || 15;
  const map = emptyMap(w, h);
  const gy = h - 5;
  
  generateTerrain(recipe, map, w, h);
  const enemies = placeEnemies(recipe, w, h, gy);
  const items = placeItems(recipe, w, h, gy);
  const biome = BIOMES[recipe.biome] || BIOMES.GARDEN;
  
  return {
    index: recipe.id,
    name: recipe.name,
    bibleStory: recipe.story,
    bibleVerse: recipe.verse,
    missionText: recipe.mission,
    character: recipe.character,
    width: w,
    height: h,
    tiles: map,
    startX: 3 * 32,
    startY: (h - 6) * 32,
    exitX: (w - 4) * 32,
    exitY: (h - 6) * 32,
    enemies,
    items,
    background: {
      skyTop: recipe.skyTop || biome.skyTop,
      skyBot: recipe.skyBot || biome.skyBot,
      parallax: recipe.parallax || biome.parallax,
    },
    mode: recipe.win || LevelMode.REACH_EXIT,
    difficulty: recipe.difficulty || 2,
  };
}

// Fallback for any missing level
function generateDefaultLevel(index) {
  const names = [
    "Faith's Journey", "God's Promise", 
    "Trust and Obey", "Walk by Faith",
    "His Word is True"
  ];
  return {
    index,
    name: names[index % names.length],
    bibleStory: "God is always with us on every journey!",
    bibleVerse: "Psalm 23:4",
    missionText: "Reach the EXIT!",
    // ... generate a basic level
  };
}
```

---

## 🚀 PROMPT 2 — All 1000 Level Recipes (Part 1: 1-250)

```
Create src/world/recipes/world1.js through world5.js
Each file contains 50 level recipes.

WORLD 1 — CREATION & EDEN (Levels 1-50):

export const WORLD1_RECIPES = [
  // Level 1
  {
    id: 0,
    name: "In the Beginning",
    story: "God created the heavens and the earth in 6 days!",
    verse: "Genesis 1:1",
    mission: "Collect all 6 creation stars!",
    character: 'mary',
    biome: 'DAWN',
    type: 'COLLECT',
    width: 80,
    terrain: { ground: 'FLAT' },
    items: [
      { type: 'STAR', count: 6, floating: true }
    ],
    enemies: [],
    win: 'COLLECT_ALL',
    difficulty: 1,
  },
  // Level 2
  {
    id: 1,
    name: "Let There Be Light!",
    story: "God said 'Let there be light' and light appeared!",
    verse: "Genesis 1:3",
    mission: "Run through the darkness to the light!",
    character: 'mary',
    biome: 'NIGHT',
    skyTop: '#000010',
    skyBot: '#000030',
    type: 'JOURNEY',
    width: 100,
    terrain: { ground: 'FLAT' },
    items: [{ type: 'SCROLL', count: 2 }],
    enemies: [{ type: 'SNAKE', count: 1, placement: 'PATROL' }],
    win: 'REACH_EXIT',
    difficulty: 1,
    special: 'DARK_TO_LIGHT', // level gets brighter as you move right
  },
  // Level 3
  {
    id: 2,
    name: "The Garden of Eden",
    story: "God planted a beautiful garden for Adam and Eve!",
    verse: "Genesis 2:8",
    mission: "Explore the garden and collect all the fruit!",
    character: 'mary',
    biome: 'GARDEN',
    type: 'COLLECT',
    width: 80,
    terrain: { ground: 'HILLS' },
    items: [
      { type: 'HEART', count: 5 },
      { type: 'SCROLL', count: 2 },
    ],
    enemies: [],
    win: 'COLLECT_ALL',
    difficulty: 1,
  },
  // Level 4
  {
    id: 3,
    name: "The Tree of Knowledge",
    story: "God told Adam and Eve not to eat from one special tree.",
    verse: "Genesis 2:17",
    mission: "Reach the tree but DON'T touch the fruit! Go around!",
    character: 'mary',
    biome: 'GARDEN',
    type: 'SURVIVE',
    width: 80,
    terrain: { ground: 'FLAT' },
    items: [{ type: 'SCROLL', count: 1 }],
    enemies: [{ type: 'SNAKE', count: 2, placement: 'GUARD' }],
    win: 'REACH_EXIT',
    difficulty: 2,
  },
  // Level 5
  {
    id: 4,
    name: "The Sneaky Snake",
    story: "The snake tricked Eve into eating the forbidden fruit.",
    verse: "Genesis 3:1",
    mission: "Avoid all snakes and reach the exit!",
    character: 'mary',
    biome: 'GARDEN',
    type: 'SURVIVE',
    width: 80,
    terrain: { ground: 'HILLS' },
    enemies: [{ type: 'SNAKE', count: 5, placement: 'RANDOM' }],
    items: [{ type: 'SCROLL', count: 2 }],
    win: 'REACH_EXIT',
    difficulty: 2,
  },
  // ... continue for all 50 levels in World 1
  // Level 6: Adam & Eve Leave the Garden
  // Level 7: Cain & Abel
  // Level 8: Noah Born
  // Level 9: The World Gets Evil
  // Level 10: God Calls Noah
  // Level 11: Noah Gathers Animals (2 by 2!)
  // Level 12: Building the Ark (collect wood)
  // Level 13: The Rain Begins
  // Level 14: Floating on the Flood
  // Level 15: 40 Days of Rain
  // Level 16: The Dove Returns
  // Level 17: Rainbow Promise
  // Level 18: Tower of Babel Begins
  // Level 19: Tower of Babel — Climb UP!
  // Level 20: Languages Confused — BOSS level
  // Level 21: Abraham Leaves Ur
  // Level 22: Abraham in Canaan
  // Level 23: God's Promise — Stars Like Sand
  // Level 24: Sodom & Lot Escapes
  // Level 25: Don't Look Back! (speed run)
  // Level 26: Abraham & Isaac Journey
  // Level 27: The Ram in the Thicket
  // Level 28: Isaac & Rebekah
  // Level 29: Jacob & Esau — The Birthright
  // Level 30: Jacob's Dream — CLIMB level
  // Level 31: Jacob Works for Rachel
  // Level 32: Jacob's 12 Sons
  // Level 33: Joseph's Colorful Coat
  // Level 34: Joseph Thrown in the Pit
  // Level 35: Joseph in Egypt
  // Level 36: Pharaoh's Dream
  // Level 37: Joseph Saves Egypt
  // Level 38: Brothers Come to Egypt
  // Level 39: Benjamin's Journey
  // Level 40: Joseph Revealed — CELEBRATION!
  // Level 41: Jacob Goes to Egypt
  // Level 42: Slaves in Egypt
  // Level 43: Baby Moses Hidden
  // Level 44: Moses in the Basket
  // Level 45: Moses at Pharaoh's Palace
  // Level 46: Moses Flees to Midian
  // Level 47: Moses the Shepherd
  // Level 48: Burning Bush
  // Level 49: God's Name — I AM
  // Level 50: BOSS — Return to Egypt!
];

WORLD 2 — PATRIARCHS continues with same format...
// All 50 recipes defined with unique missions

Continue defining all worlds. For efficiency,
use a DIFFICULTY CURVE:
- Levels 1-10: difficulty 1 (very easy, tutorial)
- Levels 11-50: difficulty 2 (easy)
- Levels 51-150: difficulty 2-3 (medium)
- Levels 151-300: difficulty 3 (medium-hard)
- Levels 301-500: difficulty 3-4 (hard)
- Levels 501-700: difficulty 4 (very hard)
- Levels 701-900: difficulty 4-5 (expert)
- Levels 901-1000: difficulty 5 (master)

After: npm run build
```

---

## 🚀 PROMPT 3 — All 1000 Level Recipes (Part 2: 251-600)

```
Create src/world/recipes/world6.js through world12.js

WORLD 6 — JESUS IS BORN (Levels 251-300):

export const WORLD6_RECIPES = [
  {
    id: 250,
    name: "The Angel Gabriel Visits Mary",
    story: "Angel Gabriel told Mary she would have God's Son!",
    verse: "Luke 1:28",
    mission: "Help Gabriel reach Mary with God's message!",
    character: 'mary',
    biome: 'DAWN',
    type: 'JOURNEY',
    width: 80,
    terrain: { ground: 'FLAT' },
    items: [{ type: 'DOVE', count: 3 }],
    enemies: [],
    difficulty: 2,
  },
  {
    id: 251,
    name: "Mary Visits Elizabeth",
    story: "Mary visited her cousin Elizabeth who was also expecting!",
    verse: "Luke 1:41",
    mission: "Journey through the hills to reach Elizabeth!",
    character: 'mary',
    biome: 'MOUNTAIN',
    type: 'JOURNEY',
    width: 100,
    terrain: { ground: 'HILLS' },
    difficulty: 2,
  },
  {
    id: 252,
    name: "Journey to Bethlehem",
    story: "Mary and Joseph had to travel to Bethlehem for the census!",
    verse: "Luke 2:4",
    mission: "Travel the long road to Bethlehem!",
    character: 'mary',
    biome: 'DESERT',
    type: 'JOURNEY',
    width: 150,  // long level!
    terrain: { ground: 'HILLS' },
    enemies: [{ type: 'SNAKE', count: 2, placement: 'RANDOM' }],
    difficulty: 2,
  },
  {
    id: 253,
    name: "No Room at the Inn",
    story: "Every inn was full! But God had a special stable ready.",
    verse: "Luke 2:7",
    mission: "Find the stable with the glowing star above it!",
    character: 'mary',
    biome: 'NIGHT',
    type: 'COLLECT',
    special: 'FIND_STABLE',
    difficulty: 2,
  },
  {
    id: 254,
    name: "Baby Jesus is Born! 🌟",
    story: "Jesus was born in Bethlehem — the most special night ever!",
    verse: "Luke 2:11",
    mission: "Celebrate! Collect all the stars of joy!",
    character: 'mary',
    biome: 'NIGHT',
    skyTop: '#000830',
    skyBot: '#001060',
    type: 'COLLECT',
    items: [{ type: 'STAR', count: 10, floating: true }],
    enemies: [],
    special: 'STAR_SHOWER',  // stars rain from sky
    difficulty: 1,
  },
  // ... 45 more Christmas/birth story levels
];

WORLD 7 — JESUS MINISTRY (Levels 301-350):
WORLD 8 — MIRACLES (351-400):
WORLD 9 — PARABLES (401-450):

PARABLES WORLD is special — puzzle levels:
  {
    id: 400,
    name: "The Lost Sheep",
    story: "A shepherd left 99 sheep to find the one that was lost!",
    verse: "Luke 15:4",
    mission: "Find the 1 lost sheep hiding in the level!",
    type: 'COLLECT',
    special: 'FIND_HIDDEN',  // 1 sheep hidden off the main path
    difficulty: 3,
  },
  {
    id: 401,
    name: "The Prodigal Son's Journey",
    story: "The son left home and ended up feeding pigs. Then he returned!",
    verse: "Luke 15:20",
    mission: "Journey home through 3 different environments!",
    type: 'JOURNEY',
    special: 'BIOME_CHANGE',  // level changes biome mid-way
    // Pig pen → desert → beautiful home
    difficulty: 3,
  },
  {
    id: 402,
    name: "The Good Samaritan",
    story: "A Samaritan helped an injured stranger when others walked by.",
    verse: "Luke 10:33",
    mission: "Help 3 injured travelers before reaching the end!",
    type: 'COLLECT',
    special: 'RESCUE_NPCS',
    difficulty: 3,
  },
  {
    id: 403,
    name: "The Sower and the Seeds",
    story: "Seeds fell on rocky ground, thorns, and good soil.",
    verse: "Matthew 13:8",
    mission: "Plant seeds in the GOOD soil only — avoid rocks & thorns!",
    type: 'SURVIVE',
    special: 'SOIL_TYPES',
    difficulty: 3,
  },
  {
    id: 404,
    name: "Treasure in a Field",
    story: "A man found a treasure and sold everything to buy that field!",
    verse: "Matthew 13:44",
    mission: "Find the hidden treasure buried in the field!",
    type: 'COLLECT',
    special: 'HIDDEN_TREASURE',
    difficulty: 3,
  },

After: npm run build
```

---

## 🚀 PROMPT 4 — All 1000 Level Recipes (Part 3: 601-1000)

```
Create src/world/recipes/world13.js through world20.js

WORLD 13 — HOLY WEEK (Levels 601-650):
  651: Palm Sunday — Triumphal Entry
  652: Cleansing the Temple
  653: Teaching at the Temple
  654: The Widow's Offering (small but mighty!)
  655: Last Supper Preparation
  656: The Last Supper
  657: Garden of Gethsemane — Stay Awake!
  658: Judas's Betrayal — BOSS level
  659: Peter's Three Denials
  660: Before Pilate
  661: Simon Carries the Cross
  662: The Crucifixion (dark but hopeful level)
  663: The Curtain Tears
  664: Three Hours of Darkness
  665: Joseph's Tomb
  666: The Sealed Tomb
  667: Women at the Tomb — DAWN level
  668: He Is Risen! 🌅 — Most joyful celebration
  669: Road to Emmaus
  670: Doubting Thomas

WORLD 15 — EARLY CHURCH (701-750):
  701: Pentecost Fire
  702: Peter's First Sermon
  703: 3000 Baptized!
  704: Healing at the Beautiful Gate
  705: Ananias & Sapphira (honesty level)
  706: Stephen's Vision
  707: Philip & the Ethiopian
  708: Saul Meets Jesus — Blinding Light!
  709: Saul Becomes Paul
  710: Peter's Vision — Clean & Unclean
  711: Cornelius — First Gentile Believer
  712: Peter Escapes Prison
  713: Herod's Punishment
  714: Paul's First Journey
  715: Paul in Lystra
  716: Jerusalem Council
  717: Paul & Silas in Prison — SINGING!
  718: Lydia — First European Christian
  719: Paul in Athens
  720: Paul in Corinth

WORLD 16 — PAUL'S LETTERS (751-800):
  These are WISDOM levels — different mechanic!
  Instead of action, collect WISDOM WORDS:
  
  {
    id: 750,
    name: "Love is Patient, Love is Kind",
    story: "Paul wrote about the greatest gift — LOVE!",
    verse: "1 Corinthians 13:4",
    mission: "Collect all 8 love letters floating in the sky!",
    type: 'COLLECT',
    special: 'FLOATING_LETTERS',
    items: [
      { type: 'SCROLL', count: 8, floating: true },
    ],
    difficulty: 3,
  },
  {
    id: 751,
    name: "Fruit of the Spirit",
    story: "The Holy Spirit grows good fruit in our hearts!",
    verse: "Galatians 5:22",
    mission: "Collect all 9 fruits of the Spirit!",
    items: [{ type: 'HEART', count: 9 }],
    // 9 fruits: love, joy, peace, patience, kindness,
    // goodness, faithfulness, gentleness, self-control
    special: 'NAMED_ITEMS',
    difficulty: 3,
  },

WORLD 17 — FAITH & WISDOM (801-850):
  Book of Job levels — survive the hardships:
  {
    id: 800,
    name: "Job's Trials Begin",
    story: "Job lost everything but still trusted God!",
    verse: "Job 1:21",
    mission: "Survive the storm — stay faithful!",
    type: 'SURVIVE',
    special: 'STORM_LEVEL',
    difficulty: 4,
  },
  
  Psalms levels — collect musical notes:
  {
    id: 820,
    name: "The Lord is My Shepherd",
    story: "David wrote that God leads us like a shepherd!",
    verse: "Psalm 23:1",
    mission: "Follow the shepherd through the valley!",
    type: 'JOURNEY',
    special: 'FOLLOW_GUIDE',  // NPC shepherd leads the way
    difficulty: 2,
  },
  {
    id: 821,
    name: "Praise Him with Music!",
    story: "Praise God with singing and instruments!",
    verse: "Psalm 150:6",
    mission: "Collect all the musical notes!",
    type: 'COLLECT',
    items: [{ type: 'CROWN', count: 10, floating: true }],
    special: 'MUSIC_NOTES',
    difficulty: 2,
  },

WORLD 19 — REVELATION (901-950):
  Most dramatic levels in the game:
  
  {
    id: 900,
    name: "John's Vision on Patmos",
    story: "Jesus appeared to John with a message for the churches!",
    verse: "Revelation 1:17",
    mission: "Collect the 7 messages for the 7 churches!",
    type: 'COLLECT',
    items: [{ type: 'SCROLL', count: 7 }],
    biome: 'OCEAN',
    difficulty: 4,
  },
  {
    id: 949,
    name: "FINAL BOSS: The Dragon Falls! ⚔️",
    story: "The dragon was defeated forever! God always wins!",
    verse: "Revelation 20:10",
    mission: "Defeat the dragon with 7 seals of light!",
    type: 'BOSS',
    special: 'DRAGON_BOSS',
    biome: 'FIRE',
    difficulty: 5,
  },

WORLD 20 — BONUS & SPECIAL (951-1000):
  {
    id: 950,
    name: "Joshua & Caleb's Adventure! 👦👦",
    story: "Named after two of the greatest Bible heroes!",
    verse: "Numbers 14:24",
    mission: "Joshua & Caleb — take the mountain TOGETHER!",
    type: 'COOP',  // forces co-op mode!
    special: 'COOP_REQUIRED',
    difficulty: 3,
  },
  {
    id: 960,
    name: "The Whole Bible in One Level!",
    story: "From Creation to Revelation — God's love story!",
    verse: "John 3:16",
    mission: "Run through ALL of Bible history!",
    type: 'JOURNEY',
    width: 500,  // MASSIVE level!
    special: 'BIOME_JOURNEY',
    // Biome changes every 50 tiles:
    // Garden → Desert → Ocean → Cave → Palace → 
    // Night → Storm → Dawn → Fire → Heaven
    difficulty: 4,
  },
  {
    id: 999,
    name: "Streets of Gold 🏆",
    story: "God will make all things new — the best is yet to come!",
    verse: "Revelation 21:4",
    mission: "Run the golden streets of New Jerusalem — FINAL LEVEL!",
    type: 'JOURNEY',
    biome: 'HEAVEN',
    special: 'RAINBOW_SKY',
    enemies: [],  // No enemies in heaven!
    items: [{ type: 'CROWN', count: 20, floating: true }],
    difficulty: 1,  // Easy — it's heaven!
  },

Update constants.js:
export const TOTAL_LEVELS = 1000;

Update MainMenu level grid:
- Show levels as a scroll-able world map
- 20 world bubbles, each expands to 50 levels
- Lock worlds until previous world completed
- Show stars earned per world

npm run build
```

---

## 🚀 PROMPT 5 — World Map Navigation

```
Replace the flat level grid with a WORLD MAP
in src/ui/WorldMap.js

Design:
- Scroll horizontally through 20 world bubbles
- Each world = large circular bubble with:
  - World number
  - World name  
  - World icon (unique emoji per world)
  - Stars earned / total stars
  - Lock icon if not yet unlocked

World icons:
🌍 World 1: Creation (earth)
👴 World 2: Patriarchs (old man)
🔥 World 3: Moses (flame)
🏜️ World 4: Wilderness (desert)
⚔️ World 5: Promised Land (sword)
👑 World 6: Kingdom (crown)
🦁 World 7: Prophets (lion)
📖 World 8: Wisdom (book)
🐟 World 9: Minor Prophets (fish)
🏛️ World 10: Exile (temple)
⭐ World 11: Jesus Born (star)
🕊️ World 12: Ministry (dove)
✨ World 13: Miracles (sparkle)
📜 World 14: Parables (scroll)
✝️ World 15: Holy Week (cross)
🔥 World 16: Early Church (flame)
✉️ World 17: Letters (letter)
🙏 World 18: Faith (hands)
🌈 World 19: Revelation (rainbow)
🏆 World 20: Bonus (trophy)

Tap a world → slides open to show 50 level dots
Level dots: ⭐ (completed) or ● (locked) or ▶ (available)

Unlock system:
- Complete level N to unlock level N+1
- Complete all 50 in a world to unlock next world
- Joshua & Caleb levels always unlocked

After: npm run build
```

---

## 🚀 PROMPT 6 — Bigger Characters Final Polish

```
Final character size and mission clarity update.

CHARACTERS: Use S = 14 (was 12, now 14)
Total character height: ~112px — unmissable on any screen!

MISSION DISPLAY — always visible:
Position: just below the HUD bar
Background: rgba(0,0,0,0.8)
Border: 2px solid #FFD700
Padding: 6px 16px
Border-radius: 20px

Show:
Line 1: 🎯 [MISSION TEXT] — white, 10px Press Start 2P
Line 2: Progress bar — fills as objectives completed
         [████████░░] 4/5 stones

Progress bar:
  Background: #333
  Fill: #FFD700 (gold)
  Width: 200px
  Height: 12px
  Border-radius: 6px

When objective complete:
  Bar turns GREEN (#44CC44)
  "✓ NOW REACH THE EXIT! →" flashes
  Arrow pulses toward exit (every 0.5s)

EXIT ARROW:
When mission complete, draw a golden arrow
pointing toward the exit gate every frame:
  const angle = Math.atan2(
    exitY - playerY, 
    exitX - playerX
  );
  // Draw arrow at edge of screen in that direction
  ctx.fillStyle = '#FFD700';
  // Arrow shape using beginPath

LEVEL INTRO CARD (shown for 4 seconds on level start):
Full-screen dim overlay → slides up after 4s
Shows:
  - World name + level number
  - Character portrait (large, 128px)
  - Bible story (2 sentences max)
  - Mission (bold, large)
  - Bible verse
  - ▶ TAP TO START button

After: npm run build && npx cap sync ios
```

---

## 📊 The Numbers

| Metric | Count |
|--------|-------|
| Total Levels | 1000 |
| Bible Books Covered | 66 |
| Characters Playable | 10 |
| Worlds | 20 |
| Levels per World | 50 |
| Estimated Play Time | 50-100 hours |
| Age Range | 3-103 |

## 🕐 Build Timeline

| Phase | Prompts | Levels | Time |
|-------|---------|--------|------|
| Engine | Prompt 1 | Generator | 1 session |
| Genesis-Exodus | Prompt 2 | 1-250 | 2 sessions |
| Joshua-Prophets | Prompt 3 | 251-600 | 2 sessions |
| NT-Revelation | Prompt 4 | 601-1000 | 2 sessions |
| World Map | Prompt 5 | Navigation | 1 session |
| Polish | Prompt 6 | UI/Characters | 1 session |

*Total: ~9 Cursor sessions to build the most 
comprehensive Bible game ever created!*

---

*"Your word is a lamp to my feet and a light 
to my path." — Psalm 119:105* 🙏🎮
