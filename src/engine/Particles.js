export class Particle {
  constructor(x, y, vx, vy, life, maxLife, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = maxLife;
    this.color = color;
    this.size = size;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.life--;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    const a = this.life / this.maxLife;
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * a, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  constructor() {
    /** @type {Particle[]} */
    this.particles = [];
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {object} options
   */
  emit(x, y, options) {
    const kind = options.kind || 'burst';
    if (kind === 'star') return starCollect(this, x, y, options);
    if (kind === 'scroll') return scrollCollect(this, x, y);
    if (kind === 'jump') return playerJump(this, x, y);
    if (kind === 'land') return playerLand(this, x, y);
    if (kind === 'enemy') return enemyDeath(this, x, y);
    if (kind === 'boss') return bossDefeated(this, x, y);
    if (kind === 'level') return levelComplete(this, x, y);
    if (kind === 'wall') return wallCrumble(this, x, y);
    if (kind === 'splash') return waterSplash(this, x, y);
    if (kind === 'confetti') {
      const life = options.life ?? 90;
      const maxLife = life;
      this.particles.push(
        new Particle(
          x,
          y,
          options.vx ?? 0,
          options.vy ?? 0,
          life,
          maxLife,
          options.color ?? '#ffd700',
          options.size ?? 6,
        ),
      );
      return;
    }
    if (kind === 'special') {
      const color = options.color ?? '#ffd700';
      const n = options.count ?? 12;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n;
        this.particles.push(
          new Particle(x, y, Math.cos(a) * 2, Math.sin(a) * 2, 20, 20, color, 4),
        );
      }
      return;
    }
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      this.particles.push(
        new Particle(
          x,
          y,
          Math.cos(a) * 3,
          Math.sin(a) * 3,
          30,
          30,
          '#ffd700',
          4,
        ),
      );
    }
  }

  update() {
    for (const p of this.particles) p.update();
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  clear() {
    this.particles = [];
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    for (const p of this.particles) p.draw(ctx);
  }
}

/** @param {ParticleSystem} sys */
function starCollect(sys, x, y, options = {}) {
  const color = options.color ?? '#ffd700';
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    sys.particles.push(
      new Particle(x, y, Math.cos(a) * 4, Math.sin(a) * 4, 30, 30, color, 5),
    );
  }
}

/** @param {ParticleSystem} sys */
function scrollCollect(sys, x, y) {
  for (let i = 0; i < 6; i++) {
    sys.particles.push(
      new Particle(
        x + Math.cos(i) * 8,
        y,
        Math.sin(i * 0.7) * 0.5,
        -2 - Math.random(),
        36,
        36,
        '#f5e6c8',
        4,
      ),
    );
  }
}

/** @param {ParticleSystem} sys */
function playerJump(sys, x, y) {
  for (let i = 0; i < 4; i++) {
    sys.particles.push(
      new Particle(
        x + (i - 2) * 4,
        y,
        (Math.random() - 0.5) * 0.5,
        2 + Math.random(),
        15,
        15,
        '#c9b896',
        3,
      ),
    );
  }
}

/** @param {ParticleSystem} sys */
function playerLand(sys, x, y) {
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * i) / 3;
    sys.particles.push(
      new Particle(x, y, Math.cos(a) * 3, Math.sin(a) * 2, 20, 20, '#a09070', 3),
    );
  }
}

/** @param {ParticleSystem} sys */
function enemyDeath(sys, x, y) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    sys.particles.push(
      new Particle(
        x,
        y,
        Math.cos(a) * (2 + Math.random() * 3),
        Math.sin(a) * (2 + Math.random() * 3),
        24,
        24,
        '#e04040',
        4,
      ),
    );
  }
}

/** @param {ParticleSystem} sys */
function bossDefeated(sys, x, y) {
  for (let i = 0; i < 30; i++) {
    const a = Math.random() * Math.PI * 2;
    sys.particles.push(
      new Particle(
        x,
        y,
        Math.cos(a) * (3 + Math.random() * 5),
        Math.sin(a) * (3 + Math.random() * 5),
        40,
        40,
        i % 2 ? '#fff' : '#ffd700',
        5,
      ),
    );
  }
}

/** @param {ParticleSystem} sys */
function levelComplete(sys, x, y) {
  const colors = ['#ff6b6b', '#ffd93d', '#6bcBef', '#b8e986', '#c792ea'];
  for (let i = 0; i < 30; i++) {
    sys.particles.push(
      new Particle(
        x + (Math.random() - 0.5) * 40,
        y,
        (Math.random() - 0.5) * 2,
        -1 - Math.random() * 2,
        60,
        60,
        colors[i % colors.length],
        4,
      ),
    );
  }
}

/** @param {ParticleSystem} sys */
function wallCrumble(sys, x, y) {
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    sys.particles.push(
      new Particle(
        x,
        y,
        Math.cos(a) * (2 + Math.random() * 4),
        Math.sin(a) * (2 + Math.random() * 4),
        28,
        28,
        '#8b7355',
        3,
      ),
    );
  }
}

/** @param {ParticleSystem} sys */
function waterSplash(sys, x, y) {
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * i) / 8;
    sys.particles.push(
      new Particle(
        x,
        y,
        Math.cos(a) * 3,
        -Math.abs(Math.sin(a)) * 4,
        18,
        18,
        '#4a9fd8',
        3,
    ));
  }
}
