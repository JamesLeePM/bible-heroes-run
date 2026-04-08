# 🏃 BibleRun — Cursor Build Prompts
> A Super Mario-style 2D platformer featuring Bible heroes
> Built for Joshua & Caleb! 🙏
> Stack: Vite + Vanilla JS + HTML5 Canvas + Capacitor iOS
> Paste each prompt into Cursor in order.

---

## 🚀 PROMPT 1 — Project Setup

```
Create a brand new Vite + vanilla JavaScript project called "BibleRun".

Project structure:
- index.html
- src/main.js
- src/engine/GameLoop.js
- src/engine/Physics.js
- src/engine/Camera.js
- src/engine/Input.js
- src/world/Level.js
- src/world/TileMap.js
- src/characters/Player.js
- src/characters/Enemies.js
- src/ui/HUD.js
- src/ui/MainMenu.js
- src/ui/CharacterSelect.js
- src/assets/SpriteSheet.js
- src/audio/SoundManager.js

Install dependencies:
- vite (dev)
- NO Three.js — pure HTML5 Canvas only

index.html:
- Full screen canvas #game-canvas
- Black background
- No scroll, no overflow
- Meta viewport: width=device-width, initial-scale=1, 
  maximum-scale=1, user-scalable=no
- Link Google Font: "Press Start 2P" for pixel style

src/main.js:
- Get canvas, set width/height to window.innerWidth/Height
- Handle resize
- Create 2D context (ctx)
- Start game loop with requestAnimationFrame
- Show main menu first

capacitor.config.ts:
- appId: com.jameslee.biblerun
- appName: BibleRun
- webDir: dist
- ios backgroundColor: #000000

vite.config.js:
- base: './'
- build target: es2015
- sourcemap: true
```

---

## 🎨 PROMPT 2 — Sprite System & Art

```
Create a pixel art sprite system in src/assets/SpriteSheet.js
using HTML5 Canvas to draw all game graphics procedurally.
NO image files needed — everything drawn with canvas API.

TILE SIZE: 32x32 pixels each

DRAW THESE TILES (on a 512x512 canvas atlas):

ROW 0 — Ground tiles:
(0,0) Sand — tan #d4a853 with darker dots
(1,0) Grass — green top #5a8a3c, brown sides #8b5e3c
(2,0) Stone — grey #888 with crack lines
(3,0) Wood — brown #8b4513 with grain lines
(4,0) Water — blue #1a6fa8 with white wave lines
(5,0) Gold — bright #ffd700 with shine
(6,0) Cloud — white with light blue shadow
(7,0) Brick — red #c1440e with grey mortar lines

ROW 1 — Character sprites (16x32 each, tall):
(0,1) David — brown tunic, dark hair, sling in hand
(1,1) Moses — white robe, grey beard, staff
(2,1) Noah — brown work clothes, hammer
(3,1) Mary — blue robe, head covering
(4,1) Daniel — purple robe, calm face
(5,1) Esther — purple/gold queen dress, crown
(6,1) Jonah — blue tunic, fish nearby
(7,1) Joshua — bronze armor, sword, shield

ROW 2 — Enemies:
(0,2) Goliath — huge grey armor, 48x48
(1,2) Pharaoh Soldier — red/gold armor, spear
(2,2) Lion — orange, crouching
(3,2) Snake — green, coiled
(4,2) Whale — large blue, open mouth

ROW 3 — Items & collectibles:
(0,3) Gold Star ⭐ — spinning collectible
(1,3) Heart ❤️ — life pickup  
(2,3) Scroll 📜 — Bible verse collectible
(3,3) Bread 🍞 — health restore
(4,3) Key 🗝️ — level exit key
(5,3) Crown 👑 — bonus item
(6,3) Dove 🕊️ — extra life
(7,3) Shield 🛡️ — temporary invincibility

ROW 4 — Platforms & decoration:
(0,4) Palm tree trunk
(1,4) Palm tree top
(2,4) Rock formation
(3,4) Desert cactus
(4,4) Burning bush (animated orange/red)
(5,4) Ark piece (wooden boat section)
(6,4) Temple pillar
(7,4) Gate/door

Style: warm, bright, friendly pixel art
Colors: biblical palette — sandy golds, desert oranges,
        sky blues, rich greens

Export:
- getSpriteSheet() → returns the canvas
- drawTile(ctx, tileX, tileY, destX, destY, scale)
- drawCharacter(ctx, charId, destX, destY, facing, frame)
- drawEnemy(ctx, enemyId, destX, destY, frame)
- drawItem(ctx, itemId, destX, destY, frame)
```

---

## 🎮 PROMPT 3 — Physics & Player

```
Build the core game physics in src/engine/Physics.js 
and player controller in src/characters/Player.js.

PHYSICS ENGINE (src/engine/Physics.js):
Constants:
- GRAVITY = 0.5
- MAX_FALL_SPEED = 12
- FRICTION = 0.85

PhysicsBody class:
- x, y, width, height
- vx, vy (velocity)
- onGround = false
- applyGravity(dt)
- applyFriction()
- move(dx, dy)
- checkTileCollision(tileMap) — AABB collision with tiles

PLAYER (src/characters/Player.js):
Properties:
- character: one of 8 Bible characters
- health: 3 hearts
- stars: 0 (score)
- scrolls: 0 (Bible verses collected)
- isJumping, onGround
- facing: 'left' | 'right'
- animFrame: 0 (cycles 0-3 for walk animation)
- invincible: false (brief after hit)

UNIQUE ABILITIES per character:
- DAVID: 
  runSpeed = 5 (fastest)
  jumpForce = -11
  special: throws sling stones (tap attack button)
  
- MOSES: 
  runSpeed = 3
  jumpForce = -14 (highest jump)
  special: raises staff to create platform on water
  
- NOAH: 
  runSpeed = 3.5
  jumpForce = -11
  special: can pick up and throw animals/items
  
- MARY:
  runSpeed = 4
  jumpForce = -12
  special: nearby enemies slow down (grace effect)
  
- DANIEL:
  runSpeed = 4
  jumpForce = -11
  special: lions turn friendly and help him
  
- ESTHER:
  runSpeed = 4
  jumpForce = -11
  special: DOUBLE JUMP
  
- JONAH:
  runSpeed = 3.5
  jumpForce = -11
  swimSpeed = 4 (moves fast in water)
  special: can breathe underwater
  
- JOSHUA:
  runSpeed = 4.5
  jumpForce = -12
  special: shout attack — stuns enemies in radius

CONTROLS (from src/engine/Input.js):
Keyboard:
- Left/Right arrows or A/D: move
- Space or Up: jump
- Z or X: special attack

Touch (mobile — VERY IMPORTANT):
- Left button (◀): move left
- Right button (▶): move right  
- Jump button (🟢): jump
- Special button (⚡): special ability
- NO joystick — simple D-pad buttons for 2D platformer

ANIMATIONS:
- 4-frame walk cycle (animFrame 0-3, changes every 8 game ticks)
- Jump frame (separate sprite position)
- Hurt flash (toggle visible every 4 frames when invincible)
- Idle: slight bob using Math.sin
```

---

## 🌍 PROMPT 4 — Level System & Tile Maps

```
Build the level system in src/world/Level.js 
and src/world/TileMap.js.

TILE MAP (src/world/TileMap.js):
- Store map as 2D array of tile IDs
- Tile size: 32x32
- Solid tiles: [1,2,3,5,6,7,8] (all except air=0, water=4)
- Water tile: special — player swims, slows movement
- render(ctx, camera) — draw only visible tiles (culling)
- getTileAt(worldX, worldY) — returns tile ID
- setTileAt(worldX, worldY, tileId)

LEVEL STRUCTURE:
Each level has:
- name, bibleStory (2-3 sentence summary)
- character (which hero stars in this level)
- tiles (2D array)
- enemies (array of {type, x, y})
- items (array of {type, x, y})
- startX, startY (player spawn)
- exitX, exitY (level exit — golden gate)
- width, height (in tiles)
- background (sky color + parallax layers)

LEVELS — build all 6:

═══════════════════════════
LEVEL 1: DAVID'S VALLEY
Character: David
Story: "David trusted God and defeated Goliath 
with just a sling and five smooth stones!"
═══════════════════════════
Width: 120 tiles wide, 20 tiles tall
Layout:
- Rolling grass hills
- Stream to jump over (water tiles)
- 5 smooth stones to collect (items)
- Goliath BOSS at the end (x=100)
Background: blue sky, green hills parallax
Enemies: 2 Philistine soldiers patrolling
Items: 5 stones, 3 hearts, 2 scrolls
Win: Collect all 5 stones then defeat Goliath

═══════════════════════════
LEVEL 2: DESERT OF EXODUS
Character: Moses
Story: "God led Moses and His people 
through the desert with a pillar of fire!"
═══════════════════════════
Width: 150 tiles wide, 20 tiles tall
Layout:
- Flat desert with sand dunes (platforms)
- Burning bush at start (collect = get staff power)
- Wide water gap (Red Sea) - Moses special splits it
- Pharaoh's soldiers chasing from right
Background: orange/tan desert sky, sand parallax
Enemies: 4 Pharaoh soldiers, 2 snakes
Items: Manna bread (restore health), scrolls
Win: Reach the Promised Land gate at right edge

═══════════════════════════
LEVEL 3: NOAH'S FLOOD
Character: Noah
Story: "God told Noah to build an ark. 
Noah trusted God and saved his family and the animals!"
═══════════════════════════
Width: 100 tiles wide, 25 tiles tall
Layout:
- Water is RISING slowly (every 30 seconds 
  the water level rises by 1 tile — add urgency!)
- Ark sections to collect and assemble (5 pieces)
- Animals to rescue (collectibles that follow Noah)
- Platforms = floating debris and rock outcrops
Background: stormy dark blue/grey sky, rain effect
  (draw random vertical lines each frame)
Enemies: rising water (environmental), serpents
Items: Ark pieces (x5), animals (x8), dove (extra life)
Win: Collect all ark pieces and reach the mountaintop

═══════════════════════════
LEVEL 4: DANIEL'S LIONS DEN
Character: Daniel
Story: "Daniel prayed to God even when it was 
dangerous. God shut the lions' mouths!"
═══════════════════════════
Width: 80 tiles wide, 20 tiles tall
Layout:
- Dark cave/dungeon with stone platforms
- Lions roaming (Daniel special makes them friendly)
- Prayer spots (gold circles — stand on them to pray, 
  pauses lions for 5 seconds)
- Exit: angel opens door at the end
Background: dark cave, torches flickering 
  (orange glow circles that pulse with Math.sin)
Enemies: 4 lions, 2 guards at entrance
Items: Scrolls (prayer verses), hearts
Win: Pray at 3 prayer spots then reach the angel door

═══════════════════════════
LEVEL 5: JONAH'S OCEAN
Character: Jonah
Story: "Jonah ran from God, but God sent a 
great fish. Inside the fish, Jonah prayed and obeyed!"
═══════════════════════════
Width: 120 tiles wide, 30 tiles tall
Layout:
- Half air (ship at start), half underwater
- Ship platforms at top
- Deep ocean below with platforms (coral, rocks)
- WHALE BOSS chases Jonah underwater
- Inside whale section (wooden ribs = platforms)
- Exit: whale spits Jonah onto beach
Background: deep blue ocean, light rays from surface
Enemies: Whale (boss), jellyfish, sailors (friendly NPCs)
Items: Scrolls, fish collectibles, air bubbles (health)
Win: Escape the whale and reach Nineveh beach

═══════════════════════════
LEVEL 6: JOSHUA'S JERICHO
Character: Joshua
Story: "Joshua and the Israelites marched around 
Jericho for 7 days. On day 7, they shouted 
and the walls came tumbling down!"
═══════════════════════════
Width: 200 tiles wide (loops 7 times!), 20 tiles tall
Layout:
- Circular path around city walls (very unique level)
- Each lap = 1 day (7 laps total)
- On lap 7: tap SHOUT button — walls crumble 
  (tiles disappear with particle effect)
- Enemies on walls shooting arrows
- Priests with trumpets to escort (don't let them die)
Background: golden sunset sky, Jericho walls prominent
Enemies: Wall archers (x6), gate guards (x2)
Items: Trumpets (x7), scrolls, crowns
Win: Complete 7 laps then shout to topple the walls

After all levels: npm run build
```

---

## 🎮 PROMPT 5 — Touch Controls & Mobile HUD

```
Build the mobile touch controls in src/ui/TouchControls.js
and game HUD in src/ui/HUD.js optimized for iPad/iPhone.

TOUCH CONTROLS (bottom of screen):
Layout:
┌─────────────────────────────────────┐
│                                     │
│         [GAME AREA]                 │
│                                     │
├──────────────┬──────────────────────┤
│ ◀  ▶        │    ⚡      🟢 JUMP   │
│ (move)      │  (special)  (jump)   │
└──────────────┴──────────────────────┘

Left side controls:
- ◀ LEFT button: 80x80px, rounded, semi-transparent dark
- ▶ RIGHT button: 80x80px, same style
- Side by side, bottom-left
- Press and HOLD to keep moving (not just tap)

Right side controls:  
- 🟢 JUMP button: 100x100px circle, green, bottom-right
- ⚡ SPECIAL button: 70x70px, gold, above-left of jump
- Both use touchstart for instant response

BUTTON STYLING:
background: rgba(0, 0, 0, 0.45)
border: 3px solid rgba(255, 213, 79, 0.6)
border-radius: 50% (circles) or 16px (rectangles)
color: white
font-family: Press Start 2P
Active state: background brightens, slight scale(0.92)
All buttons: touch-action: none, user-select: none

INPUT SYSTEM (src/engine/Input.js):
Unified input that handles BOTH keyboard and touch:

const input = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false,  // true for ONE frame only
  special: false,
  specialPressed: false
}

Keyboard:
document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') 
    input.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') 
    input.right = true;
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    input.jump = true;
    input.jumpPressed = true;
  }
  if (e.code === 'KeyZ' || e.code === 'KeyX') {
    input.special = true;
    input.specialPressed = true;
  }
})

Touch buttons set input.X = true on touchstart,
false on touchend.

Reset jumpPressed and specialPressed to false 
at the END of each game loop frame.

HUD (overlay on canvas):
Top bar:
- Left: ❤️❤️❤️ hearts (current health)
- Center: level name in Press Start 2P
- Right: ⭐ star count

Bottom info bar (above controls):
- Current character name + small sprite icon
- Scrolls collected: 📜 x3

PAUSE MENU (tap anywhere on HUD top bar):
- Dim background
- "PAUSED" title
- Resume / Character Select / Main Menu buttons
- Current Bible story text shown while paused

After: npm run build
```

---

## 🎭 PROMPT 6 — Characters, Enemies & Main Menu

```
Build the character selection and enemy AI systems.

CHARACTER SELECT (src/ui/CharacterSelect.js):
- Full screen with parchment background texture
  (draw with canvas: tan base + subtle noise)
- Title: "Choose Your Bible Hero" in Press Start 2P
- 8 character cards in a 4x2 grid
- Each card shows:
  - Large character sprite (drawn via SpriteSheet)
  - Name (e.g. "DAVID")
  - Special ability text (e.g. "⚡ Sling Shot")
  - Bible verse reference (e.g. "1 Samuel 17:45")
  - "PLAY" button
- Selected card glows gold
- Swipe left/right to browse on mobile
- Recommended level shown: "Best in: David's Valley"

SPECIAL CHARACTER CARDS for Joshua & Caleb:
Add at bottom of character select:

JOSHUA (playable in all levels):
- Ability: SHOUT — stuns all enemies on screen
- Speed: 4.5 (fast warrior)
- Jump: high
- Verse: "Be strong and courageous!" — Joshua 1:9
- Unlock: Available from the start (named after 
  the user's son — always unlocked!)
- Card color: bold blue and gold

CALEB (playable in all levels):
- Ability: WHOLEHEARTEDNESS — double star collection radius
- Speed: 4 
- Jump: very high (Caleb said "give me this mountain!")
- Verse: "I wholeheartedly followed the Lord" — Joshua 14:8
- Unlock: Available from the start (named after 
  the user's son — always unlocked!)
- Card color: rich green and gold
- Special: can climb steeper slopes than other characters

ENEMY AI (src/characters/Enemies.js):

Base Enemy class:
- x, y, vx, vy
- health
- patrolLeft, patrolRight boundaries
- flipDirection when hitting wall or edge
- onHit(damage) — flash red, reduce health
- onDeath() — play death animation, drop item

Enemy types:

PHILISTINE_SOLDIER:
- Patrols back and forth
- Throws spear when player in range (x ± 200px)
- Health: 1 hit (David level)

PHARAOH_SOLDIER:
- Faster patrol
- Chases player if within 300px
- Health: 2 hits

LION:
- Pounces toward player (large leap every 2s)
- Daniel special: turns friendly, follows Daniel
- Health: 2 hits

SNAKE:
- Slithers along ground, stays low
- Jumps at player when adjacent
- Health: 1 hit

JELLYFISH:
- Bobs up and down in water using Math.sin
- Damages player on contact
- Health: 1 hit

BOSS — GOLIATH:
- 5x normal enemy size (drawn big)
- 10 health
- Phase 1 (10-6 HP): walks toward player
- Phase 2 (5-1 HP): throws boulders, stomps
- Weakness: David's sling stones
- Death: dramatic fall animation, screen shake
- Drop: Crown collectible + level complete

BOSS — WHALE:
- Swims in sine wave pattern
- Opens mouth to suck player in
- Inside whale: escape mini-game
- Health: can't be killed, must be escaped

All enemies:
- Never hurt the player if invincibility active
- Drop random item (50% chance) on death
- Show health bar above boss enemies only

After: npm run build
```

---

## 🎵 PROMPT 7 — Sound, Particles & Main Menu

```
Add the final polish: sounds, particles, and main menu.

SOUND MANAGER (src/audio/SoundManager.js):
Use Web Audio API to generate ALL sounds procedurally.
No audio files needed.

Sounds to generate:

jump():
  oscillator, frequency 220→440, duration 0.15s
  type: 'square', quick attack

land():
  noise burst, low frequency, duration 0.05s

collectStar():
  ascending arpeggio: C-E-G-C, duration 0.3s
  type: 'sine'

collectScroll():
  soft harp tone, frequency 523, duration 0.4s

takeDamage():
  descending noise, frequency 200→80, duration 0.2s

enemyDeath():
  quick descending tone, type 'sawtooth'

bossHit():
  low thud, frequency 80, duration 0.15s

levelComplete():
  triumphant 8-bit fanfare: C-E-G-C5 arpeggio
  then hold chord, total duration 1.5s

specialAbility():
  ascending sweep, frequency 300→800, duration 0.3s

menuSelect():
  soft tick, frequency 440, duration 0.05s

PARTICLES (src/engine/Particles.js):
Simple particle system:

class Particle {
  x, y, vx, vy, life, maxLife, color, size
  update() — move + fade
  draw(ctx) — filled circle, fading alpha
}

class ParticleSystem {
  particles = []
  
  emit(x, y, options) — create burst of particles
  update() — update all, remove dead
  draw(ctx) — draw all
}

Particle effects to create:

starCollect(x, y):
  8 gold particles, burst outward, fade in 0.5s

scrollCollect(x, y):
  6 white/cream particles spiral upward

playerJump(x, y):
  4 dust puffs downward, grey/tan

playerLand(x, y):
  6 dust puffs outward, grey/tan

enemyDeath(x, y):
  10 red particles burst, fade 0.4s

bossDefeated(x, y):
  30 gold + white particles, large burst
  screen shake: canvas translateX sin wave

levelComplete(x, y):
  confetti: 20 particles, random colors
  float upward slowly

wallCrumble(x, y):
  20 grey/brown particles fly outward
  (for Joshua's Jericho level)

waterSplash(x, y):
  8 blue particles arc upward

MAIN MENU (src/ui/MainMenu.js):
Animated background:
- Scrolling pixel art landscape (parallax)
- Three layers: sky, mountains, ground
- Day/night cycle slowly shifts sky color

Title treatment:
- "BIBLE" in large gold pixel font
- "RUN" in slightly larger font below
- Subtitle: "Adventures of Joshua & Caleb" 
  (personalized for the boys!)
- Blinking "TAP TO START" text

Menu options:
1. PLAY (→ Character Select)
2. LEVELS (→ Level Select map showing all 6)
3. BIBLE FACTS (→ scroll of facts about each character)
4. ??? SECRET (→ unlockable after finishing all levels)

Level Select Map:
- Scroll-able horizontal map
- Each level shown as a location on a treasure map
- Locked levels show padlock (complete previous to unlock)
- Stars earned shown under each level (0-3 stars)
- 3-star criteria:
  ⭐ Complete the level
  ⭐⭐ Collect all scrolls
  ⭐⭐⭐ No damage taken

GABRIEL THE GUIDE (tutorial angel):
- Appears on first launch
- Small angel 👼 in top-left
- Walks Joshua & Caleb through:
  1. How to move (◀ ▶)
  2. How to jump (🟢)
  3. How to collect stars
  4. How to use special ability
  5. How to find Bible scrolls
- Speaks in simple, warm language
- "Great job [name]! God loves brave hearts! 🌟"
- After tutorial: shrinks to small help button

After: npm run build && npx cap sync ios
```

---

## 🎯 BONUS PROMPT — Joshua & Caleb Special Mode

```
Add a special "Joshua & Caleb Co-op Mode" to BibleRun.

Since this game is made for two brothers, add a special 
2-player mode where both can play on the SAME screen:

SPLIT SCREEN CO-OP:
- Canvas splits into LEFT (Joshua) and RIGHT (Caleb)
  halves
- Each player has their own controls:
  Player 1 (Joshua): ◀ ▶ JUMP SPECIAL buttons on left
  Player 2 (Caleb): separate ◀ ▶ JUMP SPECIAL on right
- Both players in the SAME level
- If one falls, the other can revive them by 
  reaching their position
- Shared star count (cooperative scoring)
- Special combo move: when both use special 
  at same time → MIRACLE move (clears all enemies!)

BROTHER BONUS MOMENTS:
At random intervals, Gabriel appears and says:
- "Joshua and Caleb trusted God together! 
  Just like you two! 💪"
- "The real Joshua and Caleb said 
  'We can do it!' — Numbers 13:30"
- "Brothers who pray together, 
  WIN together! 🙏"

FAMILY HIGH SCORE:
- localStorage saves best scores for 
  "Joshua" and "Caleb" separately
- High score table on main menu
- Crown 👑 next to the leading brother's name
- "Dad's Best" score category too 
  (for when you play with them!)

After: npm run build && npx cap sync ios
```

---

## 📋 Build Order & Tips

```
Run these in Cursor in ORDER:
1. Project Setup → test npm run dev works
2. Sprite System → verify canvas draws in browser  
3. Physics & Player → test keyboard movement in browser
4. Level System → one level working end-to-end
5. Touch Controls → test on iPad simulator
6. Characters & Enemies → all 8 heroes + enemies
7. Sound & Menu → full game flow

After EACH prompt:
npm run build && npx cap sync ios
Then test in Xcode simulator before next prompt.

FINAL DEPLOYMENT:
npm run build
npx cap sync ios
# Open Xcode → select iPad → ▶ Play
```

---

## 🏆 Game Summary

| Feature | Detail |
|---------|--------|
| Platform | iOS iPad & iPhone via Capacitor |
| Engine | Pure HTML5 Canvas (no Three.js!) |
| Levels | 6 Bible story levels |
| Characters | 8 Bible heroes + Joshua & Caleb unlocked |
| Controls | Simple D-pad touch buttons |
| Co-op | Split screen for 2 brothers |
| Guide | Gabriel the Angel tutorial |
| Audio | Web Audio API (no files needed) |
| Art | Procedural pixel art (no image files) |

*Made with love for Joshua & Caleb — 
"Be strong and courageous!" — Joshua 1:9* 🙏
