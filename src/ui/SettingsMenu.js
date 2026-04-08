export class SettingsMenu {
  constructor() {
    this.settings = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem('biblerun_settings');
      return raw ? { ...this.defaults(), ...JSON.parse(raw) } : this.defaults();
    } catch {
      return this.defaults();
    }
  }

  defaults() {
    return {
      difficulty: 'NORMAL',
      musicVolume: 0.7,
      sfxVolume: 1.0,
      showHints: true,
      largeText: false,
      colorblind: false,
    };
  }

  save() {
    localStorage.setItem('biblerun_settings', JSON.stringify(this.settings));
  }

  /**
   * @param {() => void} [onClose]
   */
  show(onClose) {
    document.getElementById('settings')?.remove();

    const screen = document.createElement('div');
    screen.id = 'settings';
    screen.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9000;
      background: linear-gradient(
        160deg, #0d0d2e, #1a0a3e
      );
      overflow-y: auto;
      font-family: 'Press Start 2P', monospace;
      -webkit-overflow-scrolling: touch;
    `;

    screen.innerHTML = `
      <div style="
        max-width: 600px;
        margin: 0 auto;
        padding: 24px 16px;
      ">
        <h1 style="
          color: #FFD700;
          font-size: clamp(16px,3vw,22px);
          text-align: center;
          margin-bottom: 32px;
          text-shadow: 2px 2px 0 #000;
        ">⚙️ SETTINGS</h1>
        
        <div class="setting-section">
          <h2 style="
            color: #FFD700;
            font-size: clamp(10px,2vw,14px);
            margin-bottom: 16px;
          ">⚔️ DIFFICULTY</h2>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(3,1fr);
            gap: 10px;
            margin-bottom: 24px;
          ">
            ${['EASY', 'NORMAL', 'HARD']
              .map(
                (d) => `
              <button 
                data-diff="${d}"
                style="
                  padding: 14px 8px;
                  font-family: 'Press Start 2P',monospace;
                  font-size: clamp(8px,1.5vw,11px);
                  border-radius: 12px;
                  cursor: pointer;
                  border: 3px solid ${
                    d === 'EASY' ? '#44CC44' : d === 'NORMAL' ? '#FFD700' : '#CC4444'
                  };
                  background: ${
                    d === 'EASY' ? '#003300' : d === 'NORMAL' ? '#332200' : '#330000'
                  };
                  color: ${
                    d === 'EASY' ? '#44CC44' : d === 'NORMAL' ? '#FFD700' : '#CC4444'
                  };
                  touch-action: manipulation;
                "
              >${
                d === 'EASY'
                  ? '😊 EASY<br>(Kids Mode)'
                  : d === 'NORMAL'
                    ? '⚔️ NORMAL<br>(Standard)'
                    : '💀 HARD<br>(Challenge)'
              }</button>
            `,
              )
              .join('')}
          </div>
          
          <div id="diff-desc" style="
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,215,0,0.2);
            border-radius: 10px;
            padding: 12px;
            font-size: clamp(7px,1.3vw,9px);
            color: #ccc;
            line-height: 2;
            margin-bottom: 24px;
            white-space: pre-line;
          "></div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="
            color: #FFD700;
            font-size: clamp(9px,1.8vw,12px);
            display: block;
            margin-bottom: 10px;
          ">🎵 MUSIC VOLUME</label>
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <span style="color:#aaa;font-size:10px;">
              OFF
            </span>
            <input 
              type="range" 
              id="music-vol"
              min="0" max="1" step="0.1"
              style="flex:1;height:8px;accent-color:#FFD700;"
            >
            <span style="color:#aaa;font-size:10px;">
              MAX
            </span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="
            color: #FFD700;
            font-size: clamp(9px,1.8vw,12px);
            display: block;
            margin-bottom: 10px;
          ">🔊 SOUND EFFECTS</label>
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <span style="color:#aaa;font-size:10px;">
              OFF
            </span>
            <input 
              type="range" 
              id="sfx-vol"
              min="0" max="1" step="0.1"
              style="flex:1;height:8px;accent-color:#FFD700;"
            >
            <span style="color:#aaa;font-size:10px;">
              MAX
            </span>
          </div>
        </div>
        
        <div style="
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        ">
          ${[
            ['show-hints', '💡 Show Gabriel Hints', 'showHints'],
            ['large-text', '🔤 Large Text Mode', 'largeText'],
          ]
            .map(
              ([id, label]) => `
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: rgba(255,255,255,0.05);
              border-radius: 10px;
              padding: 12px 16px;
            ">
              <span style="
                color: #eee;
                font-size: clamp(8px,1.5vw,11px);
              ">${label}</span>
              <button 
                id="${id}"
                type="button"
                style="
                  width: 56px;
                  height: 28px;
                  border-radius: 14px;
                  border: none;
                  cursor: pointer;
                  font-size: 10px;
                  touch-action: manipulation;
                "
              ></button>
            </div>
          `,
            )
            .join('')}
        </div>
        
        <button type="button" id="save-settings" style="
          width: 100%;
          padding: 16px;
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(12px,2.5vw,16px);
          background: linear-gradient(
            180deg, #FFD700, #CC8800
          );
          color: #000;
          border: 3px solid #886600;
          border-radius: 14px;
          cursor: pointer;
          touch-action: manipulation;
          margin-bottom: 12px;
        ">✅ SAVE SETTINGS</button>
        
        <button type="button" id="close-settings" style="
          width: 100%;
          padding: 12px;
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(10px,2vw,13px);
          background: transparent;
          color: #aaa;
          border: 2px solid #444;
          border-radius: 14px;
          cursor: pointer;
          touch-action: manipulation;
        ">← BACK</button>
      </div>
    `;

    document.body.appendChild(screen);

    const s = this.settings;
    /** @type {HTMLInputElement} */
    const musicEl = screen.querySelector('#music-vol');
    /** @type {HTMLInputElement} */
    const sfxEl = screen.querySelector('#sfx-vol');
    musicEl.value = String(s.musicVolume);
    sfxEl.value = String(s.sfxVolume);

    const diffDescs = {
      EASY:
        '😊 Perfect for young children!\n' +
        '• Enemies move slower\n' +
        '• Player takes less damage\n' +
        '• More hearts available\n' +
        '• Gabriel gives more hints',
      NORMAL:
        '⚔️ The classic Bible Run experience!\n' +
        '• Standard enemy speed\n' +
        '• Normal damage\n' +
        '• 3 hearts per level',
      HARD:
        '💀 For experienced players!\n' +
        '• Faster enemies\n' +
        '• More damage taken\n' +
        '• Fewer hearts\n' +
        '• No hints from Gabriel',
    };

    const updateDiff = (diff) => {
      s.difficulty = diff;
      screen.querySelectorAll('[data-diff]').forEach((btn) => {
        const b = /** @type {HTMLButtonElement} */ (btn);
        const isSelected = b.dataset.diff === diff;
        b.style.transform = isSelected ? 'scale(1.05)' : 'scale(1)';
        b.style.opacity = isSelected ? '1' : '0.6';
      });
      const desc = screen.querySelector('#diff-desc');
      if (desc) desc.textContent = diffDescs[diff] ?? '';
    };

    updateDiff(s.difficulty);

    screen.querySelectorAll('[data-diff]').forEach((btn) => {
      const b = /** @type {HTMLButtonElement} */ (btn);
      const go = () => updateDiff(b.dataset.diff ?? 'NORMAL');
      b.addEventListener('click', go);
      b.addEventListener(
        'touchend',
        (e) => {
          e.preventDefault();
          go();
        },
        { passive: false },
      );
    });

    const updateToggle = (id, key) => {
      const btn = screen.querySelector(`#${id}`);
      if (!btn) return;
      const on = /** @type {boolean} */ (s[/** @type {'showHints'|'largeText'} */ (key)]);
      btn.textContent = on ? 'ON' : 'OFF';
      /** @type {HTMLButtonElement} */ (btn).style.background = on ? '#44CC44' : '#CC4444';
      /** @type {HTMLButtonElement} */ (btn).style.color = '#fff';
    };

    [
      ['show-hints', 'showHints'],
      ['large-text', 'largeText'],
    ].forEach(([id, key]) => {
      updateToggle(id, key);
      const btn = screen.querySelector(`#${id}`);
      const go = () => {
        s[/** @type {'showHints'|'largeText'} */ (key)] =
          !s[/** @type {'showHints'|'largeText'} */ (key)];
        updateToggle(id, key);
      };
      btn?.addEventListener('click', go);
      btn?.addEventListener(
        'touchend',
        (e) => {
          e.preventDefault();
          go();
        },
        { passive: false },
      );
    });

    const saveBtn = screen.querySelector('#save-settings');
    const doSave = () => {
      s.musicVolume = parseFloat(musicEl.value);
      s.sfxVolume = parseFloat(sfxEl.value);
      this.save();
      screen.remove();
      onClose?.();
    };
    saveBtn?.addEventListener('click', doSave);
    saveBtn?.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        doSave();
      },
      { passive: false },
    );

    const closeBtn = screen.querySelector('#close-settings');
    const doClose = () => {
      screen.remove();
      onClose?.();
    };
    closeBtn?.addEventListener('click', doClose);
    closeBtn?.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        doClose();
      },
      { passive: false },
    );
  }
}

export const settings = new SettingsMenu();
