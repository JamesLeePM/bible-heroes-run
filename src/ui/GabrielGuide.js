import { gabrielSeen, setGabrielSeen } from '../game/storage.js';

const STEPS = [
  'Hi! I am Gabriel. Use ◀ and ▶ to move!',
  'Tap the green button to JUMP over gaps!',
  'Collect shining STARS for points!',
  'Tap ⚡ for your special Bible power!',
  'Find SCROLLS to learn verses!',
  'Great job! God loves brave hearts!',
];

const BOX_W = 300;
const BOX_H = 100;
const AUTO_DISMISS_SEC = 4;

export class GabrielGuide {
  constructor() {
    this.step = 0;
    /** Tutorial finished — from storage or dismiss */
    this.dismissed = gabrielSeen();
    this.elapsed = 0;
    this.onDone = null;
  }

  /** @returns {boolean} */
  isActive() {
    return !this.dismissed;
  }

  dismiss() {
    if (this.dismissed) return;
    this.dismissed = true;
    setGabrielSeen();
    if (this.onDone) this.onDone();
  }

  /** @param {number} dt */
  tick(dt) {
    if (this.dismissed) return;
    this.elapsed += dt;
    if (this.elapsed >= AUTO_DISMISS_SEC) this.dismiss();
  }

  /** @param {CanvasRenderingContext2D} ctx @param {HTMLCanvasElement} canvas */
  draw(ctx, canvas) {
    if (this.dismissed) return;

    const w = Math.min(BOX_W, canvas.width - 20);
    const h = BOX_H;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.fillRect(10, 10, w, h);
    ctx.strokeRect(10, 10, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('👼 Gabriel', 22, 32);
    ctx.font = '8px "Press Start 2P", monospace';
    const text = STEPS[this.step] || '';
    ctx.fillText(text, 22, 54);
    ctx.fillStyle = '#8fd';
    ctx.fillText('TAP anywhere to close', 22, 88);
    ctx.restore();
  }

  /** @param {number} x @param {number} y */
  tap(x, y) {
    if (this.dismissed) return false;
    this.dismiss();
    return true;
  }
}
