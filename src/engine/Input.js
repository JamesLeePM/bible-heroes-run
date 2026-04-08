/**
 * Global input (keyboard + touch). Use jumpJustPressed / specialJustPressed for one-frame actions.
 * @typedef {object} FrameInput
 * @property {boolean} left
 * @property {boolean} right
 * @property {boolean} jump
 * @property {boolean} jumpJustPressed
 * @property {boolean} jumpHeld
 * @property {boolean} special
 * @property {boolean} specialJustPressed
 */

export const input = {
  left: false,
  right: false,
  jump: false,
  jumpJustPressed: false,
  jumpHeld: false,
  special: false,
  specialJustPressed: false,
};

export const inputP2 = {
  left: false,
  right: false,
  jump: false,
  jumpJustPressed: false,
  jumpHeld: false,
  special: false,
  specialJustPressed: false,
};

export function resetAllFrameInput() {
  input.jumpJustPressed = false;
  input.specialJustPressed = false;
  inputP2.jumpJustPressed = false;
  inputP2.specialJustPressed = false;
}

const held = new Set();

function onKeyDown(e) {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }

  if (held.has(e.code)) return;
  held.add(e.code);

  // Production build — logs removed

  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      input.left = true;
      break;

    case 'ArrowRight':
    case 'KeyD':
      input.right = true;
      break;

    case 'Space':
    case 'ArrowUp':
    case 'KeyW':
      input.jump = true;
      input.jumpJustPressed = true;
      input.jumpHeld = true;
      break;

    case 'KeyZ':
    case 'KeyX':
    case 'ShiftLeft':
    case 'ShiftRight':
      input.special = true;
      input.specialJustPressed = true;
      break;

    case 'KeyJ':
      inputP2.left = true;
      break;
    case 'KeyL':
      inputP2.right = true;
      break;
    case 'KeyI':
    case 'KeyK':
      inputP2.jump = true;
      inputP2.jumpJustPressed = true;
      inputP2.jumpHeld = true;
      break;
    case 'KeyN':
    case 'KeyM':
      inputP2.special = true;
      inputP2.specialJustPressed = true;
      break;
    default:
      break;
  }
}

function onKeyUp(e) {
  held.delete(e.code);

  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      input.left = false;
      break;

    case 'ArrowRight':
    case 'KeyD':
      input.right = false;
      break;

    case 'Space':
    case 'ArrowUp':
    case 'KeyW':
      input.jump = false;
      input.jumpHeld = false;
      break;

    case 'KeyZ':
    case 'KeyX':
    case 'ShiftLeft':
    case 'ShiftRight':
      input.special = false;
      break;

    case 'KeyJ':
      inputP2.left = false;
      break;
    case 'KeyL':
      inputP2.right = false;
      break;
    case 'KeyI':
    case 'KeyK':
      inputP2.jump = false;
      inputP2.jumpHeld = false;
      break;
    case 'KeyN':
    case 'KeyM':
      inputP2.special = false;
      break;
    default:
      break;
  }
}

if (typeof window.__bibleRunKeyDown === 'function') {
  window.removeEventListener('keydown', window.__bibleRunKeyDown);
}
if (typeof window.__bibleRunKeyUp === 'function') {
  window.removeEventListener('keyup', window.__bibleRunKeyUp);
}

window.__bibleRunKeyDown = onKeyDown;
window.__bibleRunKeyUp = onKeyUp;

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

// Production build — logs removed

export function initKeyboard() {
  // Production build — logs removed
}

/**
 * @param {HTMLElement} el
 * @param {'left'|'right'|'jump'|'special'|'p2left'|'p2right'|'p2jump'|'p2special'} key
 */
export function bindTouchButton(el, key) {
  const inp =
    key === 'p2left' || key === 'p2right' || key === 'p2jump' || key === 'p2special'
      ? inputP2
      : input;

  const realKey = key.replace(/^p2/i, '').toLowerCase();

  const down = (e) => {
    e.preventDefault();
    if (realKey === 'jump') {
      if (!inp.jump) {
        inp.jumpJustPressed = true;
      }
      inp.jump = true;
      inp.jumpHeld = true;
    } else if (realKey === 'special') {
      if (!inp.special) inp.specialJustPressed = true;
      inp.special = true;
    } else if (realKey === 'left') {
      inp.left = true;
    } else if (realKey === 'right') {
      inp.right = true;
    }
  };

  const up = (e) => {
    e.preventDefault();
    if (realKey === 'jump') {
      inp.jump = false;
      inp.jumpHeld = false;
    } else if (realKey === 'special') {
      inp.special = false;
    } else if (realKey === 'left') {
      inp.left = false;
    } else if (realKey === 'right') {
      inp.right = false;
    }
  };

  el.addEventListener('touchstart', down, { passive: false });
  el.addEventListener('touchend', up, { passive: false });
  el.addEventListener('touchcancel', up, { passive: false });
  el.addEventListener('mousedown', down);
  el.addEventListener('mouseup', up);
  el.addEventListener('mouseleave', up);
}
