import { bindTouchButton } from '../engine/Input.js';

function applyStyles(el, ...styleObjs) {
  const merged = Object.assign({}, ...styleObjs);
  Object.keys(merged).forEach((key) => {
    el.style[key] = merged[key];
  });
}

function copyElementStyle(toEl, fromEl) {
  toEl.style.cssText = fromEl.style.cssText;
}

const BASE_BTN = {
  color: '#fff',
  fontFamily: '"Press Start 2P", monospace',
  touchAction: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

/**
 * @param {HTMLElement} el
 * @param {'left'|'right'|'jump'|'special'|'p2left'|'p2right'|'p2jump'|'p2special'} key
 * @param {{ activeBg?: string; jumpStyle?: boolean; specialStyle?: boolean }} [opts]
 */
function bindTouchWithFeedback(el, key, opts = {}) {
  bindTouchButton(el, key);
  const defBg = el.style.background || '';
  const { activeBg, jumpStyle, specialStyle } = opts;

  const onVisDown = () => {
    if (jumpStyle) {
      el.style.transform = 'scale(0.9)';
      el.style.background = '#2d8a2d';
    } else if (specialStyle) {
      el.style.transform = 'scale(0.9)';
      el.style.filter = 'brightness(1.15)';
    } else if (activeBg) {
      el.style.transform = 'scale(0.92)';
      el.style.background = activeBg;
    }
  };
  const onVisUp = () => {
    el.style.transform = 'scale(1)';
    el.style.background = defBg;
    el.style.filter = 'none';
  };

  el.addEventListener('touchstart', onVisDown, { passive: true });
  el.addEventListener('touchend', onVisUp, { passive: true });
  el.addEventListener('touchcancel', onVisUp, { passive: true });
  el.addEventListener('mousedown', onVisDown);
  el.addEventListener('mouseup', onVisUp);
  el.addEventListener('mouseleave', onVisUp);
}

export class TouchControls {
  constructor() {
    /** @type {HTMLDivElement | null} */
    this.root = null;
    this.coop = false;
    this._showTime = 0;
    /** @type {HTMLElement[]} */
    this._hintEls = [];
  }

  mount() {
    if (this.root) return;
    const root = document.createElement('div');
    root.id = 'touch-controls';
    applyStyles(root, {
      position: 'fixed',
      left: '0',
      right: '0',
      bottom: '0',
      height: '200px',
      pointerEvents: 'auto',
      zIndex: '50',
      display: 'none',
    });
    document.body.appendChild(root);
    this.root = root;
  }

  updateHints() {
    const elapsed = (Date.now() - this._showTime) / 1000;
    const o = Math.max(0, 1 - elapsed / 30);
    for (const el of this._hintEls) {
      el.style.opacity = String(o);
    }
  }

  setCoop(on) {
    this.coop = on;
    this._rebuild();
  }

  show() {
    this.mount();
    this._showTime = Date.now();
    if (this.root) this.root.style.display = 'block';
    this._rebuild();
  }

  hide() {
    if (this.root) this.root.style.display = 'none';
  }

  _rebuild() {
    if (!this.root) return;
    this.root.innerHTML = '';
    this._hintEls = [];
    if (this.coop) {
      this._buildHalf(this.root, true);
      this._buildHalf(this.root, false);
    } else {
      this._buildSingle(this.root);
    }
  }

  /** @param {HTMLDivElement} root */
  _buildSingle(root) {
    const leftWrap = document.createElement('div');
    applyStyles(leftWrap, {
      position: 'absolute',
      left: '20px',
      bottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
    });

    const moveHint = document.createElement('div');
    moveHint.textContent = 'MOVE';
    applyStyles(moveHint, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#fff',
      textShadow: '0 1px 2px #000',
      opacity: '1',
    });
    this._hintEls.push(moveHint);

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '10px';

    const mkArrow = () => {
      const h = document.createElement('div');
      h.textContent = '▼';
      applyStyles(h, {
        fontSize: '10px',
        color: '#ffd700',
        textAlign: 'center',
        opacity: '1',
      });
      this._hintEls.push(h);
      return h;
    };

    const l = document.createElement('button');
    l.type = 'button';
    l.textContent = '◀';
    applyStyles(l, BASE_BTN, {
      width: '90px',
      height: '90px',
      borderRadius: '20px',
      background: 'rgba(0,0,0,0.5)',
      border: '4px solid rgba(255,213,79,0.8)',
      fontSize: '32px',
    });
    bindTouchWithFeedback(l, 'left', { activeBg: 'rgba(255,213,79,0.3)' });

    const r = document.createElement('button');
    r.type = 'button';
    r.textContent = '▶';
    copyElementStyle(r, l);
    bindTouchWithFeedback(r, 'right', { activeBg: 'rgba(255,213,79,0.3)' });

    const arL = mkArrow();
    const arR = mkArrow();
    const mini = document.createElement('div');
    mini.style.display = 'flex';
    mini.style.gap = '44px';
    mini.appendChild(arL);
    mini.appendChild(arR);

    row.appendChild(l);
    row.appendChild(r);
    leftWrap.appendChild(moveHint);
    leftWrap.appendChild(mini);
    leftWrap.appendChild(row);

    const rightWrap = document.createElement('div');
    applyStyles(rightWrap, {
      position: 'absolute',
      right: '20px',
      bottom: '20px',
      width: '200px',
      height: '180px',
    });

    const jmp = document.createElement('button');
    jmp.type = 'button';
    jmp.innerHTML =
      '<span style="font-size:28px;line-height:1">🟢</span><br/><span style="font-size:10px;font-family:Press Start 2P">JUMP</span>';
    applyStyles(jmp, BASE_BTN, {
      position: 'absolute',
      right: '0',
      bottom: '0',
      width: '110px',
      height: '110px',
      borderRadius: '50%',
      flexDirection: 'column',
      background: '#44CC44',
      border: '4px solid #228B22',
      color: '#fff',
    });
    bindTouchWithFeedback(jmp, 'jump', { jumpStyle: true });

    const jmpHint = document.createElement('div');
    jmpHint.textContent = 'JUMP';
    applyStyles(jmpHint, {
      position: 'absolute',
      right: '20px',
      bottom: '125px',
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#fff',
      textShadow: '0 1px 2px #000',
    });
    this._hintEls.push(jmpHint);

    const spec = document.createElement('button');
    spec.type = 'button';
    spec.textContent = '⚡';
    applyStyles(spec, BASE_BTN, {
      position: 'absolute',
      right: '100px',
      bottom: '95px',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: '#FFD700',
      border: '4px solid #CC8800',
      fontSize: '28px',
    });
    bindTouchWithFeedback(spec, 'special', { specialStyle: true });

    const specHint = document.createElement('div');
    specHint.textContent = '▼';
    applyStyles(specHint, {
      position: 'absolute',
      right: '125px',
      bottom: '178px',
      fontSize: '12px',
      color: '#ffd700',
    });
    this._hintEls.push(specHint);

    rightWrap.appendChild(jmpHint);
    rightWrap.appendChild(jmp);
    rightWrap.appendChild(spec);
    rightWrap.appendChild(specHint);

    root.appendChild(leftWrap);
    root.appendChild(rightWrap);
  }

  /**
   * @param {HTMLDivElement} root
   * @param {boolean} isLeftHalf
   */
  _buildHalf(root, isLeftHalf) {
    const pfx = isLeftHalf ? '' : 'p2';
    const k = (/** @type {'left'|'right'|'jump'|'special'} */ name) =>
      /** @type {'left'|'right'|'jump'|'special'|'p2left'|'p2right'|'p2jump'|'p2special'} */ (
        pfx ? `p2${name}` : name
      );
    const wrap = document.createElement('div');
    applyStyles(wrap, {
      position: 'absolute',
      bottom: '20px',
      width: '50%',
      height: '180px',
      left: isLeftHalf ? '10px' : '50%',
      paddingLeft: isLeftHalf ? '0' : '8px',
      boxSizing: 'border-box',
      borderLeft: isLeftHalf ? 'none' : '2px solid rgba(255,213,79,0.3)',
    });

    const row = document.createElement('div');
    applyStyles(row, {
      display: 'flex',
      gap: '8px',
      position: 'absolute',
      bottom: '0',
      left: isLeftHalf ? '12px' : '24px',
    });

    const l = document.createElement('button');
    l.type = 'button';
    l.textContent = '◀';
    applyStyles(l, BASE_BTN, {
      width: '80px',
      height: '80px',
      borderRadius: '18px',
      background: 'rgba(0,0,0,0.5)',
      border: '4px solid rgba(255,213,79,0.8)',
      fontSize: '28px',
    });
    bindTouchWithFeedback(l, k('left'), { activeBg: 'rgba(255,213,79,0.3)' });
    const r = document.createElement('button');
    r.type = 'button';
    r.textContent = '▶';
    copyElementStyle(r, l);
    bindTouchWithFeedback(r, k('right'), { activeBg: 'rgba(255,213,79,0.3)' });
    row.appendChild(l);
    row.appendChild(r);

    const actions = document.createElement('div');
    applyStyles(actions, {
      position: 'absolute',
      right: isLeftHalf ? '12px' : '20px',
      bottom: '0',
      width: '160px',
      height: '150px',
    });

    const jmp = document.createElement('button');
    jmp.type = 'button';
    jmp.innerHTML =
      '<span style="font-size:24px">🟢</span><br/><span style="font-size:8px;font-family:Press Start 2P">JUMP</span>';
    applyStyles(jmp, BASE_BTN, {
      position: 'absolute',
      right: '0',
      bottom: '0',
      width: '96px',
      height: '96px',
      borderRadius: '50%',
      flexDirection: 'column',
      background: '#44CC44',
      border: '4px solid #228B22',
    });
    bindTouchWithFeedback(jmp, k('jump'), { jumpStyle: true });

    const spec = document.createElement('button');
    spec.type = 'button';
    spec.textContent = '⚡';
    applyStyles(spec, BASE_BTN, {
      position: 'absolute',
      right: '88px',
      bottom: '72px',
      width: '72px',
      height: '72px',
      borderRadius: '50%',
      background: '#FFD700',
      border: '4px solid #CC8800',
      fontSize: '24px',
    });
    bindTouchWithFeedback(spec, k('special'), { specialStyle: true });

    actions.appendChild(spec);
    actions.appendChild(jmp);
    wrap.appendChild(row);
    wrap.appendChild(actions);
    root.appendChild(wrap);
  }
}
