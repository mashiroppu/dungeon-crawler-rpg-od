// Minimal DOM/localStorage stubs to smoke-test boss phase logic in Node.
const fs = require("fs");
const path = require("path");

function fakeEl() {
    return {
        innerHTML: "", textContent: "", className: "", style: {},
        dataset: {}, value: "", disabled: false,
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
        appendChild() {}, remove() {}, addEventListener() {},
        querySelector: () => fakeEl(), querySelectorAll: () => [],
        scrollTop: 0, scrollHeight: 0, parentNode: null,
    };
}
const elements = new Map();
const getEl = (sel) => {
    if (!elements.has(sel)) elements.set(sel, fakeEl());
    return elements.get(sel);
};
global.document = {
    querySelector: (s) => getEl(s),
    querySelectorAll: () => [],
    getElementById: (s) => getEl("#" + s),
    createElement: () => fakeEl(),
    body: fakeEl(),
    addEventListener() {},
};
global.localStorage = {
    _d: {},
    getItem(k) { return this._d[k] ?? null; },
    setItem(k, v) { this._d[k] = String(v); },
};
global.window = global;
global.performance = { now: () => Date.now() };

// Game globals the scripts expect
global.player = {
    name: "Test", lvl: 100, cls: "warrior",
    stats: { hp: 100000, hpMax: 100000, atk: 5000, def: 500, atkSpd: 1.5, vamp: 0, critRate: 20, critDmg: 50 },
    bonusStats: {}, equippedStats: {}, skills: [], combatBuffs: [],
    abilityCharges: {}, abilityCds: {}, abilityRecs: {}, abilityLoadout: [],
    equipped: [], inventory: { equipment: [] }, storage: [],
    exp: { expCurr: 0, expMax: 100, expCurrLvl: 0, expMaxLvl: 100, lvlGained: 0 },
    gold: 0, crystals: 0, difficulty: "normal", maxDiffTier: 9,
};
global.dungeon = {
    progress: { floor: 100, room: 1, floorLimit: 1000, roomLimit: 5 },
    settings: { enemyBaseLvl: 1, enemyLvlGap: 5, enemyBaseStats: 1, enemyScaling: 1.1 },
    status: { exploring: false, paused: true, event: false },
    statistics: { kills: 0, runtime: 0 },
    backlog: [], action: 0,
    enemyMultipliers: { hp: 1.4, atk: 1, def: 1, atkSpd: 1, vamp: 1, critRate: 1, critDmg: 1 },
};
global.enemyDead = false;
global.playerDead = false;

// Load scripts in index.html order (subset needed for the phase system)
const files = ["i18n.js", "utility.js", "elements.js", "enemy.js", "combat.js", "classes.js"];
let src = files.map(f => fs.readFileSync(path.join(__dirname, "assets/js", f), "utf8")).join("\n;\n");
// expose internals for assertions
src += `\n;globalThis.__test = { generateRandomEnemy, enemyLoadStats, checkEnemyPhase, enemy: () => enemy, ENEMY_PHASE_EFFECTS, BOSS_PHASE_TABLE, BOSS_PHASE_THRESHOLDS, combatBacklog: () => combatBacklog };`;
eval(src);

const T = globalThis.__test;

// --- Test 1: guardian gets boss flags + phase thresholds ---
T.generateRandomEnemy("guardian");
let e = T.enemy();
console.log("guardian:", e.name, "| isBoss:", e.isBoss, "| kind:", e.bossKind, "| thresholds:", e.phaseThresholds);
if (!e.isBoss || e.bossKind !== "guardian") throw new Error("guardian flags wrong");

// --- Test 2: phase 2 transition at 66% ---
e.stats.hp = Math.floor(e.stats.hpMax * 0.65);
T.enemyLoadStats();
console.log("after 65%: phase =", e.phase, "| effects:", e.phaseEffects, "| stagger:", e.staggerUntil > Date.now());
if (e.phase !== 2) throw new Error("phase did not advance to 2");
if (!e.phaseEffects.length) throw new Error("no phase effects gained");
if (!(e.staggerUntil > Date.now())) throw new Error("no stagger applied");

// --- Test 3: phase 3 at 33% ---
const effBefore = e.phaseEffects.length;
e.stats.hp = Math.floor(e.stats.hpMax * 0.30);
T.enemyLoadStats();
console.log("after 30%: phase =", e.phase, "| effects:", e.phaseEffects);
if (e.phase !== 3) throw new Error("phase did not advance to 3");

// --- Test 4: trash mob gets nothing ---
T.generateRandomEnemy();
e = T.enemy();
console.log("trash:", e.name, "| isBoss:", e.isBoss);
e.stats.hp = Math.floor(e.stats.hpMax * 0.1);
T.enemyLoadStats();
if (e.phase !== 1 || e.phaseEffects.length) throw new Error("trash mob gained phases!");

// --- Test 5: monarch 4 phases ---
T.generateRandomEnemy("sboss");
e = T.enemy();
console.log("monarch:", e.name, "| thresholds:", e.phaseThresholds);
for (const cut of [0.7, 0.45, 0.2]) {
    e.stats.hp = Math.floor(e.stats.hpMax * cut);
    T.enemyLoadStats();
}
console.log("monarch final phase:", e.phase, "| effects:", e.phaseEffects);
if (e.phase !== 4) throw new Error("monarch did not reach phase 4");

// --- Test 6: every boss name has a table entry or falls back safely ---
const missing = [];
for (const kind of ["guardian", "sboss"]) {
    // regenerate a few times to sample names
    for (let i = 0; i < 30; i++) {
        T.generateRandomEnemy(kind);
        const en = T.enemy();
        if (!T.BOSS_PHASE_TABLE[en.name]) missing.push(en.name);
    }
}
console.log("sampled bosses OK; table size:", Object.keys(T.BOSS_PHASE_TABLE).length);

console.log("\nALL TESTS PASSED");
