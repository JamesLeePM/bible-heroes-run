import {
  getCharacterColor,
  getHairColor,
  darkenColor,
} from '../assets/SpriteSheet.js';

/**
 * @param {(charId: string) => void} onSelect
 * @param {() => void} onBack
 */
export function buildCharacterSelect(onSelect, onBack) {
  document.getElementById('char-select')?.remove();

  const screen = document.createElement('div');
  screen.id = 'char-select';
  screen.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 8000;
    background: linear-gradient(
      160deg,
      #1a0a3e 0%,
      #2d1b6e 40%,
      #1a3a1a 100%
    );
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    padding: 24px 16px 12px;
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
  `;
  header.innerHTML = `
    <h1 style="
      font-family: 'Press Start 2P', monospace;
      font-size: clamp(20px, 4vw, 32px);
      color: #FFD700;
      text-shadow: 3px 3px 0 #000, 0 0 20px rgba(255,215,0,0.4);
      margin: 0 0 6px;
    ">⚔️ Choose Your Hero ⚔️</h1>
    <p style="
      font-family: 'Press Start 2P', monospace;
      font-size: clamp(10px, 2vw, 14px);
      color: #aaa;
      margin: 0 0 14px;
    ">Each hero has a unique Bible superpower!</p>
  `;

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.textContent = '← BACK TO MENU';
  backBtn.style.cssText = `
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(8px, 1.8vw, 11px);
    padding: 12px 20px;
    background: linear-gradient(180deg, #444, #222);
    color: #FFD700;
    border: 3px solid #666;
    border-radius: 12px;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 3px 0 rgba(0,0,0,0.35);
  `;
  const goBack = (e) => {
    e.preventDefault();
    screen.remove();
    onBack();
  };
  backBtn.addEventListener('click', goBack);
  backBtn.addEventListener(
    'touchend',
    (e) => {
      e.preventDefault();
      goBack(e);
    },
    { passive: false },
  );
  header.appendChild(backBtn);
  screen.appendChild(header);

  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
  `;
  if (window.matchMedia('(max-width: 520px)').matches) {
    grid.style.gridTemplateColumns = '1fr';
  }

  const CHARACTERS = [
    {
      id: 'david',
      name: 'DAVID',
      emoji: '🪃',
      title: 'The Brave Shepherd',
      color: '#8B4513',
      cardColor: '#3d1a00',
      borderColor: '#CD853F',
      superpower: '⚡ SLING SHOT — Throws stones at enemies!',
      speed: '⚡⚡⚡⚡⚡',
      jump: '🦘🦘🦘',
      power: '💥💥💥💥💥',
      trait1: '🏃 Fastest runner',
      trait2: '🎯 Long-range attack',
      verse: '"The LORD is my shepherd" — Psalm 23:1',
      story:
        'A young shepherd who defeated the giant Goliath with just a sling and his faith in God!',
      bestFor: "David's Valley, Abraham's Journey",
    },
    {
      id: 'moses',
      name: 'MOSES',
      emoji: '🪄',
      title: 'The Great Deliverer',
      color: '#DDDDDD',
      cardColor: '#1a1a3d',
      borderColor: '#8888FF',
      superpower: '🌊 PART THE SEA — Creates a path through water!',
      speed: '⚡⚡⚡',
      jump: '🦘🦘🦘🦘',
      power: '💥💥💥💥',
      trait1: '🦅 Highest jumper',
      trait2: '💧 Water powers',
      verse: '"Let my people go!" — Exodus 5:1',
      story:
        "Led God's people out of slavery in Egypt through the Red Sea to the Promised Land!",
      bestFor: 'Desert of Exodus, Manna Level',
    },
    {
      id: 'noah',
      name: 'NOAH',
      emoji: '⛵',
      title: 'The Faithful Builder',
      color: '#8B6914',
      cardColor: '#2d1a00',
      borderColor: '#DAA520',
      superpower: '🔨 BUILD — Picks up and throws heavy objects!',
      speed: '⚡⚡⚡',
      jump: '🦘🦘🦘',
      power: '💥💥💥💥',
      trait1: '💪 Super strength',
      trait2: '🌊 Swims better',
      verse: '"Noah did everything God commanded" — Gen 6:22',
      story: 'Built a giant ark to save his family and every animal from the great flood!',
      bestFor: "Noah's Flood, Tower of Babel",
    },
    {
      id: 'mary',
      name: 'MARY',
      emoji: '🕊️',
      title: 'Chosen by God',
      color: '#1E90FF',
      cardColor: '#001a3d',
      borderColor: '#87CEEB',
      superpower: '✨ GRACE — Nearby enemies slow down!',
      speed: '⚡⚡⚡⚡',
      jump: '🦘🦘🦘🦘',
      power: '💥💥💥',
      trait1: '🙏 Calms enemies',
      trait2: '💨 Light & quick',
      verse: '"Blessed are you among women" — Luke 1:28',
      story:
        'Chosen by God to be the mother of Jesus — the most honored woman in history!',
      bestFor: 'Baby Moses, Feeding 5000, Easter',
    },
    {
      id: 'daniel',
      name: 'DANIEL',
      emoji: '🦁',
      title: 'The Fearless Prophet',
      color: '#6A0DAD',
      cardColor: '#1a003d',
      borderColor: '#9B59B6',
      superpower: '🦁 LION FRIEND — Lions become allies!',
      speed: '⚡⚡⚡⚡',
      jump: '🦘🦘🦘',
      power: '💥💥💥💥',
      trait1: '🦁 Lions help him',
      trait2: '🌟 Night vision',
      verse: '"My God sent his angel to shut the lions\' mouths" — Daniel 6:22',
      story: 'Prayed to God every day even when it was illegal. God shut the mouths of the lions!',
      bestFor: "Daniel's Lions Den, Gideon's 300",
    },
    {
      id: 'esther',
      name: 'ESTHER',
      emoji: '👑',
      title: 'The Courageous Queen',
      color: '#8B008B',
      cardColor: '#2d003d',
      borderColor: '#FF69B4',
      superpower: '👑 ROYAL DECREE — Opens locked doors!',
      speed: '⚡⚡⚡⚡',
      jump: '🦘🦘🦘🦘🦘',
      power: '💥💥💥',
      trait1: '🚪 Opens exits',
      trait2: '💎 Collects bonus gems',
      verse: '"For such a time as this" — Esther 4:14',
      story: 'A brave queen who risked her life to save her people from a terrible plot!',
      bestFor: "Esther's Courage, Ruth's Fields",
    },
    {
      id: 'jonah',
      name: 'JONAH',
      emoji: '🐋',
      title: 'The Ocean Runner',
      color: '#4169E1',
      cardColor: '#001a2d',
      borderColor: '#00BFFF',
      superpower: '🌊 SWIM — Breathes & swims underwater!',
      speed: '⚡⚡⚡',
      jump: '🦘🦘🦘',
      power: '💥💥💥',
      trait1: '🤿 Swims forever',
      trait2: '🐟 Ocean master',
      verse: '"From inside the fish Jonah prayed" — Jonah 2:1',
      story:
        "Swallowed by a giant fish when he ran from God — learned that God's plans are best!",
      bestFor: "Jonah's Ocean, Walking on Water",
    },
    {
      id: 'joshua_hero',
      name: 'JOSHUA',
      emoji: '⚔️',
      title: 'The Mighty Warrior',
      color: '#B8860B',
      cardColor: '#2d1a00',
      borderColor: '#FFD700',
      superpower: '📯 SHOUT — Destroys walls & stuns enemies!',
      speed: '⚡⚡⚡⚡⚡',
      jump: '🦘🦘🦘🦘',
      power: '💥💥💥💥💥',
      trait1: '🏰 Breaks walls',
      trait2: '⚡ Fast warrior',
      verse: '"Be strong and courageous!" — Joshua 1:9',
      story:
        "Led God's people into the Promised Land. The walls of Jericho fell at his shout!",
      bestFor: "Joshua's Jericho, Samson's Strength",
    },
    {
      id: 'joshua',
      name: '👦 JOSHUA',
      emoji: '🛡️',
      title: "James's Son — The Brave",
      color: '#1E3A8A',
      cardColor: '#000d2d',
      borderColor: '#4488FF',
      superpower: '📣 BATTLE CRY — All enemies freeze for 3 seconds!',
      speed: '⚡⚡⚡⚡⚡',
      jump: '🦘🦘🦘🦘',
      power: '💥💥💥💥💥',
      trait1: '🌟 SPECIAL HERO',
      trait2: '❄️ Freezes enemies',
      verse: '"Be strong and courageous!" — Joshua 1:9',
      story: 'Named after the great warrior Joshua who trusted God completely!',
      bestFor: 'All levels — UNLOCKED!',
      special: true,
      specialLabel: '⭐ YOUR HERO!',
    },
    {
      id: 'caleb',
      name: '👦 CALEB',
      emoji: '🏔️',
      title: "James's Son — Wholehearted",
      color: '#166534',
      cardColor: '#0a2d0a',
      borderColor: '#44CC44',
      superpower: '⭐ DOUBLE STARS — Collects 2x all items!',
      speed: '⚡⚡⚡⚡',
      jump: '🦘🦘🦘🦘🦘',
      power: '💥💥💥💥',
      trait1: '🌟 SPECIAL HERO',
      trait2: '⭐ 2x item pickup',
      verse: '"I wholeheartedly followed the Lord" — Joshua 14:8',
      story: 'Named after Caleb who said "Give me this mountain!" and trusted God completely!',
      bestFor: 'All levels — UNLOCKED!',
      special: true,
      specialLabel: '⭐ YOUR HERO!',
    },
  ];

  CHARACTERS.forEach((char) => {
    const card = document.createElement('div');
    const borderW = char.special ? '4px' : '3px';
    const extraShadow = char.special
      ? `0 0 30px ${char.borderColor}66, 0 4px 20px rgba(0,0,0,0.4)`
      : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)';

    card.style.cssText = `
      background: linear-gradient(
        160deg,
        ${char.cardColor} 0%,
        ${char.cardColor}cc 100%
      );
      border: ${borderW} solid ${char.borderColor};
      border-radius: 20px;
      padding: 20px;
      cursor: pointer;
      touch-action: manipulation;
      transition: transform 0.15s, box-shadow 0.15s;
      position: relative;
      overflow: hidden;
      box-shadow: ${extraShadow};
    `;

    const glowHtml = char.special
      ? `<div style="
          position: absolute;
          inset: 0;
          border-radius: 17px;
          background: radial-gradient(
            circle at 50% 0%,
            ${char.borderColor}22,
            transparent 70%
          );
          pointer-events: none;
        "></div>`
      : '';

    const badgeHtml = char.special
      ? `<div style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: ${char.borderColor};
          color: #000;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: bold;
          z-index: 2;
        ">${char.specialLabel}</div>`
      : '';

    const playName = char.name.replace(/👦\s*/g, '').trim();

    card.innerHTML = `
      ${glowHtml}
      ${badgeHtml}
      <div style="position:relative;z-index:1;">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
          <canvas
            id="portrait-${char.id}"
            width="90"
            height="120"
            style="
              border-radius: 12px;
              border: 2px solid ${char.borderColor}66;
              background: rgba(0,0,0,0.3);
              flex-shrink: 0;
            "
          ></canvas>
          <div style="flex:1;min-width:0;">
            <div style="
              font-family:'Press Start 2P',monospace;
              font-size:clamp(14px,3vw,20px);
              color:${char.borderColor};
              text-shadow:2px 2px 0 #000;
              margin-bottom:4px;
              line-height:1.3;
              word-break:break-word;
            ">${char.emoji} ${char.name}</div>
            <div style="
              font-family:'Press Start 2P',monospace;
              font-size:clamp(10px,2vw,13px);
              color:#ccc;
              margin-bottom:8px;
              line-height:1.4;
            ">${char.title}</div>
            <div style="margin-bottom:2px;">
              <span style="color:#aaa;font-family:'Press Start 2P',monospace;font-size:clamp(9px,1.8vw,12px);">SPD </span>
              <span style="font-size:clamp(12px,2vw,16px);">${char.speed}</span>
            </div>
            <div style="margin-bottom:2px;">
              <span style="color:#aaa;font-family:'Press Start 2P',monospace;font-size:clamp(9px,1.8vw,12px);">JMP </span>
              <span style="font-size:clamp(12px,2vw,16px);">${char.jump}</span>
            </div>
            <div>
              <span style="color:#aaa;font-family:'Press Start 2P',monospace;font-size:clamp(9px,1.8vw,12px);">PWR </span>
              <span style="font-size:clamp(12px,2vw,16px);">${char.power}</span>
            </div>
          </div>
        </div>
        <div style="
          background:rgba(255,215,0,0.1);
          border:1px solid rgba(255,215,0,0.3);
          border-radius:10px;
          padding:8px 10px;
          margin-bottom:8px;
          font-family:'Press Start 2P',monospace;
          font-size:clamp(10px,2vw,13px);
          color:#FFD700;
          line-height:2;
        ">${char.superpower}</div>
        <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;">
          <span style="
            background:rgba(255,255,255,0.1);
            border-radius:8px;
            padding:4px 8px;
            font-family:'Press Start 2P',monospace;
            font-size:clamp(9px,1.8vw,11px);
            color:#eee;
          ">${char.trait1}</span>
          <span style="
            background:rgba(255,255,255,0.1);
            border-radius:8px;
            padding:4px 8px;
            font-family:'Press Start 2P',monospace;
            font-size:clamp(9px,1.8vw,11px);
            color:#eee;
          ">${char.trait2}</span>
        </div>
        <div style="
          font-family:'Press Start 2P',monospace;
          font-size:clamp(9px,1.8vw,11px);
          color:#aaa;
          font-style:italic;
          margin-bottom:10px;
          line-height:2;
          border-left:2px solid ${char.borderColor}66;
          padding-left:8px;
        ">${char.verse}</div>
        <div style="
          font-family:'Press Start 2P',monospace;
          font-size:clamp(10px,2vw,12px);
          color:#bbb;
          line-height:2.2;
          margin-bottom:10px;
        ">${char.story}</div>
        <div style="
          font-family:'Press Start 2P',monospace;
          font-size:clamp(9px,1.8vw,11px);
          color:#888;
          margin-bottom:12px;
          line-height:1.5;
        ">📍 <span style="color:#aaa;">Best for:</span> ${char.bestFor}</div>
        <button type="button" class="play-btn" data-char="${char.id}" style="
          width:100%;
          font-family:'Press Start 2P',monospace;
          font-size:clamp(14px,3vw,18px);
          padding:16px;
          background:linear-gradient(180deg,
            ${char.borderColor},
            ${char.borderColor}aa
          );
          color:#000;
          border:3px solid ${char.borderColor};
          border-radius:14px;
          cursor:pointer;
          touch-action:manipulation;
          -webkit-tap-highlight-color:transparent;
          font-weight:bold;
          box-shadow:0 4px 0 rgba(0,0,0,0.4);
          transition:transform 0.1s, box-shadow 0.1s;
        ">▶ PLAY AS ${playName}</button>
      </div>
    `;

    const btn = card.querySelector('.play-btn');
    if (btn) {
      btn.addEventListener('touchstart', () => {
        btn.style.transform = 'translateY(2px)';
        btn.style.boxShadow = '0 2px 0 rgba(0,0,0,0.4)';
      }, { passive: true });

      let settled = false;
      const doSelect = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (settled) return;
        settled = true;
        btn.style.transform = '';
        btn.style.boxShadow = '';
        screen.remove();
        onSelect(char.id);
      };
      btn.addEventListener('click', doSelect);
      btn.addEventListener(
        'touchend',
        (e) => {
          doSelect(e);
        },
        { passive: false },
      );
    }

    card.addEventListener(
      'touchstart',
      () => {
        card.style.transform = 'scale(0.99)';
      },
      { passive: true },
    );
    card.addEventListener(
      'touchend',
      () => {
        card.style.transform = '';
      },
      { passive: true },
    );

    grid.appendChild(card);
  });

  screen.appendChild(grid);

  const spacer = document.createElement('div');
  spacer.style.height = '32px';
  screen.appendChild(spacer);

  document.body.appendChild(screen);

  CHARACTERS.forEach((char) => {
    const canvas = document.getElementById(`portrait-${char.id}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    drawMiniCharacter(ctx, char.id, 24, 10, 7);
  });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} charId
 * @param {number} x
 * @param {number} y
 * @param {number} S
 */
function drawMiniCharacter(ctx, charId, x, y, S) {
  const color = getCharacterColor(charId);
  ctx.fillStyle = '#FDBCB4';
  ctx.fillRect(x + S, y, S * 2, S * 2);
  ctx.fillStyle = getHairColor(charId);
  ctx.fillRect(x + S, y - 2, S * 2, 4);
  ctx.fillStyle = '#222';
  ctx.fillRect(x + S * 1.2, y + S * 0.6, S * 0.4, S * 0.4);
  ctx.fillRect(x + S * 1.8, y + S * 0.6, S * 0.4, S * 0.4);
  ctx.fillStyle = color;
  ctx.fillRect(x + S * 0.5, y + S * 2, S * 3, S * 3.5);
  ctx.fillStyle = darkenColor(color, 0.3);
  ctx.fillRect(x + S * 0.5, y + S * 5, S * 1.2, S * 2);
  ctx.fillRect(x + S * 2.3, y + S * 5, S * 1.2, S * 2);
  if (charId === 'moses') {
    ctx.fillStyle = '#6B3A2A';
    ctx.fillRect(x + S * 4, y - S, S * 0.4, S * 8);
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(x + S * 0.8, y + S * 1.8, S * 2.4, S * 1.2);
  }
  if (charId === 'esther') {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + S * 0.8, y - S * 1.2, S * 2.4, S);
  }
  if (charId === 'joshua' || charId === 'joshua_hero' || charId === 'caleb') {
    ctx.fillStyle = charId === 'caleb' ? '#166534' : '#1E3A8A';
    ctx.fillRect(x - S * 0.5, y + S * 2, S, S * 2);
  }
}

export class CharacterSelect {
  /**
   * @param {HTMLCanvasElement} _canvas
   */
  constructor(_canvas) {
    this.onPick = null;
    this.onBack = null;
    /** @type {boolean} */
    this._mounted = false;
  }

  show() {
    if (this._mounted) return;
    buildCharacterSelect(
      (id) => {
        this._mounted = false;
        if (this.onPick) this.onPick(id);
      },
      () => {
        this._mounted = false;
        if (this.onBack) this.onBack();
      },
    );
    this._mounted = true;
  }

  hide() {
    document.getElementById('char-select')?.remove();
    this._mounted = false;
  }

  /** @param {CanvasRenderingContext2D} _ctx */
  draw(_ctx) {
    this.show();
  }
}
