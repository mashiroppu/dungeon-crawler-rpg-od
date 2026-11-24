// Set bonuses trigger by equipped item type/category combination (6 slots).
// req2 = condition for tier-2 bonus, req4 = condition for tier-4 bonus.
// Keys match item.type ("Weapon"/"Armor"/"Shield"/"Helmet") or item.category ("Sword"/"Dagger"/...)
const EQUIPMENT_SETS = {
    ember:  { name: "Emberforged", req2: { Weapon: 3 },              req4: { Weapon: 4, Armor: 1 },          bonus2: { atkPct: 6 },                    bonus4: { atkPct: 12, vamp: 3 } },
    frost:  { name: "Rimescale",   req2: { Armor: 2, Shield: 1 },     req4: { Armor: 2, Shield: 2, Helmet: 1 }, bonus2: { defPct: 8, hpPct: 8 },       bonus4: { defPct: 16, hpPct: 16, atkSpd: 4 } },
    storm:  { name: "Galestep",    req2: { Weapon: 2, Helmet: 1 },    req4: { Weapon: 3, Helmet: 1 },          bonus2: { atkSpd: 6, critRate: 2 },       bonus4: { atkSpd: 12, critRate: 5, critDmg: 8 } },
    void:   { name: "Nyxweave",    req2: { Armor: 2, Helmet: 1 },     req4: { Armor: 2, Helmet: 2 },           bonus2: { critRate: 4, critDmg: 8 },      bonus4: { critRate: 8, critDmg: 20, atkPct: 8 } },
    blood:  { name: "Sanguine",    req2: { Shield: 1, Weapon: 2 },    req4: { Shield: 2, Weapon: 2 },          bonus2: { thorns: 0.08, hpPct: 6 },       bonus4: { thorns: 0.16, hpPct: 12, vamp: 4 } },
    deadeye:{ name: "Deadeye",     req2: { Weapon: 4 },               req4: { Weapon: 5 },                    bonus2: { penPct: 6, critDmg: 10 },       bonus4: { penPct: 12, critDmg: 20, critRate: 4 } },
    haste:  { name: "Quickstep",   req2: { Dagger: 1, Flail: 2 },     req4: { Dagger: 2, Flail: 2 },           bonus2: { atkSpd: 5, cdr: 4 },            bonus4: { atkSpd: 10, cdr: 13 } },
    greed:  { name: "Gilded",      req2: { Shield: 1, Helmet: 2 },    req4: { Shield: 2, Helmet: 2 },          bonus2: { goldFind: 10, expFind: 8 },     bonus4: { goldFind: 20, expFind: 15, dodge: 3 } },
    dread:  { name: "Nightveil",   req2: { Shield: 3 },               req4: { Shield: 3, Armor: 1 },           bonus2: { dodge: 4, thorns: 0.06 },       bonus4: { dodge: 8, thorns: 0.12, defPct: 8 } },
    // ===== Expansion sets =====
    warlord:{ name: "Warmaster",   req2: { Weapon: 5 },               req4: { Weapon: 6 },                    bonus2: { atkPct: 10 },                   bonus4: { atkPct: 18, critRate: 5 } },
    bastion:{ name: "Bastion",     req2: { Armor: 4 },                req4: { Armor: 5 },                     bonus2: { defPct: 10, hpPct: 6 },         bonus4: { defPct: 18, hpPct: 12 } },
    aegis:  { name: "Aegisguard",  req2: { Armor: 2, Shield: 1 },     req4: { Armor: 2, Shield: 2 },           bonus2: { defPct: 10, thorns: 0.06 },     bonus4: { defPct: 16, thorns: 0.12, hpPct: 8 } },
    tempest:{ name: "Tempest",     req2: { Axe: 1, Scythe: 1, Hammer: 1 }, req4: { Axe: 1, Scythe: 1, Hammer: 2 }, bonus2: { atkPct: 8, critDmg: 10 },       bonus4: { atkPct: 14, critDmg: 18, atkSpd: 4 } },
    phantom:{ name: "Phantom",     req2: { Dagger: 3 },               req4: { Dagger: 4 },                    bonus2: { critRate: 6, atkSpd: 4 },       bonus4: { critRate: 12, atkSpd: 8, cdr: 4 } },
    bulwark:{ name: "Bulwark",     req2: { Tower: 1, Kite: 1, Buckler: 1 }, req4: { Tower: 1, Kite: 1, Buckler: 2 }, bonus2: { defPct: 8, dodge: 3 },         bonus4: { defPct: 14, dodge: 6, thorns: 0.08 } },
    arcanist:{ name: "Arcanist",   req2: { Helmet: 3 },               req4: { Helmet: 3, Armor: 1 },          bonus2: { critDmg: 12, cdr: 4 },          bonus4: { critDmg: 20, cdr: 8, critRate: 4 } },
    warden: { name: "Warden",      req2: { Plate: 1, Chain: 1, Leather: 1 }, req4: { Plate: 1, Chain: 1, Leather: 2 }, bonus2: { hpPct: 8, defPct: 6 },         bonus4: { hpPct: 14, defPct: 10, vamp: 3 } },
    headsman:{ name: "Headsman",   req2: { Sword: 2, Axe: 1 },        req4: { Sword: 2, Axe: 1, Hammer: 1 },  bonus2: { atkPct: 8, penPct: 5 },         bonus4: { atkPct: 14, penPct: 10, critDmg: 10 } },
    mirage: { name: "Mirage",      req2: { Buckler: 1, "Horned Helm": 1, Flail: 1 }, req4: { Buckler: 1, "Horned Helm": 1, Flail: 2 }, bonus2: { dodge: 5, thorns: 0.05 },  bonus4: { dodge: 10, thorns: 0.1, atkSpd: 6 } },
    colossus:{ name: "Colossus",   req2: { Tower: 1, "Great Helm": 1, Plate: 1 }, req4: { Tower: 1, "Great Helm": 1, Plate: 2 }, bonus2: { hpPct: 10, defPct: 8 },    bonus4: { hpPct: 18, defPct: 14, thorns: 0.08 } },
};
// Count equipped items matching a type or category key
const countEquipped = (key) => player.equipped.filter(it => it.type === key || it.category === key).length;
const setReqMet = (req) => Object.keys(req).every(k => countEquipped(k) >= req[k]);
const AFFIXES = [
    { key: "atkPct",    label: "ATK",    min: 4,  max: 10, w: 3 },
    { key: "hpPct",     label: "HP",     min: 5,  max: 12, w: 3 },
    { key: "defPct",    label: "DEF",    min: 5,  max: 12, w: 2 },
    { key: "atkSpd",    label: "ATK.SPD",min: 3,  max: 8,  w: 2 },
    { key: "vamp",      label: "VAMP",   min: 0.5,max: 2,  w: 2 },
    { key: "critRate",  label: "C.RATE", min: 1,  max: 4,  w: 2 },
    { key: "critDmg",   label: "C.DMG",  min: 5,  max: 15, w: 2 },
    { key: "penPct",    label: "PEN",    min: 3,  max: 10, w: 1 },
    { key: "thorns",    label: "THORN",  min: 0.05,max: 0.1, w: 1 },
    { key: "dodge",     label: "DODGE",  min: 2,  max: 6,  w: 1 },
    { key: "goldFind",  label: "G.FIND", min: 5,  max: 15, w: 1 },
    { key: "expFind",   label: "E.FIND", min: 5,  max: 15, w: 1 },
    { key: "cdr",       label: "CDR",    min: 3,  max: 10, w: 1 },
    // (abUse affix removed — legacy AB.USE stats now count as +5% CDR each in abilityEffectiveCd)
    // ===== Special proc affixes =====
    { key: "burst",       label: "BURST",     min: 1,  max: 5,  w: 1 },
    { key: "fullHpDmg",   label: "PRIDE",     min: 10, max: 30, w: 1 },
    { key: "lowHpDmg",    label: "BERSERK",   min: 10, max: 30, w: 1 },
    { key: "attackInvuln",label: "PHASE",     min: 1.5,max: 3,  w: 1 },
    { key: "hpTradeDmg",  label: "TRIAL",     min: 10, max: 25, w: 1, pair: { key: "hpRegen", label: "REGEN", min: 0.5, max: 3 } },
    { key: "bloodOath",   label: "OATH",      min: 0.08, max: 0.2, w: 1 },
    // Normal-attack-only damage (does NOT boost abilities). Equipment total capped at 24%.
    { key: "normAtkPct",  label: "N.ATK",     min: 2,  max: 4,  w: 1 },
    // Hidden: +2% normal attack, never displayed anywhere
    { key: "secretAtk",   label: "",          min: 2,  max: 2,  w: 1, hidden: true },
];
// Stats that must never appear in item stat lines
const HIDDEN_STAT_KEYS = new Set(["secretAtk"]);
// Proc-style affixes: mutually exclusive per item, and unique across all equipped gear
const SPECIAL_AFFIX_KEYS = new Set(["burst", "fullHpDmg", "lowHpDmg", "attackInvuln", "hpTradeDmg", "hpRegen", "bloodOath"]);
const AFFIX_COUNT = { Rare: 1, Epic: 2, Legendary: 3, Heirloom: 4 };
const STAT_LINE_LABEL = { hp: "HP", atk: "ATK", def: "DEF", atkSpd: "ATK.SPD", vamp: "VAMP", critRate: "C.RATE", critDmg: "C.DMG", hpPct: "HP", atkPct: "ATK", defPct: "DEF", penPct: "PEN", thorns: "THORN", dodge: "DODGE", goldFind: "G.FIND", expFind: "E.FIND", cdr: "CDR", abUse: "AB.USE", burst: "BURST", fullHpDmg: "PRIDE", lowHpDmg: "BERSERK", attackInvuln: "PHASE", hpTradeDmg: "TRIAL", hpRegen: "REGEN", bloodOath: "OATH", normAtkPct: "N.ATK" };
const PCT_STATS = new Set(["atkSpd", "vamp", "critRate", "critDmg", "hpPct", "atkPct", "defPct", "penPct", "thorns", "dodge", "goldFind", "expFind", "cdr", "fullHpDmg", "lowHpDmg", "hpTradeDmg", "hpRegen", "bloodOath", "normAtkPct", "secretAtk"]);
const formatStatLine = (stat) => {
    const keys = Object.keys(stat).filter(k => !HIDDEN_STAT_KEYS.has(k));
    if (!keys.length) return "";
    const parts = keys.map(key => {
        const label = STAT_LINE_LABEL[key] || key.replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase();
        const val = stat[key];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const txt = PCT_STATS.has(key) ? val.toFixed(2).replace(rx, "$1") + "%" : String(val);
        return `${label}+${txt}`;
    });
    return `<li>${parts.join(" ")}</li>`;
};

const rollAffixes = (equipment) => {
    const affixCount = AFFIX_COUNT[equipment.rarity] || 0;
    equipment.affixes = [];
    const usedAffix = new Set();
    for (let i = 0; i < affixCount; i++) {
        const hasSpecial = equipment.affixes.some(af => SPECIAL_AFFIX_KEYS.has(af.key));
        const pool = AFFIXES.filter(a => !usedAffix.has(a.key) && !(hasSpecial && SPECIAL_AFFIX_KEYS.has(a.key)));
        if (!pool.length) break;
        const totalW = pool.reduce((sum, a) => sum + a.w, 0);
        let r = Math.random() * totalW;
        let pick = pool[pool.length - 1];
        for (const a of pool) { r -= a.w; if (r <= 0) { pick = a; break; } }
        usedAffix.add(pick.key);
        const mult = equipment.rarity === "Heirloom" ? 1.5 : 1;
        const val = Math.round(randomizeDecimal(pick.min, pick.max) * mult * 10) / 10;
        let pairKey = null, pairVal = null;
        if (pick.pair) {
            pairKey = pick.pair.key;
            pairVal = Math.round(randomizeDecimal(pick.pair.min, pick.pair.max) * mult * 10) / 10;
        }
        equipment.affixes.push({ key: pick.key, value: val, pairKey, pairValue: pairVal });
        equipment.stats.push(pairKey ? { [pick.key]: val, [pairKey]: pairVal } : { [pick.key]: val });
    }
};

const genItemUid = () => "eq_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

const createEquipment = () => {
    const equipment = {
        category: null,
        attribute: null,
        type: null,
        rarity: null,
        lvl: null,
        tier: null,
        value: null,
        stats: [],
        uid: genItemUid(),
    };

    // Generate random equipment attribute
    const equipmentAttributes = ["Damage", "Defense"];
    equipment.attribute = equipmentAttributes[Math.floor(Math.random() * equipmentAttributes.length)];

    // Generate random equipment name and type based on attribute
    if (equipment.attribute == "Damage") {
        const equipmentCategories = ["Sword", "Axe", "Hammer", "Dagger", "Flail", "Scythe"];
        equipment.category = equipmentCategories[Math.floor(Math.random() * equipmentCategories.length)];
        equipment.type = "Weapon";
    } else if (equipment.attribute == "Defense") {
        const equipmentTypes = ["Armor", "Shield", "Helmet"];
        equipment.type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
        if (equipment.type == "Armor") {
            const equipmentCategories = ["Plate", "Chain", "Leather"];
            equipment.category = equipmentCategories[Math.floor(Math.random() * equipmentCategories.length)];
        } else if (equipment.type == "Shield") {
            const equipmentCategories = ["Tower", "Kite", "Buckler"];
            equipment.category = equipmentCategories[Math.floor(Math.random() * equipmentCategories.length)];
        } else if (equipment.type == "Helmet") {
            const equipmentCategories = ["Great Helm", "Horned Helm"];
            equipment.category = equipmentCategories[Math.floor(Math.random() * equipmentCategories.length)];
        }
    }

    // Generate random equipment rarity
    const rarityChances = {
        "Common": 0.7,
        "Uncommon": 0.2,
        "Rare": 0.04,
        "Epic": 0.03,
        "Legendary": 0.02,
        "Heirloom": 0.01
    };

    const randomNumber = Math.random();
    let cumulativeChance = 0;

    for (let rarity in rarityChances) {
        cumulativeChance += rarityChances[rarity];
        if (randomNumber <= cumulativeChance) {
            equipment.rarity = rarity;
            break;
        }
    }

    // Determine number of times to loop based on equipment rarity
    let loopCount;
    switch (equipment.rarity) {
        case "Common":
            loopCount = 2;
            break;
        case "Uncommon":
            loopCount = 3;
            break;
        case "Rare":
            loopCount = 4;
            break;
        case "Epic":
            loopCount = 5;
            break;
        case "Legendary":
            loopCount = 6;
            break;
        case "Heirloom":
            loopCount = 8;
            break;
    }

    // Generate and append random stats to the stats array
    const physicalStats = ["atk", "atkSpd", "vamp", "critRate", "critDmg"];
    const damageyStats = ["atk", "atk", "vamp", "critRate", "critDmg", "critDmg"];
    const speedyStats = ["atkSpd", "atkSpd", "atk", "vamp", "critRate", "critRate", "critDmg"];
    const defenseStats = ["hp", "hp", "def", "def", "atk"];
    const dmgDefStats = ["hp", "def", "atk", "atk", "critRate", "critDmg"];
    let statTypes;
    if (equipment.attribute == "Damage") {
        if (equipment.category == "Axe" || equipment.category == "Scythe") {
            statTypes = damageyStats;
        } else if (equipment.category == "Dagger" || equipment.category == "Flail") {
            statTypes = speedyStats;
        } else if (equipment.category == "Hammer") {
            statTypes = dmgDefStats;
        } else {
            statTypes = physicalStats;
        }
    } else if (equipment.attribute == "Defense") {
        statTypes = defenseStats;
    }
    let equipmentValue = 0;
    for (let i = 0; i < loopCount; i++) {
        let statType = statTypes[Math.floor(Math.random() * statTypes.length)];

        // Stat scaling for equipment
        const maxLvl = dungeon.progress.floor * dungeon.settings.enemyLvlGap + (dungeon.settings.enemyBaseLvl - 1);
        const minLvl = maxLvl - (dungeon.settings.enemyLvlGap - 1);
        // Set equipment level with Lv.100 cap
        equipment.lvl = randomizeNum(minLvl, maxLvl);
        if (equipment.lvl > 100) {
            equipment.lvl = 100;
        }
        // Set stat scaling and equipment tier Tier 10 cap
        let enemyScaling = dungeon.settings.enemyScaling;
        if (enemyScaling > 2) {
            enemyScaling = 2;
        }
        let statMultiplier = (enemyScaling - 1) * equipment.lvl;
        equipment.tier = Math.round((enemyScaling - 1) * 10);
        let hpScaling = (40 * randomizeDecimal(0.5, 1.5)) + ((40 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        let atkDefScaling = (16 * randomizeDecimal(0.5, 1.5)) + ((16 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        let cdAtkSpdScaling = (3 * randomizeDecimal(0.5, 1.5)) + ((3 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        let crVampScaling = (2 * randomizeDecimal(0.5, 1.5)) + ((2 * randomizeDecimal(0.5, 1.5)) * statMultiplier);

        // Set randomized numbers to respective stats and increment sell value
        if (statType === "hp") {
            statValue = randomizeNum(hpScaling * 0.5, hpScaling);
            equipmentValue += statValue;
        } else if (statType === "atk") {
            statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
            equipmentValue += statValue * 2.5;
        } else if (statType === "def") {
            statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
            equipmentValue += statValue * 2.5;
        } else if (statType === "atkSpd") {
            statValue = randomizeDecimal(cdAtkSpdScaling * 0.5, cdAtkSpdScaling);
            if (statValue > 15) {
                statValue = 15 * randomizeDecimal(0.5, 1);
                loopCount++;
            }
            equipmentValue += statValue * 8.33;
        } else if (statType === "vamp") {
            statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
            if (statValue > 8) {
                statValue = 8 * randomizeDecimal(0.5, 1);
                loopCount++;
            }
            equipmentValue += statValue * 20.83;
        } else if (statType === "critRate") {
            statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
            if (statValue > 10) {
                statValue = 10 * randomizeDecimal(0.5, 1);
                loopCount++;
            }
            equipmentValue += statValue * 20.83;
        } else if (statType === "critDmg") {
            statValue = randomizeDecimal(cdAtkSpdScaling * 0.5, cdAtkSpdScaling);
            equipmentValue += statValue * 8.33;
        }

        // Cap maximum stat rolls for equipment rarities
        if (equipment.rarity == "Common" && loopCount > 3) {
            loopCount--;
        } else if (equipment.rarity == "Uncommon" && loopCount > 4) {
            loopCount--;
        } else if (equipment.rarity == "Rare" && loopCount > 5) {
            loopCount--;
        } else if (equipment.rarity == "Epic" && loopCount > 6) {
            loopCount--;
        } else if (equipment.rarity == "Legendary" && loopCount > 7) {
            loopCount--;
        } else if (equipment.rarity == "Heirloom" && loopCount > 9) {
            loopCount--;
        }

        // Check if stat type already exists in stats array
        let statExists = false;
        for (let j = 0; j < equipment.stats.length; j++) {
            if (Object.keys(equipment.stats[j])[0] == statType) {
                statExists = true;
                break;
            }
        }

        // If stat type already exists, add values together
        if (statExists) {
            for (let j = 0; j < equipment.stats.length; j++) {
                if (Object.keys(equipment.stats[j])[0] == statType) {
                    equipment.stats[j][statType] += statValue;
                    break;
                }
            }
        }

        // If stat type does not exist, add new stat to stats array
        else {
            equipment.stats.push({ [statType]: statValue });
        }
    }
    // Affixes (Rare and above)
    rollAffixes(equipment);
    equipmentValue += equipment.affixes.reduce((sum, a) => sum + a.value, 0) * 25;
    equipment.value = Math.round(equipmentValue * 3);
    player.inventory.equipment.push(JSON.stringify(equipment));

    saveData();
    showInventory();
    showEquipment();

    const itemShow = {
        category: equipment.category,
        rarity: equipment.rarity,
        lvl: equipment.lvl,
        tier: equipment.tier,
        icon: equipmentIcon(equipment.category),
        stats: equipment.stats
    }
    return itemShow;
}

const equipmentIcon = (equipment) => {
    if (equipment == "Sword") {
        return '<i class="ra ra-relic-blade"></i>';
    } else if (equipment == "Axe") {
        return '<i class="ra ra-axe"></i>';
    } else if (equipment == "Hammer") {
        return '<i class="ra ra-flat-hammer"></i>';
    } else if (equipment == "Dagger") {
        return '<i class="ra ra-bowie-knife"></i>';
    } else if (equipment == "Flail") {
        return '<i class="ra ra-chain"></i>';
    } else if (equipment == "Scythe") {
        return '<i class="ra ra-scythe"></i>';
    } else if (equipment == "Plate") {
        return '<i class="ra ra-vest"></i>';
    } else if (equipment == "Chain") {
        return '<i class="ra ra-vest"></i>';
    } else if (equipment == "Leather") {
        return '<i class="ra ra-vest"></i>';
    } else if (equipment == "Tower") {
        return '<i class="ra ra-shield"></i>';
    } else if (equipment == "Kite") {
        return '<i class="ra ra-heavy-shield"></i>';
    } else if (equipment == "Buckler") {
        return '<i class="ra ra-round-shield"></i>';
    } else if (equipment == "Great Helm") {
        return '<i class="ra ra-knight-helmet"></i>';
    } else if (equipment == "Horned Helm") {
        return '<i class="ra ra-helmet"></i>';
    }
}

// Show full detail of the item
const showItemInfo = (item, icon, type, i) => {
    sfxOpen.play();

    dungeon.status.exploring = false;
    let itemInfo = document.querySelector("#equipmentInfo");
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let dimContainer = document.querySelector(`#inventory`);
    if (item.tier == undefined) {
        item.tier = 1;
    }
    itemInfo.style.display = "flex";
    dimContainer.style.filter = "brightness(50%)";
    itemInfo.innerHTML = `
            <div class="content">
                <h3 class="${item.rarity}">${icon}${itemName(item)}${item.finalized ? ' <span class="finalized-badge">★ MAX</span>' : ''}</h3>
                <h5 class="lvltier ${item.rarity}"><b>Lv.${item.lvl} ${tierLabel()} ${item.tier}</b></h5>
                <ul>${item.stats.map(formatStatLine).join('')}</ul>
                <div class="button-container">
                    <button id="un-equip">${type === "Equip" ? t("eq.equip") : t("eq.unequip")}</button>
                    ${item.affixes && item.affixes.length && !item.finalized ? `<button id="reroll-equip"><i class="ra ra-recycle"></i>${t("eq.reroll")}</button>` : ''}
                    ${item.affixes && item.affixes.length && !item.finalized ? `<button id="finalize-equip"><i class="ra ra-check"></i>${t("eq.finalize")}</button>` : ''}
                    <button id="sell-equip"><i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(item.value)}</button>
                    <button id="close-item-info">${t("eq.close")}</button>
                </div>
            </div>`;

    // Equip/Unequip button for the item
    let unEquip = document.querySelector("#un-equip");
    unEquip.onclick = function () {
        if (type == "Equip") {
            // Remove the item from the inventory and add it to the equipment
            if (player.equipped.length >= 6) {
                sfxDeny.play();
            } else {
                sfxEquip.play();

                // Equip the item
                player.inventory.equipment.splice(i, 1);
                player.equipped.push(item);

                itemInfo.style.display = "none";
                dimContainer.style.filter = "brightness(100%)";
                playerLoadStats();
                saveData();
                continueExploring();
            }
        } else if (type == "Unequip") {
            sfxUnequip.play();

            // Remove the item from the equipment and add it to the inventory
            player.equipped.splice(i, 1);
            player.inventory.equipment.push(JSON.stringify(item));

            itemInfo.style.display = "none";
            dimContainer.style.filter = "brightness(100%)";
            playerLoadStats();
            saveData();
            continueExploring();
        }
    };

    // Sell equipment
    let sell = document.querySelector("#sell-equip");
    sell.onclick = function () {
        sfxOpen.play();
        itemInfo.style.display = "none";
        defaultModalElement.style.display = "flex";
        defaultModalElement.innerHTML = `
        <div class="content">
            <p>${tParams("eq.sellQ", { r: item.rarity, item: `${icon}${itemName(item)}` })}</p>
            <div class="button-container">
                <button id="sell-confirm">${t("eq.sell")}</button>
                <button id="sell-cancel">${t("common.cancel")}</button>
            </div>
        </div>`;

        let confirm = document.querySelector("#sell-confirm");
        let cancel = document.querySelector("#sell-cancel");
        confirm.onclick = function () {
            sfxSell.play();

            // Sell the equipment
            if (type == "Equip") {
                player.gold += item.value;
                player.inventory.equipment.splice(i, 1);
            } else if (type == "Unequip") {
                player.gold += item.value;
                player.equipped.splice(i, 1);
            }

            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            dimContainer.style.filter = "brightness(100%)";
            playerLoadStats();
            saveData();
            continueExploring();
        }
        cancel.onclick = function () {
            sfxDecline.play();
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            itemInfo.style.display = "flex";
            continueExploring();
        }
    };

    // Reroll affixes (Rare and above)
    let rerollBtn = document.querySelector("#reroll-equip");
    if (rerollBtn) {
        rerollBtn.onclick = function () {
            const cost = Math.max(100, Math.round((item.value || 100) * 0.3));
            if (player.gold < cost) {
                sfxDeny.play();
                return;
            }
            sfxSell.play();
            player.gold -= cost;
            const oldCount = (item.affixes || []).length;
            if (oldCount > 0) item.stats.splice(item.stats.length - oldCount, oldCount);
            rollAffixes(item);
            item.value = Math.round((item.value || 0) * 1.1);
            if (type == "Equip") {
                player.inventory.equipment[i] = JSON.stringify(item);
            }
            playerLoadStats();
            saveData();
            showItemInfo(item, icon, type, i);
        };
    }

    // Finalize: locks affixes (no more rerolls) but upgrades all option values +40%
    let finalizeBtn = document.querySelector("#finalize-equip");
    if (finalizeBtn) {
        finalizeBtn.onclick = function () {
            const cost = Math.max(500, Math.round((item.value || 200) * 0.8));
            if (player.gold < cost) {
                sfxDeny.play();
                return;
            }
            sfxOpen.play();
            itemInfo.style.display = "none";
            defaultModalElement.style.display = "flex";
            defaultModalElement.innerHTML = `
            <div class="content">
                <p>${tParams("eq.finQ", { r: item.rarity, item: `${icon}${itemName(item)}` })}</p>
                <p style="font-size:0.85rem;color:#999">${tParams("eq.finNote", { c: nFormatter(cost) })}</p>
                <div class="button-container">
                    <button id="fin-confirm">${t("eq.finalize")}</button>
                    <button id="fin-cancel">${t("common.cancel")}</button>
                </div>
            </div>`;

            document.querySelector("#fin-confirm").onclick = function () {
                sfxSell.play();
                player.gold -= cost;
                const mult = 1.4;
                item.affixes.forEach(af => {
                    af.value = Math.round(af.value * mult * 10) / 10;
                    if (af.pairValue != null) af.pairValue = Math.round(af.pairValue * mult * 10) / 10;
                });
                // Rewrite the affix stat lines (they are the last N entries in item.stats)
                const affixCount = item.affixes.length;
                const tail = item.stats.splice(item.stats.length - affixCount, affixCount);
                item.affixes.forEach((af, j) => {
                    tail[j] = af.pairKey ? { [af.key]: af.value, [af.pairKey]: af.pairValue } : { [af.key]: af.value };
                });
                item.stats.push(...tail);
                item.finalized = true;
                item.value = Math.round((item.value || 0) * 1.3);
                if (type == "Equip") {
                    player.inventory.equipment[i] = JSON.stringify(item);
                }

                defaultModalElement.style.display = "none";
                defaultModalElement.innerHTML = "";
                dimContainer.style.filter = "brightness(100%)";
                playerLoadStats();
                saveData();
                continueExploring();
            };
            document.querySelector("#fin-cancel").onclick = function () {
                sfxDecline.play();
                defaultModalElement.style.display = "none";
                defaultModalElement.innerHTML = "";
                itemInfo.style.display = "flex";
                continueExploring();
            };
        };
    }

    // Close item info
    let close = document.querySelector("#close-item-info");
    close.onclick = function () {
        sfxDecline.play();

        itemInfo.style.display = "none";
        dimContainer.style.filter = "brightness(100%)";
        continueExploring();
    };
}

// Show inventory
const showInventory = () => {
    // Clear the inventory container
    let playerInventoryList = document.getElementById("playerInventory");
    playerInventoryList.innerHTML = "";

    if (player.inventory.equipment.length == 0) {
        playerInventoryList.innerHTML = t("eq.empty");
    }

    for (let i = 0; i < player.inventory.equipment.length; i++) {
        const item = JSON.parse(player.inventory.equipment[i]);

        // Create an element to display the item's name
        let itemDiv = document.createElement('div');
        let icon = equipmentIcon(item.category);
        itemDiv.className = "items";
        itemDiv.innerHTML = `<p class="${item.rarity}">${icon}${itemName(item)}</p>`;
        itemDiv.addEventListener('click', function () {
            let type = "Equip";
            showItemInfo(item, icon, type, i);
        });

        // Add the itemDiv to the inventory container
        playerInventoryList.appendChild(itemDiv);
    }
}

// Show equipment
const showEquipment = () => {
    // Clear the inventory container
    let playerEquipmentList = document.getElementById("playerEquipment");
    playerEquipmentList.innerHTML = "";

    // Show a message if a player has no equipment
    if (player.equipped.length == 0) {
        playerEquipmentList.innerHTML = t("eq.nothing");
    }

    for (let i = 0; i < player.equipped.length; i++) {
        const item = player.equipped[i];

        // Create an element to display the item's name
        let equipDiv = document.createElement('div');
        let icon = equipmentIcon(item.category);
        equipDiv.className = "items";
        equipDiv.innerHTML = `<button class="${item.rarity}">${icon}</button>`;
        equipDiv.addEventListener('click', function () {
            let type = "Unequip";
            showItemInfo(item, icon, type, i);
        });

        // Add the equipDiv to the inventory container
        playerEquipmentList.appendChild(equipDiv);
    }
}

// Apply the equipment stats to the player
const applyEquipmentStats = () => {
    // Reset the equipment stats
    player.equippedStats = {
        hp: 0,
        atk: 0,
        def: 0,
        atkSpd: 0,
        vamp: 0,
        critRate: 0,
        critDmg: 0,
        hpPct: 0,
        atkPct: 0,
        defPct: 0,
        penPct: 0,
        thorns: 0,
        dodge: 0,
        goldFind: 0,
        expFind: 0,
        cdr: 0,
        abUse: 0,
        burst: 0,
        fullHpDmg: 0,
        lowHpDmg: 0,
        attackInvuln: 0,
        hpTradeDmg: 0,
        hpRegen: 0,
        bloodOath: 0,
        normAtkPct: 0,
        secretAtk: 0
    };

    // Deduplicate proc affixes across equipped items (first equipped wins)
    const seenSpecial = new Set();
    for (let i = 0; i < player.equipped.length; i++) {
        const item = player.equipped[i];
        const affixStatCount = (item.affixes || []).length;
        const baseStatCount = item.stats.length - affixStatCount;

        // Iterate through the stats array and update the player stats
        item.stats.forEach((stat, idx) => {
            const keys = Object.keys(stat);
            const isAffixStat = idx >= baseStatCount;
            if (isAffixStat) {
                if (keys.some(k => SPECIAL_AFFIX_KEYS.has(k) && seenSpecial.has(k))) return;
                keys.forEach(k => { if (SPECIAL_AFFIX_KEYS.has(k)) seenSpecial.add(k); });
            }
            for (const key in stat) {
                player.equippedStats[key] += stat[key];
            }
        });
    }

    // Set bonuses: triggered by equipped item type/category combinations
    player.activeSets = {};
    for (const setKey in EQUIPMENT_SETS) {
        const def = EQUIPMENT_SETS[setKey];
        const n = setReqMet(def.req4 || {}) ? 4 : setReqMet(def.req2 || {}) ? 2 : 0;
        if (n > 0) {
            player.activeSets[setKey] = n;
            const bonus = n >= 4 ? def.bonus4 : def.bonus2;
            for (const k in bonus) player.equippedStats[k] = (player.equippedStats[k] || 0) + bonus[k];
        }
    }
    calculateStats();
}

const unequipAll = () => {
    for (let i = player.equipped.length - 1; i >= 0; i--) {
        const item = player.equipped[i];
        player.equipped.splice(i, 1);
        player.inventory.equipment.push(JSON.stringify(item));
    }
    playerLoadStats();
    saveData();
}

const sellAll = (rarity) => {
    if (rarity == "All") {
        if (player.inventory.equipment.length !== 0) {
            sfxSell.play();
            for (let i = 0; i < player.inventory.equipment.length; i++) {
                const equipment = JSON.parse(player.inventory.equipment[i]);
                player.gold += equipment.value;
                player.inventory.equipment.splice(i, 1);
                i--;
            }
            playerLoadStats();
            saveData();
        } else {
            sfxDeny.play();
        }
    } else {
        let rarityCheck = false;
        for (let i = 0; i < player.inventory.equipment.length; i++) {
            const equipment = JSON.parse(player.inventory.equipment[i]);
            if (equipment.rarity === rarity) {
                rarityCheck = true;
                break;
            }
        }
        if (rarityCheck) {
            sfxSell.play();
            for (let i = 0; i < player.inventory.equipment.length; i++) {
                const equipment = JSON.parse(player.inventory.equipment[i]);
                if (equipment.rarity === rarity) {
                    player.gold += equipment.value;
                    player.inventory.equipment.splice(i, 1);
                    i--;
                }
            }
            playerLoadStats();
            saveData();
        } else {
            sfxDeny.play();
        }
    }
}

const createEquipmentPrint = (condition) => {
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let item = createEquipment();
    let panel = `
        <div class="primary-panel" style="padding: 0.5rem; margin-top: 0.5rem;">
                <h4 class="${item.rarity}"><b>${item.icon}${itemName(item)}</b></h4>
                <h5 class="${item.rarity}"><b>Lv.${item.lvl} ${tierLabel()} ${item.tier}</b></h5>
                <ul>${item.stats.map(formatStatLine).join('')}</ul>
        </div>`;
    if (condition == "combat") {
        addCombatLog(tParams("cb.itemDropped", { name: enemy.name, r: item.rarity, item: itemName(item), panel }));
    } else if (condition == "dungeon") {
        addDungeonLog(tParams("eq.gotItem", { r: item.rarity, item: `${item.icon}${itemName(item)}`, panel }));
    }
}
// ===== Legacy Storage (persists across runs, max 12) =====
const STORAGE_BASE = 20;
const STORAGE_MAX_TIER = 3; // 20 -> 40 -> 80 -> 160
const STORAGE_EXPAND_COST = 200000;
const STORAGE_EQUIP_MAX = 3;
const storageTier = () => player.storageTier || 0;
const storageMax = () => STORAGE_BASE * Math.pow(2, Math.min(storageTier(), STORAGE_MAX_TIER));
const storageFull = () => (player.storage || []).length >= storageMax();
const expandStorage = () => {
    if (storageTier() >= STORAGE_MAX_TIER || player.gold < STORAGE_EXPAND_COST) { sfxDeny.play(); return false; }
    player.gold -= STORAGE_EXPAND_COST;
    player.storageTier = storageTier() + 1;
    sfxConfirm.play();
    addDungeonLog(tParams("wh.expanded", { max: storageMax() }));
    saveData();
    playerLoadStats();
    return true;
};

// Items that can be stashed on death: inventory (JSON strings) + equipped (objects)
const carryCandidates = () => {
    const inv = (player.inventory.equipment || []).map((s, idx) => ({ src: "inv", idx, item: JSON.parse(s) }));
    const eq = (player.equipped || []).map((item, idx) => ({ src: "eq", idx, item }));
    return [...inv, ...eq];
};

const stashItem = (cand) => {
    if (cand.src === "inv") player.inventory.equipment.splice(cand.idx, 1);
    else player.equipped.splice(cand.idx, 1);
    player.storage = player.storage || [];
    player.storage.push(JSON.stringify(cand.item));
};

// Equip-preset support: presets store item uids (reference type, no duplication).
// Pulls the referenced items out of equipped/inventory/storage and equips them in order.
const applyEquipPreset = (uids) => {
    const found = [];
    for (const uid of uids) {
        if (!uid) continue;
        let idx = player.equipped.findIndex(it => it.uid === uid);
        if (idx >= 0) {
            found.push(player.equipped.splice(idx, 1)[0]);
            continue;
        }
        for (const pool of [player.inventory.equipment, player.storage || []]) {
            idx = pool.findIndex(s => { try { return JSON.parse(s).uid === uid; } catch (e) { return false; } });
            if (idx >= 0) {
                found.push(JSON.parse(pool.splice(idx, 1)[0]));
                break;
            }
        }
    }
    // Return currently equipped items that are not part of the preset to inventory
    for (const it of player.equipped) {
        player.inventory.equipment.push(JSON.stringify(it));
    }
    player.equipped = found.slice(0, 6);
    playerLoadStats();
    saveData();
    return found.length;
};

// Shown on death: pick ONE item to send to legacy storage, rest is lost
const showLegacyModal = (onDone) => {
    player.storage = player.storage || [];
    const candidates = carryCandidates();
    if (!candidates.length || storageFull()) { onDone(); return; }

    let selected = null;
    defaultModalElement.style.display = "flex";
    defaultModalElement.innerHTML = `
    <div class="content" id="legacy-modal">
        <div class="content-head"><h3>${t("legacy.title")}</h3></div>
        <p class="legacy-hint">${tParams("legacy.hint", { n: player.storage.length, max: storageMax() })}</p>
        <div class="legacy-list">
            ${candidates.map((c, i) => {
                const icon = equipmentIcon(c.item.category);
                return `<div class="items legacy-item" data-i="${i}"><p class="${c.item.rarity}">${icon}${itemName(c.item)}</p></div>`;
            }).join("")}
        </div>
        <div class="button-container">
            <button id="legacy-send">${t("legacy.send")}</button>
            <button id="legacy-skip">${t("legacy.lose")}</button>
        </div>
    </div>`;

    const finish = () => {
        defaultModalElement.style.display = "none";
        defaultModalElement.innerHTML = "";
        playerLoadStats();
        saveData();
        onDone();
    };

    defaultModalElement.querySelectorAll(".legacy-item").forEach(el => {
        el.onclick = () => {
            sfxConfirm.play();
            defaultModalElement.querySelectorAll(".legacy-item").forEach(x => x.classList.remove("selected"));
            el.classList.add("selected");
            selected = candidates[Number(el.dataset.i)];
        };
    });
    defaultModalElement.querySelector("#legacy-send").onclick = () => {
        if (!selected) { sfxDeny.play(); return; }
        sfxEquip.play();
        stashItem(selected);
        finish();
    };
    defaultModalElement.querySelector("#legacy-skip").onclick = () => {
        sfxDecline.play();
        finish();
    };
};

// Mid-run stash point (every 5 floors): pick ONE item to send to the warehouse
const showStashModal = (onDone) => {
    player.storage = player.storage || [];
    const candidates = carryCandidates();
    if (!candidates.length || storageFull()) { onDone(); return; }

    let selected = null;
    defaultModalElement.style.display = "flex";
    defaultModalElement.innerHTML = `
    <div class="content" id="legacy-modal">
        <div class="content-head"><h3>${t("legacy.title")}</h3></div>
        <p class="legacy-hint">${tParams("legacy.hint", { n: player.storage.length, max: storageMax() })}</p>
        <div class="legacy-list">
            ${candidates.map((c, i) => {
                const icon = equipmentIcon(c.item.category);
                return `<div class="items legacy-item" data-i="${i}"><p class="${c.item.rarity}">${icon}${itemName(c.item)}</p></div>`;
            }).join("")}
        </div>
        <div class="button-container">
            <button id="stash-send">${t("dgn.c.stashSend")}</button>
            <button id="stash-cancel">${t("stash.cancel")}</button>
        </div>
    </div>`;

    const finish = () => {
        defaultModalElement.style.display = "none";
        defaultModalElement.innerHTML = "";
        playerLoadStats();
        saveData();
        onDone();
    };

    defaultModalElement.querySelectorAll(".legacy-item").forEach(el => {
        el.onclick = () => {
            sfxConfirm.play();
            defaultModalElement.querySelectorAll(".legacy-item").forEach(x => x.classList.remove("selected"));
            el.classList.add("selected");
            selected = candidates[Number(el.dataset.i)];
        };
    });
    defaultModalElement.querySelector("#stash-send").onclick = () => {
        if (!selected) { sfxDeny.play(); return; }
        sfxEquip.play();
        stashItem(selected);
        addDungeonLog(tParams("stash.stored", { r: selected.item.rarity, item: itemName(selected.item) }));
        finish();
    };
    defaultModalElement.querySelector("#stash-cancel").onclick = () => {
        sfxDecline.play();
        finish();
    };
};
