export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Smooth Mario-style follow. levelW / levelH in **pixels**.
   * @param {import('../characters/Player.js').Player} player
   * @param {number} canvasW
   * @param {number} canvasH
   * @param {number} levelW
   * @param {number} levelH
   */
  update(player, canvasW, canvasH, levelW, levelH) {
    const targetX = player.x + player.width / 2 - canvasW / 3;
    const targetY = player.y + player.height / 2 - canvasH / 2;

    this.x += (targetX - this.x) * 0.1;
    this.y += (targetY - this.y) * 0.08;

    this.x = Math.max(0, Math.min(this.x, levelW - canvasW));
    this.y = Math.max(0, Math.min(this.y, levelH - canvasH));
    if (this.y < 0) this.y = 0;
  }

  /**
   * Instant snap (e.g. coop second cam) — optional use
   */
  followInstant(targetX, targetY, viewW, viewH, mapW, mapH, targetW = 16, targetH = 26) {
    this.x = targetX + targetW / 2 - viewW / 3;
    this.y = targetY + targetH / 2 - viewH / 2;
    this.x = Math.max(0, Math.min(mapW - viewW, this.x));
    this.y = Math.max(0, Math.min(mapH - viewH, this.y));
  }
}
