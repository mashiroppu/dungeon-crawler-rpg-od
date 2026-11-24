// ===== Tips & Knowledge modal =====
const TIPS = [
    // ---- Basics ----
    { cat: "Basics", title: "Stats", text: "ATK = attack power, DEF = damage reduction, ATK.SPD = attacks per second (cap 3.0). VAMP heals you for % of the enemy's max HP on kill. C.RATE / C.DMG = critical rate / critical damage." },
    { cat: "Basics", title: "Level Up", text: "Each level offers 3 random stat boosts — pick one per level. N.ATK is a rare option (~8% chance) that ONLY boosts normal attacks, not abilities. THORN improves slowly (+0.1% per pick, cap 10%)." },
    { cat: "Basics", title: "THORN", text: "THORN reflects damage when you are hit: reflect = damage taken × THORN% × (ATK/10). It scales with your ATTACK, not defense — pair it with a hard-hitting build." },
    { cat: "Basics", title: "N.ATK", text: "N.ATK (Normal Attack) boosts ONLY your auto-attack damage — abilities are unaffected. Level-up investment caps at 300%; equipment N.ATK is a minor bonus." },
    // ---- Equipment ----
    { cat: "Equipment", title: "Rarity", text: "Common → Uncommon → Rare → Epic → Legendary → Heirloom. Higher rarity = more affixes and stronger values. Heirloom rolls get a 1.5x value multiplier." },
    { cat: "Equipment", title: "Affixes", text: "Equipment options (ATK%, HP%, CDR, proc effects...) are rolled per item. Use Reroll to re-roll them, or Finalize to lock them in exchange for +40% on all options." },
    { cat: "Equipment", title: "Proc Affixes", text: "Special options: BURST (attacks stack bonus fragment hits), PRIDE (bonus dmg at full HP), BERSERK (bonus dmg at low HP), PHASE (brief invuln on attack), TRIAL+REGEN (HP trade), OATH (bonus THORN under 50% HP). Proc affixes are unique per equipped set." },
    { cat: "Equipment", title: "Set Effects", text: "Matching equipment combinations grant hidden set bonuses. Conditions are strict — most sets need 3-5 coordinated pieces. The bonuses are NOT displayed; discover them by feeling the difference." },
    { cat: "Equipment", title: "Hidden Stats", text: "Some bonuses exist but are never shown — on items or in your stats. If a build feels stronger than the numbers suggest, it probably has a secret bonus." },
    // ---- Combat ----
    { cat: "Combat", title: "Abilities", text: "Abilities have limited charges per battle plus individual cooldowns. Check the ability bar — greyed-out abilities are recharging. Some abilities heal, shield, buff, or reflect damage." },
    { cat: "Combat", title: "Reflect & Shields", text: "Judgment Counter reflects 200% but you take +30% damage. Aegis Oath grants a shield plus 50% reflect. Sanctuary heals and reflects. Reflect damage is separate from THORN." },
    { cat: "Combat", title: "Fleeing", text: "You can flee most battles, but it can fail — especially against bosses. Bosses hit hard but drop better loot." },
    // ---- Progression ----
    { cat: "Progression", title: "Dungeon", text: "Each floor has several rooms ending in a Guardian boss. Floor 100 is the final stretch — once reached, you can keep exploring it endlessly for loot and levels." },
    { cat: "Progression", title: "Dungeon Monarch", text: "Rare 'mysterious chamber' events awaken the Dungeon Monarch — an extremely powerful boss with massive stats. Only attempt it when over-leveled and well-geared." },
    { cat: "Progression", title: "Death & Legacy", text: "Dying ends the run, but you can carry ONE item into the next run via Legacy. Plan which item is worth saving before pushing deep floors." },
    { cat: "Progression", title: "Gold", text: "Gold drops scale with floor depth. G.FIND equipment boosts gold gain — useful if you're saving for Finalize costs or rerolls." },
];

const showTips = () => {
    if (typeof sfxOpen !== "undefined") sfxOpen.play();
    const modal = document.querySelector("#tipModal");
    const dim = document.querySelector("#dungeon-main");
    if (!modal) return;
    dungeon.status.exploring = false;
    modal.style.display = "flex";
    if (dim) dim.style.filter = "brightness(50%)";

    const cats = [...new Set(TIPS.map(t => t.cat))];
    // Currently active set effects (hidden stats — revealed here only)
    const setHtml = (player.activeSets ? Object.keys(player.activeSets).filter(k => player.activeSets[k] >= 2) : []).map(k => {
        const n = player.activeSets[k];
        const d = EQUIPMENT_SETS[k];
        const bonus = n >= 4 ? d.bonus4 : d.bonus2;
        const txt = Object.keys(bonus).map(bk => `${STAT_LINE_LABEL[bk] || bk}+${bonus[bk]}${PCT_STATS.has(bk) ? "%" : ""}`).join(" ");
        const req = n >= 4 ? d.req4 : d.req2;
        const reqTxt = req ? Object.keys(req).map(rk => `${rk}×${req[rk]}`).join("+") : "";
        return `<div class="tip-item"><b>${d.name} (${reqTxt})</b><p>${txt}</p></div>`;
    }).join("");
    const setSection = setHtml
        ? `<h4 class="tip-cat">Active Set Effects</h4>${setHtml}`
        : `<h4 class="tip-cat">Active Set Effects</h4><div class="tip-item"><p>No set bonuses active.</p></div>`;
    modal.innerHTML = `
    <div class="content tip-content">
        <div class="content-head">
            <h3>Tips & Knowledge</h3>
            <p id="tip-close"><i class="fa fa-xmark"></i></p>
        </div>
        <div class="tip-list">
            ${cats.map(c => `
                <h4 class="tip-cat">${c}</h4>
                ${TIPS.filter(t => t.cat === c).map(t => `
                    <div class="tip-item">
                        <b>${t.title}</b>
                        <p>${t.text}</p>
                    </div>`).join("")}
            `).join("")}
            ${setSection}
        </div>
    </div>`;

    document.querySelector("#tip-close").onclick = function () {
        if (typeof sfxDecline !== "undefined") sfxDecline.play();
        modal.style.display = "none";
        modal.innerHTML = "";
        if (dim) dim.style.filter = "brightness(100%)";
        if (!dungeon.status.paused) dungeon.status.exploring = true;
    };
};
