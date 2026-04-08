import { drawTile } from '../assets/SpriteSheet.js';
import { TileId } from '../game/constants.js';

export class TileMap {
  /**
   * @param {number} widthTiles
   * @param {number} heightTiles
   * @param {number[][]} tiles
   */
  constructor(widthTiles, heightTiles, tiles) {
    this.width = widthTiles;
    this.height = heightTiles;
    this.tiles = tiles;
    this.tileSize = 32;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {{ x: number; y: number }} camera
   */
  render(ctx, camera) {
    const ts = this.tileSize;
    const vw = ctx.canvas.width;
    const vh = ctx.canvas.height;
    const startX = Math.floor(camera.x / ts);
    const startY = Math.floor(camera.y / ts);
    const endX = Math.ceil((camera.x + vw) / ts) + 1;
    const endY = Math.ceil((camera.y + vh) / ts) + 1;

    for (let ty = Math.max(0, startY); ty < Math.min(this.height, endY); ty++) {
      const row = this.tiles[ty];
      if (!row) continue;
      for (let tx = Math.max(0, startX); tx < Math.min(this.width, endX); tx++) {
        const id = row[tx];
        if (id === 0) continue;
        const wx = tx * ts - camera.x;
        const wy = ty * ts - camera.y;
        drawTile(ctx, id, wx, wy, 1);
      }
    }
  }

  /** @param {number} worldX @param {number} worldY */
  getTileAt(worldX, worldY) {
    const tx = Math.floor(worldX / this.tileSize);
    const ty = Math.floor(worldY / this.tileSize);
    return this.getTileAtTile(tx, ty);
  }

  /** @param {number} tx @param {number} ty */
  getTileAtTile(tx, ty) {
    if (ty < 0) return TileId.AIR;
    /* Bedrock below level — solid (TileId.STONE; user doc "2" maps to grass in other schemes) */
    if (ty >= this.height) return TileId.STONE;
    if (tx < 0 || tx >= this.width) return TileId.STONE;
    const row = this.tiles[ty];
    if (!row) return TileId.AIR;
    return row[tx] ?? TileId.AIR;
  }

  /** @param {number} worldX @param {number} worldY @param {number} tileId */
  setTileAt(worldX, worldY, tileId) {
    const tx = Math.floor(worldX / this.tileSize);
    const ty = Math.floor(worldY / this.tileSize);
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return;
    if (!this.tiles[ty]) return;
    this.tiles[ty][tx] = tileId;
  }

  /** @param {number} tx @param {number} ty @param {number} tileId */
  setTileAtTile(tx, ty, tileId) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return;
    this.tiles[ty][tx] = tileId;
  }
}
