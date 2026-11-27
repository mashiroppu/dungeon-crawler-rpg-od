// ===== i18n: English / Japanese UI strings =====
// Usage: t("key") returns the string for the current language (fallback: en).
// setLang("en" | "ja") persists the choice to localStorage ("gameLang").

let LANG = localStorage.getItem("gameLang") || "en";
const getLang = () => LANG;
const setLang = (l) => {
    LANG = (l === "ja") ? "ja" : "en";
    localStorage.setItem("gameLang", LANG);
};

const STRINGS = {
    // ---- Title / Character creation ----
    "title.tap":            { en: "Tap to explore the dungeon", ja: "タップしてダンジョンを探索" },
    "cc.title":             { en: "What is your name?", ja: "あなたの名前は？" },
    "common.confirm":       { en: "Confirm", ja: "決定" },
    "name.err.special":     { en: "Name cannot contain special characters!", ja: "名前に記号は使えません！" },
    "name.err.short":       { en: "Name should be at least 3 characters!", ja: "名前は3文字以上にしてください！" },
    "name.err.long":        { en: "Name is too long! (max width: {w} 'a')", ja: "名前が長すぎます！（最大幅: a{w}個分）" },

    // ---- Dungeon header ----
    "dgn.explore":          { en: "Explore", ja: "探索" },
    "dgn.pause":            { en: "Pause", ja: "停止" },
    "dgn.resting":          { en: "Resting...", ja: "休憩中..." },
    "dgn.exploring":        { en: "Exploring...", ja: "探索中..." },
    "dgn.floor":            { en: "Floor", ja: "フロア" },
    "dgn.room":             { en: "Room", ja: "ルーム" },

    // ---- Stats panel ----
    "stats.title":          { en: "Stats", ja: "ステータス" },
    "bonus.title":          { en: "Bonus Stats", ja: "ボーナスステータス" },

    // ---- Inventory ----
    "inv.title":            { en: "Inventory", ja: "インベントリ" },
    "inv.sell":             { en: "Sell", ja: "売却" },
    "inv.menu":             { en: "Menu", ja: "メニュー" },
    "inv.equipment":        { en: "Equipment", ja: "装備" },
    "inv.sellAllQ":         { en: "Sell all of your equipment?", ja: "装備をすべて売却しますか？" },
    "inv.sellRarityQ":      { en: "Sell all {r} equipment?", ja: "{r}装備をすべて売却しますか？" },
    "inv.sellAll":          { en: "Sell All", ja: "すべて売却" },

    // ---- Menu modal ----
    "menu.title":           { en: "Menu", ja: "メニュー" },
    "menu.run":             { en: "Current Run", ja: "現在のラン" },
    "menu.volume":          { en: "Volume Settings", ja: "音量設定" },
    "menu.settings":        { en: "Settings", ja: "設定" },
    "menu.ei":              { en: "Export/Import Data", ja: "データのエクスポート/インポート" },
    "menu.quit":            { en: "Abandon", ja: "ランを放棄" },
    "menu.lang":            { en: "Language", ja: "言語" },

    // ---- Profile tab ----
    "profile.title":        { en: "Statistics", ja: "プロフィール" },
    "profile.kills":        { en: "Kills:", ja: "撃破数:" },
    "profile.deaths":       { en: "Deaths:", ja: "死亡数:" },
    "profile.playtime":     { en: "Playtime:", ja: "プレイ時間:" },
    "profile.rename":       { en: "Rename", ja: "名前変更" },

    // ---- Rename tab ----
    "rename.title":         { en: "Rename", ja: "名前変更" },

    // ---- Current Run tab ----
    "run.title":            { en: "Current Run", ja: "現在のラン" },
    "run.difficulty":       { en: "Difficulty:", ja: "難易度:" },
    "run.blessing":         { en: "Blessing Lvl.", ja: "祝福Lv." },
    "run.curse":            { en: "Curse Lvl.", ja: "呪いLv." },
    "run.kills":            { en: "Kills:", ja: "撃破数:" },
    "run.runtime":          { en: "Runtime:", ja: "経過時間:" },

    // ---- Quit confirm ----
    "quit.msg":             { en: "Do you want to abandon this run?", ja: "このランを放棄しますか？" },
    "quit.abandon":         { en: "Abandon", ja: "放棄" },
    "common.cancel":        { en: "Cancel", ja: "キャンセル" },

    // ---- Volume tab ----
    "vol.title":            { en: "Volume", ja: "音量" },
    "vol.master":           { en: "Master", ja: "マスター" },
    "vol.bgm":              { en: "BGM", ja: "BGM" },
    "vol.sfx":              { en: "SFX", ja: "効果音" },
    "vol.apply":            { en: "Apply", ja: "適用" },
    "set.title":            { en: "Settings", ja: "設定" },
    "set.brightness":       { en: "Brightness", ja: "明るさ" },

    // ---- Export/Import tab ----
    "ei.title":             { en: "Export/Import Data", ja: "データのエクスポート/インポート" },
    "ei.export":            { en: "Export Data", ja: "データをエクスポート" },
    "common.copy":          { en: "Copy", ja: "コピー" },
    "common.copied":        { en: "Copied!", ja: "コピーしました！" },
    "ei.import":            { en: "Import Data", ja: "データをインポート" },
    "ei.doImport":          { en: "Import", ja: "インポート" },
    "import.warn":          { en: "Are you sure you want to import this data? This will erase the current data and reset your dungeon progress.", ja: "本当にこのデータをインポートしますか？現在のデータは消去され、ダンジョンの進行がリセットされます。" },

    // ---- Level up ----
    "lvl.title":            { en: "Level Up!", ja: "レベルアップ！" },
    "lvl.remaining":        { en: "Remaining:", ja: "残り:" },
    "lvl.reroll":           { en: "Reroll — {c}G", ja: "リロール — {c}G" },
    "lvl.statup":           { en: "Increase bonus {s} by {p}%.", ja: "ボーナス{s}を{p}%強化。" },

    // ---- Tips modal ----
    "tips.title":           { en: "Tips & Knowledge", ja: "攻略Tips" },
    "tips.activeSets":      { en: "Active Set Effects", ja: "発動中のセット効果" },
    "tips.noSets":          { en: "No set bonuses active.", ja: "発動中のセットボーナスはありません。" },
    "tipcat.Basics":        { en: "Basics", ja: "基礎" },
    "tipcat.Equipment":     { en: "Equipment", ja: "装備" },
    "tipcat.Combat":        { en: "Combat", ja: "戦闘" },
    "tipcat.Progression":   { en: "Progression", ja: "進行" },
    "tipcat.Systems":       { en: "Systems", ja: "システム" },

    // ---- Ability loadout ----
    "loadout.title":        { en: "Ability Loadout", ja: "アビリティ編成" },
    "loadout.hint":         { en: "{c} — slot up to {n} abilities", ja: "{c} — 最大{n}つまでセット可能" },
    "loadout.cancel":       { en: "Cancel", ja: "キャンセル" },
    "loadout.confirm":      { en: "Confirm", ja: "決定" },
    "loadout.presets":      { en: "Presets", ja: "プリセット" },
    "loadout.savePreset":   { en: "Save", ja: "保存" },

    // ---- Dungeon exploration ----
    "dgn.c.enter":          { en: "Enter", ja: "進む" },
    "dgn.c.ignore":         { en: "Ignore", ja: "無視" },
    "dgn.c.openChest":      { en: "Open the chest", ja: "宝箱を開ける" },
    "dgn.c.engage":         { en: "Engage", ja: "戦う" },
    "dgn.c.flee":           { en: "Flee", ja: "逃げる" },
    "dgn.c.offer":          { en: "Offer", ja: "捧げる" },
    "dgn.log.bossDoor":     { en: '<span class="Heirloom">You found the door to the boss room.</span>', ja: '<span class="Heirloom">ボスルームへの扉を見つけた。</span>' },
    "dgn.log.door":         { en: "You found a door.", ja: "扉を見つけた。" },
    "dgn.log.advance":      { en: "You moved to the next floor.", ja: "次のフロアへ進んだ。" },
    "dgn.log.roomChest":    { en: 'You moved to the next room and found a treasure chamber. There is a <i class="fa fa-toolbox"></i>Chest inside.', ja: '次のルームへ移動し、宝物庫を見つけた。中に<i class="fa fa-toolbox"></i>宝箱がある。' },
    "dgn.log.nextRoom":     { en: "You moved to the next room.", ja: "次のルームへ移動した。" },
    "dgn.log.chestRoom":    { en: 'You found a treasure chamber. There is a <i class="fa fa-toolbox"></i>Chest inside.', ja: '宝物庫を見つけた。中に<i class="fa fa-toolbox"></i>宝箱がある。' },
    "dgn.log.encounter":    { en: "You encountered {name}.", ja: "{name}に遭遇した。" },
    "dgn.log.blessing":     { en: '<span class="Legendary">You found a Statue of Blessing. Do you want to offer <i class="fas fa-coins" style="color: #FFD700;"></i><span class="Common">{cost}</span> to gain blessings? (Blessing Lv.{blessing})</span>', ja: '<span class="Legendary">祝福の像を見つけた。<i class="fas fa-coins" style="color: #FFD700;"></i><span class="Common">{cost}</span>を捧げて祝福を得るか？（祝福Lv.{blessing}）</span>' },
    "dgn.log.noGold":       { en: "You don't have enough gold.", ja: "ゴールドが足りない。" },
    "dgn.log.curse":        { en: '<span class="Heirloom">You found a Cursed Totem. Do you want to offer <i class="fas fa-coins" style="color: #FFD700;"></i><span class="Common">{cost}</span>? This will strengthen the monsters but will also improve the loot quality. (Curse Lv.{curse})</span>', ja: '<span class="Heirloom">呪いのトーテムを見つけた。<i class="fas fa-coins" style="color: #FFD700;"></i><span class="Common">{cost}</span>を捧げるか？モンスターは強くなるが戦利品の質も上がる。（呪いLv.{curse}）</span>' },
    "dgn.log.mysterious":   { en: '<span class="Heirloom">You found a mysterious chamber. It seems like there is something sleeping inside.</span>', ja: '<span class="Heirloom">謎の部屋を見つけた。中で何かが眠っているようだ。</span>' },
    "dgn.log.guardian":     { en: "Floor Guardian {name} is blocking your way.", ja: "フロアガーディアン {name} が行く手を阻んでいる。" },
    "dgn.log.monarch":      { en: "Dungeon Monarch {name} has awoken.", ja: "ダンジョンモナーク {name} が目覚めた。" },
    "dgn.log.fleeOk":       { en: "You managed to flee.", ja: "うまく逃げ切れた。" },
    "dgn.log.fleeFail":     { en: "You failed to escape!", ja: "逃走に失敗した！" },
    "dgn.log.chestEmpty":   { en: "The chest is empty.", ja: "宝箱は空だった。" },
    "dgn.log.nothing1":     { en: "You explored and found nothing.", ja: "探索したが何もなかった。" },
    "dgn.log.nothing2":     { en: "You found an empty chest.", ja: "空の宝箱を見つけた。" },
    "dgn.log.nothing3":     { en: "You found a monster corpse.", ja: "モンスターの死体を見つけた。" },
    "dgn.log.nothing4":     { en: "You found a corpse.", ja: "死体を見つけた。" },
    "dgn.log.nothing5":     { en: "There is nothing in this area.", ja: "この辺りには何もない。" },
    "dgn.log.blessGain":    { en: "You gained {v}% bonus {s} from the blessing. (Blessing Lv.{a} > Blessing Lv.{b})", ja: "祝福によりボーナス{s}が{v}%上昇した。（祝福Lv.{a} > 祝福Lv.{b}）" },
    "dgn.log.curseGain":    { en: "The monsters in the dungeon became stronger and the loot quality improved. (Curse Lv.{a} > Curse Lv.{b})", ja: "ダンジョンのモンスターが強化され、戦利品の質が上がった。（呪いLv.{a} > 呪いLv.{b}）" },
    "dgn.log.curseReset":   { en: "You feel the curse lift... (Curse stage reset)", ja: "呪いが解けていく気がする…（呪い段階リセット）" },
    "dgn.curse.confirm":    { en: "Accept the curse? Monsters will grow stronger. (Cost: {cost})", ja: "呪いを受け入れますか？モンスターが強化されます。（費用: {cost}）" },
    "dgn.log.ignore":       { en: "You ignored it and decided to move on.", ja: "無視して先へ進んだ。" },
    "dgn.log.gold":         { en: 'You found <i class="fas fa-coins" style="color: #FFD700;"></i>{g}.', ja: '<i class="fas fa-coins" style="color: #FFD700;"></i>{g}を見つけた。' },
    "dgn.log.fleeFrom":     { en: "You fled from {name}.", ja: "{name}から逃げた。" },
    "dgn.log.abilityNew":   { en: "New ability learned: <b>{name}</b> — {desc}", ja: "新しいアビリティを習得：<b>{name}</b> — {desc}" },
    "combat.fleeReady":     { en: "You can flee from battle now!", ja: "今なら戦闘から逃げられる！" },
    "cb.claim":             { en: "Claim", ja: "受け取る" },
    "cb.backToMenu":        { en: "Back to Menu", ja: "メニューに戻る" },
    "cb.flee":              { en: "Flee", ja: "逃げる" },
    "cb.revive":            { en: "Revive — {c} crystals", ja: "復活 — クリスタル{c}個" },
    "cb.crystalDrop":       { en: "{name} dropped {n} crystal(s)!", ja: "{name}がクリスタルを{n}個落とした！" },
    "cb.diffUnlocked":      { en: "New difficulty unlocked: {name}!", ja: "新しい難易度が解放された：{name}！" },
    "cb.dungeonClear":      { en: "You have cleared the dungeon!", ja: "ダンジョンを制覇した！" },

    // ---- Equipment / Inventory ----
    "eq.equip":             { en: "Equip", ja: "装備" },
    "eq.unequip":           { en: "Unequip", ja: "外す" },
    "eq.reroll":            { en: "Reroll", ja: "リロール" },
    "eq.finalize":          { en: "Finalize", ja: "確定" },
    "eq.close":             { en: "Close", ja: "閉じる" },
    "eq.sell":              { en: "Sell", ja: "売却" },
    "eq.sellQ":             { en: "Sell <span class=\"{r}\">{item}</span>?", ja: "<span class=\"{r}\">{item}</span>を売却しますか？" },
    "eq.finQ":              { en: "Finalize <span class=\"{r}\">{item}</span>?", ja: "<span class=\"{r}\">{item}</span>を確定しますか？" },
    "eq.finNote":           { en: "All options +40% — reroll locked<br>Cost: <b>{c}G</b>", ja: "全オプション+40% — リロール不可<br>費用: <b>{c}G</b>" },
    "eq.nothing":           { en: "Nothing equipped.", ja: "装備なし。" },
    "eq.empty":             { en: "There are no items available.", ja: "アイテムがありません。" },
    "eq.tier":              { en: "Tier", ja: "ティア" },
    "eq.gotItem":           { en: "You got <span class=\"{r}\">{item}</span>.<br>{panel}", ja: "<span class=\"{r}\">{item}</span>を手に入れた。<br>{panel}" },
    "legacy.title":         { en: "Legacy", ja: "レガシー" },
    "legacy.hint":          { en: "Choose ONE item to carry into the next run. (Storage {n}/{max})", ja: "次のランに持ち越すアイテムを1つ選んでください。（保管庫 {n}/{max}）" },
    "legacy.send":          { en: "Send to Storage", ja: "保管庫へ送る" },
    "legacy.lose":          { en: "Lose All", ja: "すべて失う" },
    "stash.cancel":         { en: "Cancel", ja: "キャンセル" },
    "stash.stored":         { en: "You stored <span class=\"{r}\">{item}</span> in the warehouse.", ja: "<span class=\"{r}\">{item}</span>を倉庫に保管した。" },

    // ---- Warehouse ----
    "wh.info":              { en: "Warehouse {n}/{max}", ja: "倉庫 {n}/{max}" },
    "wh.expand":            { en: "Expand — {c}G", ja: "拡張 — {c}G" },
    "wh.maxed":             { en: "MAX", ja: "MAX" },
    "wh.expanded":          { en: "Warehouse expanded! Capacity: {max}", ja: "倉庫を拡張した！容量: {max}" },
    "wh.full":              { en: "Warehouse is full.", ja: "倉庫がいっぱいです。" },

    // ---- Stash point (every 5 floors) ----
    "dgn.log.stashPoint":   { en: "You found a wayside cache. Send ONE item to your warehouse, or take items back.", ja: "道端の物置を見つけた。アイテムを1つ倉庫へ送るか、倉庫からアイテムを取り出せる。" },
    "dgn.c.stash":          { en: "Open cache", ja: "物置を開ける" },
    "dgn.c.stashSend":      { en: "Send to Warehouse", ja: "倉庫へ送る" },
    "wh.section":           { en: "Warehouse ({n}/{max})", ja: "倉庫（{n}/{max}）" },
    "wh.retrieve":          { en: "Take", ja: "取り出す" },
    "wh.retrieved":         { en: "You retrieved <span class=\"{r}\">{item}</span> from the warehouse.", ja: "倉庫から<span class=\"{r}\">{item}</span>を取り出した。" },
    "wh.empty":             { en: "The warehouse is empty.", ja: "倉庫は空です。" },

    // ---- Blacksmith ----
    "dgn.log.blacksmith":   { en: "A burly blacksmith works a forge by the roadside. The ring of his hammer sounds like a promise.", ja: "道端で屈強な鍛冶屋が炉を打っている。金槌の音が約束を奏でる。" },
    "dgn.c.visit":          { en: "Visit the blacksmith", ja: "鍛冶屋を訪ねる" },
    "smith.title":          { en: "Blacksmith", ja: "鍛冶屋" },
    "smith.crystals":       { en: "Crystals: {n}", ja: "クリスタル: {n}" },
    "smith.hint":           { en: "Pick an item: gold enhances up to 2 of its stats (G), crystals raise its Level (Lv).", ja: "アイテムを選択：ゴールドで能力を最大2つ強化（G）、クリスタルでレベルアップ（Lv）。" },
    "smith.enhanceTitle":   { en: "Enhance this item's stats with gold", ja: "ゴールドでこのアイテムの能力値を強化" },
    "smith.pickStats":      { en: "Choose up to 2 stats on this item to enhance with gold.", ja: "ゴールドで強化する能力をこのアイテムから2つまで選んでください。" },
    "smith.pickFirst":      { en: "Select stats first", ja: "先に能力を選択" },
    "smith.noStats":        { en: "This item has no enhanceable stats.", ja: "このアイテムに強化可能な能力がありません。" },
    "smith.enhanceStatus":  { en: "Gold enhance level: {t}/{max}", ja: "ゴールド強化レベル: {t}/{max}" },
    "smith.enhMax":         { en: "MAX", ja: "MAX" },
    "smith.owned":          { en: "Owned", ja: "強化済み" },
    "smith.ward":           { en: "Crystal Ward — gear is never lost on death (auto-stored, returned next run)", ja: "クリスタルワード — 死亡しても装備が失われない（自動で倉庫へ保管され次のランで返還）" },
    "smith.rankUp":         { en: "Level Up — 10 crystals (+1 Lv, stats recalculated)", ja: "レベルアップ — クリスタル10個（Lv+1、能力値を再計算）" },
    "smith.wardBuy":        { en: "Buy — {n} crystals", ja: "購入 — クリスタル{n}個" },
    "smith.rankMax":        { en: "MAX LV", ja: "レベルMAX" },
    "smith.items":          { en: "Equipment", ja: "装備" },
    "smith.noItems":        { en: "No equipment.", ja: "装備がありません。" },
    "smith.close":          { en: "Leave", ja: "立ち去る" },

    // ---- Combat log ----
    "cb.secondWind":        { en: "{name} refuses to fall! (Second Wind)", ja: "{name}は倒れない！（Second Wind）" },
    "cb.trueInvuln":        { en: "{name} becomes untouchable for {s}s!", ja: "{name}が{s}秒間無敵になった！" },
    "cb.died":              { en: "You died!", ja: "あなたは死亡した！" },
    "cb.explode":           { en: "{name} explodes! You take {dmg} damage.", ja: "{name}が爆発した！{dmg}のダメージを受けた。" },
    "cb.enemyDied":         { en: "{name} died! ({time})", ja: "{name}を倒した！（{time}）" },
    "cb.earnedExp":         { en: "You earned {exp} exp.", ja: "{exp} EXPを獲得した。" },
    "cb.droppedGold":       { en: "{name} dropped {icon}{g} gold.", ja: "{name}が{icon}{g}ゴールドを落とした。" },
    "cb.drainKill":         { en: "{name} drains {hp} HP from the kill!", ja: "{name}がキルから{hp}HPを吸収した！" },
    "cb.dealt":             { en: "{name} dealt {dmg} {type} to {target}.", ja: "{name}が{target}に{dmg}{type}のダメージを与えた。" },
    "cb.afterimages":       { en: "{name}'s afterimages strike {n} more time{s}!", ja: "{name}の残像がさらに{n}回攻撃した！" },
    "cb.fragments":         { en: "{name}'s attack bursts into {n} fragment{s}!", ja: "{name}の攻撃が{n}つの破片に分裂した！" },
    "cb.petrifiedNoAtk":    { en: "{name} is petrified solid and cannot attack!", ja: "{name}は石化して攻撃できない！" },
    "cb.attackMisses":      { en: "{name}'s attack misses {target}!", ja: "{name}の攻撃は{target}を外れた！" },
    "cb.piercesGuard":      { en: "{name}'s attack pierces {target}'s guard!", ja: "{name}の攻撃は{target}の防御を貫いた！" },
    "cb.passesThrough":     { en: "{name}'s attack passes through {target}!", ja: "{name}の攻撃は{target}を通り抜けた！" },
    "cb.reflects":          { en: "{name} reflects {dmg} damage!", ja: "{name}が{dmg}のダメージを反射した！" },
    "cb.dealtShield":       { en: "{name} dealt {dmg} {type} to {target}.{abs}", ja: "{name}が{target}に{dmg}{type}のダメージを与えた。{abs}" },
    "cb.shieldAbsorbed":    { en: " (Shield absorbed {abs})", ja: "（シールドが{abs}を吸収）" },
    "cb.levelUp":           { en: "You leveled up! (Lv.{from} > Lv.{to})", ja: "レベルアップした！（Lv.{from} > Lv.{to}）" },
    "cb.itemDropped":       { en: "{name} dropped <span class=\"{r}\">{item}</span>.<br>{panel}", ja: "{name}が<span class=\"{r}\">{item}</span>を落とした。<br>{panel}" },
    "cb.dmgNormal":         { en: "damage", ja: "ダメージ" },
    "cb.dmgCrit":           { en: "crit damage", ja: "クリティカルダメージ" },
    "cb.dmgTypeLabel":      { en: "{dmg} {type}", ja: "{dmg}{type}" },
    "cb.bossPhase":         { en: "{name} enters Phase {p}!", ja: "{name}がフェーズ{p}に突入した！" },
    "cb.bossGain":          { en: "{name} gains {effect}!", ja: "{name}が{effect}を得た！" },
    "cb.bossHeavy":         { en: "{name} unleashes a devastating blow!", ja: "{name}が渾身の一撃を放った！" },
    "cb.bossEmpowered":     { en: "{name} follows up with an empowered strike!", ja: "{name}が強化された追撃を放った！" },
    "cb.doubleStrike":      { en: "{name} strikes again!", ja: "{name}が追撃した！" },

    // ---- Combat log: abilities ----
    "cb.ab.petrified4s":    { en: "{name} is petrified solid! (Cannot attack for 4s, takes +25% damage)", ja: "{name}は完全に石化した！（4秒間攻撃不可、被ダメ+25%）" },
    "cb.ab.unleashed":      { en: "{name} unleashed an ability, dealing {dmg} damage to {target}.", ja: "{name}がアビリティを放ち、{target}に{dmg}のダメージを与えた。" },
    "cb.ab.recovers":       { en: "{name} recovers {hp} HP!", ja: "{name}は{hp}HPを回復した！" },
    "cb.ab.timeSlows":      { en: "{name}'s time slows! (ATK.SPD -50% for 6s)", ja: "{name}の時間が遅くなった！（6秒間ATK.SPD-50%）" },
    "cb.ab.shieldWall":     { en: "{name} raises a shield wall! (Shield: {s}, DEF +30% for 8s)", ja: "{name}がシールドの壁を展開した！（シールド:{s}、8秒間DEF+30%）" },
    "cb.ab.warcry":         { en: "{name} lets out a war cry! (+35% damage for 12s)", ja: "{name}が戦意を高らかに上げた！（12秒間ダメージ+35%）" },
    "cb.ab.oath":           { en: "{name} swears an undying oath! (Regen 3% max HP/s for 10s)", ja: "{name}が不死の誓いを立てた！（10秒間最大HPの3%/秒回復）" },
    "cb.ab.executes":       { en: "{name} executes {target}!", ja: "{name}が{target}を処刑した！" },
    "cb.ab.petrifying":     { en: "{name} is petrifying... ({n}/5 stacks)", ja: "{name}が石化しつつある…（{n}/5スタック）" },
    "cb.ab.flames":         { en: "{name} is engulfed in flames!", ja: "{name}が炎に包まれた！" },
    "cb.ab.movementsSlow":  { en: "{name}'s movements slow down!", ja: "{name}の動きが鈍くなった！" },
    "cb.ab.frozenStasis":   { en: "{name} is frozen in stasis!", ja: "{name}がスタシスに凍りついた！" },
    "cb.ab.manaShield":     { en: "{name} surrounds themself in mana! (Shield: {s})", ja: "{name}がマナに包まれた！（シールド:{s}）" },
    "cb.ab.fanKnives":      { en: "{name} fans a volley of knives! (+30% ATK.SPD for 6s)", ja: "{name}がナイフの一斉攻撃を放った！（6秒間ATK.SPD+30%）" },
    "cb.ab.envenomed":      { en: "{name} is envenomed!", ja: "{name}が毒に侵された！" },
    "cb.ab.godspeed":       { en: "{name} shifts into godspeed! (+100% ATK.SPD for 10s)", ja: "{name}が神速にシフトした！（10秒間ATK.SPD+100%）" },
    "cb.ab.deadlyStance":   { en: "{name} enters a deadly stance! (+30% crit rate for 8s)", ja: "{name}が致命的な構えに入った！（8秒間クリティカル率+30%）" },
    "cb.ab.surges":         { en: "{name} surges forward! (+40% ATK.SPD for 5s)", ja: "{name}が前方に突進した！（5秒間ATK.SPD+40%）" },
    "cb.ab.afterimageSplit":{ en: "{name} splits into afterimages! (30% double strike for 8s)", ja: "{name}が残像に分裂した！（8秒間30%の確率で二重攻撃）" },
    "cb.ab.impaled":        { en: "{name} is impaled from above!", ja: "{name}が上空から串刺しにされた！" },
    "cb.ab.dragonRoar":     { en: "{name} reels from the dragon's roar! (ATK -40% for 5s)", ja: "{name}がドラゴンの咆哮にひるんだ！（5秒間ATK-40%）" },
    "cb.ab.judgment":       { en: "{name} calls down judgment! (Reflect 200%, but takes +30% damage for 8s)", ja: "{name}がジャッジメントを呼び降ろした！（8秒間反射200%、ただし被ダメ+30%）" },
    "cb.ab.thornsNova":     { en: "{name} blooms with thorns! (Reflected damage +50% burst for 10s)", ja: "{name}が茨の花を咲かせた！（10秒間反射ダメージ+50%バースト）" },
    "cb.ab.aegisOath":      { en: "{name} swears the aegis oath! (Shield: {s}, reflect 50% for 10s)", ja: "{name}がイージスの誓いを立てた！（シールド:{s}、10秒間反射50%）" },
    "cb.ab.aegisEmpowered": { en: "{name}'s judgement is empowered by the aegis!", ja: "{name}のジャッジメントがイージスに強化された！" },
    "cb.ab.sanctuary":      { en: "{name} calls down sanctuary! (Heal 30%, Shield 20%, reflect 40% for 12s)", ja: "{name}がサンクチュアリを呼び降ろした！（12秒間回復30%、シールド20%、反射40%）" },

    // ---- Character creation (stat allocation) ----
    "cc.alloc":             { en: "Allocate Stats", ja: "ステータス配分" },
    "cc.statPoints":        { en: "Stat Points: {p}", ja: "ステータスポイント: {p}" },
    "common.reset":         { en: "Reset", ja: "リセット" },
    "common.back":          { en: "Back", ja: "戻る" },
    "cc.class":             { en: "Class", ja: "クラス" },
    "cc.passive":           { en: "Passive", ja: "パッシブ" },
    "cc.difficulty":        { en: "Difficulty", ja: "難易度" },
    "cc.legacy":            { en: "Legacy Storage ({n}/{max})", ja: "レガシー保管庫（{n}/{max}）" },
    "cc.legacyHint":        { en: "Select up to {n} items to start equipped.", ja: "開始時に装備するアイテムを最大{n}個選んでください。" },
    "cc.optNormal":         { en: "Normal", ja: "ノーマル" },
    "cc.optHard":           { en: "Hard", ja: "ハード" },
    "cc.optInferno":        { en: "Inferno", ja: "インフェルノ" },
    "cc.classdesc.warrior": { en: "Frontline fighter. High HP/ATK/DEF.", ja: "前衛の戦士。高いHP/ATK/DEF。" },
    "cc.classdesc.mage":    { en: "Glass cannon. High ATK and crit damage.", ja: "ガラスキャノン。高いATKとクリティカルダメージ。" },
    "cc.classdesc.rogue":   { en: "Speed star. High ATK.SPD and crit rate.", ja: "スピードスター。高いATK.SPDとクリティカル率。" },
    "cc.classdesc.lancer":  { en: "Reach fighter. High ATK.SPD, solid ATK/DEF.", ja: "リーチファイター。高いATK.SPDと安定したATK/DEF。" },
    "cc.classdesc.paladin": { en: "Holy defender. Reflects damage, shields and heals.", ja: "聖なる防御者。ダメージ反射・シールド・回復。" },
    "cc.diffdesc.normal":   { en: "Floors 1-100. The baseline difficulty.", ja: "フロア1-100。基準となる難易度。" },
    "cc.diffdesc.hard":     { en: "Floors 101-200. Enemies: +15% HP, +10% ATK.SPD, +5% ATK, +10% DEF.", ja: "フロア101-200。敵: HP+15%、ATK.SPD+10%、ATK+5%、DEF+10%。" },
    "cc.diffdesc.terror":   { en: "Floors 201-300. Enemies: +25% HP, +15% ATK.SPD, +10% ATK, +15% DEF.", ja: "フロア201-300。敵: HP+25%、ATK.SPD+15%、ATK+10%、DEF+15%。" },
    "cc.diffdesc.abyss":    { en: "Floors 301-400. Enemies: +40% HP, +20% ATK.SPD, +25% ATK, +20% DEF.", ja: "フロア301-400。敵: HP+40%、ATK.SPD+20%、ATK+25%、DEF+20%。" },
    "cc.diffdesc.inferno":  { en: "Floors 401-500. Enemies: +50% HP, +25% ATK.SPD, +30% ATK, +25% DEF.", ja: "フロア401-500。敵: HP+50%、ATK.SPD+25%、ATK+30%、DEF+25%。" },
    "cc.diffdesc.eclipse":  { en: "Floors 501-600. Enemies: +60% HP, +30% ATK.SPD, +40% ATK, +30% DEF.", ja: "フロア501-600。敵: HP+60%、ATK.SPD+30%、ATK+40%、DEF+30%。" },
    "cc.diffdesc.oblivion": { en: "Floors 601-700. Enemies: +80% HP, +30% ATK.SPD, +50% ATK, +35% DEF.", ja: "フロア601-700。敵: HP+80%、ATK.SPD+30%、ATK+50%、DEF+35%。" },
    "cc.diffdesc.genesis":  { en: "Floors 701-800. Enemies: +100% HP, +50% ATK.SPD, +60% ATK, +40% DEF.", ja: "フロア701-800。敵: HP+100%、ATK.SPD+50%、ATK+60%、DEF+40%。" },
    "cc.diffdesc.apocalypse": { en: "Floors 801-900. Enemies: +130% HP, +60% ATK.SPD, +80% ATK, +45% DEF.", ja: "フロア801-900。敵: HP+130%、ATK.SPD+60%、ATK+80%、DEF+45%。" },
    "cc.diffdesc.omega":    { en: "Floors 901-1000. Enemies: +160% HP, +75% ATK.SPD, +100% ATK, +50% DEF. Final difficulty.", ja: "フロア901-1000。敵: HP+160%、ATK.SPD+75%、ATK+100%、DEF+50%。最終難易度。" },
};

// Passive skill descriptions (character creation)
const SKILL_DESC_KEYS = {
    "Remnant Razor":   "cc.skill.remnantRazor",
    "Titan's Will":    "cc.skill.titansWill",
    "Devastator":      "cc.skill.devastator",
    "Rampager":        "cc.skill.rampager",
    "Blade Dance":     "cc.skill.bladeDance",
    "Paladin's Heart": "cc.skill.paladinsHeart",
    "Aegis Thorns":    "cc.skill.aegisThorns",
    "Blood Tithe":     "cc.skill.bloodTithe",
    "Second Wind":     "cc.skill.secondWind",
    "Adrenaline":      "cc.skill.adrenaline",
    "Executioner":     "cc.skill.executioner",
    "Glass Cannon":    "cc.skill.glassCannon",
    "Iron Will":       "cc.skill.ironWill",
    "Momentum":        "cc.skill.momentum",
    "Leech Lord":      "cc.skill.leechLord",
};
const SKILL_DESC_EN = {
    "Remnant Razor":   "Deal +20% damage. Attacks also deal extra 2% of enemies' current health on hit.",
    "Titan's Will":    "Attacks deal extra 6% of your maximum health on hit.",
    "Devastator":      "Deal 40% more damage but you lose 30% base attack speed.",
    "Rampager":        "Increase attack by 5 after each hit. Stack resets after battle.",
    "Blade Dance":     "Gain +5% ATK.SPD after each hit (beyond the cap). Ability hits count too. Resets after battle.",
    "Paladin's Heart": "You receive 25% less damage permanently.",
    "Aegis Thorns":    "Enemies receive 20% of the damage they dealt.",
    "Blood Tithe":     "Each attack costs 2% of your max HP. Taking damage heals 6% of your max HP.",
    "Second Wind":     "Once per battle, survive a lethal blow at 1 HP and gain 8s invulnerability.",
    "Adrenaline":      "Below 30% HP: +40% ATK.SPD and +20% damage. Once per battle, gain 6s invulnerability.",
    "Executioner":     "Enemies below 66% HP take +33% damage.",
    "Glass Cannon":    "+35% ATK but -25% max HP.",
    "Iron Will":       "Below 80% HP: take 30% less damage. Hidden: DEF level-up bonus +2%.",
    "Momentum":        "Each attack without taking damage grants +3% damage (max +60%). Resets when hit.",
    "Leech Lord":      "Attacks heal 5% of your max HP and deal +5% damage.",
};
for (const [name, key] of Object.entries(SKILL_DESC_KEYS)) {
    STRINGS[key] = { en: SKILL_DESC_EN[name], ja: "" };
}
// Japanese passive descriptions
const SKILL_DESC_JA = {
    "cc.skill.remnantRazor": "与ダメージ+20%。攻撃命中時、敵の現在HPの2%を追加ダメージ。",
    "cc.skill.titansWill": "攻撃命中時、自分の最大HPの6%を追加ダメージ。",
    "cc.skill.devastator": "ダメージ+40%だが、基本攻撃速度-30%。",
    "cc.skill.rampager": "攻撃のたびにATK+5。戦闘終了でリセット。",
    "cc.skill.bladeDance": "攻撃・アビリティの命中ごとにATK.SPD+5%（上限突破）。戦闘終了でリセット。",
    "cc.skill.paladinsHeart": "被ダメージを常時25%軽減。",
    "cc.skill.aegisThorns": "敵が与えたダメージの20%を反射。",
    "cc.skill.bloodTithe": "攻撃ごとに最大HPの2%を消費。被ダメ時に最大HPの6%回復。",
    "cc.skill.secondWind": "1戦闘に1度、致命傷をHP1で耐え、8秒間無敵になる。",
    "cc.skill.adrenaline": "HP30%以下: ATK.SPD+40%、ダメージ+20%。1戦闘に1度、6秒間無敵になる。",
    "cc.skill.executioner": "HP66%以下の敵に与えるダメージ+33%。",
    "cc.skill.glassCannon": "ATK+35%だが最大HP-25%。",
    "cc.skill.ironWill": "HP80%以下: 被ダメージ30%軽減。隠し効果：レベルアップのDEF上昇量+2%。",
    "cc.skill.momentum": "被弾せず攻撃するたびにダメージ+3%（最大+60%）。被弾でリセット。",
    "cc.skill.leechLord": "攻撃命中時に最大HPの5%回復、与ダメージ+5%。",
};
for (const [key, ja] of Object.entries(SKILL_DESC_JA)) {
    STRINGS[key].ja = ja;
}
const skillDescText = (name) => {
    const key = SKILL_DESC_KEYS[name];
    return key ? t(key) : (SKILL_DESC_EN[name] || "");
};

const t = (key) => {
    const s = STRINGS[key];
    if (!s) return key;
    return s[LANG] || s.en;
};
const tParams = (key, params) => {
    let s = t(key);
    for (const k in params) s = s.replace(`{${k}}`, params[k]);
    return s;
};

// ---- Item display localization (rarity + category names) ----
const RARITY_JA = { Common: "コモン", Uncommon: "アンコモン", Rare: "レア", Epic: "エピック", Legendary: "レジェンダリー", Heirloom: "ヒアローム", All: "すべて" };
const CAT_JA = {
    Sword: "ソード", Axe: "アクス", Hammer: "ハンマー", Dagger: "ダガー", Flail: "メイス", Scythe: "サイズ",
    Plate: "プレート", Chain: "チェイン", Leather: "レザー", Tower: "タワー", Kite: "カイト", Buckler: "バックラー",
    "Great Helm": "グレートヘルム", "Horned Helm": "ホーンヘルム",
    Weapon: "武器", Armor: "防具", Shield: "盾", Helmet: "兜",
};
const rarityLabel = (r) => (LANG === "ja" && RARITY_JA[r]) ? RARITY_JA[r] : r;
const catLabel = (c) => (LANG === "ja" && CAT_JA[c]) ? CAT_JA[c] : c;
const itemName = (item) => `${rarityLabel(item.rarity)} ${catLabel(item.category)}`;
const tierLabel = () => (LANG === "ja") ? "ティア" : "Tier";

// Update static DOM labels (elements tagged with data-i18n or known ids)
const applyStaticI18n = () => {
    document.body.dataset.lang = LANG;
    document.querySelectorAll("[data-i18n]").forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        el.title = t(el.dataset.i18nTitle);
    });
    const statsTitle = document.querySelector("#stats-title");
    if (statsTitle) statsTitle.textContent = t("stats.title");
    const bonusBox = document.querySelector("#bonus-stats h4");
    if (bonusBox) bonusBox.textContent = t("bonus.title");
    // Sell-rarity dropdown labels
    document.querySelectorAll("#sell-rarity option, select option").forEach(el => {
        const v = el.value;
        if (RARITY_JA[v]) el.textContent = rarityLabel(v);
    });
    // Dungeon header controls reflect current pause state
    if (typeof dungeon !== "undefined" && dungeonActivity) {
        dungeonActivity.textContent = dungeon.status.paused ? t("dgn.explore") : t("dgn.pause");
        if (typeof loadDungeonProgress === "function") loadDungeonProgress();
        if (typeof dungeonAction !== "undefined" && dungeonAction) {
            dungeonAction.textContent = dungeon.status.paused ? t("dgn.resting") : t("dgn.exploring");
        }
    }
};
