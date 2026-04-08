import { TileId } from '../game/constants.js';
import { CharId } from '../game/constants.js';
import { drawCharacter, CHAR_DRAW_W, CHAR_DRAW_H } from '../assets/SpriteSheet.js';
import { HITBOX_INSET, hitboxLeft, hitboxRight } from '../engine/Physics.js';

const WALK_SPEED = 4;
const JUMP_FORCE = -16;
const JUMP_HOLD_BOOST = 0.6;
const JUMP_HOLD_MAX = 12;
const GRAVITY_NORMAL = 0.5;
const GRAVITY_FALLING = 0.8;
const MAX_FALL = 14;
const FRICTION_GROUND = 0.75;
const FRICTION_AIR = 0.92;
const ACCEL = 0.8;

/** Water: buoyancy and drag (approximate). */
const WATER_GRAVITY_MUL = 0.28;
const WATER_MAX_SINK = 3.2;
const WATER_SWIM_UP = -5.2;
const WATER_JONAH_SWIM_UP = -6.8;
const WATER_WADE_VX_MUL = 0.92;

const STAT_MOD = {
  [CharId.DAVID]: { run: 1, jump: 1 },
  [CharId.MOSES]: { run: 0.85, jump: 1.08 },
  [CharId.NOAH]: { run: 0.9, jump: 1 },
  [CharId.MARY]: { run: 0.95, jump: 1 },
  [CharId.DANIEL]: { run: 0.95, jump: 1 },
  [CharId.ESTHER]: { run: 0.95, jump: 1 },
  [CharId.JONAH]: { run: 0.9, jump: 1 },
  [CharId.JOSHUA_HERO]: { run: 1.05, jump: 1.05 },
  [CharId.JOSHUA]: { run: 1.05, jump: 1.05 },
  [CharId.CALEB]: { run: 0.95, jump: 1.02 },
};

export class Player {
  /**
   * @param {number} x
   * @param {number} y
   * @param {string} characterId
   */
  constructor(x, y, characterId) {
    this.x = x;
    this.y = y;
    /** Collision AABB (world); narrower than a tile, shorter than two tiles. */
    this.width = 48;
    this.height = 64;
    /** Atlas draw size after scaling (visual). */
    this.spriteW = 100;
    this.spriteH = 160;
    /** Sprite top-left offset from hitbox top-left (centers art on body). */
    this.drawOffsetX = -26;
    this.drawOffsetY = -96;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.character = characterId;
    const m = STAT_MOD[characterId] || STAT_MOD[CharId.DAVID];
    this._runMul = m.run;
    this._jumpMul = m.jump;
    this.health = 3;
    this.maxHealth = 3;
    this.stars = 0;
    this.scrolls = 0;
    this.isJumping = false;
    this.facing = 'right';
    this.animTimer = 0;
    this.invincible = 0;
    this.doubleJumpUsed = false;
    this.visible = true;
    this.stonesCollected = 0;
    this.arkPieces = 0;
    this.prayersDone = 0;
    /** @type {{x:number;y:number;vx:number;active:boolean}[]} */
    this.projectiles = [];
    /** @type {number} */
    this.squashFrames = 0;
    /** @type {number} */
    this.landShakeFrames = 0;
    /** Frames after leaving ground where jump still registers (coyote time). */
    this.coyoteTimer = 0;
    /** Frames: jump pressed before landing still triggers jump. */
    this.jumpBuffer = 0;
    /** Frames of upward hold-boost applied this jump (0 … JUMP_HOLD_MAX). */
    this.jumpHoldFrames = 0;
    /** Victory pose — simple arc, then hold until level UI. */
    this.celebrateFrames = 0;
    /** After celebration arc, hold still until next level/menu. */
    this.winFreeze = false;
    /** Frames until special can be used again. */
    this.specialCooldown = 0;
    /** Jonah: temporary water breathing (frames). */
    this.waterBreath = 0;
  }

  getStats() {
    return STAT_MOD[this.character] || STAT_MOD[CharId.DAVID];
  }

  /**
   * Torso/center mass in water — swimming / buoyancy.
   * @param {import('../world/TileMap.js').TileMap} tileMap
   */
  isInWater(tileMap) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    return tileMap.getTileAt(cx, cy) === TileId.WATER;
  }

  /**
   * Feet line in water (wade / surface without full swim).
   * @param {import('../world/TileMap.js').TileMap} tileMap
   */
  isFeetInWater(tileMap) {
    const fy = this.y + this.height - 2;
    const xl = hitboxLeft(this.x);
    const xr = hitboxRight(this.x, this.width);
    const xm = this.x + this.width / 2;
    return (
      tileMap.getTileAt(xl, fy) === TileId.WATER ||
      tileMap.getTileAt(xm, fy) === TileId.WATER ||
      tileMap.getTileAt(xr, fy) === TileId.WATER
    );
  }

  /**
   * @param {import('../engine/Input.js').FrameInput} inp
   * @param {import('../world/TileMap.js').TileMap} tileMap
   * @param {number} dt
   * @param {{ windLeft?: boolean; faithWater?: boolean; celebrating?: boolean }} [flags]
   */
  update(inp, tileMap, dt, flags = {}) {
    const f = Math.min(dt * 60, 3);

    if (this.celebrateFrames > 0) {
      this.vy += GRAVITY_NORMAL * 0.35 * f;
      this.y += this.vy * f;
      this._resolveY(tileMap);
      this.celebrateFrames--;
      if (this.celebrateFrames === 0) this.winFreeze = true;
      this.animTimer++;
      return;
    }
    if (this.winFreeze) {
      this.animTimer++;
      return;
    }

    this.jumpBuffer = Math.max(0, this.jumpBuffer - 1);
    if (inp.jumpJustPressed) this.jumpBuffer = 8;

    const walk = WALK_SPEED * this._runMul;
    const inWater = this.isInWater(tileMap);
    const feetInWater = this.isFeetInWater(tileMap);
    const canCoyoteJump = this.onGround || this.coyoteTimer > 0;

    if (inWater) {
      if (flags.faithWater) {
        if (inp.right) {
          this.vy -= 0.45 * f;
          this.facing = 'right';
          this.vx += ACCEL * 0.35 * f;
        }
        if (!inp.left && !inp.right) this.vy += 0.1 * f;
      }
      if (inp.left) {
        this.vx -= ACCEL * 0.55 * f;
        this.facing = 'left';
        if (this.vx < -walk) this.vx = -walk;
      } else if (inp.right) {
        this.vx += ACCEL * 0.55 * f;
        this.facing = 'right';
        if (this.vx > walk) this.vx = walk;
      } else {
        this.vx *= Math.pow(0.88, f);
        if (Math.abs(this.vx) < 0.06) this.vx = 0;
      }
      this.vy = Math.min(this.vy + GRAVITY_NORMAL * WATER_GRAVITY_MUL * f, WATER_MAX_SINK);
      if (inp.jumpJustPressed) {
        this.vy = this.character === CharId.JONAH ? WATER_JONAH_SWIM_UP : WATER_SWIM_UP;
      } else if (inp.jump) {
        this.vy += -0.5 * f;
        if (this.vy < WATER_SWIM_UP) this.vy = WATER_SWIM_UP;
      }
    } else if (feetInWater && !inWater) {
      if (inp.left) {
        this.vx -= ACCEL * f * WATER_WADE_VX_MUL;
        this.facing = 'left';
        if (this.vx < -walk) this.vx = -walk;
      } else if (inp.right) {
        this.vx += ACCEL * f * WATER_WADE_VX_MUL;
        this.facing = 'right';
        if (this.vx > walk) this.vx = walk;
      } else {
        const fric = this.onGround ? FRICTION_GROUND : FRICTION_AIR;
        this.vx *= Math.pow(fric, f);
        if (Math.abs(this.vx) < 0.12) this.vx = 0;
      }

      this._applyJumpFromGroundPress(inp, canCoyoteJump);
      this._tryEstherDouble(inp);

      if (this.isJumping && inp.jumpHeld && this.jumpHoldFrames < JUMP_HOLD_MAX && this.vy < 0) {
        this.vy -= JUMP_HOLD_BOOST * f;
        this.jumpHoldFrames++;
      }
      if (!inp.jumpHeld) {
        this.jumpHoldFrames = JUMP_HOLD_MAX;
      }

      this.vy += GRAVITY_NORMAL * 0.85 * f;
      if (this.vy > MAX_FALL * 0.85) this.vy = MAX_FALL * 0.85;
    } else {
      if (inp.left) {
        this.vx -= ACCEL * f;
        this.facing = 'left';
        if (this.vx < -walk) this.vx = -walk;
      } else if (inp.right) {
        this.vx += ACCEL * f;
        this.facing = 'right';
        if (this.vx > walk) this.vx = walk;
      } else {
        const fric = this.onGround ? FRICTION_GROUND : FRICTION_AIR;
        this.vx *= Math.pow(fric, f);
        if (Math.abs(this.vx) < 0.12) this.vx = 0;
      }
      if (flags.windLeft) this.vx -= 0.3 * f;

      this._applyJumpFromGroundPress(inp, canCoyoteJump);
      this._tryEstherDouble(inp);

      if (this.isJumping && inp.jumpHeld && this.jumpHoldFrames < JUMP_HOLD_MAX && this.vy < 0) {
        this.vy -= JUMP_HOLD_BOOST * f;
        this.jumpHoldFrames++;
      }
      if (!inp.jumpHeld) {
        this.jumpHoldFrames = JUMP_HOLD_MAX;
      }

      if (this.vy > 0) {
        this.vy += GRAVITY_FALLING * f;
      } else if (this.vy < 0 && !inp.jumpHeld) {
        this.vy += GRAVITY_FALLING * f;
      } else {
        this.vy += GRAVITY_NORMAL * f;
      }
      if (this.vy > MAX_FALL) this.vy = MAX_FALL;
    }

    this.x += this.vx * f;
    this.resolveHorizontalCollisions(tileMap);

    this.onGround = false;
    const vyBeforeY = this.vy;
    this.y += this.vy * f;
    this._resolveY(tileMap);

    if (!inWater) {
      if (this.jumpBuffer > 0 && this.onGround) {
        this.vy = JUMP_FORCE * this._jumpMul;
        this.jumpBuffer = 0;
        this.onGround = false;
        this.isJumping = true;
        this.doubleJumpUsed = false;
        this.jumpHoldFrames = 0;
        this.coyoteTimer = 0;
        this.y += this.vy * f;
        this._resolveY(tileMap);
      }
    }

    if (this.onGround && vyBeforeY > 8) {
      this.landShakeFrames = 4;
      this.squashFrames = 10;
    }
    if (this.squashFrames > 0) this.squashFrames--;
    if (this.landShakeFrames > 0) this.landShakeFrames--;

    if (this.onGround) {
      this.coyoteTimer = 8;
      this.isJumping = false;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - 1);
    }

    this.animTimer++;

    if (this.invincible > 0) this.invincible--;
    this.visible = this.invincible <= 0 || Math.floor(this.invincible / 4) % 2 === 0;
  }

  /**
   * @param {import('../engine/Input.js').FrameInput} inp
   * @param {boolean} canCoyoteJump
   */
  _applyJumpFromGroundPress(inp, canCoyoteJump) {
    if (!inp.jumpJustPressed) return;
    if (!canCoyoteJump) return;
    this.vy = JUMP_FORCE * this._jumpMul;
    this.isJumping = true;
    this.doubleJumpUsed = false;
    this.jumpHoldFrames = 0;
    this.coyoteTimer = 0;
    this.jumpBuffer = 0;
    // Production build — logs removed
  }

  /**
   * @param {import('../engine/Input.js').FrameInput} inp
   */
  _tryEstherDouble(inp) {
    if (this.character !== CharId.ESTHER) return;
    if (
      inp.jumpJustPressed &&
      !this.onGround &&
      !this.doubleJumpUsed &&
      this.vy > -4
    ) {
      this.vy = JUMP_FORCE * 0.85 * this._jumpMul;
      this.doubleJumpUsed = true;
      this.jumpHoldFrames = 0;
      this.isJumping = true;
    }
  }

  /**
   * Leading-edge horizontal collision (right when vx &gt; 0, left when vx &lt; 0).
   * @param {import('../world/TileMap.js').TileMap} tileMap
   */
  resolveHorizontalCollisions(tileMap) {
    const TILE = 32;
    const W = this.width;
    const H = this.height;
    const offsets = [H * 0.1, H * 0.5, H * 0.85];

    if (this.vx > 0) {
      for (const dy of offsets) {
        const tx = Math.floor((this.x + W) / TILE);
        const ty = Math.floor((this.y + dy) / TILE);
        const id = tileMap.getTileAtTile(tx, ty);
        if (id > 0 && id !== 5) {
          this.x = tx * TILE - W - 0.1;
          this.vx = 0;
          return;
        }
      }
    } else if (this.vx < 0) {
      for (const dy of offsets) {
        const tx = Math.floor(this.x / TILE);
        const ty = Math.floor((this.y + dy) / TILE);
        const id = tileMap.getTileAtTile(tx, ty);
        if (id > 0 && id !== 5) {
          this.x = (tx + 1) * TILE + 0.1;
          this.vx = 0;
          return;
        }
      }
    }
    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }
  }

  /**
   * @param {import('../world/TileMap.js').TileMap} tileMap
   */
  _resolveY(tileMap) {
    const TILE = tileMap.tileSize;
    const W = this.width;
    const H = this.height;

    if (this.vy >= 0) {
      const feetY = this.y + H;
      const checks = [this.x + 4, this.x + W / 2, this.x + W - 4];
      for (const px of checks) {
        const tx = Math.floor(px / TILE);
        const ty = Math.floor(feetY / TILE);
        const id = tileMap.getTileAtTile(tx, ty);
        if (id > 0 && id !== 5) {
          const tileTop = ty * TILE;
          if (feetY > tileTop) {
            this.y = tileTop - H - 0.1;
            this.vy = 0;
            this.onGround = true;
            this.isJumping = false;
            this.doubleJumpUsed = false;
            return;
          }
        }
      }
    } else {
      const checks = [this.x + 4, this.x + W - 4];
      for (const px of checks) {
        const tx = Math.floor(px / TILE);
        const ty = Math.floor(this.y / TILE);
        const id = tileMap.getTileAtTile(tx, ty);
        if (id > 0 && id !== 5) {
          this.y = (ty + 1) * TILE + 0.1;
          this.vy = 1;
          return;
        }
      }
    }
  }

  takeDamage(amount) {
    if (this.invincible > 0) return false;
    this.health -= amount;
    this.invincible = 90;
    return true;
  }

  heal(n) {
    this.health = Math.min(this.maxHealth, this.health + n);
  }

  displayName() {
    const id = this.character.replace('_', ' ').toUpperCase();
    if (this.character === 'joshua_hero') return 'JOSHUA';
    return id.split(' ')[0];
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {{x:number;y:number}} camera
   */
  draw(ctx, camera) {
    if (!this.visible) return;
    const idleBob =
      Math.sin(this.animTimer * 0.08) * (this.onGround && Math.abs(this.vx) < 0.1 ? 2 : 0);
    const runBob =
      !this.onGround ? 0 : Math.sin(this.animTimer * 0.25) * (Math.abs(this.vx) > 0.5 ? 3 : 0);
    const bx = this.x + this.drawOffsetX - camera.x;
    const by = this.y + this.drawOffsetY - camera.y + idleBob + runBob;
    const hurt = this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 1;
    const air = !this.onGround;
    const moving = this.onGround && Math.abs(this.vx) > 0.5;
    const walkFrame = moving ? Math.floor(this.animTimer / 8) % 4 : 0;
    const displayFrame = air ? 3 : walkFrame;

    const sq = this.squashFrames / 10;
    const squashX = 1 + 0.2 * sq;
    const squashY = 1 - 0.2 * sq;
    const cx = bx + this.spriteW / 2;
    const cy = by + this.spriteH / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(squashX, squashY);
    ctx.scale(this.spriteW / CHAR_DRAW_W, this.spriteH / CHAR_DRAW_H);
    ctx.translate(-CHAR_DRAW_W / 2, -CHAR_DRAW_H / 2);
    drawCharacter(ctx, this.character, 0, 0, this.facing, displayFrame, {
      hurt,
      jump: air,
      label: '',
    });
    ctx.restore();

    const name = this.displayName();
    const ncx = bx + this.spriteW / 2;
    const labelY = by - 12;
    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.strokeText(name, ncx, labelY);
    ctx.fillStyle = 'white';
    ctx.fillText(name, ncx, labelY);
  }
}
