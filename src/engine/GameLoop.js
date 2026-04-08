export class GameLoop {
  /**
   * @param {(dt: number) => void} update
   * @param {() => void} draw
   */
  constructor(update, draw) {
    this.update = update;
    this.draw = draw;
    this.lastTime = 0;
    this.running = false;
  }

  start() {
    this.running = true;
    const loop = (time) => {
      if (!this.running) return;
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;
      this.update(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
