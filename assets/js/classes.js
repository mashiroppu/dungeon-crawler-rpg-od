// ===== Classes & Abilities =====
const CLASSES = {
    warrior: { name: "Warrior", desc: "Frontline fighter. High HP/ATK/DEF.", mult: { hp: 1.25, atk: 1.1, def: 1.2, atkSpd: 1 }, add: { critRate: 0, critDmg: 0 } },
    mage:    { name: "Mage",    desc: "Glass cannon. High ATK and crit damage.", mult: { hp: 0.85, atk: 1.15, def: 0.9, atkSpd: 1 }, add: { critRate: 5, critDmg: 25 } },
    rogue:   { name: "Rogue",   desc: "Speedster. High ATK.SPD and crit rate.", mult: { hp: 0.9, atk: 1.05, def: 0.95, atkSpd: 1.3 }, add: { critRate: 12, critDmg: 10 } },
    lancer:  { name: "Lancer",  desc: "Reach fighter. High ATK.SPD, solid ATK/DEF.", mult: { hp: 1.0, atk: 1.08, def: 1.05, atkSpd: 1.2 }, add: { critRate: 5, critDmg: 10 } },
};

const ABILITIES = {
    cleave:       { cls: "warrior", lvl: 1,  cd: 8,  name: "Cleave",       desc: "Deal 260% ATK damage.",                 icon: "ra-axe" },
    warcry:       { cls: "warrior", lvl: 12, cd: 25, name: "War Cry",      desc: "+35% damage for 12s.",                  icon: "ra-lightning-storm" },
    bulwark:      { cls: "warrior", lvl: 25, cd: 30, name: "Bulwark",      desc: "Shield absorbing 35% of max HP.",        icon: "ra-round-shield" },
    fireball:     { cls: "mage",    lvl: 1,  cd: 9,  name: "Fireball",     desc: "350% ATK dmg, ignores 50% DEF.",        icon: "ra-fire-breath" },
    frostbolt:    { cls: "mage",    lvl: 12, cd: 15, name: "Frostbolt",    desc: "180% dmg, slows enemy ATK.SPD 35%/6s.", icon: "ra-snowflake" },
    mana_shield:  { cls: "mage",    lvl: 25, cd: 30, name: "Mana Shield",  desc: "Shield absorbing 45% of max HP.",        icon: "ra-potion" },
    backstab:     { cls: "rogue",   lvl: 1,  cd: 8,  name: "Backstab",     desc: "Deal 350% ATK damage.",                 icon: "ra-diving-dagger" },
    smoke_bomb:   { cls: "rogue",   lvl: 12, cd: 20, name: "Smoke Bomb",   desc: "+45% ATK.SPD for 8s.",                   icon: "ra-cluster-bomb" },
    poison_blade: { cls: "rogue",   lvl: 25, cd: 18, name: "Poison Blade", desc: "160% dmg + poison 6% max HP over 6s.",  icon: "ra-flask" },
    impale:        { cls: "lancer",  lvl: 1,  cd: 8,  name: "Impale",       desc: "300% ATK dmg, pierces 25% of DEF.",       icon: "ra-spear-head" },
    skewer_rush:   { cls: "lancer",  lvl: 12, cd: 14, name: "Skewer Rush",  desc: "220% dmg + 40% ATK.SPD for 6s.",           icon: "ra-barbed-arrow" },
    dragon_fall:   { cls: "lancer",  lvl: 25, cd: 26, name: "Dragon's Fall", desc: "450% ATK dmg, ignores 50% DEF.",        icon: "ra-two-dragons" },
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

// ===== Buff / Debuff helpers =====
const buffMult = (list, type, dflt = 1) => {
    const now = Date.now();
    let m = dflt;
    (list || []).forEach(b => { if (b.type === type && b.expire > now) m *= b.mult; });
    return m;
};
const playerBuffMult = (type) => buffMult(player.combatBuffs, type);
const enemyDebuffMult = (type) => buffMult(enemy && enemy.combatDebuffs, type);

const abilityReadyAt = (id) => (player.abilityCds && player.abilityCds[id]) || 0;
const abilityCdLeft = (id) => Math.max(0, Math.ceil((abilityReadyAt(id) - Date.now()) / 1000));

const spawnDamageNumber = (damage, crit) => {
    const dmgContainer = document.querySelector("#dmg-container");
    if (!dmgContainer) return;
    const dmgNumber = document.createElement("p");
    dmgNumber.className = "dmg-numbers";
    if (crit) {
        dmgNumber.style.color = "gold";
        dmgNumber.innerHTML = nFormatter(damage) + "!";
    } else {
        dmgNumber.innerHTML = nFormatter(damage);
    }
    dmgContainer.appendChild(dmgNumber);
    setTimeout(() => { if (dmgNumber.parentNode) dmgNumber.parentNode.removeChild(dmgNumber); }, 370);
};

// Direct nuke damage used by damage abilities
const abilityDamage = (mult, defScale = 1) => {
    const penFactor = 1 - Math.min(90, (player.equippedStats && player.equippedStats.penPct) || 0) / 100;
    let damage = player.stats.atk * mult * (player.stats.atk / (player.stats.atk + enemy.stats.def * defScale * penFactor));
    damage *= 0.9 + Math.random() * 0.2;
    let crit = false;
    if (Math.floor(Math.random() * 100) < player.stats.critRate) {
        crit = true;
        damage *= 1 + (player.stats.critDmg / 100);
    }
    damage = Math.round(damage * playerBuffMult("atkMult"));
    const lifesteal = Math.round(damage * (player.stats.vamp / 100));
    enemy.stats.hp -= damage;
    player.stats.hp += lifesteal;
    addCombatLog(`${player.name} unleashed an ability, dealing ` + nFormatter(damage) + ` damage to ${enemy.name}.`);
    spawnDamageNumber(damage, crit);
    hpValidation();
    playerLoadStats();
    enemyLoadStats();
};

const useAbility = (id) => {
    const a = ABILITIES[id];
    if (!a || !player.inCombat || enemyDead) return;
    if (abilityCdLeft(id) > 0) { sfxDeny.play(); return; }
    player.abilityCds = player.abilityCds || {};
    player.abilityCds[id] = Date.now() + a.cd * 1000;

    // Timing gauge: hitting the zone empowers the ability
    const timed = typeof timingInZone === "function" && timingInZone();
    const power = timed ? 1.5 : 1;
    const dur = (sec) => Math.round(sec * 1000 * power);
    if (timed) {
        sfxBuff.play();
        addCombatLog(`<b style="color:#ffd700">Perfect timing!</b> ${a.name} is empowered!`);
        const g = document.querySelector("#timingGauge");
        if (g) { g.classList.add("hit"); setTimeout(() => g.classList.remove("hit"), 250); }
    } else {
        sfxConfirm.play();
    }
    const now = Date.now();
    switch (id) {
        case "cleave": abilityDamage(2.6 * power); break;
        case "warcry":
            player.combatBuffs = player.combatBuffs || [];
            player.combatBuffs.push({ type: "atkMult", mult: 1 + 0.35 * power, expire: now + dur(12) });
            addCombatLog(`${player.name} lets out a war cry! (+${Math.round(35 * power)}% damage for ${Math.round(12 * power)}s)`);
            break;
        case "bulwark":
            player.shield = Math.max(player.shield || 0, Math.round(player.stats.hpMax * 0.35 * power));
            addCombatLog(`${player.name} raises a bulwark! (Shield: ${nFormatter(player.shield)})`);
            break;
        case "fireball": abilityDamage(3.5 * power, 0.5); break;
        case "frostbolt":
            abilityDamage(1.8 * power);
            enemy.combatDebuffs = enemy.combatDebuffs || [];
            enemy.combatDebuffs.push({ type: "atkSpdMult", mult: timed ? 0.5 : 0.65, expire: now + dur(6) });
            addCombatLog(`${enemy.name}'s movements slow down!`);
            break;
        case "mana_shield":
            player.shield = Math.max(player.shield || 0, Math.round(player.stats.hpMax * 0.45 * power));
            addCombatLog(`${player.name} surrounds themself in mana! (Shield: ${nFormatter(player.shield)})`);
            break;
        case "backstab": abilityDamage(3.5 * power); break;
        case "smoke_bomb":
            player.combatBuffs = player.combatBuffs || [];
            player.combatBuffs.push({ type: "atkSpdMult", mult: 1 + 0.45 * power, expire: now + dur(8) });
            addCombatLog(`${player.name} vanishes in smoke! (+${Math.round(45 * power)}% ATK.SPD for ${Math.round(8 * power)}s)`);
            break;
        case "poison_blade":
            abilityDamage(1.6 * power);
            enemy.dot = { dps: Math.round(enemy.stats.hpMax * 0.01 * power), ticks: 6 };
            addCombatLog(`${enemy.name} is poisoned!`);
            break;
        case "impale": abilityDamage(3.0 * power, 0.75); break;
        case "skewer_rush":
            abilityDamage(2.2 * power);
            player.combatBuffs = player.combatBuffs || [];
            player.combatBuffs.push({ type: "atkSpdMult", mult: 1 + 0.4 * power, expire: now + dur(6) });
            addCombatLog(`${player.name} charges forward with the lance! (+${Math.round(40 * power)}% ATK.SPD for ${Math.round(6 * power)}s)`);
            break;
        case "dragon_fall": abilityDamage(4.5 * power, 0.5); break;
    }
    updateAbilityBar();
    playerLoadStats();
};

// Per-second combat tick: dots, regen, ability cooldown UI
const combatSecondTick = () => {
    if (!player.inCombat) return;
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
    updateAbilityBar();
};

// ===== Ability bar UI =====
const renderAbilityBar = () => {
    const bar = document.querySelector("#ability-bar");
    if (!bar) return;
    const abs = unlockedAbilities();
    if (!abs.length) { bar.innerHTML = ""; return; }
    bar.innerHTML = abs.map(a =>
        `<button class="ability-btn" data-ab="${a.id}" title="${a.desc} — time the gauge to empower"><i class="ra ${a.icon}"></i> ${a.name}</button>`
    ).join("");
    bar.querySelectorAll(".ability-btn").forEach(btn => {
        btn.onclick = () => useAbility(btn.dataset.ab);
    });
    updateAbilityBar();
};

const updateAbilityBar = () => {
    const bar = document.querySelector("#ability-bar");
    if (!bar) return;
    bar.querySelectorAll(".ability-btn").forEach(btn => {
        const left = abilityCdLeft(btn.dataset.ab);
        btn.classList.toggle("on-cd", left > 0);
        let cdEl = btn.querySelector(".cd");
        if (left > 0) {
            if (!cdEl) {
                cdEl = document.createElement("span");
                cdEl.className = "cd";
                btn.appendChild(cdEl);
            }
            cdEl.textContent = left;
        } else if (cdEl) {
            cdEl.remove();
        }
    });
};

// Called when a level-up unlocks new abilities
const checkAbilityUnlocks = (prevIds) => {
    for (const a of unlockedAbilities()) {
        if (!prevIds.includes(a.id)) {
            addDungeonLog(`New ability learned: <b>${a.name}</b> — ${a.desc}`);
        }
    }
};

// Enemy modifier display labels (ENEMY_MODS defined in enemy.js)
const enemyModLabel = () => {
    if (!enemy || !enemy.mods || !enemy.mods.length) return "";
    const labels = enemy.mods.map(m => (typeof ENEMY_MODS !== "undefined" && ENEMY_MODS[m]) ? ENEMY_MODS[m].label : m);
    return ` <span class="enemy-mods">[${labels.join(" · ")}]</span>`;
};
