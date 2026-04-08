import { TileMap } from './TileMap.js';
import { getLevelDefinition } from './levelDefinitions.js';

/**
 * Level data + tile map. World decorations are drawn in BackgroundLayers.js from tile surfaces.
 * @typedef {object} LevelData
 * @property {number} index
 * @property {string} name
 * @property {string} bibleStory
 * @property {string} character
 * @property {number} width
 * @property {number} height
 * @property {number[][]} tiles
 * @property {number} startX
 * @property {number} startY
 * @property {number} exitX
 * @property {number} exitY
 * @property {string} mode
 * @property {object[]} enemies
 * @property {object[]} items
 * @property {{ skyTop: string; skyBot: string; parallax: string }} background
 * @property {object} [flags]
 * @property {{x:number;y:number}[]} [prayerSpots]
 */

export class Level {
  /**
   * @param {number} index
   */
  constructor(index) {
    /** @type {LevelData} */
    this.data = JSON.parse(JSON.stringify(getLevelDefinition(index)));
    this.tileMap = new TileMap(this.data.width, this.data.height, this.data.tiles);
  }

  get name() {
    return this.data.name;
  }

  get bibleStory() {
    return this.data.bibleStory;
  }

  get widthPx() {
    return this.data.width * this.tileMap.tileSize;
  }

  get heightPx() {
    return this.data.height * this.tileMap.tileSize;
  }

  /**
   * Tile at grid cell — delegates to {@link TileMap#getTileAtTile} (bounds-safe bedrock/air).
   * @param {number} tx
   * @param {number} ty
   */
  getTileAtTile(tx, ty) {
    return this.tileMap.getTileAtTile(tx, ty);
  }
}
