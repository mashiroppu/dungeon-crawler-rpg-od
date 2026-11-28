// Display settings (brightness)
let settings = JSON.parse(localStorage.getItem("settingsData")) || { brightness: 100 };
const applyBrightness = () => {
    document.body.style.filter = settings.brightness === 100 ? "" : `brightness(${settings.brightness / 100})`;
};
const saveSettings = () => localStorage.setItem("settingsData", JSON.stringify(settings));
applyBrightness();

window.addEventListener("load", function () {
    if (player === null) {
        runLoad("character-creation", "flex");
    } else {
        let target = document.querySelector("#title-screen");
        target.style.display = "flex";
    }
    applyStaticI18n();

    // Title Screen Validation
    document.querySelector("#title-screen").addEventListener("click", function () {
        const player = JSON.parse(localStorage.getItem("playerData"));
        if (player.allocated) {
            enterDungeon();
        } else {
            allocationPopup();
        }
    });

    // Prevent double-click zooming on mobile devices
    document.ondblclick = function (e) {
        e.preventDefault();
    }

    // Submit Name
    document.querySelector("#name-submit").addEventListener("submit", function (e) {
        e.preventDefault();
        let playerName = document.querySelector("#name-input").value;

        var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if (format.test(playerName)) {
            document.querySelector("#alert").innerHTML = t("name.err.special");
        } else {
            if (playerName.length < 3) {
                document.querySelector("#alert").innerHTML = t("name.err.short");
            } else if (!isValidNameWidth(playerName)) {
                document.querySelector("#alert").innerHTML = tParams("name.err.long", { w: NAME_MAX_WIDTH });
            } else {
                player = {
                    name: playerName,
                    lvl: 1,
                    stats: {
                        hp: null,
                        hpMax: null,
                        atk: null,
                        def: null,
                        pen: null,
                        atkSpd: null,
                        vamp: null,
                        critRate: null,
                        critDmg: null
                    },
                    baseStats: {
                        hp: 500,
                        atk: 100,
                        def: 50,
                        pen: 0,
                        atkSpd: 0.6,
                        vamp: 0,
                        critRate: 0,
                        critDmg: 50
                    },
                    equippedStats: {
                        hp: 0,
                        atk: 0,
                        def: 0,
                        pen: 0,
                        atkSpd: 0,
                        vamp: 0,
                        critRate: 0,
                        critDmg: 0,
                        hpPct: 0,
                        atkPct: 0,
                        defPct: 0,
                        penPct: 0,
                    },
                    bonusStats: {
                        hp: 0,
                        atk: 0,
                        def: 0,
                        atkSpd: 0,
                        vamp: 0,
                        critRate: 0,
                        critDmg: 0,
                        nAtk: 0
                    },
                    exp: {
                        expCurr: 0,
                        expMax: 100,
                        expCurrLvl: 0,
                        expMaxLvl: 100,
                        lvlGained: 0
                    },
                    inventory: {
                        consumables: [],
                        equipment: []
                    },
                    storage: [],
                    equipped: [],
                    gold: 0,
                    crystals: 0,
                    crystalWard: false,
                    playtime: 0,
                    kills: 0,
                    deaths: 0,
                    skills: [],
                    inCombat: false
                };
                calculateStats();
                player.stats.hp = player.stats.hpMax;
                saveData();
                document.querySelector("#character-creation").style.display = "none";
                runLoad("title-screen", "flex");
            }
        }
    });

    // Unequip all items
    document.querySelector("#unequip-all").addEventListener("click", function () {
        sfxOpen.play();

        dungeon.status.exploring = false;
        let dimTarget = document.querySelector('#inventory');
        dimTarget.style.filter = "brightness(50%)";
        defaultModalElement.style.display = "flex";
        defaultModalElement.innerHTML = `
        <div class="content">
            <p>Unequip all your items?</p>
            <div class="button-container">
                <button id="unequip-confirm">Unequip</button>
                <button id="unequip-cancel">Cancel</button>
            </div>
        </div>`;
        let confirm = document.querySelector('#unequip-confirm');
        let cancel = document.querySelector('#unequip-cancel');
        confirm.onclick = function () {
            sfxUnequip.play();
            unequipAll();
            continueExploring();
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            dimTarget.style.filter = "brightness(100%)";
        };
        cancel.onclick = function () {
            sfxDecline.play();
            continueExploring();
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            dimTarget.style.filter = "brightness(100%)";
        };
    });

    let openMenuModal = null;
    document.querySelector("#menu-btn").addEventListener("click", openMenuModal = function () {
        closeInventory();

        dungeon.status.exploring = false;
        let dimDungeon = document.querySelector('#dungeon-main');
        dimDungeon.style.filter = "brightness(50%)";
        menuModalElement.style.display = "flex";

        // Menu tab
        menuModalElement.innerHTML = `
        <div class="content">
            <div class="content-head">
                <h3>${t("menu.title")}</h3>
                <p id="close-menu"><i class="fa fa-xmark"></i></p>
            </div>
            <button id="player-menu"><i class="fas fa-user"></i>${player.name}</button>
            <button id="stats">${t("menu.run")}</button>
            <button id="volume-btn">${t("menu.settings")}</button>
            <button id="export-import">${t("menu.ei")}</button>
            <button id="lang-btn">${t("menu.lang")}: ${LANG === "ja" ? "日本語" : "English"}</button>
            <button id="quit-run">${t("menu.quit")}</button>
        </div>`;

        let close = document.querySelector('#close-menu');
        let playerMenu = document.querySelector('#player-menu');
        let runMenu = document.querySelector('#stats');
        let quitRun = document.querySelector('#quit-run');
        let exportImport = document.querySelector('#export-import');
        let volumeSettings = document.querySelector('#volume-btn');
        let langBtn = document.querySelector('#lang-btn');

        // Language toggle: switch EN/JA and re-render everything
        langBtn.onclick = function () {
            sfxOpen.play();
            setLang(LANG === "ja" ? "en" : "ja");
            applyStaticI18n();
            playerLoadStats();
            menuModalElement.style.display = "none";
            menuModalElement.innerHTML = "";
            openMenuModal();
        };

        // Player profile click function
        playerMenu.onclick = function () {
            sfxOpen.play();
            let playTime = new Date(player.playtime * 1000).toISOString().slice(11, 19);
            menuModalElement.style.display = "none";
            defaultModalElement.style.display = "flex";
            defaultModalElement.innerHTML = `
            <div class="content" id="profile-tab">
                <div class="content-head">
                    <h3>${t("profile.title")}</h3>
                    <p id="profile-close"><i class="fa fa-xmark"></i></p>
                </div>
                <p>${player.name} Lv.${player.lvl}</p>
                <p>${t("profile.kills")} ${nFormatter(player.kills)}</p>
                <p>${t("profile.deaths")} ${nFormatter(player.deaths)}</p>
                <p>${t("profile.playtime")} ${playTime}</p>
                <button id="rename-btn">${t("profile.rename")}</button>
            </div>`;
            let profileTab = document.querySelector('#profile-tab');
            profileTab.style.width = "15rem";
            let profileClose = document.querySelector('#profile-close');
            profileClose.onclick = function () {
                sfxDecline.play();
                defaultModalElement.style.display = "none";
                defaultModalElement.innerHTML = "";
                menuModalElement.style.display = "flex";
            };
            document.querySelector('#rename-btn').onclick = function () {
                sfxOpen.play();
                defaultModalElement.innerHTML = `
                <div class="content" id="rename-tab">
                    <div class="content-head">
                        <h3>${t("rename.title")}</h3>
                        <p id="rename-close"><i class="fa fa-xmark"></i></p>
                    </div>
                    <input type="text" id="rename-input" value="${player.name}" autocomplete="off">
                    <p id="rename-alert"></p>
                    <button id="rename-confirm">${t("common.confirm")}</button>
                </div>`;
                document.querySelector('#rename-close').onclick = function () {
                    sfxDecline.play();
                    playerMenu.onclick();
                };
                document.querySelector('#rename-confirm').onclick = function () {
                    let newName = document.querySelector("#rename-input").value.trim();
                    let alertEl = document.querySelector("#rename-alert");
                    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                    if (format.test(newName)) {
                        alertEl.innerHTML = t("name.err.special");
                    } else if (newName.length < 3) {
                        alertEl.innerHTML = t("name.err.short");
                    } else if (!isValidNameWidth(newName)) {
                        alertEl.innerHTML = tParams("name.err.long", { w: NAME_MAX_WIDTH });
                    } else {
                        sfxConfirm.play();
                        player.name = newName;
                        saveData();
                        playerLoadStats();
                        menuModalElement.style.display = "flex";
                        defaultModalElement.style.display = "none";
                        defaultModalElement.innerHTML = "";
                    }
                };
            };
        };

        // Dungeon run click function
        runMenu.onclick = function () {
            sfxOpen.play();
            let runTime = new Date(dungeon.statistics.runtime * 1000).toISOString().slice(11, 19);
            menuModalElement.style.display = "none";
            defaultModalElement.style.display = "flex";
            defaultModalElement.innerHTML = `
            <div class="content" id="run-tab">
                <div class="content-head">
                    <h3>${t("run.title")}</h3>
                    <p id="run-close"><i class="fa fa-xmark"></i></p>
                </div>
                <p>${player.name} Lv.${player.lvl} [${(CLASSES[player.cls] || CLASSES.warrior).name}]</p>
                <p>${t("run.difficulty")} <select id="run-diff-select">${DIFFICULTY_TIERS.map((d, i) => i <= maxDiffTier() ? `<option value="${d.key}" ${player.difficulty === d.key ? "selected" : ""}>${d.label}</option>` : "").join("")}</select></p>
                <p>${t("run.blessing")}${player.blessing}</p>
                <p>${t("run.curse")} ${Math.round((dungeon.settings.enemyScaling - 1) * 10)}</p>
                <p>${t("run.kills")} ${nFormatter(dungeon.statistics.kills)}</p>
                <p>${t("run.runtime")} ${runTime}</p>
            </div>`;
            let runTab = document.querySelector('#run-tab');
            runTab.style.width = "15rem";
            let runClose = document.querySelector('#run-close');
            runClose.onclick = function () {
                sfxDecline.play();
                defaultModalElement.style.display = "none";
                defaultModalElement.innerHTML = "";
                menuModalElement.style.display = "flex";
            };
            const runDiffSelect = document.querySelector("#run-diff-select");
            if (runDiffSelect) {
                runDiffSelect.onchange = function () {
                    sfxConfirm.play();
                    player.difficulty = runDiffSelect.value;
                    saveData();
                };
            }
        };

        // Quit the current run
        quitRun.onclick = function () {
            sfxOpen.play();
            menuModalElement.style.display = "none";
            defaultModalElement.style.display = "flex";
            defaultModalElement.innerHTML = `
            <div class="content">
                <p>${t("quit.msg")}</p>
                <div class="button-container">
                    <button id="quit-run">${t("quit.abandon")}</button>
                    <button id="cancel-quit">${t("common.cancel")}</button>
                </div>
            </div>`;
            let quit = document.querySelector('#quit-run');
            let cancel = document.querySelector('#cancel-quit');
            quit.onclick = function () {
                sfxConfirm.play();
                // Clear out everything, send the player back to meny and clear progress.
                bgmDungeon.stop();
                let dimDungeon = document.querySelector('#dungeon-main');
                dimDungeon.style.filter = "brightness(100%)";
                dimDungeon.style.display = "none";
                menuModalElement.style.display = "none";
                menuModalElement.innerHTML = "";
                defaultModalElement.style.display = "none";
                defaultModalElement.innerHTML = "";
                runLoad("title-screen", "flex");
                clearInterval(dungeonTimer);
                clearInterval(playTimer);
                progressReset();
            };
            cancel.onclick = function () {
                sfxDecline.play();
                defaultModalElement.style.display = "none";
                defaultModalElement.innerHTML = "";
                menuModalElement.style.display = "flex";
            };
        };

        // Opens the volume settings
        volumeSettings.onclick = function () {
            sfxOpen.play();

            let master = volume.master * 100;
            let bgm = (volume.bgm * 100) * 2;
            let sfx = volume.sfx * 100;
            let bright = settings.brightness;
            menuModalElement.style.display = "none";
            defaultModalElement.style.display = "flex";
            defaultModalElement.innerHTML = `
            <div class="content" id="volume-tab">
                <div class="content-head">
                    <h3>${t("set.title")}</h3>
                    <p id="volume-close"><i class="fa fa-xmark"></i></p>
                </div>
                <label id="master-label" for="master-volume">${t("vol.master")} (${master}%)</label>
                <input type="range" id="master-volume" min="0" max="100" value="${master}">
                <label id="bgm-label" for="bgm-volume">${t("vol.bgm")} (${bgm}%)</label>
                <input type="range" id="bgm-volume" min="0" max="100" value="${bgm}">
                <label id="sfx-label" for="sfx-volume">${t("vol.sfx")} (${sfx}%)</label>
                <input type="range" id="sfx-volume" min="0" max="100" value="${sfx}">
                <label id="bright-label" for="bright-slider">${t("set.brightness")} (${bright}%)</label>
                <input type="range" id="bright-slider" min="50" max="150" value="${bright}">
                <button id="apply-volume">${t("vol.apply")}</button>
            </div>`;
            let masterVol = document.querySelector('#master-volume');
            let bgmVol = document.querySelector('#bgm-volume');
            let sfxVol = document.querySelector('#sfx-volume');
            let brightSlider = document.querySelector('#bright-slider');
            let applyVol = document.querySelector('#apply-volume');
            let volumeTab = document.querySelector('#volume-tab');
            volumeTab.style.width = "15rem";
            let volumeClose = document.querySelector('#volume-close');
            volumeClose.onclick = function () {
                sfxDecline.play();
                defaultModalElement.style.display = "none";
                defaultModalElement.innerHTML = "";
                menuModalElement.style.display = "flex";
            };

            // Volume Control
            masterVol.oninput = function () {
                master = this.value;
                document.querySelector('#master-label').innerHTML = `Master (${master}%)`;
            };

            bgmVol.oninput = function () {
                bgm = this.value;
                document.querySelector('#bgm-label').innerHTML = `BGM (${bgm}%)`;
            };

            sfxVol.oninput = function () {
                sfx = this.value;
                document.querySelector('#sfx-label').innerHTML = `SFX (${sfx}%)`;
            };

            brightSlider.oninput = function () {
                bright = this.value;
                document.querySelector('#bright-label').innerHTML = `${t("set.brightness")} (${bright}%)`;
            };

            applyVol.onclick = function () {
                volume.master = master / 100;
                volume.bgm = (bgm / 100) / 2;
                volume.sfx = sfx / 100;
                settings.brightness = Number(bright);
                applyBrightness();
                saveSettings();
                bgmDungeon.stop();
                setVolume();
                bgmDungeon.play();
                saveData();
            };
        };

        // Export/Import Save Data
        exportImport.onclick = function () {
            sfxOpen.play();
            let exportedData = exportData();
            menuModalElement.style.display = "none";
            defaultModalElement.style.display = "flex";
            defaultModalElement.innerHTML = `
            <div class="content" id="ei-tab">
                <div class="content-head">
                    <h3>${t("ei.title")}</h3>
                    <p id="ei-close"><i class="fa fa-xmark"></i></p>
                </div>
                <h4>${t("ei.export")}</h4>
                <input type="text" id="export-input" autocomplete="off" value="${exportedData}" readonly>
                <button id="copy-export">${t("common.copy")}</button>
                <h4>${t("ei.import")}</h4>
                <input type="text" id="import-input" autocomplete="off">
                <button id="data-import">${t("ei.doImport")}</button>
            </div>`;
            let eiTab = document.querySelector('#ei-tab');
            eiTab.style.width = "15rem";
            let eiClose = document.querySelector('#ei-close');
            let copyExport = document.querySelector('#copy-export')
            let dataImport = document.querySelector('#data-import');
            let importInput = document.querySelector('#import-input');
            copyExport.onclick = function () {
                sfxConfirm.play();
                let copyText = document.querySelector('#export-input');
                copyText.select();
                copyText.setSelectionRange(0, 99999);
                navigator.clipboard.writeText(copyText.value);
                copyExport.innerHTML = t("common.copied");
            }
            dataImport.onclick = function () {
                importData(importInput.value);
            };
            eiClose.onclick = function () {
                sfxDecline.play();
                defaultModalElement.style.display = "none";
                defaultModalElement.innerHTML = "";
                menuModalElement.style.display = "flex";
            };
        };

        // Close menu
        close.onclick = function () {
            sfxDecline.play();
            continueExploring();
            menuModalElement.style.display = "none";
            menuModalElement.innerHTML = "";
            dimDungeon.style.filter = "brightness(100%)";
        };
    });
});

// Loading Screen
const runLoad = (id, display) => {
    let loader = document.querySelector("#loading");
    loader.style.display = "flex";
    setTimeout(async () => {
        loader.style.display = "none";
        document.querySelector(`#${id}`).style.display = `${display}`;
    }, 1000);
}

// Start the game
const enterDungeon = () => {
    sfxConfirm.play();
    document.querySelector("#title-screen").style.display = "none";
    runLoad("dungeon-main", "flex");
    if (player.inCombat) {
        enemy = JSON.parse(localStorage.getItem("enemyData"));
        showCombatInfo();
        startCombat(bgmBattleMain);
    } else {
        bgmDungeon.play();
    }
    if (player.stats.hp == 0) {
        progressReset();
    }
    initialDungeonLoad();
    playerLoadStats();
}

// Save all the data into local storage
const saveData = () => {
    const playerData = JSON.stringify(player);
    const dungeonData = JSON.stringify(dungeon);
    const enemyData = JSON.stringify(enemy);
    const volumeData = JSON.stringify(volume);
    localStorage.setItem("playerData", playerData);
    localStorage.setItem("dungeonData", dungeonData);
    localStorage.setItem("enemyData", enemyData);
    localStorage.setItem("volumeData", volumeData);
}

// Calculate every player stat
const calculateStats = () => {
    let equipmentAtkSpd = player.baseStats.atkSpd * (player.equippedStats.atkSpd / 100);
    let playerHpBase = player.baseStats.hp;
    let playerAtkBase = player.baseStats.atk;
    let playerDefBase = player.baseStats.def;
    let playerAtkSpdBase = player.baseStats.atkSpd;
    let playerVampBase = player.baseStats.vamp;
    let playerCRateBase = player.baseStats.critRate;
    let playerCDmgBase = player.baseStats.critDmg;

    const eqHpPct = player.equippedStats.hpPct || 0;
    const eqDefPct = player.equippedStats.defPct || 0;
    player.stats.hpMax = Math.round(playerHpBase * (1 + (player.bonusStats.hp + eqHpPct) / 100) + player.equippedStats.hp);
    // Glass Cannon: -25% max HP
    if ((player.skills || []).includes("Glass Cannon")) player.stats.hpMax = Math.round(player.stats.hpMax * 0.75);
    // ATK% (atkPct + level-up atk) is a direct damage-dealt multiplier applied in combat, not an ATK stat boost
    player.stats.atk = Math.round(playerAtkBase + player.equippedStats.atk);
    player.stats.def = Math.round(playerDefBase * (1 + (player.bonusStats.def + eqDefPct) / 100) + player.equippedStats.def);
    player.stats.atkSpd = (playerAtkSpdBase + playerAtkSpdBase * (player.bonusStats.atkSpd / 100)) + equipmentAtkSpd + (equipmentAtkSpd * (player.equippedStats.atkSpd / 100));
    player.stats.vamp = playerVampBase + player.bonusStats.vamp + player.equippedStats.vamp;
    player.stats.critRate = Math.min(75, playerCRateBase + player.bonusStats.critRate + player.equippedStats.critRate);
    player.stats.critDmg = playerCDmgBase + player.bonusStats.critDmg + player.equippedStats.critDmg;
    // Devastator: -30% attack speed
    if ((player.skills || []).includes("Devastator")) player.stats.atkSpd = player.stats.atkSpd * 0.7;

    // Caps attack speed to 3
    if (player.stats.atkSpd > 3) {
        player.stats.atkSpd = 3;
    }
}

// Resets the progress back to start
const progressReset = () => {
    player.stats.hp = player.stats.hpMax;
    player.lvl = 1;
    player.blessing = 1;
    player.exp = {
        expCurr: 0,
        expMax: 100,
        expCurrLvl: 0,
        expMaxLvl: 100,
        lvlGained: 0
    };
    player.bonusStats = {
        hp: 0,
        atk: 0,
        def: 0,
        atkSpd: 0,
        vamp: 0,
        critRate: 0,
        critDmg: 0,
        nAtk: 0
    };
    player.skills = [];
    player.abilityCharges = {};
    player.abilityCds = {};
    player.combatBuffs = [];
    player.shield = 0;
    player.inCombat = false;
    // Only legacy storage persists between runs — gear is lost on reset
    player.storage = player.storage || [];
    player.stashUsedFloors = {};
    player.reviveUsedBands = {};
    player.inventory.equipment = [];
    player.equipped = [];
    // Crystal Ward: stored gear returns to the inventory at the start of the next run
    if (player.crystalWard) {
        player.inventory.equipment = (player.storage || []).splice(0);
    }
    applyEquipmentStats();
    // New run starts at the selected difficulty's band head (NORMAL=1 ... OMEGA=901)
    dungeon.progress.floor = diffStartFloor(playerDiffTier());
    dungeon.progress.floorLimit = 1000;
    dungeon.progress.room = 1;
    dungeon.statistics.kills = 0;
    dungeon.status = {
        exploring: false,
        paused: true,
        event: false,
    };
    dungeon.settings = {
        enemyBaseLvl: 1,
        enemyLvlGap: 5,
        enemyBaseStats: 1,
        enemyScaling: bandCurseScaling(playerDiffTier()),
    };
    delete dungeon.enemyMultipliers;
    dungeon.curseBand = diffTierOfFloor(dungeon.progress.floor);
    dungeon.blacksmithBand = undefined;
    delete player.allocated;
    dungeon.backlog.length = 0;
    dungeon.action = 0;
    dungeon.statistics.runtime = 0;
    combatBacklog.length = 0;
    saveData();
}

// Export and Import Save Data
// UTF-8 safe base64: btoa/atob alone throw on non-Latin1 chars (e.g. Japanese names)
const encodeSaveData = (obj) => {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    let bin = "";
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin);
};
const decodeSaveData = (data) => {
    const bin = atob(data.trim());
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
};

const exportData = () => {
    return encodeSaveData(player);
}

const importData = (importedData) => {
    try {
        let playerImport = decodeSaveData(importedData);
        if (playerImport.inventory !== undefined) {
            sfxOpen.play();
            defaultModalElement.style.display = "none";
            confirmationModalElement.style.display = "flex";
            confirmationModalElement.innerHTML = `
            <div class="content">
                <p>${t("import.warn")}</p>
                <div class="button-container">
                    <button id="import-btn">${t("ei.doImport")}</button>
                    <button id="cancel-btn">${t("common.cancel")}</button>
                </div>
            </div>`;
            let confirm = document.querySelector("#import-btn");
            let cancel = document.querySelector("#cancel-btn");
            confirm.onclick = function () {
                sfxConfirm.play();
                player = playerImport;
                saveData();
                bgmDungeon.stop();
                let dimDungeon = document.querySelector('#dungeon-main');
                dimDungeon.style.filter = "brightness(100%)";
                dimDungeon.style.display = "none";
                menuModalElement.style.display = "none";
                menuModalElement.innerHTML = "";
                confirmationModalElement.style.display = "none";
                confirmationModalElement.innerHTML = "";
                defaultModalElement.style.display = "none";
                defaultModalElement.innerHTML = "";
                runLoad("title-screen", "flex");
                clearInterval(dungeonTimer);
                clearInterval(playTimer);
                progressReset();
            }
            cancel.onclick = function () {
                sfxDecline.play();
                confirmationModalElement.style.display = "none";
                confirmationModalElement.innerHTML = "";
                defaultModalElement.style.display = "flex";
            }
        } else {
            sfxDeny.play();
        }
    } catch (err) {
        sfxDeny.play();
    }
}

// Player Stat Allocation
const allocationPopup = () => {
    let allocation = {
        hp: 5,
        atk: 5,
        def: 5,
        atkSpd: 5
    }
    const updateStats = () => {
        stats = {
            hp: 50 * allocation.hp,
            atk: 10 * allocation.atk,
            def: 10 * allocation.def,
            atkSpd: 0.4 + (0.02 * allocation.atkSpd)
        }
    }
    updateStats();
    let points = 20;
    const loadContent = function () {
        defaultModalElement.innerHTML = `
        <div class="content" id="allocate-stats">
            <div class="content-head">
                <h3>${t("cc.alloc")}</h3>
                <p id="allocate-close"><i class="fa fa-xmark"></i></p>
            </div>
            <div class="row">
                <p><i class="fas fa-heart"></i><span id="hpDisplay">HP: ${stats.hp}</span></p>
                <div class="row">
                    <button id="hpMin">-</button>
                    <span id="hpAllo">${allocation.hp}</span>
                    <button id="hpAdd">+</button>
                </div>
            </div>
            <div class="row">
                <p><i class="ra ra-sword"></i><span id="atkDisplay">ATK: ${stats.atk}</span></p>
                <div class="row">
                    <button id="atkMin">-</button>
                    <span id="atkAllo">${allocation.atk}</span>
                    <button id="atkAdd">+</button>
                </div>
            </div>
            <div class="row">
                <p><i class="ra ra-round-shield"></i><span id="defDisplay">DEF: ${stats.def}</span></p>
                <div class="row">
                    <button id="defMin">-</button>
                    <span id="defAllo">${allocation.def}</span>
                    <button id="defAdd">+</button>
                </div>
            </div>
            <div class="row">
                <p><i class="ra ra-plain-dagger"></i><span id="atkSpdDisplay">ATK.SPD: ${stats.atkSpd}</span></p>
                <div class="row">
                    <button id="atkSpdMin">-</button>
                    <span id="atkSpdAllo">${allocation.atkSpd}</span>
                    <button id="atkSpdAdd">+</button>
                </div>
            </div>
            <div class="row">
                <p id="alloPts">${tParams("cc.statPoints", { p: points })}</p>
                <button id="allocate-reset">${t("common.reset")}</button>
            </div>
            <div class="row">
                <p>${t("cc.class")}</p>
                <select id="select-class">
                    <option value="warrior">Warrior</option>
                    <option value="mage">Mage</option>
                    <option value="rogue">Rogue</option>
                    <option value="lancer">Lancer</option>
                    <option value="paladin">Paladin</option>
                </select>
            </div>
            <div class="row primary-panel pad">
                <p id="class-desc">${t("cc.classdesc.warrior")}</p>
            </div>
            <div class="row">
                <p>${t("cc.passive")}</p>
                <select id="select-skill">
                    <option value="Remnant Razor">Remnant Razor</option>
                    <option value="Titan's Will">Titan's Will</option>
                    <option value="Devastator">Devastator</option>
                    <option value="Blade Dance">Blade Dance</option>
                    <option value="Paladin's Heart">Paladin's Heart</option>
                    <option value="Aegis Thorns">Aegis Thorns</option>
                    <option value="Blood Tithe">Blood Tithe</option>
                    <option value="Second Wind">Second Wind</option>
                    <option value="Adrenaline">Adrenaline</option>
                    <option value="Executioner">Executioner</option>
                    <option value="Glass Cannon">Glass Cannon</option>
                    <option value="Iron Will">Iron Will</option>
                    <option value="Momentum">Momentum</option>
                    <option value="Leech Lord">Leech Lord</option>
                </select>
            </div>
            <div class="row primary-panel pad">
                <p id="skill-desc">${skillDescText("Remnant Razor")}</p>
            </div>
            <div class="row">
                <p>${t("cc.difficulty")}</p>
                <select id="select-difficulty">
                    ${DIFFICULTY_TIERS.map((d, i) => i <= maxDiffTier() ? `<option value="${d.key}">${d.label}</option>` : "").join("")}
                </select>
            </div>
            <div class="row primary-panel pad">
                <p id="diff-desc">${t("cc.diffdesc.normal")}</p>
            </div>
            <div class="row primary-panel pad" id="legacy-box" style="display:none">
                <p>${tParams("cc.legacy", { n: `<span id="legacy-count">0</span>`, max: storageMax() })}</p>
                <div id="legacy-list" class="legacy-list"></div>
                <p class="legacy-hint">${tParams("cc.legacyHint", { n: STORAGE_EQUIP_MAX })}</p>
            </div>
            <button id="allocate-confirm">${t("common.confirm")}</button>
        </div>`;
    }
    defaultModalElement.style.display = "flex";
    document.querySelector("#title-screen").style.filter = "brightness(50%)";
    loadContent();

    // Legacy Storage: pick up to STORAGE_EQUIP_MAX items to start equipped
    let legacySelected = [];
    player.storage = player.storage || [];
    const legacyBox = document.querySelector("#legacy-box");
    if (legacyBox && player.storage.length) {
        legacyBox.style.display = "block";
        document.querySelector("#legacy-count").textContent = player.storage.length;
        const legacyList = document.querySelector("#legacy-list");
        legacyList.innerHTML = "";
        player.storage.forEach((s, i) => {
            const item = JSON.parse(s);
            const icon = equipmentIcon(item.category);
            const el = document.createElement("div");
            el.className = "items legacy-item";
            el.dataset.i = i;
            el.innerHTML = `<p class="${item.rarity}">${icon}${itemName(item)}</p>`;
            el.onclick = () => {
                sfxConfirm.play();
                const idx = legacySelected.indexOf(i);
                if (idx >= 0) {
                    legacySelected.splice(idx, 1);
                    el.classList.remove("selected");
                } else if (legacySelected.length < STORAGE_EQUIP_MAX) {
                    legacySelected.push(i);
                    el.classList.add("selected");
                } else {
                    sfxDeny.play();
                    return;
                }
            };
            legacyList.appendChild(el);
        });
    }

    // Stat Allocation
    const handleStatButtons = (e) => {
        let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        if (e.includes("Add")) {
            let stat = e.split("Add")[0];
            if (points > 0) {
                sfxConfirm.play();
                allocation[stat]++;
                points--;
                updateStats();
                document.querySelector(`#${stat}Display`).innerHTML = `${stat.replace(/([A-Z])/g, ' $1').trim().replace(/ /g, '.').toUpperCase()}: ${stats[stat].toFixed(2).replace(rx, "$1")}`;
                document.querySelector(`#${stat}Allo`).innerHTML = allocation[stat];
                document.querySelector(`#alloPts`).innerHTML = tParams("cc.statPoints", { p: points });
            } else {
                sfxDeny.play();
            }
        } else if (e.includes("Min")) {
            let stat = e.split("Min")[0];
            if (allocation[stat] > 0) {
                sfxConfirm.play();
                allocation[stat]--;
                points++;
                updateStats();
                document.querySelector(`#${stat}Display`).innerHTML = `${stat.replace(/([A-Z])/g, ' $1').trim().replace(/ /g, '.').toUpperCase()}: ${stats[stat].toFixed(2).replace(rx, "$1")}`;
                document.querySelector(`#${stat}Allo`).innerHTML = allocation[stat];
                document.querySelector(`#alloPts`).innerHTML = tParams("cc.statPoints", { p: points });
            } else {
                sfxDeny.play();
            }
        }
    }
    document.querySelector("#hpAdd").onclick = function () {
        handleStatButtons("hpAdd")
    };
    document.querySelector("#hpMin").onclick = function () {
        handleStatButtons("hpMin")
    };
    document.querySelector("#atkAdd").onclick = function () {
        handleStatButtons("atkAdd")
    };
    document.querySelector("#atkMin").onclick = function () {
        handleStatButtons("atkMin")
    };
    document.querySelector("#defAdd").onclick = function () {
        handleStatButtons("defAdd")
    };
    document.querySelector("#defMin").onclick = function () {
        handleStatButtons("defMin")
    };
    document.querySelector("#atkSpdAdd").onclick = function () {
        handleStatButtons("atkSpdAdd")
    };
    document.querySelector("#atkSpdMin").onclick = function () {
        handleStatButtons("atkSpdMin")
    };

    // Passive skills
    let selectSkill = document.querySelector("#select-skill");
    let skillDesc = document.querySelector("#skill-desc");
    selectSkill.onclick = function () {
        sfxConfirm.play();
    }
    selectSkill.onchange = function () {
        skillDesc.innerHTML = skillDescText(selectSkill.value);
    }
    let selectClass = document.querySelector("#select-class");
    let classDesc = document.querySelector("#class-desc");
    selectClass.onchange = function () {
        sfxConfirm.play();
        classDesc.innerHTML = t(`cc.classdesc.${selectClass.value}`);
    }
    let selectDiff = document.querySelector("#select-difficulty");
    let diffDesc = document.querySelector("#diff-desc");
    if (selectDiff && diffDesc) {
        const unlocked = DIFFICULTY_TIERS.filter((d, i) => i <= maxDiffTier());
        const curKey = DIFFICULTY_TIERS[playerDiffTier()] ? player.difficulty : "normal";
        selectDiff.value = unlocked.some(d => d.key === curKey) ? curKey : unlocked[unlocked.length - 1].key;
        diffDesc.innerHTML = t(`cc.diffdesc.${selectDiff.value}`);
        selectDiff.onchange = function () {
            sfxConfirm.play();
            diffDesc.innerHTML = t(`cc.diffdesc.${selectDiff.value}`);
        };
    }

    // Operation Buttons
    let confirm = document.querySelector("#allocate-confirm");
    let reset = document.querySelector("#allocate-reset");
    let close = document.querySelector("#allocate-close");
    confirm.onclick = function () {
        // Set player class
        const clsKey = document.querySelector("#select-class").value;
        const clsDef = CLASSES[clsKey] || CLASSES.warrior;

        // Set allocated stats to player base stats
        player.baseStats = {
            hp: stats.hp,
            atk: stats.atk,
            def: stats.def,
            pen: 0,
            atkSpd: stats.atkSpd,
            vamp: 0,
            critRate: clsDef.add.critRate || 0,
            critDmg: 50 + (clsDef.add.critDmg || 0)
        }

        player.cls = clsKey;
        stats.hp = Math.round(stats.hp * clsDef.mult.hp);
        stats.atk = Math.round(stats.atk * clsDef.mult.atk);
        stats.def = Math.round(stats.def * clsDef.mult.def);
        stats.atkSpd = Number((stats.atkSpd * clsDef.mult.atkSpd).toFixed(3));
        // Class multiplier must apply to baseStats (calculateStats reads from it)
        player.baseStats.hp = Math.round(player.baseStats.hp * clsDef.mult.hp);
        player.baseStats.atk = Math.round(player.baseStats.atk * clsDef.mult.atk);
        player.baseStats.def = Math.round(player.baseStats.def * clsDef.mult.def);
        player.baseStats.atkSpd = Number((player.baseStats.atkSpd * clsDef.mult.atkSpd).toFixed(3));

        // Set difficulty mode
        player.difficulty = document.querySelector("#select-difficulty").value;

        // Set player skill
        objectValidation();
        if (selectSkill.value == "Remnant Razor") {
            player.skills.push("Remnant Razor");
        }
        if (selectSkill.value == "Titan's Will") {
            player.skills.push("Titan's Will");
        }
        if (selectSkill.value == "Devastator") {
            player.skills.push("Devastator");
            player.baseStats.atkSpd = player.baseStats.atkSpd - ((30 * player.baseStats.atkSpd) / 100);
        }
        if (selectSkill.value == "Rampager") {
            player.skills.push("Rampager");
        }
        if (selectSkill.value == "Blade Dance") {
            player.skills.push("Blade Dance");
        }
        if (selectSkill.value == "Paladin's Heart") {
            player.skills.push("Paladin's Heart");
        }
        if (selectSkill.value == "Aegis Thorns") {
            player.skills.push("Aegis Thorns");
        }
        if (selectSkill.value == "Blood Tithe") {
            player.skills.push("Blood Tithe");
        }
        if (selectSkill.value == "Second Wind") {
            player.skills.push("Second Wind");
        }
        if (selectSkill.value == "Adrenaline") {
            player.skills.push("Adrenaline");
        }
        if (selectSkill.value == "Executioner") {
            player.skills.push("Executioner");
        }
        if (selectSkill.value == "Glass Cannon") {
            player.skills.push("Glass Cannon");
            player.baseStats.atk = Math.round(player.baseStats.atk * 1.35);
            player.baseStats.hp = Math.round(player.baseStats.hp * 0.75);
        }
        if (selectSkill.value == "Iron Will") {
            player.skills.push("Iron Will");
        }
        if (selectSkill.value == "Momentum") {
            player.skills.push("Momentum");
        }
        if (selectSkill.value == "Leech Lord") {
            player.skills.push("Leech Lord");
        }

        // Equip selected legacy storage items (removed from storage, max STORAGE_EQUIP_MAX)
        if (legacySelected.length) {
            const picked = legacySelected.slice().sort((a, b) => b - a);
            for (const i of picked) {
                const item = JSON.parse(player.storage[i]);
                player.storage.splice(i, 1);
                player.equipped.push(item);
            }
            applyEquipmentStats();
            playerLoadStats();
            saveData();
        }

        // Proceed to dungeon
        player.allocated = true;
        enterDungeon();
        player.stats.hp = player.stats.hpMax;
        playerLoadStats();
        defaultModalElement.style.display = "none";
        defaultModalElement.innerHTML = "";
        document.querySelector("#title-screen").style.filter = "brightness(100%)";
    }
    reset.onclick = function () {
        sfxDecline.play();
        allocation = {
            hp: 5,
            atk: 5,
            def: 5,
            atkSpd: 5
        };
        points = 20;
        updateStats();

        // Display Reset
        document.querySelector(`#hpDisplay`).innerHTML = `HP: ${stats.hp}`;
        document.querySelector(`#atkDisplay`).innerHTML = `ATK: ${stats.atk}`;
        document.querySelector(`#defDisplay`).innerHTML = `DEF: ${stats.def}`;
        document.querySelector(`#atkSpdDisplay`).innerHTML = `ATK.SPD: ${stats.atkSpd}`;
        document.querySelector(`#hpAllo`).innerHTML = allocation.hp;
        document.querySelector(`#atkAllo`).innerHTML = allocation.atk;
        document.querySelector(`#defAllo`).innerHTML = allocation.def;
        document.querySelector(`#atkSpdAllo`).innerHTML = allocation.atkSpd;
        document.querySelector(`#alloPts`).innerHTML = tParams("cc.statPoints", { p: points });
    }
    close.onclick = function () {
        sfxDecline.play();
        defaultModalElement.style.display = "none";
        defaultModalElement.innerHTML = "";
        document.querySelector("#title-screen").style.filter = "brightness(100%)";
    }
}

const objectValidation = () => {
    if (player.skills == undefined) {
        player.skills = [];
    }
    if (player.tempStats == undefined) {
        player.tempStats = {};
        player.tempStats.atk = 0;
        player.tempStats.atkSpd = 0;
    }
    saveData();
}
