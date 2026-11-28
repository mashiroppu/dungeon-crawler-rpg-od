// ===== Tips & Knowledge modal =====
const TIPS = [
    // ---- Basics ----
    { cat: "Basics", title: "Stats", titleJa: "ステータス", text: "ATK = attack power, DEF = damage reduction, ATK.SPD = attacks per second (cap 3.0). VAMP heals you for % of the enemy's max HP on kill. C.RATE / C.DMG = critical rate / critical damage.", textJa: "ATK=攻撃力、DEF=ダメージ軽減、ATK.SPD=攻撃速度/秒（上限3.0）。VAMPは敵撃破時に最大HPの%を回復。C.RATE/C.DMG=クリティカル率/クリティカルダメージ。" },
    { cat: "Basics", title: "Level Up", titleJa: "レベルアップ", text: "Each level offers 3 random stat boosts — pick one per level. N.ATK is an uncommon option (~20% chance) that ONLY boosts normal attacks, not abilities. THORN improves slowly (+0.1% per pick, cap 10%). Level cap is 500.", textJa: "レベルアップごとに3つのランダムなステータス強化から1つ選びます。N.ATKはまれに出る選択肢（約20%）で通常攻撃のみ強化（アビリティには無効）。THORNは1回+0.1%ずつ（上限10%）。レベル上限は500。" },
    { cat: "Basics", title: "THORN", titleJa: "THORN", text: "THORN reflects damage when you are hit: reflect = damage taken × THORN% × (ATK/10). It scales with your ATTACK, not defense — pair it with a hard-hitting build.", textJa: "THORNは被弾時にダメージを反射：反射量=被ダメージ×THORN%×(ATK/10)。防御ではなく攻撃力に比例するので、高火力ビルドとの相性が良い。" },
    { cat: "Basics", title: "N.ATK", titleJa: "N.ATK", text: "N.ATK (Normal Attack) boosts ONLY your auto-attack damage — abilities are unaffected. Level-up investment caps at 200%; equipment N.ATK is a minor bonus.", textJa: "N.ATK（通常攻撃）はオート攻撃のみ強化し、アビリティには無効。レベルアップでの上限は300%、装備のN.ATKは小さめのボーナス。" },
    // ---- Equipment ----
    { cat: "Equipment", title: "Rarity", titleJa: "レアリティ", text: "Common → Uncommon → Rare → Epic → Legendary → Heirloom. Higher rarity = more affixes and stronger values. Heirloom rolls get a 1.5x value multiplier.", textJa: "Common → Uncommon → Rare → Epic → Legendary → Heirloom。レアリティが高いほどオプション数と効果量が上がる。Heirloomは効果値が1.5倍。" },
    { cat: "Equipment", title: "Affixes", titleJa: "オプション", text: "Equipment options (ATK%, HP%, CDR, proc effects...) are rolled randomly per item — what you find is what you get.", textJa: "装備のオプション（ATK%、HP%、CDR、発動効果など）はアイテムごとにランダムに決まる。拾ったものがそのまま性能になる。" },
    { cat: "Equipment", title: "Proc Affixes", titleJa: "発動系オプション", text: "Special options: BURST (attacks stack bonus fragment hits), PRIDE (bonus dmg at full HP), BERSERK (bonus dmg at low HP), PHASE (brief invuln on attack), TRIAL+REGEN (HP trade), OATH (bonus THORN under 50% HP). Proc affixes are unique per equipped set.", textJa: "特殊オプション：BURST（攻撃ごとに追加ダメージ蓄積）、PRIDE（満HP時ボーナス）、BERSERK（低HP時ボーナス）、PHASE（攻撃時に短時間無敵）、TRIAL+REGEN（HP消費と引き換えに回復）、OATH（HP50%以下でTHORN増加）。同時装備では1種類のみ。" },
    { cat: "Equipment", title: "Set Effects", titleJa: "セット効果", text: "Matching equipment combinations grant hidden set bonuses. Conditions are strict — most sets need 3-5 coordinated pieces. Currently active sets are listed in the 'Active Set Effects' section at the bottom of this window.", textJa: "特定の組み合わせでセットボーナスが発動する。条件は厳しく、3〜5個の部位を揃える必要がある。発動中のセットはこのウィンドウ下部の「発動中のセット効果」に表示される。" },
    { cat: "Equipment", title: "Hidden Stats", titleJa: "隠しステータス", text: "Some bonuses exist but are never shown — on items or in your stats. If a build feels stronger than the numbers suggest, it probably has a secret bonus.", textJa: "一部のボーナスはアイテムにもステータス欄にも表示されない。数値以上に強く感じたら、隠しボーナスが付いている可能性がある。" },
    // ---- Combat ----
    { cat: "Combat", title: "Abilities", titleJa: "アビリティ", text: "Abilities have limited charges per battle plus individual cooldowns. Check the ability bar — greyed-out abilities are recharging. Some abilities heal, shield, buff, or reflect damage.", textJa: "アビリティは戦闘ごとの使用回数と個別クールダウンがある。アビリティバーがグレーのものは再充填中。一部は回復・シールド・バフ・反射も行う。" },
    { cat: "Combat", title: "Reflect & Shields", titleJa: "反射とシールド", text: "Judgment Counter reflects 200% but you take +30% damage. Aegis Oath grants a shield plus 50% reflect. Sanctuary heals and reflects. Reflect damage is separate from THORN.", textJa: "Judgment Counterは被ダメの200%を反射するが被ダメ+30%。Aegis Oathはシールド＋50%反射。Sanctuaryは回復＋反射。これらの反射はTHORNとは別系統。" },
    { cat: "Combat", title: "Fleeing", titleJa: "逃走", text: "You can flee most battles, but it can fail — especially against bosses. Bosses hit hard but drop better loot.", textJa: "多くの戦闘からは逃走できるが、失敗することもある（特にボス戦）。ボスは強いがドロップが良い。" },
    // ---- Progression ----
    { cat: "Progression", title: "Dungeon", titleJa: "ダンジョン", text: "The dungeon has 200 floors. Every 20 floors the difficulty rises one tier and floors keep scaling — enemies grow stronger with each band. Defeat the Guardian at the end of a 20-floor band to unlock the next difficulty. Clearing OMEGA (floor 200) extends the dungeon by 20 floors per cycle (NG+1 cap = floor 220, NG+2 = 240, ...) — enemies and rewards grow stronger with each cycle, endlessly.", textJa: "ダンジョンは全200階。20階ごとに難易度が1段階上がり、フロアもスケーリングする。各20階帯の最後のガーディアンを倒すと次の難易度が解放される。OMEGA(200階)を制覇するとダンジョンが20階ずつ拡張され（NG+1上限=220階、NG+2=240階…）、周回ごとに敵と報酬が強化される。無限に続く。" },
    { cat: "Progression", title: "Difficulty Tiers", titleJa: "難易度ティア", text: "10 tiers: NORMAL (1-20) → HARD (21-40) → TERROR (41-60) → ABYSS (61-80) → INFERNO (81-100) → ECLIPSE (101-120) → OBLIVION (121-140) → GENESIS (141-160) → APOCALYPSE (161-180) → OMEGA (181-200). Each starts tougher and grants better rewards. Select an unlocked difficulty when starting a run — you begin at that band's first floor.", textJa: "10段階：NORMAL(1-20)→HARD(21-40)→TERROR(41-60)→ABYSS(61-80)→INFERNO(81-100)→ECLIPSE(101-120)→OBLIVION(121-140)→GENESIS(141-160)→APOCALYPSE(161-180)→OMEGA(181-200)。解放済みの難易度をラン開始時に選ぶと、その帯の先頭フロアから開始できる。" },
    { cat: "Progression", title: "Enemy Modifiers", titleJa: "敵の特性", text: "Some enemies spawn with traits: Burning (bonus damage per hit), Frenzy (faster attacks), Vampiric (lifesteal), Regenerating (heals over time), Armored (high DEF), Volatile (explodes on death). Their tags appear in red at the encounter — before you commit to battle — so you can judge whether to engage or flee.", textJa: "敵には特性が付くことがある：Burning（攻撃ごとに追加ダメージ）、Frenzy（攻撃速度上昇）、Vampiric（吸血）、Regenerating（継続回復）、Armored（高DEF）、Volatile（死亡時爆発）。遭遇時に赤いタグで戦闘前に表示されるので、挑むか逃げるか判断できる。" },
    { cat: "Progression", title: "Dungeon Monarch", titleJa: "ダンジョンモナーク", text: "Rare 'mysterious chamber' events awaken the Dungeon Monarch — an extremely powerful boss with massive stats. Only attempt it when over-leveled and well-geared.", textJa: "まれに出る「謎の部屋」イベントでダンジョンモナークが目覚める。非常に強力なボスなので、レベルと装備が整ってから挑むべき。" },
    { cat: "Progression", title: "Death & Legacy", titleJa: "死亡とレガシー", text: "Dying ends the run. Your warehouse contents persist between runs, and on death you may send ONE extra item into it. Plan which item is worth saving before pushing deep floors.", textJa: "死亡するとランは終了する。倉庫の中身はランを跨いで保持され、死亡時にさらにアイテムを1つ送れる。深い階層に挑む前に、残す価値のあるアイテムを決めておこう。" },
    { cat: "Progression", title: "Gold", titleJa: "ゴールド", text: "Gold drops scale with floor depth and difficulty. Spend it on warehouse expansion (200k per tier), gold boosts at the blacksmith, or save it for emergencies.", textJa: "ゴールドのドロップ量は階層と難易度に比例する。倉庫拡張（1段階20万）、鍛冶屋の金の強化などに使える。" },
    // ---- Systems ----
    { cat: "Systems", title: "Warehouse", titleJa: "倉庫", text: "Wayside caches appear every 5 floors — send ONE item per floor into the warehouse, or take stored items back (unlimited retrieval). Capacity starts at 20 and expands ×2 (40→80→160) for 200k gold each, via the warehouse bar in the inventory.", textJa: "5階ごとに道端の物置が出現。各フロア1個まで倉庫へ送れるほか、倉庫からの取り出しは無制限。容量は初期20で、20万ゴールドで×2ずつ拡張（40→80→160）。インベントリ下部の倉庫バーから拡張可能。" },
    { cat: "Systems", title: "Revive", titleJa: "復活", text: "Once per 100-floor band, if you fall in battle you can spend 5 crystals to revive on the spot — the enemy is finished and the battle ends. Crystals drop from named monsters (elites, guardians).", textJa: "100階帯ごとに1回、戦闘で倒れてもクリスタル5個を消費してその場で復活できる。敵は撃破扱いで戦闘終了。クリスタルはネームドモンスター（エリート・ガーディアン等）からドロップする。" },
    { cat: "Systems", title: "Crystals & Blacksmith", titleJa: "クリスタルと鍛冶屋", text: "Named monsters have a 33.3% chance to drop crystals — harder bands drop more per kill. A blacksmith appears randomly (5% per action) on floors 25–100 of each band. There you can pick any item and: spend gold to enhance up to 2 of its existing stats through 5 tiers (10k→500k, +10%→+114% cumulative, shown as a G badge); spend 10 crystals to raise its Level by 1 — its stats are recalculated with the same level-scaling formula used when gear is generated (Lv+ badge shows bonus levels); and buy the Crystal Ward (100 crystals) so gear is never lost on death.", textJa: "ネームドモンスターは33.3%の確率でクリスタルをドロップし、難易度帯が上がるほど個数が増える。鍛冶屋は各帯の25〜100階に5%の確率でランダム出現し、アイテムを選んで：ゴールドでそのアイテムが持つ能力のうち最大2つを5段階強化（1万→50万、累積+10%〜+114%、Gバッジ表示）、クリスタル10個でレベル+1（生成時と同じレベルスケーリング式で能力値を再計算、Lv+バッジに強化レベル数）、クリスタル100個でクリスタルワード購入（死亡しても装備が失われない）ができる。" },
    { cat: "Systems", title: "Ability Presets", titleJa: "編成プリセット", text: "The ability loadout screen has P1–P3 preset slots. Saving stores your ability picks AND your currently equipped gear — by reference, so items are moved, never duplicated. Click a preset to restore the full build.", textJa: "アビリティ編成画面にP1〜P3のプリセットスロットがある。保存するとアビリティ編成と現在の装備をまとめて記録する（参照型なのでアイテムは移動するだけで複製されない）。プリセットをクリックでビルド全体を復元。" },
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
    const setSection = `<h4 class="tip-cat" id="tip-sec-sets">${t("tips.activeSets")}</h4>` + (setHtml
        ? setHtml
        : `<div class="tip-item"><p>${t("tips.noSets")}</p></div>`);

    // Table of contents: category buttons scroll to their section
    modal.innerHTML = `
    <div class="content tip-content">
        <div class="content-head">
            <h3>${t("tips.title")}</h3>
            <p id="tip-close"><i class="fa fa-xmark"></i></p>
        </div>
        <div class="tip-toc">
            ${cats.map((c, i) => `<button class="tip-toc-btn" data-target="tip-sec-${i}">${t("tipcat." + c)}</button>`).join("")}
            <button class="tip-toc-btn" data-target="tip-sec-sets">${t("tips.activeSets")}</button>
        </div>
        <div class="tip-list">
            ${cats.map((c, ci) => `
                <h4 class="tip-cat" id="tip-sec-${ci}">${t("tipcat." + c)}</h4>
                ${TIPS.filter(t => t.cat === c).map(tip => `
                    <div class="tip-item">
                        <b>${(LANG === "ja" && tip.titleJa) ? tip.titleJa : tip.title}</b>
                        <p>${(LANG === "ja" && tip.textJa) ? tip.textJa : tip.text}</p>
                    </div>`).join("")}
            `).join("")}
            ${setSection}
        </div>
    </div>`;

    modal.querySelectorAll(".tip-toc-btn").forEach(btn => {
        btn.onclick = () => {
            const target = modal.querySelector("#" + btn.dataset.target);
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        };
    });

    document.querySelector("#tip-close").onclick = function () {
        if (typeof sfxDecline !== "undefined") sfxDecline.play();
        modal.style.display = "none";
        modal.innerHTML = "";
        if (dim) dim.style.filter = "brightness(100%)";
        if (!dungeon.status.paused) dungeon.status.exploring = true;
    };
};
