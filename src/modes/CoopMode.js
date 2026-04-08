import { CharId } from '../game/constants.js';

/**
 * Co-op (Joshua & Caleb) is fully driven by {@link import('../game/Game.js').Game}
 * (split screen, shared level, miracle move). This module provides a single entry
 * point and logging so iOS / main code can call one obvious API.
 */
export class CoopMode {
  /**
   * @param {import('../game/Game.js').Game} game
   */
  static enter(game) {
    // Production build — logs removed
    game.pendingLevel = game.pendingLevel ?? 0;
    game.startCoop();
  }

  /**
   * @param {import('../game/Game.js').Game} game
   */
  static triggerMiracleMove(game) {
    // Production build — logs removed
    game.enemies?.forEach((e) => {
      if (!e.dead) e.stun = 120;
    });
    game.particles?.emit(game.player?.x ?? 0, game.player?.y ?? 0, { kind: 'boss' });
    game.sound?.specialAbility();
  }
}

export const COOP_P1 = { name: 'JOSHUA', color: '#4488FF', charId: CharId.JOSHUA };
export const COOP_P2 = { name: 'CALEB', color: '#44BB44', charId: CharId.CALEB };
