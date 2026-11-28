const combatPanel = document.querySelector("#combatPanel")
let enemyDead = false;
let playerDead = false;
let endCombatAction = null;
let playerRegenTimer = null;
let playerRapidTimer = null;

// Applies healing to the player. Blood Oath: while below 50% HP, healing cannot raise HP above 51%.
const applyPlayerHeal = (amount) => {
    let hp = player.stats.hp + amount;
    if (((player.equippedStats && player.equippedStats.bloodOath) || 0) > 0 && player.stats.hp < player.stats.hpMax * 0.5) {
        hp = Math.min(hp, player.stats.hpMax * 0.51);
    }
    player.stats.hp = Math.min(player.stats.hpMax, hp);
    // SURGE: healing empowers the next attack for 5s
    const surgePct = (player.equippedStats && player.equippedStats.healSurge) || 0;
    if (amount > 0 && surgePct > 0) {
        player.surgeNext = { pct: surgePct, expire: Date.now() + 5000 };
    }
};

// ========== Validation ==========
const hpValidation = () => {
    // Prioritizes player death before the enemy
    if (!playerDead && player.stats.hp < 1) {
        // Second Wind: survive lethal damage once per battle at 1 HP
        if (player.skills.includes("Second Wind") && !player.secondWindUsed) {
            player.secondWindUsed = true;
            player.stats.hp = 1;
            player.invulnTrueUntil = Date.now() + 8000;
            addCombatLog(tParams("cb.secondWind", { name: player.name }));
            addCombatLog(tParams("cb.trueInvuln", { name: player.name, s: 8 }));
            playerLoadStats();
            return;
        }
        player.stats.hp = 0;
        playerDead = true;
        player.deaths++;
        addCombatLog(t("cb.died"));
        endCombatAction = () => {
            sfxConfirm.play();
            playerDead = false;

            // Reset all the necessary stats and return to menu
            let dimDungeon = document.querySelector('#dungeon-main');
            dimDungeon.style.filter = "brightness(100%)";
            dimDungeon.style.display = "none";
            combatPanel.style.display = "none";

            const finishDeath = () => {
                clearInterval(dungeonTimer);
                clearInterval(playTimer);
                progressReset();
                runLoad("title-screen", "flex");
            };
            // Crystal Ward: all gear is stashed automatically, no legacy pick
            if (player.crystalWard) {
                wardStashAll();
                finishDeath();
            } else {
                // Legacy: choose one item to carry into storage before the run resets
                showLegacyModal(finishDeath);
            }
        };
        endCombat();
    } else if (!enemyDead && enemy.stats.hp < 1) {
        // Boss Second Wind: once per battle, survive lethal damage at 10% HP
        if (enemy.bossSecondWind && !enemy.bossSecondWindUsed) {
            enemy.bossSecondWindUsed = true;
            enemy.stats.hp = Math.max(1, Math.round(enemy.stats.hpMax * 0.1));
            addCombatLog(tParams("cb.secondWind", { name: enemy.name }));
            enemyLoadStats();
            return;
        }
        // Gives out all the reward and show the claim button
        enemy.stats.hp = 0;
        enemyDead = true;
        if (enemy.mods && enemy.mods.includes("volatile")) {
            const boom = Math.round(player.stats.hpMax * 0.08);
            player.stats.hp -= boom;
            addCombatLog(tParams("cb.explode", { name: enemy.name, dmg: nFormatter(boom) }));
            if (player.stats.hp < 1) {
                player.stats.hp = 0;
                hpValidation();
                return;
            }
        }
        player.kills++;
        dungeon.statistics.kills++;
        addCombatLog(tParams("cb.enemyDied", { name: enemy.name, time: new Date(combatSeconds * 1000).toISOString().substring(14, 19) }));
        addCombatLog(tParams("cb.earnedExp", { exp: nFormatter(enemy.rewards.exp) }))
        playerExpGain();
        const goldGain = Math.round(enemy.rewards.gold * (1 + ((player.equippedStats && player.equippedStats.goldFind) || 0) / 100));
        addCombatLog(tParams("cb.droppedGold", { name: enemy.name, icon: '<i class="fas fa-coins" style="color: #FFD700;"></i>', g: nFormatter(goldGain) }))
        player.gold += goldGain;
        playerLoadStats();
        if (enemy.rewards.drop) {
            createEquipmentPrint("combat");
        }
        if (enemy.named && Math.random() < 1 / 3) {
            const gems = 1 + diffTierOfFloor(dungeon.progress.floor);
            player.crystals = (player.crystals || 0) + gems;
            addCombatLog(tParams("cb.crystalDrop", { name: enemy.name, n: gems }));
            saveData();
        }

        // Recover 20% of players health
        applyPlayerHeal(Math.round((player.stats.hpMax * 20) / 100));
        playerLoadStats();

        // VAMP: recover HP equal to VAMP% of the defeated enemy's max HP on kill
        const vampPct = player.stats.vamp || 0;
        if (vampPct > 0) {
            const vampHeal = Math.round(enemy.stats.hpMax * vampPct / 100);
            if (vampHeal > 0) {
                applyPlayerHeal(vampHeal);
                addCombatLog(tParams("cb.drainKill", { name: player.name, hp: nFormatter(vampHeal) }));
            }
        }

        // Stage boss kill on a band-end floor clears that difficulty tier
        if (enemy.stageBoss) {
            const tier = diffTierOfFloor(dungeon.progress.floor);
            dungeon.clearedTiers = dungeon.clearedTiers || {};
            if (!dungeon.clearedTiers[tier]) {
                dungeon.clearedTiers[tier] = true;
                if (tier >= DIFFICULTY_TIERS.length - 1) {
                    addCombatLog(t("cb.dungeonClear"));
                } else if (tier + 1 > maxDiffTier()) {
                    player.maxDiffTier = tier + 1;
                    addCombatLog(tParams("cb.diffUnlocked", { name: DIFFICULTY_TIERS[tier + 1].label }));
                    saveData();
                }
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
    // ATK%: direct damage-dealt multiplier (equipment atkPct + level-up atk; applies to attacks and abilities)
    const atkPctTotal = ((player.equippedStats && player.equippedStats.atkPct) || 0) + ((player.bonusStats && player.bonusStats.atk) || 0);
    if (atkPctTotal > 0) damage = damage * (1 + atkPctTotal / 100);
    // Normal-attack-only damage: level-up N.ATK + equipment N.ATK + hidden secretAtk (total cap 200%)
    const normAtkPct = Math.min(200,
        Math.min(200, (player.bonusStats && player.bonusStats.nAtk) || 0)
        + ((player.equippedStats && player.equippedStats.normAtkPct) || 0)
        + ((player.equippedStats && player.equippedStats.secretAtk) || 0));
    if (normAtkPct > 0) damage = damage * (1 + normAtkPct / 100);
    // Check if the attack is a critical hit (bosses with Nullify cannot be crit)
    if (!enemy.noCrit && Math.floor(Math.random() * 100) < Math.min(75, player.stats.critRate + buffAdd(player.combatBuffs, "critRateAdd"))) {
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
        // +20% damage and attacks deal extra 2% of enemies' current health on hit
        damage = Math.round(damage * 1.2);
        damage += Math.round((2 * enemy.stats.hp) / 100);
    }
    if (player.skills.includes("Titan's Will")) {
        // Attacks deal extra 6% of your maximum health on hit
        damage += Math.round((6 * player.stats.hpMax) / 100);
    }
    if (player.skills.includes("Devastator")) {
        // Deal 40% more damage but you lose 30% base attack speed
        damage = Math.round(damage + ((40 * damage) / 100));
    }
    // Glass Cannon: +35% damage dealt, -25% max HP (HP penalty applied in calculateStats)
    if (player.skills.includes("Glass Cannon")) {
        damage = Math.round(damage * 1.35);
    }
    if (player.skills.includes("Rampager")) {
        // Increase base attack by 5 after each hit. Stack resets after battle.
        player.baseStats.atk += 5;
        objectValidation();
        player.tempStats.atk += 5;
        saveData();
    }
    if (player.skills.includes("Blade Dance")) {
        // +5% ATK.SPD per hit — uncapped (added after the stats cap) and also
        // shortens ability recovery. Resets after battle.
        player.bladeDanceStacks = (player.bladeDanceStacks || 0) + 1;
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
    if (player.skills.includes("Executioner") && enemy.stats.hp < enemy.stats.hpMax * 0.66) damage = Math.round(damage * 1.33);
    if (player.skills.includes("Leech Lord")) damage = Math.round(damage * 1.05);
    damage = Math.round(damage * petrifyDamageMult());
    if (player.skills.includes("Momentum")) {
        damage = Math.round(damage * (1 + Math.min(player.momentumStacks || 0, 20) * 0.03));
        player.momentumStacks = Math.min((player.momentumStacks || 0) + 1, 20);
    }
    // OPENER: first connecting hit of the battle deals bonus damage
    const openerPct = (player.equippedStats && player.equippedStats.opener) || 0;
    if (player.openerReady && openerPct > 0) {
        damage = Math.round(damage * (1 + openerPct / 100));
    }
    // HUNTER'S MARK: consecutive hits on the same enemy stack bonus damage
    const markPct = Math.min(player.hunterStacks || 0, 20) * ((player.equippedStats && player.equippedStats.hunterMark) || 0);
    if (markPct > 0) damage = Math.round(damage * (1 + markPct / 100));
    // SURGE: the next attack after a heal deals bonus damage (5s window)
    if (player.surgeNext && player.surgeNext.expire > Date.now() && player.surgeNext.pct > 0) {
        damage = Math.round(damage * (1 + player.surgeNext.pct / 100));
        player.surgeNext = null;
    }
    // FURY: battles start at 75% HP — deal bonus damage as compensation
    const fury75Pct = (player.equippedStats && player.equippedStats.fury75) || 0;
    if (fury75Pct > 0) damage = Math.round(damage * (1 + fury75Pct / 100));

    // Boss phase effects: Phantom Step dodge / Stone Skin damage reduction
    const dodged = (enemy.dodge || 0) > 0 && Math.random() * 100 < enemy.dodge;
    if (dodged) damage = 0;
    else if (enemy.dr) damage = Math.max(1, Math.round(damage * (1 - enemy.dr / 100)));

    // Apply the calculations to combat
    enemy.stats.hp -= damage;
    if (!dodged) {
        player.openerReady = false;
        player.hunterStacks = Math.min((player.hunterStacks || 0) + 1, 20);
    }
    if (!dodged) petrifyOnHit();
    // Blood Tithe: each attack costs 2% of your max HP (cannot drop below 1 HP)
    if (player.skills.includes("Blood Tithe") && damage > 0) {
        player.stats.hp = Math.max(1, player.stats.hp - Math.round(player.stats.hpMax * 0.02));
    }
    // Boss thorns: reflect a % of damage taken
    if (!dodged && !(player.invulnTrueUntil > Date.now()) && enemy.thornsPct && damage > 0) {
        const refDmg = Math.round(damage * enemy.thornsPct / 100);
        if (refDmg > 0) {
            player.stats.hp -= refDmg;
            addCombatLog(tParams("cb.reflects", { name: enemy.name, dmg: nFormatter(refDmg) }));
        }
    }
    // Leech Lord: each connecting attack restores 5% of max HP
    if (!dodged && damage > 0 && player.skills.includes("Leech Lord")) {
        applyPlayerHeal(Math.round(player.stats.hpMax * 0.05));
    }
    // SIPHON: heal for a % of the damage dealt
    const siphonPct = (player.equippedStats && player.equippedStats.siphon) || 0;
    if (!dodged && damage > 0 && siphonPct > 0) {
        applyPlayerHeal(Math.round(damage * siphonPct / 100));
    }
    // C.HEAL: critical hits restore a % of max HP
    const critHealPct = (player.equippedStats && player.equippedStats.critHeal) || 0;
    if (!dodged && crit && damage > 0 && critHealPct > 0) {
        applyPlayerHeal(Math.round(player.stats.hpMax * critHealPct / 100));
    }
    if (dodged) {
        addCombatLog(tParams("cb.attackMisses", { name: player.name, target: enemy.name }));
    } else {
        addCombatLog(tParams("cb.dealt", { name: player.name, dmg: tParams("cb.dmgTypeLabel", { dmg: nFormatter(damage), type: dmgtype === "crit damage" ? t("cb.dmgCrit") : t("cb.dmgNormal") }), target: enemy.name }));
    }
    // Phase: attacking grants brief invulnerability
    const invulnSec = Math.min((player.equippedStats && player.equippedStats.attackInvuln) || 0, 3);
    if (!dodged && invulnSec > 0) {
        player.invulnUntil = Date.now() + invulnSec * 1000;
    }

    // Afterimage: 30% chance per attack to strike again at 50% damage, can chain (max 10)
    if (!enemyDead && !dodged && (player.combatBuffs || []).some(b => b.type === "afterimage" && b.expire > Date.now())) {
        let chains = 0;
        while (chains < 10 && !enemyDead && Math.random() < 0.3) {
            chains++;
            const bonus = Math.max(1, Math.round(damage * 0.5));
            enemy.stats.hp -= bonus;
            spawnDamageNumber(bonus, false);
        }
        if (chains) addCombatLog(tParams("cb.afterimages", { name: player.name, n: chains, s: chains > 1 ? "s" : "" }));
    }
    // Burst: each stack explodes into a separate fragment hit (10% of damage each)
    const burstStacks = player.burstStacks || 0;
    if (!dodged && burstStacks > 0 && enemy.stats.hp > 0) {
        let frags = 0;
        for (let i = 0; i < burstStacks && enemy.stats.hp > 0; i++) {
            const frag = Math.max(1, Math.round(damage * 0.10));
            enemy.stats.hp -= frag;
            spawnDamageNumber(frag, false);
            frags++;
        }
        if (frags) addCombatLog(tParams("cb.fragments", { name: player.name, n: frags, s: frags > 1 ? "s" : "" }));
    }
    // Flourish: chance for the attack to strike twice for full damage
    const flourishPct = (player.equippedStats && player.equippedStats.flourish) || 0;
    if (!dodged && flourishPct > 0 && enemy.stats.hp > 0 && Math.random() * 100 < flourishPct) {
        const bonus = Math.max(1, damage);
        enemy.stats.hp -= bonus;
        spawnDamageNumber(bonus, crit);
        addCombatLog(tParams("cb.flourish", { name: player.name, target: enemy.name }));
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
    if (!dodged) spawnDamageNumber(damage, crit);

    // Attack Timer
    if (player.inCombat) {
        setTimeout(() => {
            if (player.inCombat) {
                playerAttack();
            }
        }, (1000 / ((player.stats.atkSpd + (player.bladeDanceStacks || 0) * 0.05) * playerBuffMult("atkSpdMult") * (player.skills.includes("Adrenaline") && player.stats.hp < player.stats.hpMax * 0.3 ? 1.4 : 1))));
    }
}

const enemyAttack = () => {
    if (!player.inCombat || playerDead) {
        return;
    }
    // Boss phase transition stagger: the enemy cannot attack while staggered
    if (enemy.staggerUntil && enemy.staggerUntil > Date.now()) {
        setTimeout(enemyAttack, Math.max(50, enemy.staggerUntil - Date.now()));
        return;
    }
    if (player.inCombat) {
        sfxAttack.play();
    }

    // Calculates the damage and attacks the player
    let damage = enemy.stats.atk * (enemy.stats.atk / (enemy.stats.atk + player.stats.def * playerBuffMult("defMult")));
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

    // Iron Will: below 80% HP, take 30% less damage
    if (player.skills.includes("Iron Will") && player.stats.hp < player.stats.hpMax * 0.8) {
        damage = Math.round(damage * 0.7);
    }

    // WARD: battles start at 75% HP — take reduced damage as compensation
    const warded75Pct = (player.equippedStats && player.equippedStats.warded75) || 0;
    if (damage > 0 && warded75Pct > 0) {
        damage = Math.round(damage * (1 - warded75Pct / 100));
    }

    // Boss phase effects: Enrage (ATK+30% under 30% HP) / Desperado (scales with missing HP)
    if (enemy.enragePhase && enemy.stats.hp < enemy.stats.hpMax * 0.3) damage = Math.round(damage * 1.3);
    if (enemy.desperado) damage = Math.round(damage * (1 + Math.min(0.5, 1 - enemy.stats.hp / enemy.stats.hpMax)));

    // Petrified enemies cannot attack
    if (isEnemyPetrified()) {
        damage = 0;
        lifesteal = 0;
        addCombatLog(tParams("cb.petrifiedNoAtk", { name: enemy.name }));
    }

    // Dodge affix: chance to avoid the hit entirely
    if (damage > 0 && Math.random() * 100 < ((player.equippedStats && player.equippedStats.dodge) || 0)) {
        damage = 0;
        lifesteal = 0;
        addCombatLog(tParams("cb.attackMisses", { name: enemy.name, target: player.name }));
    }

    // Trial: above 50% HP you take increased damage
    if (damage > 0 && player.stats.hp > player.stats.hpMax * 0.5 && ((player.equippedStats && player.equippedStats.hpTradeDmg) || 0) > 0) {
        damage = Math.round(damage * (1 + player.equippedStats.hpTradeDmg / 100));
    }

    // Phase: invulnerable for a short window after attacking — but hits dealing 10%+ max HP pierce it
    if (damage > 0 && player.invulnUntil && Date.now() < player.invulnUntil) {
        if (damage >= player.stats.hpMax * 0.10) {
            addCombatLog(tParams("cb.piercesGuard", { name: enemy.name, target: player.name }));
        } else {
            damage = 0;
            lifesteal = 0;
            addCombatLog(tParams("cb.passesThrough", { name: enemy.name, target: player.name }));
        }
    }

    // True invulnerability (Adrenaline / Second Wind): negates all damage, no pierce
    if (damage > 0 && player.invulnTrueUntil && Date.now() < player.invulnTrueUntil) {
        damage = 0;
        lifesteal = 0;
    }

    // Boss phase effects: every Nth attack is a heavy blow / first hit after a phase is empowered
    enemy.attackCount = (enemy.attackCount || 0) + 1;
    if (damage > 0 && enemy.heavyEvery && enemy.attackCount % enemy.heavyEvery === 0) {
        damage *= 2;
        addCombatLog(tParams("cb.bossHeavy", { name: enemy.name }));
    }
    if (damage > 0 && enemy.empoweredNext) {
        damage = Math.round(damage * 1.6);
        enemy.empoweredNext = false;
        addCombatLog(tParams("cb.bossEmpowered", { name: enemy.name }));
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
    // Boss phase effect: Twin Strikes — chance of a follow-up hit
    if (enemy.doubleStrike > 0 && damage > 0 && Math.random() < enemy.doubleStrike) {
        const bonus = Math.max(1, Math.round(damage * 0.6));
        player.stats.hp -= bonus;
        spawnDamageNumber(bonus, false);
        addCombatLog(tParams("cb.doubleStrike", { name: enemy.name }));
    }
    if (damage > 0) player.momentumStacks = 0;
    // Boss phase effect: Momentum — each attack ramps ATK.SPD
    if (enemy.momentumRamp) enemy.momentumSpd = Math.min(0.6, (enemy.momentumSpd || 0) + 0.03);
    // Thorns: reflect % of damage taken (level growth + equipment)
    // Blood Oath: below 50% HP, THORN is increased by the affix value
    const oathThorns = player.stats.hp < player.stats.hpMax * 0.5 ? ((player.equippedStats && player.equippedStats.bloodOath) || 0) : 0;
    const thornsPct = ((player.bonusStats && player.bonusStats.thorns) || 0) + ((player.equippedStats && player.equippedStats.thorns) || 0) + oathThorns;
    if (thornsPct > 0 && damage > 0) {
        // THORN: damage taken × thorns% × (ATK/10) × ATK%
        const thornAtkPct = ((player.equippedStats && player.equippedStats.atkPct) || 0) + ((player.bonusStats && player.bonusStats.atk) || 0);
        const refDmg = Math.round(damage * (thornsPct / 100) * (player.stats.atk / 10) * (1 + thornAtkPct / 100));
        enemy.stats.hp -= refDmg;
        // THORN VIPER: thorns heal a % of max HP; VAMPTHORN: heal a % of reflected damage
        const thornViperPct = (player.equippedStats && player.equippedStats.thornViper) || 0;
        const vampThornsPct = (player.equippedStats && player.equippedStats.vampThorns) || 0;
        if (thornViperPct > 0) applyPlayerHeal(Math.round(player.stats.hpMax * thornViperPct / 100));
        if (vampThornsPct > 0) applyPlayerHeal(Math.round(refDmg * vampThornsPct / 100));
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
        addCombatLog(tParams("cb.reflects", { name: player.name, dmg: nFormatter(refDmg) }));
        spawnDamageNumber(refDmg, false);
    }
    enemy.stats.hp += lifesteal;
    addCombatLog(tParams("cb.dealtShield", {
        name: enemy.name,
        dmg: tParams("cb.dmgTypeLabel", { dmg: nFormatter(damage), type: dmgtype === "crit damage" ? t("cb.dmgCrit") : t("cb.dmgNormal") }),
        target: player.name,
        abs: absorbed > 0 ? tParams("cb.shieldAbsorbed", { abs: nFormatter(absorbed) }) : ""
    }));
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
        }, (1000 / (enemy.stats.atkSpd * enemyDebuffMult("atkSpdMult") * (1 + (enemy.momentumSpd || 0)))));
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
        button.innerHTML = `<button id="battleButton">${t("cb.claim")}</button>`;
        combatLogBox.appendChild(button);
    }

    if (playerDead) {
        let button = document.createElement("div");
        button.className = "decision-panel";
        button.innerHTML = `<button id="battleButton">${t("cb.backToMenu")}</button>`;
        combatLogBox.appendChild(button);
        // Revive: once per 100-floor band, spend ALL gold (min 500K) to end the battle as a win
        if (reviveAvailable()) {
            let revivePanel = document.createElement("div");
            revivePanel.className = "decision-panel";
            revivePanel.innerHTML = `<button id="reviveButton">${tParams("cb.revive", { c: REVIVE_CRYSTAL_COST })}</button>`;
            combatLogBox.appendChild(revivePanel);
        }
    }

    // Flee becomes available 60s into combat
    if (!enemyDead && !playerDead && combatSeconds >= 60) {
        let fleePanel = document.createElement("div");
        fleePanel.className = "decision-panel";
        fleePanel.innerHTML = `<button id="fleeButton">${t("cb.flee")}</button>`;
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
    player.adrenalineUsed = false;
    player.invulnTrueUntil = 0;
    player.bladeDanceStacks = 0;
    player.openerReady = true;
    player.hunterStacks = 0;
    player.surgeNext = null;
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

    // WARD / FURY: battles begin at no more than 75% HP
    if (((player.equippedStats && player.equippedStats.warded75) || 0) > 0 || ((player.equippedStats && player.equippedStats.fury75) || 0) > 0) {
        player.stats.hp = Math.min(player.stats.hp, Math.round(player.stats.hpMax * 0.75));
        playerLoadStats();
    }
    // RAPID: fast regen — heal a % of max HP every 0.1s
    if (playerRapidTimer) clearInterval(playerRapidTimer);
    playerRapidTimer = setInterval(() => {
        if (!player.inCombat || playerDead || enemyDead) return;
        const rapid = (player.equippedStats && player.equippedStats.rapidRegen) || 0;
        if (rapid <= 0 || player.stats.hp <= 0 || player.stats.hp >= player.stats.hpMax) return;
        applyPlayerHeal(Math.round(player.stats.hpMax * rapid / 100));
        playerLoadStats();
    }, 100);

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
    // Stops every timer in combat
    clearInterval(combatTimer);
    if (playerRegenTimer) { clearInterval(playerRegenTimer); playerRegenTimer = null; }
    if (playerRapidTimer) { clearInterval(playerRapidTimer); playerRapidTimer = null; }
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

// ========== Revive (once per 100-floor band, costs 5 crystals) ==========
const REVIVE_CRYSTAL_COST = 5;
const reviveBand = () => diffTierOfFloor(dungeon.progress.floor);
const reviveAvailable = () => {
    player.reviveUsedBands = player.reviveUsedBands || {};
    return !player.reviveUsedBands[reviveBand()] && (player.crystals || 0) >= REVIVE_CRYSTAL_COST;
};
const reviveCombat = () => {
    if (!reviveAvailable()) { sfxDeny.play(); return; }
    sfxConfirm.play();
    player.reviveUsedBands[reviveBand()] = true;
    player.crystals -= REVIVE_CRYSTAL_COST;
    player.stats.hp = Math.max(1, Math.round(player.stats.hpMax * 0.5));
    player.stats.hpPercent = Math.round((player.stats.hp / player.stats.hpMax) * 100);
    playerDead = false;
    // The battle ends as a victory: enemy is defeated and rewards are granted
    enemy.stats.hp = 0;
    hpValidation();
    playerLoadStats();
    saveData();
};

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
            <div class="grid-room" role="img" aria-label="grid dungeon" aria-hidden="true"><img class="battle-bg" src="./assets/bg/battle.jpg" alt=""><div class="stage">
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
            <div class="battle-bar empty-bar hp bb-hp${enemy.isBoss ? " boss-hp" : ""}">
                <div class="battle-bar dmg bb-hp" id="enemy-hp-dmg"></div>
                <div class="battle-bar current bb-hp" id="enemy-hp-battle"></div>
                <div class="bar-text" id="enemy-hp-text">&nbsp;${nFormatter(enemy.stats.hp)}/${nFormatter(enemy.stats.hpMax)} (${enemy.stats.hpPercent}%)</div>
                ${enemy.isBoss ? enemy.phaseThresholds.map(t => `<div class="phase-tick" style="left:${t * 100}%"></div>`).join("") : ""}
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
        if (e.target.closest("#reviveButton") && playerDead) reviveCombat();
        if (e.target.closest("#fleeButton") && player.inCombat && !enemyDead && !playerDead) fleeCombat();
    });
}