// Rank monarchs by effective combat stats at a given floor/difficulty.
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
const getEl = (sel) => { if (!elements.has(sel)) elements.set(sel, fakeEl()); return elements.get(sel); };
global.document = {
    querySelector: (s) => getEl(s), querySelectorAll: () => [],
    getElementById: (s) => getEl("#" + s), createElement: () => fakeEl(),
    body: fakeEl(), addEventListener() {},
};
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); } };
global.window = global;
global.performance = { now: () => Date.now() };

global.player = {
    name: "T", lvl: 500, cls: "warrior",
    stats: { hp: 1e9, hpMax: 1e9, atk: 1, def: 1, atkSpd: 1, vamp: 0, critRate: 0, critDmg: 50 },
    bonusStats: {}, equippedStats: {}, skills: [], combatBuffs: [],
    abilityLoadout: [], equipped: [], inventory: { equipment: [] }, storage: [],
    exp: { expCurr: 0, expMax: 1, expCurrLvl: 0, expMaxLvl: 1, lvlGained: 0 },
    gold: 0, crystals: 0, difficulty: "omega", maxDiffTier: 9,
};
global.dungeon = {
    progress: { floor: 950, room: 1, floorLimit: 1000, roomLimit: 5 },
    settings: { enemyBaseLvl: 1, enemyLvlGap: 5, enemyBaseStats: 1, enemyScaling: 1.1 },
    status: { exploring: false, paused: true, event: false },
    statistics: { kills: 0, runtime: 0 }, backlog: [], action: 0,
    enemyMultipliers: { hp: 1.4, atk: 1, def: 1, atkSpd: 1, vamp: 1, critRate: 1, critDmg: 1 },
};
global.enemyDead = false;
global.playerDead = false;

const files = ["i18n.js", "utility.js", "elements.js", "enemy.js", "combat.js", "classes.js"];
let src = files.map(f => fs.readFileSync(path.join(__dirname, "assets/js", f), "utf8")).join("\n;\n");
src += `\n;globalThis.__test = { generateRandomEnemy, enemy: () => enemy, BOSS_PHASE_TABLE, ENEMY_PHASE_EFFECTS };`;
eval(src);
const T = globalThis.__test;

// Collect one sample of each monarch (loop until all 9 names seen)
// NOTE: enemy is a single reused object — snapshot stats immediately.
const snap = (e) => ({
    name: e.name, type: e.type, isBoss: e.isBoss, bossKind: e.bossKind,
    phaseEffects: [], stats: { ...e.stats }, phaseThresholds: e.phaseThresholds,
});
const seen = {};
for (let i = 0; i < 800 && Object.keys(seen).length < 9; i++) {
    T.generateRandomEnemy("sboss");
    const s = snap(T.enemy());
    if (!seen[s.name]) seen[s.name] = s;
}
// Also guardians for comparison
const guardians = {};
for (let i = 0; i < 1500 && Object.keys(guardians).length < 15; i++) {
    T.generateRandomEnemy("guardian");
    const s = snap(T.enemy());
    if (!guardians[s.name]) guardians[s.name] = s;
}

// Apply each boss's full phase table (simulate reaching final phase)
function applyAllPhases(e) {
    const table = T.BOSS_PHASE_TABLE[e.name];
    if (!table) return;
    for (const tier of table) {
        for (const id of tier) {
            const eff = T.ENEMY_PHASE_EFFECTS[id];
            if (eff && !e.phaseEffects.includes(id)) { e.phaseEffects.push(id); eff.apply(e); }
        }
    }
}

// apply() mutates e.stats — snapshots have the same shape as enemy

function report(list, label) {
    console.log(`\n===== ${label} (floor 950, OMEGA) =====`);
    const rows = Object.values(list).map(e => {
        applyAllPhases(e);
        const dps = e.stats.atk * e.stats.atkSpd * (1 + e.stats.critRate / 100 * e.stats.critDmg / 100);
        const score = e.stats.hpMax * dps;
        return { name: e.name, type: e.type, hp: e.stats.hpMax, atk: e.stats.atk, def: e.stats.def, spd: +e.stats.atkSpd.toFixed(2), cr: +e.stats.critRate.toFixed(1), cd: +e.stats.critDmg.toFixed(0), vamp: e.stats.vamp, score };
    }).sort((a, b) => b.score - a.score);
    for (const r of rows) {
        console.log(`${r.name.padEnd(32)} ${r.type.padEnd(10)} HP=${r.hp} ATK=${r.atk} DEF=${r.def} SPD=${r.spd} CR=${r.cr}% CD=${r.cd}% VAMP=${r.vamp}`);
    }
    console.log("\nTop 3 by HP×DPS score:");
    rows.slice(0, 3).forEach((r, i) => console.log(`  ${i + 1}. ${r.name} (score ${Math.round(r.score / 1e6)}M)`));
}

report(seen, "MONARCHS");
report(guardians, "GUARDIANS");
