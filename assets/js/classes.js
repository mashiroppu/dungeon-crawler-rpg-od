// ===== Classes & Abilities =====
const CLASSES = {
    warrior: { name: "Warrior", desc: "Frontline fighter. High HP/ATK/DEF.", mult: { hp: 1.25, atk: 1.1, def: 1.2, atkSpd: 1 }, add: { critRate: 0, critDmg: 0 } },
    mage:    { name: "Mage",    desc: "Glass cannon. High ATK and crit damage.", mult: { hp: 0.85, atk: 1.15, def: 0.9, atkSpd: 1 }, add: { critRate: 5, critDmg: 25 } },
    rogue:   { name: "Rogue",   desc: "Speedster. High ATK.SPD and crit rate.", mult: { hp: 0.9, atk: 1.05, def: 0.95, atkSpd: 1.3 }, add: { critRate: 12, critDmg: 10 } },
    lancer:  { name: "Lancer",  desc: "Reach fighter. High ATK.SPD, solid ATK/DEF.", mult: { hp: 1.0, atk: 1.08, def: 1.05, atkSpd: 1.2 }, add: { critRate: 5, critDmg: 10 } },
    paladin: { name: "Paladin", desc: "Holy defender. Reflects damage, shields and heals.", mult: { hp: 1.3, atk: 0.95, def: 1.25, atkSpd: 0.95 }, add: { critRate: 0, critDmg: 0 } },
};

// Each class: 6 abilities with distinct roles (nuke / multi-hit / DoT / CC / buff / sustain / defense / finisher)
const ABILITIES = {
    // ===== Warrior: balanced bruiser — nuke, control, defense, buffs, sustain, finisher =====
    cleave:        { cls: "warrior", lvl: 1,  cd: 3.2, rec: 0.75, uses: 4, name: "Cleave",          desc: "Deal 260% ATK damage.",                                  icon: "ra-axe" },
    temporal_snare:{ cls: "warrior", lvl: 8,  cd: 6, rec: 1, uses: 3, name: "Temporal Snare",   desc: "150% ATK dmg, enemy ATK.SPD -50% for 6s.",                 icon: "ra-hourglass-sand" },
    shield_wall:   { cls: "warrior", lvl: 5,  cd: 5.5, rec: 1, uses: 2, name: "Shield Wall",    desc: "Shield 25% max HP + DEF +30% for 8s.",                    icon: "ra-shield" },
    warcry:        { cls: "warrior", lvl: 12, cd: 5, rec: 1, uses: 3, name: "War Cry",         desc: "+35% damage for 12s.",                                     icon: "ra-lightning-storm" },
    undying_oath:  { cls: "warrior", lvl: 20, cd: 6.5, rec: 1.25, uses: 2, name: "Undying Oath",   desc: "100% ATK dmg + regen 3% max HP/s for 10s.",               icon: "ra-crowned-heart" },
    execute:       { cls: "warrior", lvl: 25, cd: 7.5, rec: 1.25, uses: 2, name: "Execute",         desc: "220% ATK dmg — 550% if enemy HP is below 30%.",          icon: "ra-sword" },
    // ===== Mage: glass cannon — nuke, multi-hit, DoT, slow, hard CC, shield =====
    fireball:      { cls: "mage",    lvl: 1,  cd: 3.5, rec: 0.75, uses: 4, name: "Fireball",        desc: "350% ATK dmg, ignores 50% DEF.",                          icon: "ra-fire-breath" },
    petrify:       { cls: "mage",    lvl: 8,  cd: 6, rec: 1, uses: 3, name: "Petrify",          desc: "150% dmg. Builds petrify (5 stacks = petrified 4s: no attacks, +25% dmg taken). Hits during petrify deal bonus damage.", icon: "ra-hourglass" },
    flame_nova:    { cls: "mage",    lvl: 5,  cd: 4, rec: 0.75, uses: 3, name: "Flame Nova",      desc: "200% ATK dmg + burn (1.5% max HP/s for 8s).",             icon: "ra-fire-ring" },
    frostbolt:     { cls: "mage",    lvl: 12, cd: 4, rec: 0.75, uses: 3, name: "Frostbolt",       desc: "180% dmg, slows enemy ATK.SPD 35%/6s.",                   icon: "ra-snowflake" },
    stasis:        { cls: "mage",    lvl: 15, cd: 8, rec: 1.25, uses: 2, name: "Stasis",          desc: "Freezes enemy for 2s (ATK.SPD -95%).",                    icon: "ra-hourglass" },
    mana_shield:   { cls: "mage",    lvl: 25, cd: 5.5, rec: 1, uses: 3, name: "Mana Shield",     desc: "Shield absorbing 45% of max HP.",                          icon: "ra-potion" },
    // ===== Rogue: speedster — nuke, atk-spd buff, poison, defense, crit buff, multi-hit =====
    backstab:      { cls: "rogue",   lvl: 1,  cd: 3.2, rec: 0.75, uses: 4, name: "Backstab",        desc: "Deal 350% ATK damage.",                                    icon: "ra-diving-dagger" },
    fan_of_knives: { cls: "rogue",   lvl: 1,  cd: 3.8, rec: 0.75, uses: 5, name: "Fan of Knives",   desc: "180% ATK dmg, +30% ATK.SPD for 6s.",                       icon: "ra-arrow-cluster" },
    venom_dagger:  { cls: "rogue",   lvl: 5,  cd: 4.8, rec: 1, uses: 3, name: "Venom Dagger",    desc: "120% ATK dmg + poison (1.25% max HP/s for 8s).",          icon: "ra-poison-cloud" },
    godspeed:      { cls: "rogue",   lvl: 12, cd: 7, rec: 1.25, uses: 2, name: "Godspeed",        desc: "+100% ATK.SPD for 10s.",                                   icon: "ra-dash" },
    deadly_precision:{ cls: "rogue", lvl: 18, cd: 5, rec: 1, uses: 2, name: "Deadly Precision",desc: "300% ATK dmg, +30% crit rate for 8s.",                  icon: "ra-targeted" },
    thousand_cuts: { cls: "rogue",   lvl: 25, cd: 6, rec: 1, uses: 5, name: "Thousand Cuts",   desc: "7 hits of 70% ATK damage.",                               icon: "ra-daggers" },
    // ===== Lancer: reach fighter — pierce nukes, atk-spd, sweep control, stun, atk debuff, ultimate =====
    impale:        { cls: "lancer",  lvl: 1,  cd: 3.2, rec: 0.75, uses: 4, name: "Impale",          desc: "300% ATK dmg, pierces 25% of DEF.",                        icon: "ra-spear-head" },
    dragon_thrust: { cls: "lancer",  lvl: 1,  cd: 3.8, rec: 0.75, uses: 4, name: "Dragon's Thrust",  desc: "220% ATK dmg, +40% ATK.SPD for 5s.",                    icon: "ra-dragon" },
    afterimage:    { cls: "lancer",  lvl: 8,  cd: 5.5, rec: 1, uses: 3, name: "Afterimage",       desc: "100% ATK dmg. For 8s, attacks have 30% chance to strike again at 50% (can chain).", icon: "ra-ghost" },
    sky_piercer:   { cls: "lancer",  lvl: 5,  cd: 6.5, rec: 1.25, uses: 2, name: "Sky Piercer",     desc: "280% ATK dmg, pierces 60% DEF, stuns 1s.",                icon: "ra-supersonic-arrow" },
    dragon_roar:   { cls: "lancer",  lvl: 15, cd: 5, rec: 1, uses: 3, name: "Dragon Roar",     desc: "180% ATK dmg, enemy ATK -40% for 5s.",                    icon: "ra-dragon-breath" },
    dragon_fall:   { cls: "lancer",  lvl: 25, cd: 8, rec: 1.25, uses: 2, name: "Dragon's Fall",   desc: "450% ATK dmg, ignores 50% DEF.",                           icon: "ra-two-dragons" },
    // ===== Paladin: holy counterattacker — strike+heal, reflect, armor break, shield, conditional nuke, ultimate =====
    holy_strike:   { cls: "paladin", lvl: 1,  cd: 3.5, rec: 0.75, uses: 4, name: "Holy Strike",     desc: "240% ATK dmg, recover 8% max HP.",                       icon: "ra-lightning-sword" },
    judgment_counter:{ cls: "paladin",lvl: 15, cd: 6, rec: 1, uses: 2, name: "Judgment Counter",desc: "For 8s, reflect 200% damage taken but take +30% damage.",  icon: "ra-gavel" },
    thorns_nova:   { cls: "paladin", lvl: 10, cd: 5.5, rec: 1, uses: 3, name: "Thorns Nova",     desc: "150% ATK dmg. For 10s, reflected damage also bursts for +50%.", icon: "ra-cactus" },
    aegis_oath:    { cls: "paladin", lvl: 12, cd: 6, rec: 1, uses: 2, name: "Aegis Oath",      desc: "Shield 30% max HP, reflect 50% for 10s.",                 icon: "ra-round-shield" },
    divine_judgement:{ cls: "paladin",lvl: 20, cd: 7.5, rec: 1.25, uses: 2, name: "Divine Judgement",desc: "300% ATK dmg — 500% while shielded.",               icon: "ra-on-target" },
    sanctuary:     { cls: "paladin", lvl: 25, cd: 8, rec: 1.25, uses: 2, name: "Sanctuary",       desc: "Heal 30% max HP, shield 20%, reflect 40% for 12s.",        icon: "ra-angel-wings" },
};

const playerClassKey = () => (player && CLASSES[player.cls]) ? player.cls : "warrior";

const unlockedAbilities = () => {
    const out = [];
    for (const id in ABILITIES) {
        const a = ABILITIES[id];
        if (a.cls === playerClassKey() && player.lvl >= a.lvl) out.push({ id, ...a });
    }
    return out;
};

// Max 4 abilities can be slotted. Loadout is stored on player.abilityLoadout (persisted via saveData).
const MAX_ABILITY_SLOTS = 3;

// Charges: player.abilityCharges[id] (0..uses). Missing entry = full stock.
const abilityMaxUses = (id) => {
    const a = ABILITIES[id];
    return a ? (a.uses || 1) : 1;
};
const abilityCharges = (id) => {
    const ch = (player && player.abilityCharges) || {};
    const a = ABILITIES[id];
    if (!a) return 0;
    return Math.min(abilityMaxUses(id), Math.max(0, ch[id] ?? abilityMaxUses(id)));
};
// player.abilityCds[id] = timestamp when the next charge finishes regenerating
const abilityCdLeft = (id) => {
    const cds = (player && player.abilityCds) || {};
    return Math.max(0, ((cds[id] || 0) - Date.now()) / 1000);
};
// player.abilityRecs[id] = timestamp when this ability's recovery ends (per-ability lock)
const abilityRecLeft = (id) => {
    const recs = (player && player.abilityRecs) || {};
    return Math.max(0, ((recs[id] || 0) - Date.now()) / 1000);
};
// Effective cooldown after CDR affix (cap 50% reduction)
const abilityEffectiveCd = (id) => {
    const a = ABILITIES[id];
    if (!a) return 0;
    const es = player.equippedStats || {};
    const cdr = Math.min(50, (es.cdr || 0) + (es.abUse || 0) * 5); // legacy AB.USE counts as +5% CDR each
    return Math.max(0.5, (a.cd || 1) * (1 - cdr / 100));
};
const abilityReady = (id) => abilityCharges(id) >= 1 && abilityRecLeft(id) <= 0;
// Charge regen tick + ability bar UI refresh
setInterval(() => {
    if (!player) return;
    const now = Date.now();
    player.abilityCharges = player.abilityCharges || {};
    player.abilityCds = player.abilityCds || {};
    for (const a of equippedAbilities()) {
        const max = abilityMaxUses(a.id);
        const cur = player.abilityCharges[a.id] ?? max;
        if (cur > 0) continue; // only empty stock triggers the refill cooldown
        const nextAt = player.abilityCds[a.id] || 0;
        if (!nextAt) {
            player.abilityCds[a.id] = now + abilityEffectiveCd(a.id) * 1000;
        } else if (nextAt <= now) {
            player.abilityCharges[a.id] = max;
            delete player.abilityCds[a.id];
        }
    }
    updateAbilityBar();
}, 200);
const equippedAbilities = () => {
    const unlocked = unlockedAbilities();
    const picked = (player.abilityLoadout || []).filter(id => unlocked.some(a => a.id === id));
    for (const a of unlocked) {
        if (picked.length >= MAX_ABILITY_SLOTS) break;
        if (!picked.includes(a.id)) picked.push(a.id);
    }
    return unlocked.filter(a => picked.includes(a.id)).slice(0, MAX_ABILITY_SLOTS);
};

// ===== Buff / Debuff helpers =====
const buffMult = (list, type, dflt = 1) => {
    const now = Date.now();
    let m = dflt;
    (list || []).forEach(b => { if (b.type === type && b.expire > now) m *= b.mult; });
    return m;
};
const playerBuffMult = (type) => buffMult(player.combatBuffs, type);
const enemyDebuffMult = (type) => buffMult(enemy && enemy.combatDebuffs, type);
const buffAdd = (list, type) => {
    const now = Date.now();
    let s = 0;
    (list || []).forEach(b => { if (b.type === type && b.expire > now) s += b.add || 0; });
    return s;
};
const playerCritRate = () => player.stats.critRate + buffAdd(player.combatBuffs, "critRateAdd");

// (cooldown system removed — each ability is usable once per battle)

const spawnDamageNumber = (damage, crit) => {
    const dmgContainer = document.querySelector("#dmg-container");
    if (!dmgContainer) return;
    const dmgNumber = document.createElement("p");
    dmgNumber.className = "dmg-numbers" + (crit ? " crit" : "");
    dmgNumber.innerHTML = nFormatter(damage);
    // Scatter horizontally so multi-hit fragments don't stack perfectly
    dmgNumber.style.left = "auto";
    dmgNumber.style.right = "auto";
    dmgNumber.style.width = "3em";
    dmgNumber.style.marginLeft = "-1.5em";
    dmgNumber.style.left = (30 + Math.random() * 40) + "%";
    dmgContainer.appendChild(dmgNumber);
    setTimeout(() => { if (dmgNumber.parentNode) dmgNumber.parentNode.removeChild(dmgNumber); }, 370);
};

// Petrify helpers: enemy.petrifyStacks builds while "petrifyLink" buff is active; 5 stacks = petrified 4s
const isEnemyPetrified = () => !!(enemy && enemy.petrifiedUntil && enemy.petrifiedUntil > Date.now());
const petrifyOnHit = () => {
    if (!enemy || enemyDead || isEnemyPetrified() || enemy.statusResist) return;
    const linked = (player.combatBuffs || []).some(b => b.type === "petrifyLink" && b.expire > Date.now());
    if (!linked) return;
    enemy.petrifyStacks = Math.min(5, (enemy.petrifyStacks || 0) + 1);
    if (enemy.petrifyStacks >= 5) {
        enemy.petrifyStacks = 0;
        enemy.petrifiedUntil = Date.now() + 4000;
        addCombatLog(tParams("cb.ab.petrified4s", { name: enemy.name }));
    }
};
const petrifyDamageMult = () => isEnemyPetrified() ? 1.25 : 1;

// Direct nuke damage used by damage abilities
const abilityDamage = (mult, defScale = 1) => {
    const penFactor = 1 - Math.min(90, (player.equippedStats && player.equippedStats.penPct) || 0) / 100;
    const defDebuff = enemyDebuffMult("defMult");
    let damage = player.stats.atk * mult * (player.stats.atk / (player.stats.atk + enemy.stats.def * defScale * defDebuff * penFactor));
    damage *= 0.9 + Math.random() * 0.2;
    let crit = false;
    if (!enemy.noCrit && Math.floor(Math.random() * 100) < playerCritRate()) {
        crit = true;
        damage *= 1 + (player.stats.critDmg / 100);
    }
    damage = Math.round(damage * playerBuffMult("atkMult"));
    // Passives: Remnant Razor / Executioner / Leech Lord / petrified bonus
    if (player.skills.includes("Remnant Razor")) damage = Math.round(damage * 1.2);
    if (player.skills.includes("Executioner") && enemy.stats.hp < enemy.stats.hpMax * 0.66) damage = Math.round(damage * 1.33);
    if (player.skills.includes("Leech Lord")) damage = Math.round(damage * 1.05);
    damage = Math.round(damage * petrifyDamageMult());
    // Boss phase effects: Phantom Step dodge / Stone Skin damage reduction
    if ((enemy.dodge || 0) > 0 && Math.random() * 100 < enemy.dodge) {
        addCombatLog(tParams("cb.attackMisses", { name: player.name, target: enemy.name }));
        return;
    }
    if (enemy.dr) damage = Math.max(1, Math.round(damage * (1 - enemy.dr / 100)));
    petrifyOnHit();
    enemy.stats.hp -= damage;
    // Blade Dance: ability hits also grant ATK.SPD stacks
    if (player.skills.includes("Blade Dance")) player.bladeDanceStacks = (player.bladeDanceStacks || 0) + 1;
    // Boss thorns: reflect a % of damage taken
    if (enemy.thornsPct && damage > 0 && !(player.invulnTrueUntil > Date.now())) {
        const refDmg = Math.round(damage * enemy.thornsPct / 100);
        if (refDmg > 0) {
            player.stats.hp -= refDmg;
            addCombatLog(tParams("cb.reflects", { name: enemy.name, dmg: nFormatter(refDmg) }));
        }
    }
    // Ability hit reaction: big flinch + flash on the enemy sprite
    const hitSprite = document.querySelector("#enemy-sprite");
    if (hitSprite) {
        hitSprite.classList.remove("ability-hit");
        void hitSprite.offsetWidth;
        hitSprite.classList.add("ability-hit");
        setTimeout(() => hitSprite.classList.remove("ability-hit"), 450);
    }
    addCombatLog(tParams("cb.ab.unleashed", { name: player.name, dmg: nFormatter(damage), target: enemy.name }));
    spawnDamageNumber(damage, crit);
    hpValidation();
    playerLoadStats();
    enemyLoadStats();
};

// Ability visual effects (GIF overlays on the enemy panel)
const ABILITY_FX = {
    holy_strike:       { sheet: "./assets/effects/holy-strike-gold.png", cols: 9, rows: 1, frames: 9, delay: 63, dx: 4, dy: -18 },
    thorns_nova:       { sheet: "./assets/effects/thorns-nova.png", cols: 5, rows: 3, frames: 15, delay: 56, dx: 0, dy: 0 },
    aegis_oath:        { sheet: "./assets/effects/aegis-oath.png", cols: 5, rows: 2, frames: 10, delay: 80, dx: 0, dy: 0 },
    judgment_counter:  { sheet: "./assets/effects/impact-orange.png", cols: 5, rows: 2, frames: 10, delay: 54, dx: 0, dy: 0 },
};
// Per-ability sound overrides (fallback: generic sfxAbility)
const ABILITY_SFX = {
    holy_strike:       () => (typeof sfxHolyStrike !== "undefined" && sfxHolyStrike) || sfxAbility,
    thorns_nova:       () => (typeof sfxThornsNova !== "undefined" && sfxThornsNova) || sfxAbility,
    aegis_oath:        () => (typeof sfxAegisOath !== "undefined" && sfxAegisOath) || sfxAbility,
    judgment_counter:  () => (typeof sfxJudgmentCounter !== "undefined" && sfxJudgmentCounter) || sfxAbility,
};
const playAbilityFx = (id) => {
    const fxDef = ABILITY_FX[id];
    const wrap = document.querySelector("#enemy-sprite-wrap") || document.querySelector("#enemyPanel");
    if (!fxDef || !wrap) return;
    const fx = document.createElement("div");
    fx.className = "ability-fx";
    if (fxDef.dx || fxDef.dy) fx.style.transform = `translate(${fxDef.dx || 0}%, ${fxDef.dy || 0}%)`;
    wrap.appendChild(fx);
    if (fxDef.sheet) {
        // Sprite-sheet animation: step background-position through the grid
        const sheet = document.createElement("div");
        sheet.className = "ability-fx-sheet";
        const size = Math.min(fx.clientWidth, fx.clientHeight) || 176;
        sheet.style.width = sheet.style.height = size + "px";
        sheet.style.backgroundImage = `url("${fxDef.sheet}")`;
        if (fxDef.filter) sheet.style.filter = fxDef.filter;
        sheet.style.backgroundSize = `${fxDef.cols * 100}% ${fxDef.rows * 100}%`;
        fx.appendChild(sheet);
        const delay = fxDef.delay || 80;
        let f = 0;
        const timer = setInterval(() => {
            f++;
            if (f >= fxDef.frames) { clearInterval(timer); fx.remove(); return; }
            const c = f % fxDef.cols, r = Math.floor(f / fxDef.cols);
            sheet.style.backgroundPosition = `${(c * 100 / (fxDef.cols - 1))}% ${fxDef.rows > 1 ? (r * 100 / (fxDef.rows - 1)) : 0}%`;
        }, delay);
        return;
    }
    fx.innerHTML = `<img src="${fxDef.src}" alt="">`;
    setTimeout(() => fx.remove(), fxDef.ms || 1600);
};

const useAbility = (id) => {
    const a = ABILITIES[id];
    if (!a || !player.inCombat || enemyDead) return;
    // Charge + per-ability recovery: consumes 1 charge, starts charge regen timer and swing lock
    if (!abilityReady(id)) { sfxDeny.play(); return; }
    player.abilityCharges = player.abilityCharges || {};
    player.abilityCds = player.abilityCds || {};
    player.abilityRecs = player.abilityRecs || {};
    const cur = player.abilityCharges[id] ?? abilityMaxUses(id);
    player.abilityCharges[id] = cur - 1;
    const nowMs = Date.now();
    // Stock empty -> start the full-refill cooldown
    if (cur - 1 <= 0 && (!player.abilityCds[id] || player.abilityCds[id] <= nowMs)) {
        player.abilityCds[id] = nowMs + abilityEffectiveCd(id) * 1000;
    }
    player.abilityRecs[id] = nowMs + (a.rec || 0.3) * 1000;

    (ABILITY_SFX[id] ? ABILITY_SFX[id]() : sfxAbility).play();
    const now = Date.now();
    const pushEnemyDebuff = (type, mult, sec) => {
        if (enemy.statusResist) return; // Null Ward: immune to debuffs
        enemy.combatDebuffs = enemy.combatDebuffs || [];
        enemy.combatDebuffs.push({ type, mult, expire: now + Math.round(sec * 1000) });
    };
    const pushPlayerBuff = (type, mult, sec, add = 0) => {
        player.combatBuffs = player.combatBuffs || [];
        player.combatBuffs.push({ type, mult, add, expire: now + Math.round(sec * 1000) });
    };
    const healPlayer = (pct) => {
        const before = player.stats.hp;
        applyPlayerHeal(Math.round(player.stats.hpMax * pct / 100));
        const healed = player.stats.hp - before;
        if (healed > 0) {
            addCombatLog(tParams("cb.ab.recovers", { name: player.name, hp: nFormatter(healed) }));
        }
    };
    switch (id) {
        // ===== Warrior =====
        case "cleave": abilityDamage(2.6); break;
        case "temporal_snare":
            abilityDamage(1.5);
            pushEnemyDebuff("atkSpdMult", 0.5, 6);
            addCombatLog(tParams("cb.ab.timeSlows", { name: enemy.name }));
            break;
        case "shield_wall":
            player.shield = Math.max(player.shield || 0, Math.round(player.stats.hpMax * 0.25));
            pushPlayerBuff("defMult", 1.3, 8);
            addCombatLog(tParams("cb.ab.shieldWall", { name: player.name, s: nFormatter(player.shield) }));
            break;
        case "warcry":
            pushPlayerBuff("atkMult", 1.35, 12);
            addCombatLog(tParams("cb.ab.warcry", { name: player.name }));
            break;
        case "undying_oath":
            abilityDamage(1.0);
            player.hot = { dps: Math.round(player.stats.hpMax * 0.03), ticks: 10 };
            addCombatLog(tParams("cb.ab.oath", { name: player.name }));
            break;
        case "execute": {
            const mult = enemy.stats.hp / enemy.stats.hpMax < 0.3 ? 5.5 : 2.2;
            abilityDamage(mult);
            if (mult > 3) addCombatLog(tParams("cb.ab.executes", { name: player.name, target: enemy.name }));
            break;
        }
        // ===== Mage =====
        case "fireball": abilityDamage(3.5, 0.5); break;
        case "petrify": {
            abilityDamage(1.5);
            enemy.petrifyStacks = Math.min(5, (enemy.petrifyStacks || 0) + 2);
            pushPlayerBuff("petrifyLink", 1, 15);
            if (enemy.petrifyStacks >= 5) {
                enemy.petrifyStacks = 0;
                enemy.petrifiedUntil = now + 4000;
                addCombatLog(tParams("cb.ab.petrified4s", { name: enemy.name }));
            } else {
                addCombatLog(tParams("cb.ab.petrifying", { name: enemy.name, n: enemy.petrifyStacks }));
            }
            break;
        }
        case "flame_nova":
            abilityDamage(2.0);
            if (!enemy.statusResist) enemy.dot = { dps: Math.round(enemy.stats.hpMax * 0.015), ticks: 8 };
            addCombatLog(tParams("cb.ab.flames", { name: enemy.name }));
            break;
        case "frostbolt":
            abilityDamage(1.8);
            pushEnemyDebuff("atkSpdMult", 0.65, 6);
            addCombatLog(tParams("cb.ab.movementsSlow", { name: enemy.name }));
            break;
        case "stasis":
            pushEnemyDebuff("atkSpdMult", 0.05, 2);
            addCombatLog(tParams("cb.ab.frozenStasis", { name: enemy.name }));
            break;
        case "mana_shield":
            player.shield = Math.max(player.shield || 0, Math.round(player.stats.hpMax * 0.45));
            addCombatLog(tParams("cb.ab.manaShield", { name: player.name, s: nFormatter(player.shield) }));
            break;
        // ===== Rogue =====
        case "backstab": abilityDamage(3.5); break;
        case "fan_of_knives":
            abilityDamage(1.8);
            pushPlayerBuff("atkSpdMult", 1.3, 6);
            addCombatLog(tParams("cb.ab.fanKnives", { name: player.name }));
            break;
        case "venom_dagger":
            abilityDamage(1.2);
            if (!enemy.statusResist) enemy.dot = { dps: Math.round(enemy.stats.hpMax * 0.0125), ticks: 8 };
            addCombatLog(tParams("cb.ab.envenomed", { name: enemy.name }));
            break;
        case "godspeed":
            pushPlayerBuff("atkSpdMult", 2.0, 10);
            addCombatLog(tParams("cb.ab.godspeed", { name: player.name }));
            break;
        case "deadly_precision":
            abilityDamage(3.0);
            pushPlayerBuff("critRateAdd", 1, 8, 30);
            addCombatLog(tParams("cb.ab.deadlyStance", { name: player.name }));
            break;
        case "thousand_cuts":
            for (let i = 0; i < 7; i++) abilityDamage(0.7);
            break;
        // ===== Lancer =====
        case "impale": abilityDamage(3.0, 0.75); break;
        case "dragon_thrust":
            abilityDamage(2.2);
            pushPlayerBuff("atkSpdMult", 1.4, 5);
            addCombatLog(tParams("cb.ab.surges", { name: player.name }));
            break;
        case "afterimage":
            abilityDamage(1.0);
            pushPlayerBuff("afterimage", 1, 8);
            addCombatLog(tParams("cb.ab.afterimageSplit", { name: player.name }));
            break;
        case "sky_piercer":
            abilityDamage(2.8, 0.4);
            pushEnemyDebuff("atkSpdMult", 0.1, 1);
            addCombatLog(tParams("cb.ab.impaled", { name: enemy.name }));
            break;
        case "dragon_roar":
            abilityDamage(1.8);
            pushEnemyDebuff("atkMult", 0.6, 5);
            addCombatLog(tParams("cb.ab.dragonRoar", { name: enemy.name }));
            break;
        case "dragon_fall": abilityDamage(4.5, 0.5); break;
        // ===== Paladin =====
        case "holy_strike":
            playAbilityFx(id);
            abilityDamage(2.4);
            healPlayer(8);
            break;
        case "judgment_counter":
            playAbilityFx(id);
            pushPlayerBuff("reflectPct", 1, 8, 200);
            pushPlayerBuff("damageTakenMult", 1.3, 8);
            addCombatLog(tParams("cb.ab.judgment", { name: player.name }));
            break;
        case "thorns_nova":
            playAbilityFx(id);
            abilityDamage(1.5);
            pushPlayerBuff("thornsNova", 1, 10);
            addCombatLog(tParams("cb.ab.thornsNova", { name: player.name }));
            break;
        case "aegis_oath":
            playAbilityFx(id);
            player.shield = Math.max(player.shield || 0, Math.round(player.stats.hpMax * 0.30));
            pushPlayerBuff("reflectPct", 1, 10, 50);
            addCombatLog(tParams("cb.ab.aegisOath", { name: player.name, s: nFormatter(player.shield) }));
            break;
        case "divine_judgement": {
            const shielded = (player.shield || 0) > 0;
            abilityDamage(shielded ? 5.0 : 3.0);
            if (shielded) addCombatLog(tParams("cb.ab.aegisEmpowered", { name: player.name }));
            break;
        }
        case "sanctuary":
            healPlayer(30);
            player.shield = Math.max(player.shield || 0, Math.round(player.stats.hpMax * 0.20));
            pushPlayerBuff("reflectPct", 1, 12, 40);
            addCombatLog(tParams("cb.ab.sanctuary", { name: player.name }));
            break;
    }
    updateAbilityBar();
    playerLoadStats();
};

// Per-second combat tick: dots, regen, ability cooldown UI
const combatSecondTick = () => {
    if (!player.inCombat) return;
    // Adrenaline: once per battle, dropping below 30% HP grants 6s invulnerability
    if (player.skills.includes("Adrenaline") && !player.adrenalineUsed &&
        player.stats.hp > 0 && player.stats.hp < player.stats.hpMax * 0.3) {
        player.adrenalineUsed = true;
        player.invulnTrueUntil = Date.now() + 6000;
        addCombatLog(tParams("cb.trueInvuln", { name: player.name, s: 6 }));
    }
    if (enemy && enemy.dot && enemy.dot.ticks > 0 && enemy.stats.hp > 0) {
        enemy.stats.hp -= enemy.dot.dps;
        enemy.dot.ticks--;
        if (enemy.dot.ticks <= 0) delete enemy.dot;
        if (enemy.stats.hp < 1) {
            enemy.stats.hp = 0;
            enemy.stats.hpPercent = 0;
            hpValidation();
            return;
        }
        enemy.stats.hpPercent = Math.round((enemy.stats.hp / enemy.stats.hpMax) * 100);
        enemyLoadStats();
    }
    if (enemy && enemy.regenPerSec && enemy.stats.hp > 0 && enemy.stats.hp < enemy.stats.hpMax) {
        enemy.stats.hp = Math.min(enemy.stats.hpMax, enemy.stats.hp + enemy.regenPerSec);
        enemy.stats.hpPercent = Math.round((enemy.stats.hp / enemy.stats.hpMax) * 100);
        enemyLoadStats();
    }
    if (player.hot && player.hot.ticks > 0 && player.stats.hp > 0 && player.stats.hp < player.stats.hpMax) {
        applyPlayerHeal(Math.round(player.hot.dps));
        player.stats.hpPercent = Math.round((player.stats.hp / player.stats.hpMax) * 100);
        player.hot.ticks--;
        if (player.hot.ticks <= 0) delete player.hot;
        playerLoadStats();
    }
    updateAbilityBar();
};

// ===== Ability bar UI =====
const renderAbilityBar = () => {
    const bar = document.querySelector("#ability-bar");
    if (!bar) return;
    const abs = equippedAbilities();
    if (!abs.length) { bar.innerHTML = ""; return; }
    bar.innerHTML = abs.map(a =>
        `<button class="ability-btn" data-ab="${a.id}" title="${a.desc}"><i class="ra ${a.icon}"></i> ${a.name}</button>`
    ).join("");
    // Loadout is managed from the dungeon header gear button only — never inside combat
    bar.querySelectorAll(".ability-btn").forEach(btn => {
        btn.onclick = () => useAbility(btn.dataset.ab);
    });
    updateAbilityBar();
};

// Loadout picker: choose up to MAX_ABILITY_SLOTS abilities from unlocked ones
const showLoadoutModal = () => {
    if (player.inCombat) return;
    const unlocked = unlockedAbilities();
    if (!unlocked.length) return;
    const current = (player.abilityLoadout || []).filter(id => unlocked.some(a => a.id === id));
    const overlay = document.createElement("div");
    overlay.className = "loadout-overlay";
    overlay.innerHTML = `
        <div class="loadout-panel">
            <h3>${t("loadout.title")} <span class="loadout-count" id="loadoutCount">${current.length}/${MAX_ABILITY_SLOTS}</span></h3>
            <p class="loadout-hint">${tParams("loadout.hint", { c: CLASSES[playerClassKey()].name, n: MAX_ABILITY_SLOTS })}</p>
            <div class="loadout-list">
                ${unlocked.map(a => `
                    <label class="loadout-item ${current.includes(a.id) ? "on" : ""}">
                        <input type="checkbox" value="${a.id}" ${current.includes(a.id) ? "checked" : ""}>
                        <i class="ra ${a.icon}"></i>
                        <span class="loadout-name">${a.name}</span>
                        <span class="loadout-desc">${a.desc}</span>
                        <span class="loadout-cd">x${a.uses} / ${a.cd}s</span>
                        <span class="loadout-lv">Lv.${a.lvl}</span>
                    </label>`).join("")}
            </div>
            <div class="preset-row">
                <span class="preset-label">${t("loadout.presets")}:</span>
                ${[0, 1, 2].map(i => `<button class="preset-btn" data-p="${i}">P${i + 1}</button>`).join("")}
                <button id="presetSave">${t("loadout.savePreset")}</button>
            </div>
            <div class="loadout-actions">
                <button id="loadoutCancel">${t("loadout.cancel")}</button>
                <button id="loadoutSave">${t("loadout.confirm")}</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    const boxes = [...overlay.querySelectorAll("input[type=checkbox]")];
    const countEl = overlay.querySelector("#loadoutCount");
    const sync = () => {
        const n = boxes.filter(b => b.checked).length;
        countEl.textContent = `${n}/${MAX_ABILITY_SLOTS}`;
        boxes.forEach(b => {
            b.closest(".loadout-item").classList.toggle("on", b.checked);
            if (!b.checked && boxes.filter(x => x.checked).length >= MAX_ABILITY_SLOTS) b.disabled = true;
            else b.disabled = false;
        });
    };
    boxes.forEach(b => b.onchange = sync);
    sync();

    // Loadout presets: 3 saved slots storing ability ids + equipped item uids
    // (reference type — items are moved, not duplicated). Legacy array format = abilities only.
    player.abilityPresets = player.abilityPresets || [null, null, null];
    while (player.abilityPresets.length < 3) player.abilityPresets.push(null);
    const presetAbilities = (p) => Array.isArray(p) ? p : (p && p.abilities) || [];
    const presetHasData = (p) => presetAbilities(p).length > 0 || (!!p && !Array.isArray(p) && (p.equip || []).length > 0);
    let activePreset = -1;
    const presetBtns = [...overlay.querySelectorAll(".preset-btn")];
    presetBtns.forEach((b, i) => {
        if (presetHasData(player.abilityPresets[i])) b.classList.add("filled");
        b.onclick = () => {
            const p = player.abilityPresets[i];
            if (!presetHasData(p)) { sfxDeny.play(); return; }
            const valid = new Set(unlocked.map(a => a.id));
            const ids = presetAbilities(p).filter(id => valid.has(id));
            boxes.forEach(bx => { bx.checked = ids.includes(bx.value); });
            sync();
            if (!Array.isArray(p) && p.equip && p.equip.length) {
                applyEquipPreset(p.equip);
            }
            activePreset = i;
            presetBtns.forEach((x, j) => x.classList.toggle("on", j === i));
            sfxConfirm.play();
        };
    });
    overlay.querySelector("#presetSave").onclick = () => {
        let target = activePreset;
        if (target < 0) {
            target = player.abilityPresets.findIndex(p => !presetHasData(p));
            if (target < 0) target = 0;
        }
        const equipUids = player.equipped.map(it => it.uid || (it.uid = genItemUid()));
        player.abilityPresets[target] = {
            abilities: boxes.filter(b => b.checked).map(b => b.value),
            equip: equipUids,
        };
        activePreset = target;
        presetBtns.forEach((x, j) => {
            x.classList.toggle("on", j === target);
            x.classList.toggle("filled", presetHasData(player.abilityPresets[j]));
        });
        saveData();
        sfxConfirm.play();
    };

    overlay.querySelector("#loadoutCancel").onclick = () => overlay.remove();
    overlay.querySelector("#loadoutSave").onclick = () => {
        const sel = boxes.filter(b => b.checked).map(b => b.value);
        if (sel.length > MAX_ABILITY_SLOTS) { sfxDeny.play(); return; }
        player.abilityLoadout = sel;
        saveData();
        overlay.remove();
        sfxConfirm.play();
        renderAbilityBar();
    };
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
};

const updateAbilityBar = () => {
    const bar = document.querySelector("#ability-bar");
    if (!bar) return;
    bar.querySelectorAll(".ability-btn[data-ab]").forEach(btn => {
        const id = btn.dataset.ab;
        const ch = abilityCharges(id);
        const ready = abilityReady(id);
        btn.classList.toggle("on-cd", !ready);
        btn.classList.remove("used");
        // Charge count badge (e.g. "x2")
        let cnt = btn.querySelector(".charges");
        if (!cnt) {
            cnt = document.createElement("span");
            cnt.className = "charges";
            btn.appendChild(cnt);
        }
        cnt.textContent = `x${Math.floor(ch)}`;
        cnt.style.opacity = ch >= 1 ? "1" : "0.4";
        // Overlay: recovery lock always; charge-regen countdown only when stock is empty
        const waitLeft = Math.max(abilityRecLeft(id), ch >= 1 ? 0 : abilityCdLeft(id));
        let cdEl = btn.querySelector(".cd");
        if (waitLeft > 0) {
            if (!cdEl) {
                cdEl = document.createElement("span");
                cdEl.className = "cd";
                btn.appendChild(cdEl);
            }
            cdEl.textContent = waitLeft < 10 ? waitLeft.toFixed(1) : Math.ceil(waitLeft);
        } else if (cdEl) {
            cdEl.remove();
        }
    });
};

// Called when a level-up unlocks new abilities
const checkAbilityUnlocks = (prevIds) => {
    for (const a of unlockedAbilities()) {
        if (!prevIds.includes(a.id)) {
            addDungeonLog(tParams("dgn.log.abilityNew", { name: a.name, desc: a.desc }));
        }
    }
};

// Enemy modifier display labels (ENEMY_MODS defined in enemy.js)
const enemyModLabel = (cls = "") => {
    if (!enemy || !enemy.mods || !enemy.mods.length) return "";
    const labels = enemy.mods.map(m => (typeof ENEMY_MODS !== "undefined" && ENEMY_MODS[m]) ? ENEMY_MODS[m].label : m);
    return ` <span class="enemy-mods${cls}">[${labels.join(" · ")}]</span>`;
};
