const combatPanel = document.querySelector("#combatPanel")
let enemyDead = false;
let playerDead = false;
let endCombatAction = null;
let playerRegenTimer = null;

// Applies healing to the player. Blood Oath: while below 50% HP, healing cannot raise HP above 51%.
const applyPlayerHeal = (amount) => {
    let hp = player.stats.hp + amount;
    if (((player.equippedStats && player.equippedStats.bloodOath) || 0) > 0 && player.stats.hp < player.stats.hpMax * 0.5) {
        hp = Math.min(hp, player.stats.hpMax * 0.51);
    }
    player.stats.hp = Math.min(player.stats.hpMax, hp);
};

// ========== Validation ==========
const hpValidation = () => {
    // Prioritizes player death before the enemy
    if (!playerDead && player.stats.hp < 1) {
        // Second Wind: survive lethal damage once per battle at 1 HP
        if (player.skills.includes("Second Wind") && !player.secondWindUsed) {
            player.secondWindUsed = true;
            player.stats.hp = 1;
            addCombatLog(`${player.name} refuses to fall! (Second Wind)`);
            playerLoadStats();
            return;
        }
        player.stats.hp = 0;
        playerDead = true;
        player.deaths++;
        addCombatLog(`You died!`);
        endCombatAction = () => {
            sfxConfirm.play();
            playerDead = false;

            // Reset all the necessary stats and return to menu
            let dimDungeon = document.querySelector('#dungeon-main');
            dimDungeon.style.filter = "brightness(100%)";
            dimDungeon.style.display = "none";
            combatPanel.style.display = "none";

            // Legacy: choose one item to carry into storage before the run resets
            showLegacyModal(() => {
                clearInterval(dungeonTimer);
                clearInterval(playTimer);
                progressReset();
                runLoad("title-screen", "flex");
            });
        };
        endCombat();
    } else if (!enemyDead && enemy.stats.hp < 1) {
        // Gives out all the reward and show the claim button
        enemy.stats.hp = 0;
        enemyDead = true;
        if (enemy.mods && enemy.mods.includes("volatile")) {
            const boom = Math.round(player.stats.hpMax * 0.08);
            player.stats.hp -= boom;
            addCombatLog(`${enemy.name} explodes! You take ${nFormatter(boom)} damage.`);
            if (player.stats.hp < 1) {
                player.stats.hp = 0;
                hpValidation();
                return;
            }
        }
        player.kills++;
        dungeon.statistics.kills++;
        addCombatLog(`${enemy.name} died! (${new Date(combatSeconds * 1000).toISOString().substring(14, 19)})`);
        addCombatLog(`You earned ${nFormatter(enemy.rewards.exp)} exp.`)
        playerExpGain();
        const goldGain = Math.round(enemy.rewards.gold * (1 + ((player.equippedStats && player.equippedStats.goldFind) || 0) / 100));
        addCombatLog(`${enemy.name} dropped <i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(goldGain)} gold.`)
        player.gold += goldGain;
        playerLoadStats();
        if (enemy.rewards.drop) {
            createEquipmentPrint("combat");
        }

        // Recover 20% of players health
        applyPlayerHeal(Math.round((player.stats.hpMax * 20) / 100));
        playerLoadStats();

        // VAMP: recover HP equal to VAMP% of the defeated enemy's max HP on kill
        const vampPct = (player.stats.vamp || 0) * (player.skills.includes("Leech Lord") ? 1.35 : 1);
        if (vampPct > 0) {
            const vampHeal = Math.round(enemy.stats.hpMax * vampPct / 100);
            if (vampHeal > 0) {
                applyPlayerHeal(vampHeal);
                addCombatLog(`${player.name} drains ${nFormatter(vampHeal)} HP from the kill!`);
            }
        }

        // Close the battle panel
        endCombatAction = () => {
            sfxConfirm.play();

            // Clear combat backlog and transition to dungeon exploration
            let dimDungeon = document.querySelector('#dungeon-main');
            dimDungeon.style.filter = "brightness(100%)";
            bgmDungeon.play();

            dungeon.status.event = false;
            combatPanel.style.display = "none";
            enemyDead = false;
            combatBacklog.length = 0;
        };
        endCombat();
    }
}

// ========== Attack Functions ==========
const playerAttack = () => {
    if (!player.inCombat || enemyDead) {
        return;
    }
    if (player.inCombat) {
        sfxAttack.play();
    }

    // Calculates the damage and attacks the enemy
    let crit;
    let penFactor = 1 - Math.min(90, (player.equippedStats && player.equippedStats.penPct) || 0) / 100;
    let damage = player.stats.atk * (player.stats.atk / (player.stats.atk + enemy.stats.def * penFactor));
    // Randomizes the damage by 90% - 110%
    let dmgRange = 0.9 + Math.random() * 0.2;
    damage = damage * dmgRange;
    // Normal-attack-only damage: level-up N.ATK + equipment N.ATK + hidden secretAtk (total cap 300%)
    const normAtkPct = Math.min(300,
        ((player.bonusStats && player.bonusStats.nAtk) || 0)
        + ((player.equippedStats && player.equippedStats.normAtkPct) || 0)
        + ((player.equippedStats && player.equippedStats.secretAtk) || 0));
    if (normAtkPct > 0) damage = damage * (1 + normAtkPct / 100);
    // Check if the attack is a critical hit
    if (Math.floor(Math.random() * 100) < (player.stats.critRate + buffAdd(player.combatBuffs, "critRateAdd"))) {
        crit = true;
        dmgtype = "crit damage";
        damage = Math.round(damage * (1 + (player.stats.critDmg / 100)));
    } else {
        crit = false;
        dmgtype = "damage";
        damage = Math.round(damage);
    }

    // Skill effects
    objectValidation();
    if (player.skills.includes("Remnant Razor")) {
        // Attacks deal extra 8% of enemies' current health on hit
        damage += Math.round((8 * enemy.stats.hp) / 100);
    }
    if (player.skills.includes("Titan's Will")) {
        // Attacks deal extra 6% of your maximum health on hit
        damage += Math.round((6 * player.stats.hpMax) / 100);
    }
    if (player.skills.includes("Devastator")) {
        // Deal 40% more damage but you lose 30% base attack speed
        damage = Math.round(damage + ((40 * damage) / 100));
    }
    if (player.skills.includes("Rampager")) {
        // Increase base attack by 5 after each hit. Stack resets after battle.
        player.baseStats.atk += 5;
        objectValidation();
        player.tempStats.atk += 5;
        saveData();
    }
    if (player.skills.includes("Blade Dance")) {
        // Gain increased attack speed after each hit. Stack resets after battle
        player.baseStats.atkSpd += 0.01;
        objectValidation();
        player.tempStats.atkSpd += 0.01;
        saveData();
    }

// Ability buffs
    damage = Math.round(damage * playerBuffMult("atkMult"));

    // HP-conditional damage affixes
    const hpPctNow = (player.stats.hp / player.stats.hpMax) * 100;
    if (hpPctNow >= 95 && ((player.equippedStats && player.equippedStats.fullHpDmg) || 0) > 0) {
        damage = Math.round(damage * (1 + player.equippedStats.fullHpDmg / 100));
    }
    if (hpPctNow <= 50 && ((player.equippedStats && player.equippedStats.lowHpDmg) || 0) > 0) {
        damage = Math.round(damage * (1 + player.equippedStats.lowHpDmg / 100));
    }
    // Burst: each attack stacks (max = affix value, capped at 5); stacks burst into bonus fragment hits below
    player.burstStacks = Math.min((player.burstStacks || 0) + 1, Math.min((player.equippedStats && player.equippedStats.burst) || 0, 5));

    // Passives: Adrenaline / Executioner / Leech Lord / Bloodlust / petrified / Momentum
    if (player.skills.includes("Adrenaline") && hpPctNow < 30) damage = Math.round(damage * 1.2);
    if (player.skills.includes("Executioner") && enemy.stats.hp < enemy.stats.hpMax * 0.3) damage = Math.round(damage * 1.35);
    if (player.skills.includes("Leech Lord")) damage = Math.round(damage * 0.85);
    damage = Math.round(damage * petrifyDamageMult());
    if (player.skills.includes("Momentum")) {
        damage = Math.round(damage * (1 + Math.min(player.momentumStacks || 0, 20) * 0.03));
        player.momentumStacks = Math.min((player.momentumStacks || 0) + 1, 20);
    }

    // Apply the calculations to combat
    enemy.stats.hp -= damage;
    petrifyOnHit();
    // Blood Tithe: each attack costs 2% of your max HP (cannot drop below 1 HP)
    if (player.skills.includes("Blood Tithe") && damage > 0) {
        player.stats.hp = Math.max(1, player.stats.hp - Math.round(player.stats.hpMax * 0.02));
    }
    addCombatLog(`${player.name} dealt ` + nFormatter(damage) + ` ${dmgtype} to ${enemy.name}.`);
    // Phase: attacking grants brief invulnerability
    const invulnSec = Math.min((player.equippedStats && player.equippedStats.attackInvuln) || 0, 3);
    if (invulnSec > 0) {
        player.invulnUntil = Date.now() + invulnSec * 1000;
    }

    // Afterimage: 30% chance per attack to strike again at 50% damage, can chain (max 10)
    if (!enemyDead && (player.combatBuffs || []).some(b => b.type === "afterimage" && b.expire > Date.now())) {
        let chains = 0;
        while (chains < 10 && !enemyDead && Math.random() < 0.3) {
            chains++;
            const bonus = Math.max(1, Math.round(damage * 0.5));
            enemy.stats.hp -= bonus;
            spawnDamageNumber(bonus, false);
        }
        if (chains) addCombatLog(`${player.name}'s afterimages strike ${chains} more time${chains > 1 ? "s" : ""}!`);
    }
    // Burst: each stack explodes into a separate fragment hit (10% of damage each)
    const burstStacks = player.burstStacks || 0;
    if (burstStacks > 0 && enemy.stats.hp > 0) {
        let frags = 0;
        for (let i = 0; i < burstStacks && enemy.stats.hp > 0; i++) {
            const frag = Math.max(1, Math.round(damage * 0.10));
            enemy.stats.hp -= frag;
            spawnDamageNumber(frag, false);
            frags++;
        }
        if (frags) addCombatLog(`${player.name}'s attack bursts into ${frags} fragment${frags > 1 ? "s" : ""}!`);
    }
    hpValidation();
    playerLoadStats();
    enemyLoadStats();

    // Damage effect
    let enemySprite = document.querySelector("#enemy-sprite");
    enemySprite.classList.add("animation-shake");
    enemySprite.classList.add("hit-flash");
    setTimeout(() => {
        enemySprite.classList.remove("animation-shake");
        enemySprite.classList.remove("hit-flash");
    }, 200);

    // Damage numbers
    spawnDamageNumber(damage, crit);

    // Attack Timer
    if (player.inCombat) {
        setTimeout(() => {
            if (player.inCombat) {
                playerAttack();
            }
        }, (1000 / (player.stats.atkSpd * playerBuffMult("atkSpdMult") * (player.skills.includes("Adrenaline") && player.stats.hp < player.stats.hpMax * 0.3 ? 1.4 : 1))));
    }
}

const enemyAttack = () => {
    if (!player.inCombat || playerDead) {
        return;
    }
    if (player.inCombat) {
        sfxAttack.play();
    }

    // Calculates the damage and attacks the player
    let damage = enemy.stats.atk * (enemy.stats.atk / (enemy.stats.atk + player.stats.def * playerBuffMult("defMult") * (player.skills.includes("Iron Will") && player.stats.hp < player.stats.hpMax * 0.5 ? 1.3 : 1)));
    damage *= enemyDebuffMult("atkMult");
    let lifesteal = Math.round(enemy.stats.atk * (enemy.stats.vamp / 100));
    // Randomizes the damage by 90% - 110%
    let dmgRange = 0.9 + Math.random() * 0.2;
    damage = damage * dmgRange;
    // Check if the attack is a critical hit
    if (Math.floor(Math.random() * 100) < enemy.stats.critRate) {
        dmgtype = "crit damage";
        damage = Math.round(damage * (1 + (enemy.stats.critDmg / 100)));
    } else {
        dmgtype = "damage";
        damage = Math.round(damage);
    }
    damage = Math.round(damage * playerBuffMult("damageTakenMult"));

    // Petrified enemies cannot attack
    if (isEnemyPetrified()) {
        damage = 0;
        lifesteal = 0;
        addCombatLog(`${enemy.name} is petrified solid and cannot attack!`);
    }

    // Dodge affix: chance to avoid the hit entirely
    if (damage > 0 && Math.random() * 100 < ((player.equippedStats && player.equippedStats.dodge) || 0)) {
        damage = 0;
        lifesteal = 0;
        addCombatLog(`${enemy.name}'s attack misses ${player.name}!`);
    }

    // Trial: above 50% HP you take increased damage
    if (damage > 0 && player.stats.hp > player.stats.hpMax * 0.5 && ((player.equippedStats && player.equippedStats.hpTradeDmg) || 0) > 0) {
        damage = Math.round(damage * (1 + player.equippedStats.hpTradeDmg / 100));
    }

    // Phase: invulnerable for a short window after attacking — but hits dealing 10%+ max HP pierce it
    if (damage > 0 && player.invulnUntil && Date.now() < player.invulnUntil) {
        if (damage >= player.stats.hpMax * 0.10) {
            addCombatLog(`${enemy.name}'s attack pierces ${player.name}'s guard!`);
        } else {
            damage = 0;
            lifesteal = 0;
            addCombatLog(`${enemy.name}'s attack passes through ${player.name}!`);
        }
    }

    // Skill effects
    if (player.skills.includes("Paladin's Heart")) {
        // You receive 25% less damage
        damage = Math.round(damage - ((25 * damage) / 100));
    }

    // Burning modifier: bonus damage based on player max HP
    if (enemy.mods && enemy.mods.includes("burning")) {
        damage += Math.round(player.stats.hpMax * 0.03);
    }

    // Shield absorb
    let absorbed = 0;
    if (player.shield > 0) {
        absorbed = Math.min(player.shield, damage);
        player.shield -= absorbed;
        damage -= absorbed;
    }

    // Apply the calculations
    player.stats.hp -= damage;
    if (damage > 0) player.momentumStacks = 0;
    // Thorns: reflect % of damage taken (level growth + equipment)
    // Blood Oath: below 50% HP, THORN is increased by the affix value
    const oathThorns = player.stats.hp < player.stats.hpMax * 0.5 ? ((player.equippedStats && player.equippedStats.bloodOath) || 0) : 0;
    const thornsPct = ((player.bonusStats && player.bonusStats.thorns) || 0) + ((player.equippedStats && player.equippedStats.thorns) || 0) + oathThorns;
    if (thornsPct > 0 && damage > 0) {
        // THORN: damage taken × thorns% × (ATK/10)
        const refDmg = Math.round(damage * (thornsPct / 100) * (player.stats.atk / 10));
        enemy.stats.hp -= refDmg;
        // Thorns Nova: reflected damage bursts for +50%
        if ((player.combatBuffs || []).some(b => b.type === "thornsNova" && b.expire > Date.now())) {
            enemy.stats.hp -= Math.round(refDmg * 0.5);
        }
    }
    // Aegis Thorns skill
    objectValidation();
    if (player.skills.includes("Aegis Thorns")) {
        // Enemies receive 20% of the damage they dealt
        enemy.stats.hp -= Math.round((20 * damage) / 100);
    }
    // Blood Tithe: taking damage heals 6% of max HP
    if (player.skills.includes("Blood Tithe") && damage > 0) {
        applyPlayerHeal(Math.round(player.stats.hpMax * 0.06));
    }
    // Reflect buffs (Paladin abilities): reflect % of damage taken
    const reflectPct = buffAdd(player.combatBuffs, "reflectPct");
    if (reflectPct > 0 && damage > 0) {
        const refDmg = Math.round(damage * reflectPct / 100);
        enemy.stats.hp -= refDmg;
        addCombatLog(`${player.name} reflects ${nFormatter(refDmg)} damage!`);
        spawnDamageNumber(refDmg, false);
    }
    enemy.stats.hp += lifesteal;
    addCombatLog(`${enemy.name} dealt ` + nFormatter(damage) + ` ${dmgtype} to ${player.name}.` + (absorbed > 0 ? ` (Shield absorbed ${nFormatter(absorbed)})` : ""));
    hpValidation();
    playerLoadStats();
    enemyLoadStats();

    // Damage effect
    let playerPanel = document.querySelector('#playerPanel');
    playerPanel.classList.add("animation-shake");
    playerPanel.classList.add("player-hit");
    setTimeout(() => {
        playerPanel.classList.remove("animation-shake");
        playerPanel.classList.remove("player-hit");
    }, 300);

    // Attack Timer
    if (player.inCombat) {
        setTimeout(() => {
            if (player.inCombat) {
                enemyAttack();
            }
        }, (1000 / (enemy.stats.atkSpd * enemyDebuffMult("atkSpdMult"))));
    }
}

// ========== Combat Backlog ==========
const combatBacklog = [];

// Add a log to the combat backlog
const addCombatLog = (message) => {
    combatBacklog.push(message);
    updateCombatLog();
}

// Displays every combat activity
const updateCombatLog = () => {
    let combatLogBox = document.getElementById("combatLogBox");
    combatLogBox.innerHTML = "";

    for (let message of combatBacklog) {
        let logElement = document.createElement("p");
        logElement.innerHTML = message;
        combatLogBox.appendChild(logElement);
    }

    if (enemyDead) {
        let button = document.createElement("div");
        button.className = "decision-panel";
        button.innerHTML = `<button id="battleButton">Claim</button>`;
        combatLogBox.appendChild(button);
    }

    if (playerDead) {
        let button = document.createElement("div");
        button.className = "decision-panel";
        button.innerHTML = `<button id="battleButton">Back to Menu</button>`;
        combatLogBox.appendChild(button);
    }

    // Flee becomes available 60s into combat
    if (!enemyDead && !playerDead && combatSeconds >= 60) {
        let fleePanel = document.createElement("div");
        fleePanel.className = "decision-panel";
        fleePanel.innerHTML = `<button id="fleeButton">Flee</button>`;
        combatLogBox.appendChild(fleePanel);
    }

    combatLogBox.scrollTop = combatLogBox.scrollHeight;
}

// Combat Timer
let combatSeconds = 0;

const startCombat = (battleMusic) => {
    bgmDungeon.pause();
    sfxEncounter.play();
    battleMusic.play();
    player.inCombat = true;
    player.combatBuffs = [];
    player.shield = 0;
    player.burstStacks = 0;
    player.invulnUntil = 0;
    player.abilityRecs = {};
    player.momentumStacks = 0;
    player.secondWindUsed = false;
    delete player.hot;
    if (enemy) { delete enemy.petrifyStacks; enemy.petrifiedUntil = 0; }
    // Trial regen: while below 50% HP, recover REGEN% of max HP every 0.5s
    if (playerRegenTimer) clearInterval(playerRegenTimer);
    playerRegenTimer = setInterval(() => {
        if (!player.inCombat || playerDead || enemyDead) return;
        const regen = (player.equippedStats && player.equippedStats.hpRegen) || 0;
        if (regen <= 0 || player.stats.hp <= 0 || player.stats.hp >= player.stats.hpMax * 0.5) return;
        applyPlayerHeal(Math.round(player.stats.hpMax * regen / 100));
        playerLoadStats();
    }, 500);
    endCombatAction = null;
    enemyDead = false;
    playerDead = false;
    if (enemy) {
        enemy.combatDebuffs = [];
        delete enemy.dot;
    }

    // Starts the timer for player and enemy attacks along with combat timer
    setTimeout(playerAttack, (1000 / player.stats.atkSpd));
    setTimeout(enemyAttack, (1000 / enemy.stats.atkSpd));
    let dimDungeon = document.querySelector('#dungeon-main');
    dimDungeon.style.filter = "brightness(50%)";

    playerLoadStats();
    enemyLoadStats();

    dungeon.status.event = true;
    combatPanel.style.display = "flex";

    combatTimer = setInterval(combatCounter, 1000);
}

const endCombat = () => {
    bgmBattleMain.stop();
    bgmBattleGuardian.stop();
    bgmBattleBoss.stop();
    sfxCombatEnd.play();
    player.inCombat = false;
    // Skill validation
    if (player.skills.includes("Rampager")) {
        // Remove Rampager attack buff
        objectValidation();
        player.baseStats.atk -= player.tempStats.atk;
        player.tempStats.atk = 0;
        saveData();
    }
    if (player.skills.includes("Blade Dance")) {
        // Remove Blade Dance attack speed buff
        objectValidation();
        player.baseStats.atkSpd -= player.tempStats.atkSpd;
        player.tempStats.atkSpd = 0;
        saveData();
    }

    // Stops every timer in combat
    clearInterval(combatTimer);
    if (playerRegenTimer) { clearInterval(playerRegenTimer); playerRegenTimer = null; }
    combatSeconds = 0;
    saveData();
}

const combatCounter = () => {
    combatSeconds++;
    combatSecondTick();
    if (combatSeconds === 60 && player.inCombat && !enemyDead && !playerDead) {
        addCombatLog(t("combat.fleeReady"));
    }
}

// Flee mid-combat: no rewards, return to dungeon exploration
const fleeCombat = () => {
    sfxConfirm.play();
    endCombat();
    addDungeonLog(tParams("dgn.log.fleeFrom", { name: enemy.name }));

    let dimDungeon = document.querySelector('#dungeon-main');
    dimDungeon.style.filter = "brightness(100%)";
    bgmDungeon.play();

    dungeon.status.event = false;
    combatPanel.style.display = "none";
    enemyDead = false;
    combatBacklog.length = 0;
    saveData();
}

const showCombatInfo = () => {
    document.querySelector('#combatPanel').innerHTML = `
    <div class="content">
        <div class="battle-info-panel center" id="enemyPanel">
            <div class="grid-room" role="img" aria-label="grid dungeon" aria-hidden="true"><div class="stage">
                <div class="fill f-left"></div>
                <div class="fill f-right"></div>
                <div class="fill f-top"></div>
                <div class="fill f-bottom"></div>
                <div class="back"></div>
                <div class="lines">
                <div class="back-grid"></div>
                <div class="ring" style="--k:1"></div>
                <div class="ring" style="--k:2"></div>
                <div class="ring" style="--k:3"></div>
                <div class="ring" style="--k:4"></div>
                <div class="ring" style="--k:5"></div>
                <div class="ring" style="--k:6"></div>
                <div class="ring" style="--k:7"></div>
                <div class="ring" style="--k:8"></div>
                <div class="frame"></div>
                <i class="ray" style="--a:-143.1301deg;--r:0.62500"></i>
                <i class="ray" style="--a:-135.0000deg;--r:0.53033"></i>
                <i class="ray" style="--a:-123.6901deg;--r:0.45069"></i>
                <i class="ray" style="--a:-108.4349deg;--r:0.39528"></i>
                <i class="ray" style="--a:-90.0000deg;--r:0.37500"></i>
                <i class="ray" style="--a:-71.5651deg;--r:0.39528"></i>
                <i class="ray" style="--a:-56.3099deg;--r:0.45069"></i>
                <i class="ray" style="--a:-45.0000deg;--r:0.53033"></i>
                <i class="ray" style="--a:-36.8699deg;--r:0.62500"></i>
                <i class="ray" style="--a:143.1301deg;--r:0.62500"></i>
                <i class="ray" style="--a:135.0000deg;--r:0.53033"></i>
                <i class="ray" style="--a:123.6901deg;--r:0.45069"></i>
                <i class="ray" style="--a:108.4349deg;--r:0.39528"></i>
                <i class="ray" style="--a:90.0000deg;--r:0.37500"></i>
                <i class="ray" style="--a:71.5651deg;--r:0.39528"></i>
                <i class="ray" style="--a:56.3099deg;--r:0.45069"></i>
                <i class="ray" style="--a:45.0000deg;--r:0.53033"></i>
                <i class="ray" style="--a:36.8699deg;--r:0.62500"></i>
                <i class="ray" style="--a:-153.4349deg;--r:0.55902"></i>
                <i class="ray" style="--a:-165.9638deg;--r:0.51539"></i>
                <i class="ray" style="--a:180.0000deg;--r:0.50000"></i>
                <i class="ray" style="--a:165.9638deg;--r:0.51539"></i>
                <i class="ray" style="--a:153.4349deg;--r:0.55902"></i>
                <i class="ray" style="--a:-26.5651deg;--r:0.55902"></i>
                <i class="ray" style="--a:-14.0362deg;--r:0.51539"></i>
                <i class="ray" style="--a:0.0000deg;--r:0.50000"></i>
                <i class="ray" style="--a:14.0362deg;--r:0.51539"></i>
                <i class="ray" style="--a:26.5651deg;--r:0.55902"></i>
                </div>
            </div></div>
            <p>${enemy.name} Lv.${enemy.lvl}${enemyModLabel()}</p>
            <div class="battle-bar empty-bar hp bb-hp">
                <div class="battle-bar dmg bb-hp" id="enemy-hp-dmg"></div>
                <div class="battle-bar current bb-hp" id="enemy-hp-battle"></div>
                <div class="bar-text" id="enemy-hp-text">&nbsp;${nFormatter(enemy.stats.hp)}/${nFormatter(enemy.stats.hpMax)} (${enemy.stats.hpPercent}%)</div>
            </div>
            <div id="dmg-container" class="dmg-container"></div>
            <div id="enemy-sprite-wrap">
                <img src="./assets/sprites/${enemy.image.name}${enemy.image.type}" alt="${enemy.name}" id="enemy-sprite"
                    style="${enemy.image.name === 'slime_crusader' ? 'height:7.7rem' : ['slime_angel', 'slime_knight'].includes(enemy.image.name) ? 'height:8.25rem' : enemy.image.name.startsWith('spider') ? 'height:9.35rem' : ''}">
            </div>
        </div>
        <div class="battle-info-panel primary-panel" id="playerPanel">
            <p id="player-combat-info"></p>
            <div class="battle-bar empty-bar bb-hp">
                <div class="battle-bar dmg bb-hp" id="player-hp-dmg"></div>
                <div class="battle-bar current bb-hp" id="player-hp-battle"></div>
                <div class="bar-text" id="player-hp-text">&nbsp;${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)} (${player.stats.hpPercent}%)</div>
            </div>
            <div class="battle-bar empty-bar bb-xb">
                <div class="battle-bar current bb-xb" id="player-exp-bar"></div>
            </div>
        </div>
        <div id="ability-bar"></div>
        <div class="logBox primary-panel">
            <div id="combatLogBox"></div>
        </div>
    </div>
    `;
    renderAbilityBar();
    const logBox = document.getElementById("combatLogBox");
    logBox.addEventListener("click", (e) => {
        if (e.target.closest("#battleButton") && endCombatAction) endCombatAction();
        if (e.target.closest("#fleeButton") && player.inCombat && !enemyDead && !playerDead) fleeCombat();
    });
}