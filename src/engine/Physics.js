import { isSolidTile } from '../game/constants.js';
import { TileId } from '../game/constants.js';

/** @typedef {import('../world/TileMap.js').TileMap} TileMap */

/** Inset from hitbox edges for probe samples (matches Player collision margins). */
export const HITBOX_INSET = 2;

/** Default world hitbox (matches Player body AABB; sprite is drawn larger with offsets). */
export const DEFAULT_HITBOX_W = 28;
export const DEFAULT_HITBOX_H = 44;

export const GRAVITY = 0.5;
export const MAX_FALL_SPEED = 12;
export const FRICTION = 0.85;

/** @param {number} x @param {number} w */
export function hitboxLeft(x) {
  return x + HITBOX_INSET;
}

/** @param {number} x @param {number} w */
export function hitboxRight(x, w) {
  return x + w - HITBOX_INSET;
}

export class PhysicsBody {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
  }

  applyGravity() {
    this.vy = Math.min(this.vy + GRAVITY, MAX_FALL_SPEED);
  }

  applyFriction() {
    this.vx *= FRICTION;
    if (Math.abs(this.vx) < 0.01) this.vx = 0;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * @param {TileMap} tileMap
   */
  checkTileCollision(tileMap) {
    this.onGround = false;
    const ts = tileMap.tileSize;

    let newX = this.x + this.vx;
    let newY = this.y + this.vy;

    const resolveAxisX = () => {
      const minTx = Math.floor(newX / ts);
      const maxTx = Math.floor((newX + this.width - 0.001) / ts);
      const minTy = Math.floor(this.y / ts);
      const maxTy = Math.floor((this.y + this.height - 0.001) / ts);

      for (let ty = minTy; ty <= maxTy; ty++) {
        for (let tx = minTx; tx <= maxTx; tx++) {
          const id = tileMap.getTileAtTile(tx, ty);
          if (isSolidTile(id)) {
            if (this.vx > 0) {
              newX = tx * ts - this.width - 0.01;
              this.vx = 0;
            } else if (this.vx < 0) {
              newX = (tx + 1) * ts + 0.01;
              this.vx = 0;
            }
            return;
          }
        }
      }
    };

    const resolveAxisY = () => {
      const minTx = Math.floor(newX / ts);
      const maxTx = Math.floor((newX + this.width - 0.001) / ts);
      const minTy = Math.floor(newY / ts);
      const maxTy = Math.floor((newY + this.height - 0.001) / ts);

      for (let ty = minTy; ty <= maxTy; ty++) {
        for (let tx = minTx; tx <= maxTx; tx++) {
          const id = tileMap.getTileAtTile(tx, ty);
          if (isSolidTile(id)) {
            if (this.vy > 0) {
              newY = ty * ts - this.height - 0.01;
              this.vy = 0;
              this.onGround = true;
            } else if (this.vy < 0) {
              newY = (ty + 1) * ts + 0.01;
              this.vy = 0;
            }
            return;
          }
        }
      }
    };

    newX = this.x + this.vx;
    resolveAxisX();
    this.x = newX;

    newY = this.y + this.vy;
    resolveAxisY();
    this.y = newY;
  }

  /**
   * @param {TileMap} tileMap
   * @returns {boolean}
   */
  isInWater(tileMap) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    return tileMap.getTileAt(cx, cy) === TileId.WATER;
  }
}
