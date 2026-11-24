// ===== Tips & Knowledge modal =====
const TIPS = [
    // ---- Basics ----
    { cat: "Basics", title: "Stats", titleJa: "ステータス", text: "ATK = attack power, DEF = damage reduction, ATK.SPD = attacks per second (cap 3.0). VAMP heals you for % of the enemy's max HP on kill. C.RATE / C.DMG = critical rate / critical damage.", textJa: "ATK=攻撃力、DEF=ダメージ軽減、ATK.SPD=攻撃速度/秒（上限3.0）。VAMPは敵撃破時に最大HPの%を回復。C.RATE/C.DMG=クリティカル率/クリティカルダメージ。" },
    { cat: "Basics", title: "Level Up", titleJa: "レベルアップ", text: "Each level offers 3 random stat boosts — pick one per level. N.ATK is an uncommon option (~20% chance) that ONLY boosts normal attacks, not abilities. THORN improves slowly (+0.1% per pick, cap 10%).", textJa: "レベルアップごとに3つのランダムなステータス強化から1つ選びます。N.ATKはまれに出る選択肢（約20%）で通常攻撃のみ強化（アビリティには無効）。THORNは1回+0.1%ずつ（上限10%）。" },
    { cat: "Basics", title: "THORN", titleJa: "THORN", text: "THORN reflects damage when you are hit: reflect = damage taken × THORN% × (ATK/10). It scales with your ATTACK, not defense — pair it with a hard-hitting build.", textJa: "THORNは被弾時にダメージを反射：反射量=被ダメージ×THORN%×(ATK/10)。防御ではなく攻撃力に比例するので、高火力ビルドとの相性が良い。" },
    { cat: "Basics", title: "N.ATK", titleJa: "N.ATK", text: "N.ATK (Normal Attack) boosts ONLY your auto-attack damage — abilities are unaffected. Level-up investment caps at 300%; equipment N.ATK is a minor bonus.", textJa: "N.ATK（通常攻撃）はオート攻撃のみ強化し、アビリティには無効。レベルアップでの上限は300%、装備のN.ATKは小さめのボーナス。" },
    // ---- Equipment ----
    { cat: "Equipment", title: "Rarity", titleJa: "レアリティ", text: "Common → Uncommon → Rare → Epic → Legendary → Heirloom. Higher rarity = more affixes and stronger values. Heirloom rolls get a 1.5x value multiplier.", textJa: "Common → Uncommon → Rare → Epic → Legendary → Heirloom。レアリティが高いほどオプション数と効果量が上がる。Heirloomは効果値が1.5倍。" },
    { cat: "Equipment", title: "Affixes", titleJa: "オプション", text: "Equipment options (ATK%, HP%, CDR, proc effects...) are rolled per item. Use Reroll to re-roll them, or Finalize to lock them in exchange for +40% on all options.", textJa: "装備のオプション（ATK%、HP%、CDR、発動効果など）はアイテムごとにランダム。Rerollで振り直し、Finalizeで全オプション+40%を払って確定できる。" },
    { cat: "Equipment", title: "Proc Affixes", titleJa: "発動系オプション", text: "Special options: BURST (attacks stack bonus fragment hits), PRIDE (bonus dmg at full HP), BERSERK (bonus dmg at low HP), PHASE (brief invuln on attack), TRIAL+REGEN (HP trade), OATH (bonus THORN under 50% HP). Proc affixes are unique per equipped set.", textJa: "特殊オプション：BURST（攻撃ごとに追加ダメージ蓄積）、PRIDE（満HP時ボーナス）、BERSERK（低HP時ボーナス）、PHASE（攻撃時に短時間無敵）、TRIAL+REGEN（HP消費と引き換えに回復）、OATH（HP50%以下でTHORN増加）。同時装備では1種類のみ。" },
    { cat: "Equipment", title: "Set Effects", titleJa: "セット効果", text: "Matching equipment combinations grant hidden set bonuses. Conditions are strict — most sets need 3-5 coordinated pieces. The bonuses are NOT displayed; discover them by feeling the difference.", textJa: "特定の組み合わせで隠しセットボーナスが発動する。条件は厳しく、3〜5個の部位を揃える必要がある。ボーナスは表示されないので、強さの違いで気づくしかない。" },
    { cat: "Equipment", title: "Hidden Stats", titleJa: "隠しステータス", text: "Some bonuses exist but are never shown — on items or in your stats. If a build feels stronger than the numbers suggest, it probably has a secret bonus.", textJa: "一部のボーナスはアイテムにもステータス欄にも表示されない。数値以上に強く感じたら、隠しボーナスが付いている可能性がある。" },
    // ---- Combat ----
    { cat: "Combat", title: "Abilities", titleJa: "アビリティ", text: "Abilities have limited charges per battle plus individual cooldowns. Check the ability bar — greyed-out abilities are recharging. Some abilities heal, shield, buff, or reflect damage.", textJa: "アビリティは戦闘ごとの使用回数と個別クールダウンがある。アビリティバーがグレーのものは再充填中。一部は回復・シールド・バフ・反射も行う。" },
    { cat: "Combat", title: "Reflect & Shields", titleJa: "反射とシールド", text: "Judgment Counter reflects 200% but you take +30% damage. Aegis Oath grants a shield plus 50% reflect. Sanctuary heals and reflects. Reflect damage is separate from THORN.", textJa: "Judgment Counterは被ダメの200%を反射するが被ダメ+30%。Aegis Oathはシールド＋50%反射。Sanctuaryは回復＋反射。これらの反射はTHORNとは別系統。" },
    { cat: "Combat", title: "Fleeing", titleJa: "逃走", text: "You can flee most battles, but it can fail — especially against bosses. Bosses hit hard but drop better loot.", textJa: "多くの戦闘からは逃走できるが、失敗することもある（特にボス戦）。ボスは強いがドロップが良い。" },
    // ---- Progression ----
    { cat: "Progression", title: "Dungeon", titleJa: "ダンジョン", text: "Each floor has several rooms ending in a Guardian boss. Floor 100 is the final stretch — once reached, you can keep exploring it endlessly for loot and levels.", textJa: "各フロアは複数のルームで構成され、最後にガーディアンのボスが待つ。100階到達後はその階を無限周回でき、戦利品とレベルを稼げる。" },
    { cat: "Progression", title: "Dungeon Monarch", titleJa: "ダンジョンモナーク", text: "Rare 'mysterious chamber' events awaken the Dungeon Monarch — an extremely powerful boss with massive stats. Only attempt it when over-leveled and well-geared.", textJa: "まれに出る「謎の部屋」イベントでダンジョンモナークが目覚める。非常に強力なボスなので、レベルと装備が整ってから挑むべき。" },
    { cat: "Progression", title: "Death & Legacy", titleJa: "死亡とレガシー", text: "Dying ends the run, but you can carry ONE item into the next run via Legacy. Plan which item is worth saving before pushing deep floors.", textJa: "死亡するとランは終了するが、レガシーでアイテムを1つだけ次のランに持ち越せる。深い階層に挑む前に、残す価値のあるアイテムを決めておこう。" },
    { cat: "Progression", title: "Gold", titleJa: "ゴールド", text: "Gold drops scale with floor depth. G.FIND equipment boosts gold gain — useful if you're saving for Finalize costs or rerolls.", textJa: "ゴールドのドロップ量は階層に比例する。G.FIND装備でゴールド獲得が増える。Finalize費用やリロール代を貯めたい時に有効。" },
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
        ? `<h4 class="tip-cat">${t("tips.activeSets")}</h4>${setHtml}`
        : `<h4 class="tip-cat">${t("tips.activeSets")}</h4><div class="tip-item"><p>${t("tips.noSets")}</p></div>`;
    modal.innerHTML = `
    <div class="content tip-content">
        <div class="content-head">
            <h3>${t("tips.title")}</h3>
            <p id="tip-close"><i class="fa fa-xmark"></i></p>
        </div>
        <div class="tip-list">
            ${cats.map(c => `
                <h4 class="tip-cat">${t("tipcat." + c)}</h4>
                ${TIPS.filter(t => t.cat === c).map(tip => `
                    <div class="tip-item">
                        <b>${(LANG === "ja" && tip.titleJa) ? tip.titleJa : tip.title}</b>
                        <p>${(LANG === "ja" && tip.textJa) ? tip.textJa : tip.text}</p>
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
