/**
 * Exit gate hitbox in world pixels — must match drawExitGate() in BackgroundLayers.js
 * Level data uses exitX / exitY in pixel coordinates (not tile indices).
 */
export const EXIT_HIT_W = 96;
export const EXIT_HIT_H = 128;
export const EXIT_OFF_X = -32;
export const EXIT_OFF_Y = -96;

/**
 * @param {{ exitX: number; exitY: number }} d
 * @returns {{ x: number; y: number; w: number; h: number }}
 */
export function getExitHitRect(d) {
  return {
    x: d.exitX + EXIT_OFF_X,
    y: d.exitY + EXIT_OFF_Y,
    w: EXIT_HIT_W,
    h: EXIT_HIT_H,
  };
}
