const KEY_STARS = 'biblerun_stars';
const KEY_UNLOCK = 'biblerun_unlock';
const KEY_COMPLETE = 'biblerun_all_complete';
const KEY_GABRIEL = 'biblerun_gabriel';
const KEY_SCORES = 'biblerun_scores';
const KEY_DAMAGE = 'biblerun_level_nodamage';

export function loadStars() {
  try {
    const s = localStorage.getItem(KEY_STARS);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

/** @param {number} levelIndex @param {number} stars */
export function saveStars(levelIndex, stars) {
  const o = loadStars();
  o[levelIndex] = Math.max(o[levelIndex] || 0, stars);
  localStorage.setItem(KEY_STARS, JSON.stringify(o));
}

export function loadUnlockedMax() {
  const v = localStorage.getItem(KEY_UNLOCK);
  return v != null ? Number(v) : 0;
}

/** @param {number} maxLevel */
export function saveUnlockedMax(maxLevel) {
  const cur = loadUnlockedMax();
  if (maxLevel > cur) localStorage.setItem(KEY_UNLOCK, String(maxLevel));
}

export function allLevelsComplete() {
  return localStorage.getItem(KEY_COMPLETE) === '1';
}

export function setAllLevelsComplete() {
  localStorage.setItem(KEY_COMPLETE, '1');
}

export function gabrielSeen() {
  return localStorage.getItem(KEY_GABRIEL) === '1';
}

export function setGabrielSeen() {
  localStorage.setItem(KEY_GABRIEL, '1');
}

/** @returns {{ joshua: number; caleb: number; dad: number }} */
export function loadScores() {
  try {
    const s = localStorage.getItem(KEY_SCORES);
    return s ? JSON.parse(s) : { joshua: 0, caleb: 0, dad: 0 };
  } catch {
    return { joshua: 0, caleb: 0, dad: 0 };
  }
}

/** @param {{ joshua?: number; caleb?: number; dad?: number }} patch */
export function saveScores(patch) {
  const cur = loadScores();
  const next = { ...cur, ...patch };
  localStorage.setItem(KEY_SCORES, JSON.stringify(next));
}

/** @param {number} levelIndex */
export function loadNoDamage(levelIndex) {
  try {
    const s = localStorage.getItem(KEY_DAMAGE);
    const o = s ? JSON.parse(s) : {};
    return o[levelIndex] === true;
  } catch {
    return false;
  }
}

/** @param {number} levelIndex @param {boolean} v */
export function saveNoDamage(levelIndex, v) {
  try {
    const s = localStorage.getItem(KEY_DAMAGE);
    const o = s ? JSON.parse(s) : {};
    o[levelIndex] = v;
    localStorage.setItem(KEY_DAMAGE, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}
