const combatPanel = document.querySelector("#combatPanel")
let enemyDead = false;
let playerDead = false;
let timingPos = 0;
let timingDir = 1;
let timingTimer = null;
const TIMING_ZONE_LO = 42;
const TIMING_ZONE_HI = 58;
const TIMING_MULT = 1.5;
const TIMING_HITS = 3;
const timingInZone = () => timingPos >= TIMING_ZONE_LO && timingPos <= TIMING_ZONE_HI;

const updateTimingBtn = () => {
    const btn = document.querySelector("#btnTiming");
    if (!btn) return;
    const hits = (player && player.timingHits) || 0;
    btn.innerHTML = hits > 0 ? `TIMING! x${hits}` : "TIMING!";
    btn.classList.toggle("armed", hits > 0);
};

const timingGaugeTick = () => {
    timingPos += timingDir * 1.6;
    if (timingPos >= 100) { timingPos = 100; timingDir = -1; }
    if (timingPos <= 0) { timingPos = 0; timingDir = 1; }
    const marker = document.querySelector("#timingMarker");
    if (marker) marker.style.left = timingPos + "%";
};

const timingPress = () => {
    if (!player.inCombat) return;
    if (timingInZone()) {
        sfxBuff.play();
        player.timingHits = TIMING_HITS;
        addCombatLog(`<b style="color:#ffd700">Perfect timing!</b> Next ${TIMING_HITS} attacks deal +${Math.round((TIMING_MULT - 1) * 100)}% damage.`);
        const g = document.querySelector("#timingGauge");
        if (g) { g.classList.add("hit"); setTimeout(() => g.classList.remove("hit"), 250); }
    } else {
        addCombatLog(`Timing missed (${Math.round(timingPos)}%).`);
    }
    updateTimingBtn();
};

// ========== Validation ==========
const hpValidation = () => {
    // Prioritizes player death before the enemy
    if (player.stats.hp < 1) {
        player.stats.hp = 0;
        playerDead = true;
        player.deaths++;
        addCombatLog(`You died!`);
        document.querySelector("#battleButton").addEventListener("click", function () {
            sfxConfirm.play();
            playerDead = false;

            // Reset all the necessary stats and return to menu
            let dimDungeon = document.querySelector('#dungeon-main');
            dimDungeon.style.filter = "brightness(100%)";
            dimDungeon.style.display = "none";
            combatPanel.style.display = "none";
            runLoad("title-screen", "flex");

            clearInterval(dungeonTimer);
            clearInterval(playTimer);
            progressReset();
        });
        endCombat();
    } else if (enemy.stats.hp < 1) {
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
        player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
        playerLoadStats();

        // Close the battle panel
        document.querySelector("#battleButton").addEventListener("click", function () {
            sfxConfirm.play();

            // Clear combat backlog and transition to dungeon exploration
            let dimDungeon = document.querySelector('#dungeon-main');
            dimDungeon.style.filter = "brightness(100%)";
            bgmDungeon.play();

            dungeon.status.event = false;
            combatPanel.style.display = "none";
            enemyDead = false;
            combatBacklog.length = 0;
        });
        endCombat();
    }
}

// ========== Attack Functions ==========
const playerAttack = () => {
    if (!player.inCombat) {
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
    // Check if the attack is a critical hit
    if (Math.floor(Math.random() * 100) < player.stats.critRate) {
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
        // Attacks deal extra 5% of your maximum health on hit
        damage += Math.round((5 * player.stats.hpMax) / 100);
    }
    if (player.skills.includes("Devastator")) {
        // Deal 30% more damage but you lose 30% base attack speed
        damage = Math.round(damage + ((30 * damage) / 100));
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

    // Timing gauge buff
    let timingHit = false;
    if (player.timingHits > 0) {
        timingHit = true;
        damage = Math.round(damage * TIMING_MULT);
        player.timingHits--;
    }

    // Lifesteal formula
    let lifesteal = Math.round(damage * (player.stats.vamp / 100));

    // Apply the calculations to combat
    enemy.stats.hp -= damage;
    player.stats.hp += lifesteal;
    addCombatLog(`${player.name} dealt ` + nFormatter(damage) + ` ${dmgtype} to ${enemy.name}.` + (timingHit ? ' <b style="color:#ffd700">Timing!</b>' : ''));
    hpValidation();
    playerLoadStats();
    enemyLoadStats();

    // Damage effect
    let enemySprite = document.querySelector("#enemy-sprite");
    enemySprite.classList.add("animation-shake");
    setTimeout(() => {
        enemySprite.classList.remove("animation-shake");
    }, 200);

    // Damage numbers
    spawnDamageNumber(damage, crit);

    // Attack Timer
    if (player.inCombat) {
        setTimeout(() => {
            if (player.inCombat) {
                playerAttack();
            }
        }, (1000 / (player.stats.atkSpd * playerBuffMult("atkSpdMult"))));
    }
}

const enemyAttack = () => {
    if (!player.inCombat) {
        return;
    }
    if (player.inCombat) {
        sfxAttack.play();
    }

    // Calculates the damage and attacks the player
    let damage = enemy.stats.atk * (enemy.stats.atk / (enemy.stats.atk + player.stats.def * playerBuffMult("defMult")));
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

    // Dodge affix: chance to avoid the hit entirely
    if (damage > 0 && Math.random() * 100 < ((player.equippedStats && player.equippedStats.dodge) || 0)) {
        damage = 0;
        lifesteal = 0;
        addCombatLog(`${enemy.name}'s attack misses ${player.name}!`);
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
    // Thorns affix: reflect % of damage taken
    const thornsPct = (player.equippedStats && player.equippedStats.thorns) || 0;
    if (thornsPct > 0 && damage > 0) {
        enemy.stats.hp -= Math.round(damage * thornsPct / 100);
    }
    // Aegis Thorns skill
    objectValidation();
    if (player.skills.includes("Aegis Thorns")) {
        // Enemies receive 15% of the damage they dealt
        enemy.stats.hp -= Math.round((15 * damage) / 100);
    }
    enemy.stats.hp += lifesteal;
    addCombatLog(`${enemy.name} dealt ` + nFormatter(damage) + ` ${dmgtype} to ${player.name}.` + (absorbed > 0 ? ` (Shield absorbed ${nFormatter(absorbed)})` : ""));
    hpValidation();
    playerLoadStats();
    enemyLoadStats();

    // Damage effect
    let playerPanel = document.querySelector('#playerPanel');
    playerPanel.classList.add("animation-shake");
    setTimeout(() => {
        playerPanel.classList.remove("animation-shake");
    }, 200);

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

    combatLogBox.scrollTop = combatLogBox.scrollHeight;
}

// Combat Timer
let combatSeconds = 0;

const startCombat = (battleMusic) => {
    bgmDungeon.pause();
    sfxEncounter.play();
    battleMusic.play();
    player.inCombat = true;
    player.abilityCds = {};
    player.combatBuffs = [];
    player.shield = 0;
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

    player.timingHits = 0;
    timingPos = 0;
    timingDir = 1;
    clearInterval(timingTimer);
    timingTimer = setInterval(timingGaugeTick, 30);
    updateTimingBtn();

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
    clearInterval(timingTimer);
    timingTimer = null;
    if (player) player.timingHits = 0;
    combatSeconds = 0;
}

const combatCounter = () => {
    combatSeconds++;
    combatSecondTick();
}

const showCombatInfo = () => {
    document.querySelector('#combatPanel').innerHTML = `
    <div class="content">
        <div class="battle-info-panel center" id="enemyPanel">
            <p>${enemy.name} Lv.${enemy.lvl}${enemyModLabel()}</p>
            <div class="battle-bar empty-bar hp bb-hp">
                <div class="battle-bar dmg bb-hp" id="enemy-hp-dmg"></div>
                <div class="battle-bar current bb-hp" id="enemy-hp-battle">
                    &nbsp${nFormatter(enemy.stats.hp)}/${nFormatter(enemy.stats.hpMax)}<br>(${enemy.stats.hpPercent}%)
                </div>
            </div>
            <div id="dmg-container"></div>
            <img src="./assets/sprites/${enemy.image.name}${enemy.image.type}" alt="${enemy.name}" width="${enemy.image.size}" id="enemy-sprite">
        </div>
        <div class="battle-info-panel primary-panel" id="playerPanel">
            <p id="player-combat-info"></p>
            <div class="battle-bar empty-bar bb-hp">
                <div class="battle-bar dmg bb-hp" id="player-hp-dmg"></div>
                <div class="battle-bar current bb-hp" id="player-hp-battle">
                    &nbsp${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)}(${player.stats.hpPercent}%)
                </div>
            </div>
            <div class="battle-bar empty-bar bb-xb">
                <div class="battle-bar current bb-xb" id="player-exp-bar">exp</div>
            </div>
        </div>
        <div id="ability-bar"></div>
        <div id="timing-wrap">
            <button id="btnTiming" class="ability-btn">TIMING!</button>
            <div id="timingGauge"><div id="timingZone"></div><div id="timingMarker"></div></div>
        </div>
        <div class="logBox primary-panel">
            <div id="combatLogBox"></div>
        </div>
    </div>
    `;
    renderAbilityBar();
    const btnT = document.querySelector("#btnTiming");
    if (btnT) btnT.addEventListener("click", timingPress);
    updateTimingBtn();
}