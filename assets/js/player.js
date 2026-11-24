let player = JSON.parse(localStorage.getItem("playerData"));
// Migrate renamed passive
if (player && player.skills) {
    player.skills = player.skills.map(s => s === "Aegis Renewal" ? "Blood Tithe" : s);
}
let inventoryOpen = false;
let leveled = false;
const lvlupSelect = document.querySelector("#lvlupSelect");
const lvlupPanel = document.querySelector("#lvlupPanel");

const playerExpGain = () => {
    const prevAbilities = unlockedAbilities().map(a => a.id);
    const expGain = Math.round(enemy.rewards.exp * (1 + ((player.equippedStats && player.equippedStats.expFind) || 0) / 100));
    player.exp.expCurr += expGain;
    player.exp.expCurrLvl += expGain;

    while (player.exp.expCurr >= player.exp.expMax && player.lvl < 200) {
        playerLvlUp();
    }
    if (leveled) {
        lvlupPopup();
    }
    checkAbilityUnlocks(prevAbilities);

    playerLoadStats();
}

// Levels up the player
const playerLvlUp = () => {
    leveled = true;

    // Calculates the excess exp and the new exp required to level up
    let expMaxIncrease = Math.floor(((player.exp.expMax * 1.1) + 100) - player.exp.expMax);
    if (player.lvl >= 200) {
        expMaxIncrease = 1000000;
    }
    let excessExp = player.exp.expCurr - player.exp.expMax;
    player.exp.expCurrLvl = excessExp;
    player.exp.expMaxLvl = expMaxIncrease;

    // Increase player level and maximum exp
    player.lvl++;
    player.exp.lvlGained++;
    player.exp.expMax += expMaxIncrease;

    // Increase player bonus stats per level
    player.bonusStats.hp += 4;
    player.bonusStats.atk += 2;
    player.bonusStats.def += 2;
    player.bonusStats.atkSpd += 0.15;
    player.bonusStats.critRate += 0.1;
    player.bonusStats.critDmg += 0.25;
}

// Refresh the player stats
const playerLoadStats = () => {
    showEquipment();
    showInventory();
    applyEquipmentStats();

    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    if (player.stats.hp > player.stats.hpMax) {
        player.stats.hp = player.stats.hpMax;
    }
    player.stats.hpPercent = Number((player.stats.hp / player.stats.hpMax) * 100).toFixed(2).replace(rx, "$1");
    if ((player.bonusStats.thorns || 0) > 10) player.bonusStats.thorns = 10;
    player.exp.expPercent = Math.min(100, Math.max(0, Number((player.exp.expCurrLvl / player.exp.expMaxLvl) * 100))).toFixed(2).replace(rx, "$1");

    // Generate battle info for player if in combat
    if (player.inCombat || playerDead) {
        const playerCombatHpElement = document.querySelector('#player-hp-battle');
        const playerHpDamageElement = document.querySelector('#player-hp-dmg');
        const playerExpElement = document.querySelector('#player-exp-bar');
        const playerInfoElement = document.querySelector('#player-combat-info');
        const playerCombatHpTextElement = document.querySelector('#player-hp-text');
        playerCombatHpTextElement.innerHTML = `&nbsp${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)} (${player.stats.hpPercent}%)`;
        playerCombatHpElement.style.width = `${player.stats.hpPercent}%`;
        playerCombatHpElement.classList.toggle("low-hp", player.stats.hpPercent < 30);
        playerHpDamageElement.style.width = `${player.stats.hpPercent}%`;
        playerExpElement.style.width = `${player.exp.expPercent}%`;
        playerInfoElement.innerHTML = `${player.name} Lv.${player.lvl} (${player.exp.expPercent}%)`;
    }

    // Header
    document.querySelector("#player-name").innerHTML = `<i class="fas fa-user"></i>${player.name} Lv.${player.lvl} <i class="fas fa-coins"></i>${nFormatter(player.gold)}`;
    document.querySelector("#player-exp-info").innerHTML = `<i class="fas fa-star"></i>EXP ${nFormatter(player.exp.expCurr)}/${nFormatter(player.exp.expMax)} (${player.exp.expPercent}%)`;

    // Player Stats
    playerHpElement.innerHTML = `${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)} (${player.stats.hpPercent}%)`;
    playerAtkElement.innerHTML = nFormatter(player.stats.atk);
    playerNatkElement.innerHTML = (Math.min(300, player.bonusStats.nAtk || 0) + Math.min(60, (player.equippedStats && player.equippedStats.normAtkPct) || 0)).toFixed(2).replace(rx, "$1") + "%";
    playerDefElement.innerHTML = nFormatter(player.stats.def);
    playerAtkSpdElement.innerHTML = player.stats.atkSpd.toFixed(2).replace(rx, "$1");
    playerVampElement.innerHTML = (player.stats.vamp).toFixed(2).replace(rx, "$1") + "%";
    playerCrateElement.innerHTML = (player.stats.critRate).toFixed(2).replace(rx, "$1") + "%";
    playerCdmgElement.innerHTML = (player.stats.critDmg).toFixed(2).replace(rx, "$1") + "%";
    playerThornsElement.innerHTML = ((player.bonusStats.thorns || 0) + ((player.equippedStats && player.equippedStats.thorns) || 0)).toFixed(2).replace(rx, "$1") + "%";

    // Player Bonus Stats
    document.querySelector("#bonus-stats").innerHTML = `
    <h4>${t("bonus.title")}</h4>
    <p><i class="fas fa-heart"></i>HP+${player.bonusStats.hp.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-sword"></i>ATK+${player.bonusStats.atk.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="fas fa-bolt"></i>N.ATK+${(player.bonusStats.nAtk || 0).toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-round-shield"></i>DEF+${player.bonusStats.def.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-plain-dagger"></i>ATK.SPD+${player.bonusStats.atkSpd.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-dripping-blade"></i>VAMP+${player.bonusStats.vamp.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-lightning-bolt"></i>C.RATE+${player.bonusStats.critRate.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-focused-lightning"></i>C.DMG+${player.bonusStats.critDmg.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-crown-of-thorns"></i>THORN+${(player.bonusStats.thorns || 0).toFixed(2).replace(rx, "$1")}%</p>`;
}

// Warehouse bar inside the inventory modal
const updateWarehouseBar = () => {
    const info = document.querySelector("#warehouse-info");
    const btn = document.querySelector("#warehouse-expand");
    if (!info || !btn) return;
    player.storage = player.storage || [];
    info.textContent = tParams("wh.info", { n: player.storage.length, max: storageMax() });
    if (storageTier() >= STORAGE_MAX_TIER) {
        btn.textContent = t("wh.maxed");
        btn.disabled = true;
    } else {
        btn.textContent = tParams("wh.expand", { c: nFormatter(STORAGE_EXPAND_COST) });
        btn.disabled = player.gold < STORAGE_EXPAND_COST;
    }
    btn.onclick = () => { if (expandStorage()) updateWarehouseBar(); };
};

// Opens inventory
const openInventory = () => {
    sfxOpen.play();

    dungeon.status.exploring = false;
    inventoryOpen = true;
    let openInv = document.querySelector('#inventory');
    let dimDungeon = document.querySelector('#dungeon-main');
    openInv.style.display = "flex";
    dimDungeon.style.filter = "brightness(50%)";

    sellAllElement.onclick = function () {
        sfxOpen.play();
        openInv.style.filter = "brightness(50%)";
        let rarity = sellRarityElement.value;

        defaultModalElement.style.display = "flex";
        if (rarity == "All") {
            defaultModalElement.innerHTML = `
            <div class="content">
                <p>${t("inv.sellAllQ")}</p>
                <div class="button-container">
                    <button id="sell-confirm">${t("inv.sellAll")}</button>
                    <button id="sell-cancel">${t("common.cancel")}</button>
                </div>
            </div>`;
        } else {
            defaultModalElement.innerHTML = `
            <div class="content">
                <p>${tParams("inv.sellRarityQ", { r: `<span class="${rarity}">${rarity}</span>` })}</p>
                <div class="button-container">
                    <button id="sell-confirm">${t("inv.sellAll")}</button>
                    <button id="sell-cancel">${t("common.cancel")}</button>
                </div>
            </div>`;
        }

        let confirm = document.querySelector('#sell-confirm');
        let cancel = document.querySelector('#sell-cancel');
        confirm.onclick = function () {
            sellAll(rarity);
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            openInv.style.filter = "brightness(100%)";
        };
        cancel.onclick = function () {
            sfxDecline.play();
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            openInv.style.filter = "brightness(100%)";
        };
    };
    sellRarityElement.onclick = function () {
        sfxOpen.play();
    };
    sellRarityElement.onchange = function () {
        let rarity = sellRarityElement.value;
        sellRarityElement.className = rarity;
    };
    updateWarehouseBar();
}

// Closes inventory
const closeInventory = () => {
    sfxDecline.play();

    let openInv = document.querySelector('#inventory');
    let dimDungeon = document.querySelector('#dungeon-main');
    openInv.style.display = "none";
    dimDungeon.style.filter = "brightness(100%)";
    inventoryOpen = false;
    if (!dungeon.status.paused) {
        dungeon.status.exploring = true;
    }
}

// Continue exploring if inventory is not open and the game is not paused
const continueExploring = () => {
    if (!inventoryOpen && !dungeon.status.paused) {
        dungeon.status.exploring = true;
    }
}

// Shows the level up popup
const lvlupPopup = () => {
    sfxLvlUp.play();
    addCombatLog(tParams("cb.levelUp", { from: player.lvl - player.exp.lvlGained, to: player.lvl }));

    // Recover 20% extra hp on level up
    player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
    playerLoadStats();

    // Show popup choices
    lvlupPanel.style.display = "flex";
    combatPanel.style.filter = "brightness(50%)";
    const percentages = {
        "hp": 10,
        "atk": 8,
        "def": 8,
        "atkSpd": 3,
        "vamp": 0.5,
        "critRate": 1,
        "critDmg": 6,
        "thorns": 0.1,
        "nAtk": 6
    };
    generateLvlStats(2, percentages);
}

// Generates random stats for level up popup
const generateLvlStats = (rerolls, percentages) => {
    let selectedStats = [];
    let stats = ["hp", "atk", "def", "atkSpd", "vamp", "critRate", "critDmg", "thorns"];
    while (selectedStats.length < 3) {
        let randomIndex = Math.floor(Math.random() * stats.length);
        if (!selectedStats.includes(stats[randomIndex])) {
            selectedStats.push(stats[randomIndex]);
        }
    }
    // N.ATK is an uncommon level-up option (~20% chance to appear, hidden once capped)
    if (Math.random() < 0.2 && (player.bonusStats.nAtk || 0) < 300) {
        selectedStats[Math.floor(Math.random() * selectedStats.length)] = "nAtk";
    }

    const loadLvlHeader = () => {
        lvlupSelect.innerHTML = `
            <h1>${t("lvl.title")}</h1>
            <div class="content-head">
                <h4>${t("lvl.remaining")} ${player.exp.lvlGained}</h4>
                <button id="lvlReroll">${t("lvl.reroll")} ${rerolls}/2</button>
            </div>
        `;
    }
    loadLvlHeader();

    const lvlReroll = document.querySelector("#lvlReroll");
    lvlReroll.addEventListener("click", function () {
        if (rerolls > 0) {
            sfxSell.play();
            rerolls--;
            loadLvlHeader();
            generateLvlStats(rerolls, percentages);
        } else {
            sfxDeny.play();
        }
    });

    try {
        for (let i = 0; i < 4; i++) {
            let button = document.createElement("button");
            button.id = "lvlSlot" + i;

            let h3 = document.createElement("h3");
            h3.innerHTML = selectedStats[i].replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase() + " UP";
            button.appendChild(h3);

            let p = document.createElement("p");
            const statName = selectedStats[i].replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase();
            p.innerHTML = tParams("lvl.statup", { s: statName, p: percentages[selectedStats[i]] });
            button.appendChild(p);

            // Increase the selected stat for player
            button.addEventListener("click", function () {
                sfxItem.play();
                player.bonusStats[selectedStats[i]] = (player.bonusStats[selectedStats[i]] || 0) + percentages[selectedStats[i]];
                if (selectedStats[i] === "thorns") {
                    player.bonusStats.thorns = Math.min(10, player.bonusStats.thorns);
                }
                if (selectedStats[i] === "nAtk") {
                    player.bonusStats.nAtk = Math.min(300, player.bonusStats.nAtk);
                }

                if (player.exp.lvlGained > 1) {
                    player.exp.lvlGained--;
                    generateLvlStats(2, percentages);
                } else {
                    player.exp.lvlGained = 0;
                    lvlupPanel.style.display = "none";
                    combatPanel.style.filter = "brightness(100%)";
                    leveled = false;
                }

                playerLoadStats();
                saveData();
            });

            lvlupSelect.appendChild(button);
        }
    } catch (err) { }
}