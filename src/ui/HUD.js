import { drawCharacter } from '../assets/SpriteSheet.js';

function drawHeartShape(ctx, x, y, size, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 28, size / 28);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(14, 24);
  ctx.bezierCurveTo(4, 14, 4, 6, 14, 10);
  ctx.bezierCurveTo(24, 6, 24, 14, 14, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

export class HUD {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
  }

  /**
   * @param {object} state
   * @param {import('../characters/Player.js').Player} state.player
   * @param {string} state.levelName
   * @param {number} [state.frame]
   */
  draw(ctx, state) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const barH = 56;
    const frame = state.frame ?? 0;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, barH);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, barH);
    ctx.lineTo(w, barH);
    ctx.stroke();

    let hx = 56;
    for (let i = 0; i < state.player.maxHealth; i++) {
      const filled = i < state.player.health;
      drawHeartShape(ctx, hx, 18, 28, filled ? '#e02040' : '#444');
      hx += 36;
    }

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 40, 40);
    drawCharacter(ctx, state.player.character, 8, 8, 'right', 0, {
      portrait: true,
      label: '',
    });

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    const name = state.player.displayName
      ? state.player.displayName()
      : state.player.character.toUpperCase();
    ctx.strokeText(name, 28, 52);
    ctx.fillText(name, 28, 52);

    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctx.strokeText(state.levelName, w / 2, barH / 2);
    ctx.fillStyle = '#FFD700';
    ctx.fillText(state.levelName, w / 2, barH / 2);

    const starLabel =
      state.coopStars != null ? String(state.coopStars) : String(state.player.stars);
    ctx.textAlign = 'right';
    ctx.save();
    ctx.translate(w - 36, barH / 2);
    ctx.rotate(Math.sin(frame * 0.08) * 0.15);
    ctx.font = '22px sans-serif';
    ctx.fillText('⭐', 0, 0);
    ctx.restore();
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(starLabel, w - 48, barH / 2);

    ctx.textAlign = 'left';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`📜 x${state.player.scrolls}`, w / 2 - 30, barH + 16);

    if (state.lives != null) {
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(`♥×${state.lives}`, 200, barH + 16);
    }

    ctx.restore();
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} o
   * @param {number} o.stars
   * @param {string} o.verse
   * @param {number} o.frame
   * @param {number} o.levelIndex
   */
  drawLevelComplete(ctx, o) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 215, 0, 0.88)';
    ctx.fillRect(0, 0, w, h);
    const bounce = Math.sin(o.frame * 0.12) * 8;
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctx.strokeText('LEVEL COMPLETE!', w / 2, h * 0.22 + bounce);
    ctx.fillStyle = '#fff';
    ctx.fillText('LEVEL COMPLETE!', w / 2, h * 0.22 + bounce);

    for (let i = 0; i < 3; i++) {
      const show = o.frame > 20 + i * 25;
      const sx = w / 2 - 60 + i * 60;
      ctx.globalAlpha = show ? 1 : 0.2;
      ctx.font = '40px sans-serif';
      ctx.fillStyle = i < o.stars ? '#ffd700' : '#555';
      ctx.fillText('⭐', sx, h * 0.38);
    }
    ctx.globalAlpha = 1;

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#1a1a1a';
    const lines = o.verse.match(/.{1,48}/g) || [o.verse];
    let ly = h * 0.52;
    for (const ln of lines) {
      ctx.fillText(ln, w / 2, ly);
      ly += 16;
    }

    ctx.fillStyle = '#222';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('NEXT LEVEL ▶ (tap)', w / 2, h * 0.72);
    ctx.fillText('MENU (tap lower)', w / 2, h * 0.8);
    ctx.restore();
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} frame
   */
  drawGameOver(ctx, frame) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.save();
    ctx.fillStyle = 'rgba(120, 20, 20, 0.92)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
    const t = "DON'T GIVE UP!";
    ctx.strokeText(t, w / 2, h * 0.28);
    ctx.fillText(t, w / 2, h * 0.28);

    ctx.font = '8px "Press Start 2P", monospace';
    const msg =
      "Gabriel: Even David fell down and got back up! Try again!";
    ctx.fillText(msg, w / 2, h * 0.42);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('TRY AGAIN (tap)', w / 2, h * 0.62);
    ctx.fillText('MENU (tap lower)', w / 2, h * 0.72);
    ctx.restore();
  }
}
