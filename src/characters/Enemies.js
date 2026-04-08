import { EnemyType } from '../game/constants.js';
import { settings } from '../ui/SettingsMenu.js';

/** @returns {number} */
function difficultySpeedMult() {
  return { EASY: 0.5, NORMAL: 1.0, HARD: 1.6 }[settings.settings.difficulty] ?? 1.0;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} px
 * @param {number} py
 * @param {number} w
 * @param {number} h
 * @param {number} frame
 */
function drawSnake(ctx, px, py, w, h, frame) {
  ctx.fillStyle = '#22CC22';
  ctx.fillRect(px, py + h * 0.35, w * 0.85, h * 0.45);
  ctx.beginPath();
  ctx.arc(px + w * 0.92, py + h * 0.55, h * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a991a';
  ctx.fillRect(px + w * 0.15, py + h * 0.4, w * 0.5, h * 0.15);
  const flick = Math.sin(frame * 0.25) * 4;
  ctx.fillStyle = '#CC2222';
  ctx.fillRect(px + w * 0.95 + flick, py + h * 0.48, 8, 4);
}

function drawPhilistine(ctx, px, py, w, h) {
  ctx.fillStyle = '#AA2222';
  ctx.fillRect(px + w * 0.2, py + h * 0.15, w * 0.6, h * 0.55);
  ctx.fillStyle = '#882020';
  ctx.fillRect(px + w * 0.35, py + h * 0.7, w * 0.3, h * 0.28);
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(px + w * 0.85, py + h * 0.35, w * 0.2, h * 0.08);
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px + w * 0.95, py + h * 0.39);
  ctx.lineTo(px + w * 1.15, py + h * 0.5);
  ctx.stroke();
}

function drawPharaoh(ctx, px, py, w, h) {
  ctx.fillStyle = '#2244AA';
  ctx.fillRect(px + w * 0.15, py + h * 0.22, w * 0.7, h * 0.55);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(px + w * 0.25, py, w * 0.5, h * 0.18);
  ctx.fillStyle = '#DAA520';
  ctx.beginPath();
  ctx.moveTo(px + w * 0.5, py);
  ctx.lineTo(px + w * 0.35, py - h * 0.12);
  ctx.lineTo(px + w * 0.65, py - h * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.fillRect(px + w * 0.38, py + h * 0.32, w * 0.1, h * 0.08);
  ctx.fillRect(px + w * 0.52, py + h * 0.32, w * 0.1, h * 0.08);
}

function drawLion(ctx, px, py, w, h) {
  ctx.fillStyle = '#DAA520';
  ctx.beginPath();
  ctx.ellipse(px + w * 0.45, py + h * 0.55, w * 0.4, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a2c0a';
  ctx.beginPath();
  ctx.arc(px + w * 0.45, py + h * 0.35, w * 0.42, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(px + w * 0.62, py + h * 0.48, w * 0.12, h * 0.1);
  ctx.fillStyle = '#222';
  ctx.fillRect(px + w * 0.35, py + h * 0.62, w * 0.35, h * 0.06);
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(px + w * 0.32 + i * w * 0.08, py + h * 0.68, w * 0.05, h * 0.04);
  }
}

function drawGoliath(ctx, px, py, w, h) {
  ctx.fillStyle = '#6a6a70';
  ctx.fillRect(px + w * 0.15, py + h * 0.2, w * 0.7, h * 0.55);
  ctx.fillStyle = '#888';
  ctx.fillRect(px + w * 0.2, py + h * 0.75, w * 0.25, h * 0.22);
  ctx.fillRect(px + w * 0.55, py + h * 0.75, w * 0.25, h * 0.22);
  ctx.fillStyle = '#444';
  ctx.fillRect(px + w * 0.35, py + h * 0.08, w * 0.3, h * 0.15);
}

function drawWhale(ctx, px, py, w, h) {
  ctx.fillStyle = '#2266AA';
  ctx.beginPath();
  ctx.ellipse(px + w * 0.45, py + h * 0.5, w * 0.48, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a5088';
  ctx.fillRect(px + w * 0.72, py + h * 0.35, w * 0.22, h * 0.35);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(px + w * 0.78 + i * 4, py + h * 0.42, 3, 6);
  }
  ctx.fillStyle = '#4488CC';
  ctx.beginPath();
  ctx.moveTo(px + w * 0.02, py + h * 0.5);
  ctx.quadraticCurveTo(px - w * 0.08, py + h * 0.35, px + w * 0.05, py + h * 0.25);
  ctx.lineTo(px + w * 0.12, py + h * 0.45);
  ctx.closePath();
  ctx.fill();
}

function drawJellyfish(ctx, px, py, w, h, frame) {
  const bob = Math.sin(frame * 0.08) * 3;
  ctx.fillStyle = 'rgba(200,100,220,0.85)';
  ctx.beginPath();
  ctx.arc(px + w / 2, py + h * 0.25 + bob, w * 0.45, Math.PI, 0);
  ctx.lineTo(px + w * 0.9, py + h * 0.45 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8844AA';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const ox = px + w * 0.2 + i * w * 0.15;
    ctx.beginPath();
    ctx.moveTo(ox, py + h * 0.45 + bob);
    ctx.lineTo(ox + Math.sin(frame * 0.1 + i) * 4, py + h * 0.95 + bob);
    ctx.stroke();
  }
}

function drawArcher(ctx, px, py, w, h) {
  ctx.fillStyle = '#6B4423';
  ctx.fillRect(px + w * 0.25, py + h * 0.2, w * 0.45, h * 0.55);
  ctx.fillStyle = '#4a3018';
  ctx.fillRect(px + w * 0.35, py + h * 0.75, w * 0.15, h * 0.22);
  ctx.fillRect(px + w * 0.5, py + h * 0.75, w * 0.15, h * 0.22);
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(px + w * 0.2, py + h * 0.45, h * 0.35, -0.4, 0.8);
  ctx.stroke();
}

function drawGuard(ctx, px, py, w, h) {
  ctx.fillStyle = '#AA2222';
  ctx.fillRect(px + w * 0.18, py + h * 0.18, w * 0.64, h * 0.58);
  ctx.fillStyle = '#333';
  ctx.fillRect(px + w * 0.35, py + h * 0.72, w * 0.12, h * 0.26);
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(px + w * 0.55, py + h * 0.35, w * 0.08, h * 0.35);
}

export class Enemy {
  /**
   * @param {object} def
   */
  constructor(def) {
    this.type = def.type;
    this.x = def.x;
    this.y = def.y;
    this.vx = 1.2;
    this.vy = 0;
    this.width = 52;
    this.height = 64;
    this.patrolLeft = def.patrolL ?? def.x - 120;
    this.patrolRight = def.patrolR ?? def.x + 120;
    this.health = 1;
    this.maxHealth = 1;
    this.frame = 0;
    this.dead = false;
    this.flash = 0;
    this.stun = 0;
    this.facing = 1;
    this._pounceCd = 0;
    this._spearCd = 0;
    this.phase = 1;
    this.frozen = false;
    this.friendly = false;
    this.friendTimer = 0;
    this._graceSlow = 0;
    this.seesPlayer = false;

    switch (this.type) {
      case EnemyType.SNAKE:
        this.width = 48;
        this.height = 24;
        break;
      case EnemyType.PHILISTINE:
        this.width = 52;
        this.height = 64;
        break;
      case EnemyType.PHARAOH:
        this.width = 56;
        this.height = 72;
        this.health = 2;
        this.maxHealth = 2;
        break;
      case EnemyType.LION:
        this.width = 64;
        this.height = 48;
        this.health = 2;
        this.maxHealth = 2;
        break;
      case EnemyType.GOLIATH:
        this.width = 96;
        this.height = 128;
        this.health = 10;
        this.maxHealth = 10;
        this.vx = 0.8;
        break;
      case EnemyType.WHALE:
        this.width = 128;
        this.height = 80;
        this.health = 999;
        this.maxHealth = 999;
        break;
      case EnemyType.JELLYFISH:
        this.width = 40;
        this.height = 40;
        break;
      case EnemyType.ARCHER:
        this.width = 48;
        this.height = 64;
        break;
      case EnemyType.GUARD:
        this.width = 52;
        this.height = 64;
        break;
      default:
        break;
    }
  }

  /**
   * @param {import('./Player.js').Player} player
   * @param {import('../world/TileMap.js').TileMap} map
   */
  update(player, map) {
    if (this.dead) return;
    this.frame++;
    this.seesPlayer =
      Math.abs(player.x - this.x) < 260 && Math.abs(player.y - this.y) < 160;
    if (this.frozen) return;

    const diffMult = difficultySpeedMult();
    if (this.flash > 0) this.flash--;
    if (this.stun > 0) {
      this.stun--;
      return;
    }

    if (this.friendTimer > 0) {
      this.friendTimer--;
      if (this.friendTimer === 0) this.friendly = false;
    }
    const slowMul = this._graceSlow > 0 ? 0.45 : 1;
    if (this._graceSlow > 0) this._graceSlow--;

    if (this.type === EnemyType.GOLIATH) {
      this._updateGoliath(player, map, slowMul * diffMult);
      return;
    }
    if (this.type === EnemyType.WHALE) {
      this._updateWhale(player, slowMul * diffMult);
      return;
    }
    if (this.type === EnemyType.PHARAOH) {
      const dx = player.x - this.x;
      if (Math.abs(dx) < 300) {
        this.vx = dx > 0 ? 2.2 : -2.2;
      } else {
        this.patrol();
      }
      this.x += this.vx * slowMul * diffMult;
      this.clampPatrol();
      return;
    }
    if (this.type === EnemyType.LION) {
      if (this.friendly) {
        const dx = player.x - this.x;
        this.x += Math.sign(dx) * Math.min(3, Math.abs(dx) * 0.06) * slowMul * diffMult;
        this.vy += 0.5;
        this.y += this.vy;
        if (this.y > 400) this.y = 400;
        return;
      }
      this._pounceCd--;
      const dx = player.x - this.x;
      if (this._pounceCd <= 0 && Math.abs(dx) < 200) {
        this.vy = -10;
        this.vx = dx > 0 ? 5 : -5;
        this._pounceCd = 120;
      }
      this.vy += 0.5;
      this.x += this.vx * slowMul * diffMult;
      this.y += this.vy;
      if (this.y > 400) this.y = 400;
      return;
    }
    if (this.type === EnemyType.SNAKE) {
      this.patrol();
      this.x += this.vx * slowMul * diffMult;
      if (Math.abs(player.x - this.x) < 40 && Math.abs(player.y - this.y) < 40) {
        this.vy = -6;
      }
      this.y += this.vy;
      this.vy *= 0.9;
      this.clampPatrol();
      return;
    }
    if (this.type === EnemyType.JELLYFISH) {
      this.x += Math.sin(this.frame * 0.03) * 0.5 * slowMul * diffMult;
      this.y += Math.sin(this.frame * 0.08) * 0.8 * slowMul * diffMult;
      this.clampPatrol();
      return;
    }
    if (this.type === EnemyType.ARCHER) {
      this._spearCd--;
      if (Math.abs(player.x - this.x) < 220 && this._spearCd <= 0) {
        this._spearCd = 90;
      }
      return;
    }

    this.patrol();
    this.x += this.vx * slowMul * diffMult;
    this.clampPatrol();

    this._spearCd--;
    if (
      this.type === EnemyType.PHILISTINE &&
      Math.abs(player.x - this.x) < 200 &&
      this._spearCd <= 0
    ) {
      this._spearCd = 120;
    }
  }

  patrol() {
    this.x += this.vx;
    if (this.x < this.patrolLeft) {
      this.x = this.patrolLeft;
      this.vx = Math.abs(this.vx);
    }
    if (this.x > this.patrolRight) {
      this.x = this.patrolRight;
      this.vx = -Math.abs(this.vx);
    }
  }

  clampPatrol() {
    this.x = Math.max(this.patrolLeft, Math.min(this.patrolRight, this.x));
  }

  /**
   * @param {import('./Player.js').Player} player
   * @param {import('../world/TileMap.js').TileMap} map
   * @param {number} [slowMul]
   */
  _updateGoliath(player, map, slowMul = 1) {
    this.phase = this.health > 5 ? 1 : 2;
    const dx = player.x - this.x;
    if (this.phase === 1) {
      this.x += (dx > 0 ? 1.2 : -1.2) * slowMul;
    } else {
      this.x += Math.sin(this.frame * 0.05) * 2 * slowMul;
      if (this.frame % 90 === 0) {
        this.vy = -4;
      }
    }
    this.y += this.vy;
    this.vy += 0.4;
    const ground = 15 * 32;
    if (this.y > ground) {
      this.y = ground;
      this.vy = 0;
    }
    this.x = Math.max(map.tileSize, Math.min(map.width * map.tileSize - this.width, this.x));
  }

  /** @param {import('./Player.js').Player} player @param {number} [slowMul] */
  _updateWhale(player, slowMul = 1) {
    this.x += Math.sin(this.frame * 0.02) * 3 * slowMul;
    this.y += Math.cos(this.frame * 0.015) * 1.5 * slowMul;
    const dx = player.x - this.x;
    this.x += (dx > 0 ? 0.4 : -0.4) * slowMul;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {{x:number;y:number}} camera
   */
  draw(ctx, camera) {
    if (this.dead) return;
    const px = this.x - camera.x;
    const py = this.y - camera.y;
    const w = this.width;
    const h = this.height;

    if (this.flash > 0 && this.flash % 4 < 2) {
      ctx.filter = 'brightness(1.8)';
    }

    switch (this.type) {
      case EnemyType.SNAKE:
        drawSnake(ctx, px, py, w, h, this.frame);
        break;
      case EnemyType.PHARAOH:
        drawPharaoh(ctx, px, py, w, h);
        break;
      case EnemyType.LION:
        drawLion(ctx, px, py, w, h);
        break;
      case EnemyType.GOLIATH:
        drawGoliath(ctx, px, py, w, h);
        break;
      case EnemyType.WHALE:
        drawWhale(ctx, px, py, w, h);
        break;
      case EnemyType.JELLYFISH:
        drawJellyfish(ctx, px, py, w, h, this.frame);
        break;
      case EnemyType.ARCHER:
        drawArcher(ctx, px, py, w, h);
        break;
      case EnemyType.GUARD:
        drawGuard(ctx, px, py, w, h);
        break;
      default:
        drawPhilistine(ctx, px, py, w, h);
        break;
    }

    ctx.filter = 'none';

    ctx.fillStyle = '#fff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(this.type, px + w / 2, py - 4);

    if (this.type === EnemyType.GOLIATH || this.type === EnemyType.WHALE) {
      ctx.fillStyle = '#CC0000';
      ctx.fillRect(px, py - 20, w, 8);
      ctx.fillStyle = '#00CC00';
      ctx.fillRect(px, py - 20, w * (this.health / this.maxHealth), 8);
    }

    if (this.seesPlayer) {
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('!', px + w / 2, py - 22);
    }

    if (this.stun > 0) {
      const stars = ['★', '☆', '★'];
      ctx.font = '12px monospace';
      ctx.fillStyle = '#FFD700';
      const t = Date.now() / 200;
      stars.forEach((s, i) => {
        const angle = (t + i * 2) % (Math.PI * 2);
        ctx.fillText(s, px + w / 2 + Math.cos(angle) * 16, py - 16 + Math.sin(angle) * 8);
      });
    }

    if (this.frozen) {
      ctx.fillStyle = 'rgba(136,204,255,0.4)';
      ctx.fillRect(px, py, w, h);
      ctx.fillStyle = '#88CCFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❄️', px + w / 2, py + h / 2);
    }
  }
}

/**
 * @param {object[]} defs
 * @returns {Enemy[]}
 */
export function spawnEnemies(defs) {
  return defs.map((d) => new Enemy(d));
}
