/**
 * Programmatic App Store icon (1024×1024 PNG via data URL).
 */

export function generateAppIcon() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const bg = ctx.createLinearGradient(0, 0, 0, 1024);
  bg.addColorStop(0, '#1a0a3e');
  bg.addColorStop(0.5, '#2d1b6e');
  bg.addColorStop(1, '#1a3a1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.fillStyle = 'rgba(255,215,0,0.1)';
  ctx.beginPath();
  ctx.arc(512, 512, 400, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,215,0,0.3)';
  ctx.fillRect(462, 200, 100, 624);
  ctx.fillRect(262, 350, 500, 100);

  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 16;
  ctx.font = 'bold 160px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('BIBLE', 512, 380);
  ctx.fillText('BIBLE', 512, 380);

  ctx.font = 'bold 200px "Press Start 2P", monospace';
  ctx.strokeText('RUN', 512, 600);
  ctx.fillText('RUN', 512, 600);

  const S = 24;
  const cx = 512;
  const cy = 750;
  ctx.fillStyle = '#FDBCB4';
  ctx.fillRect(cx - S, cy - S * 4, S * 2, S * 2);
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(cx - S * 1.5, cy - S * 2, S * 3, S * 3);
  ctx.fillRect(cx - S, cy + S, S * 0.8, S * 1.5);
  ctx.fillRect(cx + S * 0.2, cy + S, S * 0.8, S * 1.5);

  ctx.fillStyle = '#FFD700';
  ctx.font = '80px serif';
  ctx.textAlign = 'center';
  ctx.fillText('⭐', 180, 900);
  ctx.fillText('⭐', 780, 900);

  const border = ctx.createLinearGradient(0, 0, 1024, 1024);
  border.addColorStop(0, '#FFD700');
  border.addColorStop(0.5, '#CC8800');
  border.addColorStop(1, '#FFD700');
  ctx.strokeStyle = border;
  ctx.lineWidth = 24;
  ctx.beginPath();
  const r = 180;
  const x = 12;
  const y = 12;
  const w = 1000;
  const h = 1000;
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

export function downloadIcon() {
  const url = generateAppIcon();
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AppIcon-1024.png';
  a.click();
}
