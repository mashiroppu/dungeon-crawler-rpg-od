// ===== Difficulty Tiers (10 bands of 20 floors, floors 1-200; NG+ scales beyond) =====
// Columns: enemy HP / ATK.SPD / ATK / DEF bonuses vs NORMAL. Each band = one tier.
const DIFFICULTY_TIERS = [
    { key: "normal",     label: "NORMAL",     hp: 1.00, atkSpd: 1.00, atk: 1.00, def: 1.00, reward: 1.00, dropRoll: 3, critRate: 0,  critDmg: 1.00 },
    { key: "hard",       label: "HARD",       hp: 1.15, atkSpd: 1.10, atk: 1.05, def: 1.10, reward: 1.15, dropRoll: 3, critRate: 2,  critDmg: 1.05 },
    { key: "terror",     label: "TERROR",     hp: 1.25, atkSpd: 1.15, atk: 1.10, def: 1.15, reward: 1.30, dropRoll: 3, critRate: 4,  critDmg: 1.10 },
    { key: "abyss",      label: "ABYSS",      hp: 1.40, atkSpd: 1.20, atk: 1.25, def: 1.20, reward: 1.45, dropRoll: 3, critRate: 6,  critDmg: 1.15 },
    { key: "inferno",    label: "INFERNO",    hp: 1.50, atkSpd: 1.25, atk: 1.30, def: 1.25, reward: 1.60, dropRoll: 2, critRate: 8,  critDmg: 1.20 },
    { key: "eclipse",    label: "ECLIPSE",    hp: 1.60, atkSpd: 1.30, atk: 1.40, def: 1.30, reward: 1.75, dropRoll: 2, critRate: 10, critDmg: 1.25 },
    { key: "oblivion",   label: "OBLIVION",   hp: 1.80, atkSpd: 1.30, atk: 1.50, def: 1.35, reward: 1.90, dropRoll: 2, critRate: 12, critDmg: 1.30 },
    { key: "genesis",    label: "GENESIS",    hp: 2.00, atkSpd: 1.50, atk: 1.60, def: 1.40, reward: 2.05, dropRoll: 2, critRate: 14, critDmg: 1.35 },
    { key: "apocalypse", label: "APOCALYPSE", hp: 2.30, atkSpd: 1.60, atk: 1.80, def: 1.45, reward: 2.20, dropRoll: 2, critRate: 16, critDmg: 1.40 },
    { key: "omega",      label: "OMEGA",      hp: 2.60, atkSpd: 1.75, atk: 2.00, def: 1.50, reward: 2.40, dropRoll: 2, critRate: 20, critDmg: 1.50 },
];
const DIFFICULTY_MODES = Object.fromEntries(DIFFICULTY_TIERS.map(d => [d.key, d]));
// Tier index for a floor: floors 1-20 -> 0, 21-40 -> 1, ... 181-200 -> 9
const diffTierOfFloor = (floor) => Math.max(0, Math.min(DIFFICULTY_TIERS.length - 1, Math.floor((floor - 1) / 20)));
// First floor of each difficulty's band (NORMAL=1, HARD=21, ... OMEGA=181)
const diffStartFloor = (tier) => tier * 20 + 1;
// Tier label with NG+ suffix (each cleared OMEGA adds one "+")
const diffTierLabel = (tier) => {
    const d = DIFFICULTY_TIERS[tier];
    if (!d) return "";
    const ng = (player && player.ngPlus) || 0;
    return d.label + (ng > 0 ? "+".repeat(Math.min(ng, 5)) : "");
};
const diffKeyToTier = (key) => {
    const i = DIFFICULTY_TIERS.findIndex(d => d.key === key);
    return i >= 0 ? i : 0;
};
// Highest unlocked tier (sequential unlock; legacy saves map old keys)
const maxDiffTier = () => {
    if (typeof player.maxDiffTier === "number") return player.maxDiffTier;
    const legacy = { normal: 0, hard: 1, inferno: 4 };
    return legacy[player.difficulty] ?? 0;
};
const playerDiffTier = () => diffKeyToTier(player.difficulty);
const currentDifficulty = () => DIFFICULTY_TIERS[diffTierOfFloor(dungeon.progress.floor)] || DIFFICULTY_TIERS[0];
// Starting curse stage per difficulty tier: tiers 0-2 -> 0, 3-5 -> 1, 6-8 -> 2, 9 -> 3
const bandCurseStage = (tier) => tier >= 9 ? 3 : tier >= 6 ? 2 : tier >= 3 ? 1 : 0;
// enemyScaling baseline for a band: stage 0 = 1.0 (no curse), each stage +0.1
const bandCurseScaling = (tier) => 1 + 0.1 * bandCurseStage(tier);

// Enemy
let enemy = {
    name: null,
    type: null,
    lvl: null,
    stats: {
        hp: null,
        hpMax: null,
        atk: 0,
        def: 0,
        atkSpd: 0,
        vamp: 0,
        critRate: 0,
        critDmg: 0
    },
    image: {
        name: null,
        type: null,
        size: null
    },
    rewards: {
        exp: null,
        gold: null,
        drop: null
    }
};

const ENEMY_MODS = {
    burning:      { label: "Burning",      desc: "Deals +3% of your max HP as bonus damage per hit." },
    frenzy:       { label: "Frenzy",       atkSpd: 1.35 },
    vampiric:     { label: "Vampiric",     vamp: 8 },
    regenerating: { label: "Regenerating", regen: 0.01 },
    armored:      { label: "Armored",      def: 1.6 },
    volatile:     { label: "Volatile",     desc: "Explodes on death, dealing 8% of your max HP." },
};

const applyElite = () => {
    enemy.elite = true;
    enemy.named = true;
    enemy.name = "Elite " + enemy.name;
    enemy.stats.hpMax = Math.round(enemy.stats.hpMax * 1.6);
    enemy.stats.atk = Math.round(enemy.stats.atk * 1.4);
    enemy.stats.def = Math.round(enemy.stats.def * 1.4);
    enemy.stats.atkSpd = Math.min(2.5, enemy.stats.atkSpd * 1.15);
    enemy.rewards.exp = Math.round(enemy.rewards.exp * 2.2);
    enemy.rewards.gold = Math.round(enemy.rewards.gold * 2.2);
    enemy.rewards.drop = true;
    enemy.stats.hp = enemy.stats.hpMax;
};

const applyEnemyModifiers = (condition) => {
    enemy.mods = [];
    enemy.combatDebuffs = [];
    const rollCount = condition
        ? 2
        : (enemy.elite ? (Math.random() < 0.5 ? 2 : 1) : (Math.random() < 0.1 ? 1 : 0));
    const pool = Object.keys(ENEMY_MODS);
    for (let i = 0; i < rollCount; i++) {
        const key = pool[Math.floor(Math.random() * pool.length)];
        if (enemy.mods.includes(key)) continue;
        enemy.mods.push(key);
        const m = ENEMY_MODS[key];
        if (m.atkSpd) enemy.stats.atkSpd = Math.min(2.5, enemy.stats.atkSpd * m.atkSpd);
        if (m.vamp) enemy.stats.vamp += m.vamp;
        if (m.def) enemy.stats.def = Math.round(enemy.stats.def * m.def);
        if (m.regen) enemy.regenPerSec = Math.max(1, Math.round(enemy.stats.hpMax * m.regen));
    }
};

// ===== Boss Phase System =====
// Bosses (guardians / monarchs) fight in HP phases. Crossing a threshold grants
// the boss a fixed set of phase effects and briefly staggers it.
const BOSS_PHASE_THRESHOLDS = {
    guardian: [0.66, 0.33],
    sboss:    [0.75, 0.5, 0.25],
};
const BOSS_PHASE_STAGGER = { guardian: 800, sboss: 1000 };

// Phase effect pool (~20 kinds). apply() mutates the enemy; checks in combat.js
// read the resulting fields (dr, dodge, thornsPct, noCrit, statusResist, ...).
const ENEMY_PHASE_EFFECTS = {
    atk_surge:  { name: "ATK Surge",      apply: e => { e.stats.atk = Math.round(e.stats.atk * 1.25); } },
    iron_hide:  { name: "Iron Hide",      apply: e => { e.stats.def = Math.round(e.stats.def * 1.35); } },
    swift:      { name: "Swiftness",      apply: e => { e.stats.atkSpd = Math.min(2.5, e.stats.atkSpd * 1.2); } },
    keen:       { name: "Keen Sight",     apply: e => { e.stats.critRate = Math.min(80, e.stats.critRate + 15); } },
    heavy_crit: { name: "Heavy Crits",    apply: e => { e.stats.critDmg = Math.round(e.stats.critDmg * 1.4); } },
    leech:      { name: "Leeching",       apply: e => { e.stats.vamp += 6; } },
    bulwark:    { name: "Bulwark",        apply: e => { const add = Math.round(e.stats.hpMax * 0.25); e.stats.hpMax += add; e.stats.hp = Math.min(e.stats.hpMax, e.stats.hp + add); } },
    regen:      { name: "Regeneration",   apply: e => { e.regenPerSec = Math.max(e.regenPerSec || 0, Math.round(e.stats.hpMax * 0.015)); } },
    enrage:     { name: "Enrage",         apply: e => { e.enragePhase = true; } },
    stone_skin: { name: "Stone Skin",     apply: e => { e.dr = (e.dr || 0) + 12; } },
    reflect:    { name: "Retaliation",    apply: e => { e.thornsPct = (e.thornsPct || 0) + 8; } },
    dodge:      { name: "Phantom Step",   apply: e => { e.dodge = (e.dodge || 0) + 12; } },
    no_crit:    { name: "Nullify",        apply: e => { e.noCrit = true; } },
    heavy_five: { name: "Heavy Blows",    apply: e => { e.heavyEvery = 5; } },
    double:     { name: "Twin Strikes",   apply: e => { e.doubleStrike = 0.15; } },
    momentum:   { name: "Momentum",       apply: e => { e.momentumRamp = true; } },
    empowered:  { name: "Empowerment",    apply: e => { e.empoweredNext = true; } },
    desperado:  { name: "Desperado",      apply: e => { e.desperado = true; } },
    ward:       { name: "Null Ward",      apply: e => { e.statusResist = true; } },
    second_wind:{ name: "Second Wind",    apply: e => { e.bossSecondWind = true; } },
};

// Fixed phase-effect table per boss. Index = phase transition (P1->P2 is [0]).
// Guardians get 2 entries, monarchs get 3.
const BOSS_PHASE_TABLE = {
    // ===== Guardians =====
    'Zaart, the Dominator Goblin': [["atk_surge"], ["enrage"]],
    'Banshee, Skeleton Lord':      [["keen"], ["double"]],
    'Molten Spider':               [["leech"], ["heavy_five"]],
    'Cerberus Ptolemaios':         [["atk_surge"], ["double"]],
    'Hellhound Inferni':           [["swift"], ["enrage"]],
    'Berthelot, the Undead King':  [["iron_hide"], ["reflect"]],
    'Slime King':                  [["bulwark"], ["regen"]],
    'Zodiac Cancer':               [["stone_skin"], ["ward"]],
    'Alfadriel, the Light Titan':  [["keen"], ["empowered"]],
    'Tiamat, the Dragon Knight':   [["atk_surge"], ["desperado"]],
    'Nameless Fallen King':        [["iron_hide"], ["second_wind"]],
    'Zodiac Aries':                [["swift"], ["dodge"]],
    'Llyrrad, the Ant Queen':       [["momentum"], ["double"]],
    'Clockwork Spider':            [["dodge"], ["heavy_five"]],
    'Aragorn, the Lethal Wolf':    [["leech"], ["enrage"]],
    // ===== Monarchs =====
    'Naizicher, the Spider Dragon': [["swift"], ["momentum"], ["double"]],
    'Ulliot, the Deathlord':        [["iron_hide"], ["regen"], ["reflect", "stone_skin"]],
    'Ifrit':                        [["atk_surge"], ["enrage"], ["heavy_five"]],
    'Shiva':                        [["keen"], ["dodge"], ["stone_skin"]],
    'Behemoth':                     [["bulwark"], ["iron_hide"], ["second_wind"]],
    'Blood Manipulation Feral':     [["leech"], ["desperado"], ["enrage"]],
    'Thanatos':                     [["no_crit"], ["reflect"], ["empowered"]],
    'Darkness Angel Reaper':        [["swift"], ["dodge"], ["double"]],
    'Zalaras, the Dragon Emperor':  [["atk_surge"], ["heavy_crit"], ["enrage", "heavy_five"]],
};
const BOSS_PHASE_DEFAULTS = {
    guardian: [["atk_surge"], ["enrage"]],
    sboss:    [["atk_surge"], ["swift"], ["enrage"]],
};

const gainEnemyPhaseEffect = (id) => {
    const eff = ENEMY_PHASE_EFFECTS[id];
    if (!eff || enemy.phaseEffects.includes(id)) return;
    enemy.phaseEffects.push(id);
    eff.apply(enemy);
    addCombatLog(tParams("cb.bossGain", { name: enemy.name, effect: eff.name }));
};

const checkEnemyPhase = () => {
    if (!enemy || !enemy.isBoss || enemyDead || enemy.stats.hp <= 0) return;
    let crossed = 0;
    for (const t of enemy.phaseThresholds) {
        if (enemy.stats.hp <= enemy.stats.hpMax * t) crossed++;
    }
    const newPhase = 1 + crossed;
    if (newPhase <= enemy.phase) return;
    enemy.phase = newPhase;
    enemy.staggerUntil = Date.now() + BOSS_PHASE_STAGGER[enemy.bossKind];
    const table = BOSS_PHASE_TABLE[enemy.name] || BOSS_PHASE_DEFAULTS[enemy.bossKind] || BOSS_PHASE_DEFAULTS.guardian;
    const effects = table[newPhase - 2] || [];
    addCombatLog(tParams("cb.bossPhase", { name: enemy.name, p: newPhase }));
    const sprite = document.querySelector("#enemy-sprite");
    if (sprite) {
        sprite.classList.remove("phase-flash");
        void sprite.offsetWidth;
        sprite.classList.add("phase-flash");
        setTimeout(() => sprite.classList.remove("phase-flash"), 900);
    }
    for (const id of effects) gainEnemyPhaseEffect(id);
};

const generateRandomEnemy = (condition) => {
    enemy.elite = false;
    enemy.named = false;
    enemy.stageBoss = false;
    enemy.mods = [];
    enemy.combatDebuffs = [];
    // Boss phase state
    enemy.isBoss = (condition === "guardian" || condition === "sboss");
    enemy.bossKind = enemy.isBoss ? condition : null;
    enemy.phase = 1;
    enemy.phaseEffects = [];
    enemy.phaseThresholds = enemy.isBoss ? BOSS_PHASE_THRESHOLDS[condition] : null;
    enemy.staggerUntil = 0;
    enemy.attackCount = 0;
    enemy.empoweredNext = false;
    enemy.momentumRamp = false;
    enemy.momentumSpd = 0;
    enemy.dr = 0;
    enemy.dodge = 0;
    enemy.thornsPct = 0;
    enemy.noCrit = false;
    enemy.statusResist = false;
    enemy.bossSecondWind = false;
    enemy.bossSecondWindUsed = false;
    enemy.enragePhase = false;
    enemy.desperado = false;
    enemy.heavyEvery = 0;
    enemy.doubleStrike = 0;
    delete enemy.dot;
    delete enemy.regenPerSec;
    // List of possible enemy names
    const enemyNames = [
        // Goblin
        'Goblin', 'Goblin Rogue', 'Goblin Mage', 'Goblin Archer',
        // Wolf
        'Wolf', 'Black Wolf', 'Winter Wolf',
        // Slime
        'Slime', 'Angel Slime', 'Knight Slime', 'Crusader Slime',
        // Orc
        'Orc Swordsmaster', 'Orc Axe', 'Orc Archer', 'Orc Mage',
        // Spider
        'Spider', 'Red Spider', 'Green Spider',
        // Skeleton
        'Skeleton Archer', 'Skeleton Swordsmaster', 'Skeleton Knight', 'Skeleton Mage', 'Skeleton Pirate', 'Skeleton Samurai', 'Skeleton Warrior',
        // Bosses
        'Zaart, the Dominator Goblin', 'Banshee, Skeleton Lord', 'Molten Spider', 'Cerberus Ptolemaios', 'Hellhound Inferni', 'Berthelot, the Undead King', 'Slime King', 'Zodiac Cancer', 'Alfadriel, the Light Titan', 'Tiamat, the Dragon Knight', 'Nameless Fallen King', 'Zodiac Aries', 'Llyrrad, the Ant Queen', 'Clockwork Spider', 'Aragorn, the Lethal Wolf',
        // Monarch
        'Naizicher, the Spider Dragon', 'Ulliot, the Deathlord', 'Ifrit', 'Shiva', 'Behemoth', 'Blood Manipulation Feral', 'Thanatos', 'Darkness Angel Reaper', 'Zalaras, the Dragon Emperor'
    ];
    const enemyTypes = ['Offensive', 'Defensive', 'Balanced', 'Quick', 'Lethal'];
    let selectedEnemies = null;

    // Generate enemy type
    enemy.type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    // Calculate enemy level
    const maxLvl = dungeon.progress.floor * dungeon.settings.enemyLvlGap + (dungeon.settings.enemyBaseLvl - 1);
    const minLvl = maxLvl - (dungeon.settings.enemyLvlGap - 1);
    if (condition == "guardian") {
        enemy.lvl = minLvl;
    } else if (condition == "sboss") {
        enemy.lvl = maxLvl;
    } else {
        enemy.lvl = randomizeNum(minLvl, maxLvl);
    }

    // Generate proper enemy info
    switch (enemy.type) {
        case "Offensive":
            // Select name and apply stats for Offensive enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'Zaart, the Dominator Goblin', 'Banshee, Skeleton Lord', 'Molten Spider', 'Berthelot, the Undead King'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'Behemoth', 'Zalaras, the Dragon Emperor'
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Goblin Mage', 'Goblin Archer',
                    'Wolf', 'Black Wolf', 'Winter Wolf',
                    'Knight Slime',
                    'Orc Swordsmaster', 'Orc Axe', 'Orc Archer', 'Orc Mage',
                    'Red Spider',
                    'Skeleton Archer', 'Skeleton Swordsmaster', 'Skeleton Mage', 'Skeleton Pirate', 'Skeleton Samurai',
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
        case "Defensive":
            // Select name and apply stats for Defensive enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'Slime King', 'Zodiac Cancer', 'Alfadriel, the Light Titan'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'Ulliot, the Deathlord',
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Angel Slime', 'Knight Slime', 'Crusader Slime',
                    'Green Spider',
                    'Skeleton Knight', 'Skeleton Warrior'
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
        case "Balanced":
            // Select name and apply stats for Balanced enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'Tiamat, the Dragon Knight', 'Nameless Fallen King', 'Zodiac Aries'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'Ifrit', 'Shiva', 'Thanatos'
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Goblin',
                    'Slime', 'Angel Slime', 'Knight Slime',
                    'Orc Swordsmaster', 'Orc Axe', 'Orc Archer', 'Orc Mage',
                    'Spider',
                    'Skeleton Knight', 'Skeleton Warrior'
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
        case "Quick":
            // Select name and apply stats for Quick enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'Llyrrad, the Ant Queen', 'Clockwork Spider'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'Darkness Angel Reaper', 'Naizicher, the Spider Dragon'
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Goblin', 'Goblin Rogue', 'Goblin Archer',
                    'Wolf', 'Black Wolf', 'Winter Wolf',
                    'Orc Swordsmaster',
                    'Spider', 'Red Spider', 'Green Spider',
                    'Skeleton Swordsmaster', 'Skeleton Pirate', 'Skeleton Samurai'
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
        case "Lethal":
            // Select name and apply stats for Lethal enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'Aragorn, the Lethal Wolf', 'Cerberus Ptolemaios', 'Hellhound Inferni'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'Blood Manipulation Feral'
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Goblin Rogue',
                    'Wolf', 'Black Wolf', 'Winter Wolf',
                    'Orc Swordsmaster', 'Orc Axe',
                    'Red Spider',
                    'Skeleton Swordsmaster', 'Skeleton Samurai'
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
    }
    if (condition == "chest") {
        enemy.name = "Mimic";
    } else if (condition == "door") {
        enemy.name = "Door Mimic";
    }
    if (condition == "guardian" || condition == "sboss") {
        enemy.named = true;
    }
    setEnemyImg();
    if (!condition && Math.random() < 0.12) {
        applyElite();
    }
    applyEnemyModifiers(condition);
}

// Set a randomly generated stat for the enemy
const setEnemyStats = (type, condition) => {
    if (type == "Offensive") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(300, 370),
            atk: randomizeNum(70, 100),
            def: randomizeNum(20, 50),
            atkSpd: randomizeDecimal(0.2, 0.4),
            vamp: 0,
            critRate: randomizeDecimal(1, 4),
            critDmg: randomizeDecimal(6.5, 7.5)
        };
    } else if (type == "Defensive") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(400, 500),
            atk: randomizeNum(40, 70),
            def: randomizeNum(40, 70),
            atkSpd: randomizeDecimal(0.1, 0.3),
            vamp: 0,
            critRate: 0,
            critDmg: 0
        };
    } else if (type == "Balanced") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(320, 420),
            atk: randomizeNum(50, 80),
            def: randomizeNum(30, 60),
            atkSpd: randomizeDecimal(0.15, 0.35),
            vamp: 0,
            critRate: randomizeDecimal(0.5, 1.5),
            critDmg: randomizeDecimal(1, 3)
        };
    } else if (type == "Quick") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(300, 370),
            atk: randomizeNum(50, 80),
            def: randomizeNum(30, 60),
            atkSpd: randomizeDecimal(0.35, 0.45),
            vamp: 0,
            critRate: randomizeDecimal(1, 4),
            critDmg: randomizeDecimal(3, 6)
        };
    } else if (type == "Lethal") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(300, 370),
            atk: randomizeNum(70, 100),
            def: randomizeNum(20, 50),
            atkSpd: randomizeDecimal(0.15, 0.35),
            vamp: 0,
            critRate: randomizeDecimal(4, 8),
            critDmg: randomizeDecimal(6, 9)
        };
    }

    if (dungeon.enemyMultipliers == undefined) {
        dungeon.enemyMultipliers = {
            hp: 1.4,
            atk: 1,
            def: 1,
            atkSpd: 1,
            vamp: 1,
            critRate: 1,
            critDmg: 1
        }
    }
    // One-time migration: global enemy HP buff (+40%) for saves created before it
    if (!dungeon.enemyHpBuffed && dungeon.enemyMultipliers.hp === 1) {
        dungeon.enemyMultipliers.hp = 1.4;
        dungeon.enemyHpBuffed = true;
    }

    // Apply stat scaling for enemies each level
    for (const stat in enemy.stats) {
        if (["hpMax", "atk", "def"].includes(stat)) {
            enemy.stats[stat] += Math.round(enemy.stats[stat] * ((dungeon.settings.enemyScaling - 1) * enemy.lvl));
        } else if (["atkSpd"].includes(stat)) {
            enemy.stats[stat] = 0.4;
            enemy.stats[stat] += enemy.stats[stat] * (((dungeon.settings.enemyScaling - 1) / 4) * enemy.lvl);
        } else if (["critRate"].includes(stat)) {
            enemy.stats[stat] += enemy.stats[stat] * (((dungeon.settings.enemyScaling - 1) / 4) * enemy.lvl);
        } else if (["critDmg"].includes(stat)) {
            enemy.stats[stat] = 50;
            enemy.stats[stat] += enemy.stats[stat] * (((dungeon.settings.enemyScaling - 1) / 4) * enemy.lvl);
        }
    }

    // Stat multiplier for floor guardians
    if (condition == "guardian") {
        enemy.stats.hpMax = enemy.stats.hpMax * 1.5;
        enemy.stats.atk = enemy.stats.atk * 1.3;
        enemy.stats.def = enemy.stats.def * 1.3;
        enemy.stats.critRate = enemy.stats.critRate * 1.1;
        enemy.stats.critDmg = enemy.stats.critDmg * 1.2;
    }

    // Stat multiplier for monarchs
    if (condition == "sboss") {
        enemy.stats.hpMax = enemy.stats.hpMax * 6;
        enemy.stats.atk = enemy.stats.atk * 2;
        enemy.stats.def = enemy.stats.def * 2;
        enemy.stats.critRate = enemy.stats.critRate * 1.1;
        enemy.stats.critDmg = enemy.stats.critDmg * 1.3;
    }

    // Apply stat multipliers for every stat
    let floorMultiplier = (dungeon.progress.floor / 3);
    if (floorMultiplier < 1) {
        floorMultiplier = 1;
    }
    enemy.stats.hpMax = Math.round((enemy.stats.hpMax * floorMultiplier) * dungeon.enemyMultipliers.hp);
    enemy.stats.atk = Math.round(enemy.stats.atk * dungeon.enemyMultipliers.atk);
    enemy.stats.def = Math.round(enemy.stats.def * dungeon.enemyMultipliers.def);
    enemy.stats.atkSpd = enemy.stats.atkSpd * dungeon.enemyMultipliers.atkSpd;
    enemy.stats.vamp = enemy.stats.vamp * dungeon.enemyMultipliers.vamp;
    enemy.stats.critRate = enemy.stats.critRate * dungeon.enemyMultipliers.critRate;
    enemy.stats.critDmg = enemy.stats.critDmg * dungeon.enemyMultipliers.critDmg;

    // Scale with player level so monsters keep pace with gear/level growth
    const lvlGap = (player && player.lvl ? player.lvl : 1) - enemy.lvl;
    if (lvlGap > 0) {
        const pressure = Math.min(3, 1 + lvlGap * 0.07);
        enemy.stats.hpMax = Math.round(enemy.stats.hpMax * pressure);
        enemy.stats.atk = Math.round(enemy.stats.atk * pressure);
        enemy.stats.def = Math.round(enemy.stats.def * pressure);
        enemy.stats.critRate = Math.min(50, enemy.stats.critRate + lvlGap);
        enemy.stats.critDmg = Math.min(300, enemy.stats.critDmg + lvlGap * 2);
    }

    // Difficulty mode scaling
    const diff = currentDifficulty();
    enemy.stats.hpMax = Math.round(enemy.stats.hpMax * diff.hp);
    enemy.stats.atk = Math.round(enemy.stats.atk * diff.atk);
    enemy.stats.def = Math.round(enemy.stats.def * diff.def);
    enemy.stats.atkSpd = Math.min(2.5, enemy.stats.atkSpd * diff.atkSpd);
    enemy.stats.critRate = Math.min(80, enemy.stats.critRate + diff.critRate);
    enemy.stats.critDmg = Math.round(enemy.stats.critDmg * diff.critDmg);

    // NG+ cycle scaling: each cleared OMEGA run strengthens enemies (+30% stats, +15% rewards per cycle)
    const ngPlus = (player && player.ngPlus) || 0;
    if (ngPlus > 0) {
        const ngStat = 1 + 0.3 * ngPlus;
        enemy.stats.hpMax = Math.round(enemy.stats.hpMax * ngStat);
        enemy.stats.atk = Math.round(enemy.stats.atk * ngStat);
        enemy.stats.def = Math.round(enemy.stats.def * ngStat);
    }
    const ngReward = 1 + 0.15 * ngPlus;

    // Calculate exp and gold that the monster gives
    const expYield = [];

    for (const stat in enemy.stats) {
        let statExp;
        if (["hpMax", "atk", "def"].includes(stat)) {
            statExp = enemy.stats[stat] + enemy.stats[stat] * 0.5;
        } else if (["atkSpd", "critRate", "critDmg"].includes(stat)) {
            statExp = enemy.stats[stat] + enemy.stats[stat] * 2;
        } else if (["vamp", "hp"].includes(stat)) {
            statExp = enemy.stats[stat] + enemy.stats[stat] * 1;
        }
        expYield.push(statExp);
    }

    let expCalculation = (expYield.reduce((acc, cur) => acc + cur, 0)) / 20;
    enemy.rewards.exp = Math.round((expCalculation + expCalculation * (enemy.lvl * 0.1)) * diff.reward * ngReward);
    if (enemy.rewards.exp > 1000000) {
        enemy.rewards.exp = 1000000 * randomizeDecimal(0.9, 1.1);
    }
    enemy.rewards.gold = Math.round((enemy.rewards.exp * randomizeDecimal(0.9, 1.1)) * 1.5 * diff.reward * ngReward);
    enemy.rewards.drop = randomizeNum(1, diff.dropRoll);
    if (enemy.rewards.drop == 1) {
        enemy.rewards.drop = true;
    } else {
        enemy.rewards.drop = false;
    }

    enemy.stats.hp = enemy.stats.hpMax;
    enemy.stats.hpPercent = 100;

    // Caps attack speed to 2.5
    if (enemy.stats.atkSpd > 2.5) {
        enemy.stats.atkSpd = 2.5;
    }
}

const setEnemyImg = () => {
    // Apply monster image
    enemy.image.type = '.png';
    switch (enemy.name) {
        // Goblins
        case 'Goblin':
            enemy.image.name = 'goblin';
            enemy.image.size = '50%';
            break;
        case 'Goblin Rogue':
            enemy.image.name = 'goblin_rogue';
            enemy.image.size = '50%';
            break;
        case 'Goblin Archer':
            enemy.image.name = 'goblin_archer';
            enemy.image.size = '50%';
            break;
        case 'Goblin Mage':
            enemy.image.name = 'goblin_mage';
            enemy.image.size = '50%';
            break;

        // Wolf
        case 'Wolf':
            enemy.image.name = 'wolf';
            enemy.image.size = '50%';
            break;
        case 'Black Wolf':
            enemy.image.name = 'wolf_black';
            enemy.image.size = '50%';
            break;
        case 'Winter Wolf':
            enemy.image.name = 'wolf_winter';
            enemy.image.size = '50%';
            break;

        // Slime
        case 'Slime':
            enemy.image.name = 'slime';
            enemy.image.size = '50%';
            break;
        case 'Angel Slime':
            enemy.image.name = 'slime_angel';
            enemy.image.size = '50%';
            break;
        case 'Knight Slime':
            enemy.image.name = 'slime_knight';
            enemy.image.size = '50%';
            break;
        case 'Crusader Slime':
            enemy.image.name = 'slime_crusader';
            enemy.image.size = '50%';
            break;

        // Orc
        case 'Orc Swordsmaster':
            enemy.image.name = 'orc_swordsmaster';
            enemy.image.size = '50%';
            break;
        case 'Orc Axe':
            enemy.image.name = 'orc_axe';
            enemy.image.size = '50%';
            break;
        case 'Orc Archer':
            enemy.image.name = 'orc_archer';
            enemy.image.size = '50%';
            break;
        case 'Orc Mage':
            enemy.image.name = 'orc_mage';
            enemy.image.size = '50%';
            break;

        // Spider
        case 'Spider':
            enemy.image.name = 'spider';
            enemy.image.size = '50%';
            break;
        case 'Red Spider':
            enemy.image.name = 'spider_red';
            enemy.image.size = '50%';
            break;
        case 'Green Spider':
            enemy.image.name = 'spider_green';
            enemy.image.size = '50%';
            break;

        // Skeleton
        case 'Skeleton Archer':
            enemy.image.name = 'skeleton_archer';
            enemy.image.size = '50%';
            break;
        case 'Skeleton Swordsmaster':
            enemy.image.name = 'skeleton_swordsmaster';
            enemy.image.size = '50%';
            break;
        case 'Skeleton Knight':
            enemy.image.name = 'skeleton_knight';
            enemy.image.size = '50%';
            break;
        case 'Skeleton Mage':
            if (randomizeNum(1, 2) == 1) {
                enemy.image.name = 'skeleton_mage1';
            } else {
                enemy.image.name = 'skeleton_mage2';
            }
            enemy.image.size = '50%';
            break;
        case 'Skeleton Pirate':
            enemy.image.name = 'skeleton_pirate';
            enemy.image.size = '50%';
            break;
        case 'Skeleton Samurai':
            enemy.image.name = 'skeleton_samurai';
            enemy.image.size = '50%';
            break;
        case 'Skeleton Warrior':
            enemy.image.name = 'skeleton_warrior';
            enemy.image.size = '50%';
            break;

        // Mimic
        case 'Mimic':
            enemy.image.name = 'mimic';
            enemy.image.size = '50%';
            break;
        case 'Door Mimic':
            enemy.image.name = 'mimic_door';
            enemy.image.size = '50%';
            break;

        // Bosses
        case 'Zaart, the Dominator Goblin':
            enemy.image.name = 'goblin_boss';
            enemy.image.size = '87.5%';
            break;
        case 'Banshee, Skeleton Lord':
            enemy.image.name = 'skeleton_boss';
            enemy.image.size = '50%';
            break;
        case 'Molten Spider':
            enemy.image.name = 'spider_fire';
            enemy.image.size = '50%';
            break;
        case 'Cerberus Ptolemaios':
            enemy.image.name = 'cerberus_ptolemaios';
            enemy.image.size = '50%';
            break;
        case 'Hellhound Inferni':
            enemy.image.name = 'hellhound';
            enemy.image.size = '50%';
            break;
        case 'Berthelot, the Undead King':
            enemy.image.name = 'berthelot';
            enemy.image.size = '50%';
            break;
        case 'Slime King':
            enemy.image.name = 'slime_boss';
            enemy.image.size = '50%';
            break;
        case 'Zodiac Cancer':
            enemy.image.name = 'zodiac_cancer';
            enemy.image.size = '50%';
            break;
        case 'Alfadriel, the Light Titan':
            enemy.image.name = 'alfadriel';
            enemy.image.size = '50%';
            break;
        case 'Tiamat, the Dragon Knight':
            enemy.image.name = 'tiamat';
            enemy.image.size = '50%';
            break;
        case 'Nameless Fallen King':
            enemy.image.name = 'fallen_king';
            enemy.image.size = '50%';
            break;
        case 'Zodiac Aries':
            enemy.image.name = 'zodiac_aries';
            enemy.image.size = '50%';
            break;
        case 'Clockwork Spider':
            enemy.image.name = 'spider_boss';
            enemy.image.size = '50%';
            break;
        case 'Llyrrad, the Ant Queen':
            enemy.image.name = 'ant_queen';
            enemy.image.size = '50%';
            break;
        case 'Aragorn, the Lethal Wolf':
            enemy.image.name = 'wolf_boss';
            enemy.image.size = '50%';
            break;

        // Special Boss
        case 'Naizicher, the Spider Dragon':
            enemy.image.name = 'spider_dragon';
            enemy.image.size = '87.5%';
            break;
        case 'Ulliot, the Deathlord':
            enemy.image.name = 'skeleton_dragon';
            enemy.image.size = '87.5%';
            break;
        case 'Ifrit':
            enemy.image.name = 'firelord';
            enemy.image.size = '87.5%';
            break;
        case 'Shiva':
            enemy.image.name = 'icemaiden';
            enemy.image.size = '87.5%';
            break;
        case 'Behemoth':
            enemy.image.name = 'behemoth';
            enemy.image.size = '87.5%';
            break;
        case 'Blood Manipulation Feral':
            enemy.image.name = 'bm-feral';
            enemy.image.size = '87.5%';
            break;
        case 'Thanatos':
            enemy.image.name = 'thanatos';
            enemy.image.size = '93%';
            break;
        case 'Darkness Angel Reaper':
            enemy.image.name = 'da-reaper';
            enemy.image.size = '87.5%';
            break;
        case 'Zalaras, the Dragon Emperor':
            enemy.image.name = 'zalaras';
            enemy.image.size = '87.5%';
            break;
    };
}

const enemyLoadStats = () => {
    checkEnemyPhase();
    // Shows proper percentage for respective stats
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    if (enemy.stats.hp > enemy.stats.hpMax) {
        enemy.stats.hp = enemy.stats.hpMax;
    }
    enemy.stats.hpPercent = ((enemy.stats.hp / enemy.stats.hpMax) * 100).toFixed(2).replace(rx, "$1");

    const enemyHpElement = document.querySelector('#enemy-hp-battle');
    const enemyHpTextElement = document.querySelector('#enemy-hp-text');
    const enemyHpDamageElement = document.querySelector('#enemy-hp-dmg');
    enemyHpTextElement.innerHTML = `&nbsp${nFormatter(enemy.stats.hp)}/${nFormatter(enemy.stats.hpMax)} (${enemy.stats.hpPercent}%)`;
    enemyHpElement.style.width = `${enemy.stats.hpPercent}%`;
    enemyHpDamageElement.style.width = `${enemy.stats.hpPercent}%`;
}