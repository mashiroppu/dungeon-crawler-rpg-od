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
    "name.err.long":        { en: "Name is too long! (max width: 12 'a')", ja: "名前が長すぎます！（最大幅: a12個分）" },

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
    "lvl.reroll":           { en: "Reroll", ja: "リロール" },
    "lvl.statup":           { en: "Increase bonus {s} by {p}%.", ja: "ボーナス{s}を{p}%強化。" },

    // ---- Tips modal ----
    "tips.title":           { en: "Tips & Knowledge", ja: "攻略Tips" },
    "tips.activeSets":      { en: "Active Set Effects", ja: "発動中のセット効果" },
    "tips.noSets":          { en: "No set bonuses active.", ja: "発動中のセットボーナスはありません。" },
    "tipcat.Basics":        { en: "Basics", ja: "基礎" },
    "tipcat.Equipment":     { en: "Equipment", ja: "装備" },
    "tipcat.Combat":        { en: "Combat", ja: "戦闘" },
    "tipcat.Progression":   { en: "Progression", ja: "進行" },

    // ---- Ability loadout ----
    "loadout.title":        { en: "Ability Loadout", ja: "アビリティ編成" },
    "loadout.hint":         { en: "{c} — slot up to {n} abilities", ja: "{c} — 最大{n}つまでセット可能" },
    "loadout.cancel":       { en: "Cancel", ja: "キャンセル" },
    "loadout.confirm":      { en: "Confirm", ja: "決定" },
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

// Update static DOM labels (elements tagged with data-i18n or known ids)
const applyStaticI18n = () => {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    const statsTitle = document.querySelector("#stats-title");
    if (statsTitle) statsTitle.textContent = t("stats.title");
    const bonusBox = document.querySelector("#bonus-stats h4");
    if (bonusBox) bonusBox.textContent = t("bonus.title");
    // Dungeon header controls reflect current pause state
    if (typeof dungeon !== "undefined" && dungeonActivity) {
        dungeonActivity.textContent = dungeon.status.paused ? t("dgn.explore") : t("dgn.pause");
        if (typeof loadDungeonProgress === "function") loadDungeonProgress();
        if (typeof dungeonAction !== "undefined" && dungeonAction) {
            dungeonAction.textContent = dungeon.status.paused ? t("dgn.resting") : t("dgn.exploring");
        }
    }
};
