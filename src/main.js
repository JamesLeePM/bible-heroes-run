import { downloadIcon } from './assets/generateIcon.js';

const splash = document.getElementById('splash');
const splashBar = document.getElementById('splash-bar');

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

function setSplashProgress(pct) {
  if (splashBar) splashBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

async function boot() {
  let fake = 0;
  const tick = window.setInterval(() => {
    fake = Math.min(92, fake + 6 + Math.random() * 4);
    setSplashProgress(fake);
  }, 45);

  try {
    const { Game } = await import('./game/Game.js');
    setSplashProgress(100);
    const game = new Game(canvas, ctx);
    game.start();
  } catch (e) {
    console.error('Failed to start game:', e);
    setSplashProgress(100);
  } finally {
    window.clearInterval(tick);
  }

  window.setTimeout(() => {
    splash?.classList.add('hidden');
  }, 380);
}

boot();

if (import.meta.env.DEV) {
  const iconBtn = document.getElementById('icon-btn');
  if (iconBtn) {
    iconBtn.style.display = 'block';
    iconBtn.addEventListener('click', () => downloadIcon());
  }
}
