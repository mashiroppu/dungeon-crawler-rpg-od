/* ==========================================================================
 * AI Player for Dungeon Crawler on Demand
 * --------------------------------------------------------------------------
 * In-page bot: reads the live game state (player/enemy/dungeon globals) and
 * plays through the UI with real decisions — engage/flee evaluation, ability
 * usage, level-up picks, loot/equip management, economy rules, death legacy.
 *
 * Usage (on the game page, e.g. GitHub Pages or local server):
 *   1) Paste this whole file into DevTools console, or
 *   2) fetch('ai-player.js').then(r=>r.text()).then(eval)   (same origin)
 * Then:  AIPlayer.start()
 * Stop:  AIPlayer.stop()
 * Tune:  edit AIPlayer.cfg before start(), e.g. AIPlayer.cfg.passive="Second Wind"
 * ========================================================================== */
(function () {
    "use strict";

    const CFG = {
        // ---- New run build ----
        alloc: { hp: 4, atk: 8, def: 6, atkSpd: 2 },   // 20 stat points
        cls: "warrior",
        passive: "Second Wind",
        difficulty: "normal",
        legacyCount: 3,                               // items carried from storage

        // ---- Combat ----
        abilities: true,
        fleeBelowHp: 35,        // % HP — flee normal fights under this if risky
        fleeRiskRatio: 1.0,     // ttk/ttd above this => fight is dangerous
        allowFlee: true,        // use the 60s mid-combat flee when losing
        reviveMinFloor: 15,     // spend crystals on revive only past this floor

        // ---- Economy ----
        blessingMax: 12,        // stop buying blessings past this level
        blessingGoldMult: 3,    // need gold > cost*this to offer
        totem: false,           // accept cursed totem? (harder enemies, better loot)
        totemGoldMult: 6,
        rerollGold: 400,        // min gold to reroll level-up options
        maxRerolls: 2,

        // ---- Loot ----
        equipMargin: 1.15,      // new item must beat worst equipped by this factor
        stashMinScore: 60,      // stash items scoring above this
        sellJunkBelow: 25,      // sell Commons below this score when inventory bloated
        invSoftCap: 12,

        // ---- Progression targets (for monarch / deep pushes) ----
        monarchMinLvl: 20,
        monarchMinHp: 75,
    };

    const state = { timer: null, tick: 0, rerolls: 0, lastAbility: {}, runCount: 0 };

    // ---------- DOM helpers ----------
    const vis = (el) => el && el.offsetParent !== null;
    const qa = (sel) => Array.from(document.querySelectorAll(sel));
    const modalOpen = (sel) => { const m = document.querySelector(sel); return m && m.style.display !== "none" && vis(m); };
    const clickBtn = (re) => {
        const b = qa("button").find(x => vis(x) && re.test((x.innerText || "").trim()));
        if (b) { b.click(); return true; }
        return false;
    };
    const lastLog = () => (dungeon.backlog || []).slice(-3).join("\n");
    const hpPct = () => player.stats.hpMax ? (player.stats.hp / player.stats.hpMax) * 100 : 100;

    // ---------- Item scoring ----------
    const STAT_W = {
        hp: 1, atk: 3.2, def: 1.6, atkSpd: 45, vamp: 10, critRate: 12,
        critDmg: 4, thorns: 6, hpPct: 70, atkPct: 100, defPct: 70, penPct: 45,
        dodge: 45, goldFind: 4, expFind: 8, cdr: 18, abUse: 15, normAtkPct: 8,
    };
    const RARITY_W = { Common: 0, Rare: 12, Epic: 30, Legendary: 55, Heirloom: 80 };
    const SPECIAL_AFFIX = /siphon|warded|fury|rapid|surge|oath|viper|vampThorns|healSurge|bloodOath|hpRegen|opener|flourish|hunterMark|critHeal|attackInvuln|hpTradeDmg|fullHpDmg|lowHpDmg|burst/i;

    function itemScore(it) {
        if (!it) return -999;
        let sc = 0;
        for (const st of (it.stats || [])) {
            if (typeof st !== "object") continue;
            for (const k in st) sc += (STAT_W[k] || 1.5) * (st[k] || 0);
        }
        for (const af of (it.affixes || [])) {
            const key = af.stat || af.key || af.name || "";
            sc += SPECIAL_AFFIX.test(key) ? 70 : 18;
        }
        sc += RARITY_W[it.rarity] || 0;
        sc += ((it.lvl || 1) - (it.lvBase || 1)) * 2;
        if (it.finalized) sc += 40;
        return sc;
    }
    const parseItem = (raw) => { try { return typeof raw === "string" ? JSON.parse(raw) : raw; } catch (e) { return null; } };

    // ---------- Fight evaluation ----------
    function fightEstimate() {
        const p = player.stats, e = enemy.stats || {};
        const pDps = Math.max(1, (p.atk || 1) * (p.atkSpd || 1));
        const eDps = Math.max(0.5, (e.atk || 1) * (e.atkSpd || 1));
        const ttk = (e.hpMax || e.hp || 1) / pDps;          // seconds to kill (def ignored)
        const ttd = (p.hpMax || 1) / eDps;                  // seconds to die (def ignored)
        return { ttk, ttd, ratio: ttk / Math.max(0.1, ttd) };
    }
    function modDanger() {
        const mods = (enemy && enemy.mods) || [];
        let d = 0;
        if (mods.includes("volatile")) d += 30;
        if (mods.includes("frenzy")) d += 15;
        if (mods.includes("regenerating")) d += 12;
        if (mods.includes("vampiric")) d += 12;
        if (mods.includes("burning")) d += 8;
        if (mods.includes("armored")) d += 10;
        if (enemy && enemy.elite) d += 20;
        if (enemy && enemy.isBoss) d += 40;
        return d;
    }
    function shouldEngage() {
        const { ratio } = fightEstimate();
        const danger = modDanger();
        // Obviously losing: flee (50% chance; fail = forced fight anyway)
        if (ratio > CFG.fleeRiskRatio * 1.6 || danger >= 60 && ratio > 1.1) return false;
        // Low HP + risky fight: bail out
        if (hpPct() < CFG.fleeBelowHp && ratio > CFG.fleeRiskRatio) return false;
        return true;
    }

    // ---------- Level-up ----------
    const LVL_PREF = ["N.ATK UP", "ATK UP", "ATK.SPD UP", "HP UP", "DEF UP", "C.DMG UP", "C.RATE UP", "VAMP UP", "THORN UP"];
    function handleLevelUp() {
        if (!modalOpen("#lvlupPanel")) { state.rerolls = 0; return; }
        const slots = qa("#lvlSlot0, #lvlSlot1, #lvlSlot2").filter(vis);
        if (!slots.length) return;
        // find best slot by preference
        let best = -1, bestRank = 99;
        slots.forEach((s, i) => {
            const h = s.querySelector("h3");
            const name = h ? h.innerText.trim().toUpperCase() : "";
            const rank = LVL_PREF.findIndex(p => name.startsWith(p));
            const r = rank === -1 ? 50 : rank;
            if (r < bestRank) { bestRank = r; best = i; }
        });
        // reroll if nothing good and rich
        const rerollBtn = document.querySelector("#lvlReroll");
        if (bestRank > 3 && rerollBtn && vis(rerollBtn) && state.rerolls < CFG.maxRerolls && player.gold > CFG.rerollGold) {
            state.rerolls++;
            rerollBtn.click();
            return;
        }
        if (best >= 0) slots[best].click();
    }

    // ---------- Abilities ----------
    function classifyAbility(title) {
        const t = title || "";
        if (/shield|aegis|wall|guard|barrier|oath/i.test(t)) return "def";
        if (/snare|slow|root|stun|freeze|bind|nova.*slow/i.test(t)) return "cc";
        return "dmg";
    }
    function handleAbilities() {
        if (!CFG.abilities || !player.inCombat || enemyDeadFlag()) return;
        const now = Date.now();
        qa(".ability-btn").filter(vis).forEach(btn => {
            const title = btn.title || btn.getAttribute("data-ability") || "";
            const key = title || btn.className;
            const charges = parseInt((btn.innerText || "").match(/x(\d+)/)?.[1] || "1", 10);
            if (charges <= 0) return;
            if (now - (state.lastAbility[key] || 0) < 2500) return;
            const kind = classifyAbility(title);
            const hp = hpPct();
            const isBoss = enemy && enemy.isBoss;
            const dangerous = enemy && enemy.stats && enemy.stats.atk > (player.stats.atk || 1) * 1.5;
            let use = false;
            if (kind === "def") use = hp < 60 || (isBoss && hp < 80);
            else if (kind === "cc") use = isBoss || dangerous || (enemy && enemy.stats && enemy.stats.atkSpd > (player.stats.atkSpd || 1) * 1.4);
            else use = isBoss || hp < 100 || fightEstimate().ratio > 0.7; // nuke: bosses, losing fights, otherwise on CD vs tough foes
            // don't waste nukes on trivial mobs unless off CD anyway — allow, charges regenerate
            if (use) { state.lastAbility[key] = now; btn.click(); }
        });
    }
    function enemyDeadFlag() {
        try { return typeof enemyDead !== "undefined" && enemyDead; } catch (e) { return false; }
    }
    function playerDeadFlag() {
        try { return typeof playerDead !== "undefined" && playerDead; } catch (e) { return false; }
    }

    // ---------- Combat extras: flee / revive ----------
    function handleCombatExtras() {
        if (!player.inCombat) return;
        if (playerDeadFlag()) {
            const rb = document.querySelector("#reviveButton");
            if (vis(rb) && dungeon.progress.floor >= CFG.reviveMinFloor) { rb.click(); return; }
            const bm = document.querySelector("#battleButton");
            // don't auto "back to menu" — let death flow handle legacy
            return;
        }
        if (CFG.allowFlee && !enemyDeadFlag()) {
            const fb = document.querySelector("#fleeButton");
            if (vis(fb) && hpPct() < 20) { fb.click(); return; }
        }
    }

    // ---------- Dungeon choices ----------
    function handleChoices() {
        const c1 = document.querySelector("#choice1");
        const c2 = document.querySelector("#choice2");
        if (!vis(c1) || !vis(c2)) return;
        const t1 = (c1.innerText || "").trim();
        const t2 = (c2.innerText || "").trim();
        const log = lastLog();

        // Engage / Flee
        if (/engage|fight|戦う/i.test(t1) && /flee|逃げる/i.test(t2)) {
            if (shouldEngage()) c1.click(); else c2.click();
            return;
        }
        // Open chest
        if (/open the chest|宝箱を開ける/i.test(t1)) { c1.click(); return; }
        // Offer / Ignore — blessing vs totem
        if (/offer|捧げる/i.test(t1) && /ignore|無視/i.test(t2)) {
            if (/blessing|祝福/i.test(log)) {
                const bless = player.blessing || 1;
                const cost = bless * (500 * (bless * 0.5)) + 750;
                if (bless < CFG.blessingMax && player.gold > cost * CFG.blessingGoldMult) c1.click(); else c2.click();
            } else if (/curse|呪い|totem/i.test(log)) {
                const curseLvl = Math.round(((dungeon.settings.enemyScaling || 1) - 1) * 10);
                const cost = curseLvl * (10000 * (curseLvl * 0.5)) + 5000;
                if (CFG.totem && player.gold > cost * CFG.totemGoldMult) c1.click(); else c2.click();
            } else c2.click();
            return;
        }
        // Enter / Ignore — door, boss door, mysterious chamber, stash, blacksmith
        if (/enter|進む/i.test(t1) && /ignore|無視/i.test(t2)) {
            if (/mysterious|謎の部屋/i.test(log)) {
                // Dungeon Monarch — only when well-geared
                if ((player.lvl || 1) >= CFG.monarchMinLvl && hpPct() >= CFG.monarchMinHp && player.stats.hpMax > 800) c1.click();
                else c2.click();
            } else if (/wayside cache|物置/i.test(log)) {
                c1.click(); // open stash modal (handled separately)
            } else if (/blacksmith|鍛冶屋/i.test(log)) {
                c2.click(); // v1: skip blacksmith
            } else {
                c1.click(); // doors & boss door: always advance
            }
            return;
        }
        // Stash / Ignore (Open cache)
        if (/open cache|物置を開ける/i.test(t1)) { c1.click(); return; }
        // Visit / Ignore (blacksmith)
        if (/visit the blacksmith|鍛冶屋を訪ねる/i.test(t1)) { c2.click(); return; }
        // generic fallback: take first choice unless it looks like flee
        c1.click();
    }

    // ---------- Stash modal ----------
    function handleStashModal() {
        const modal = document.querySelector("#defaultModal");
        if (!modal || modal.style.display === "none" || !modal.innerHTML.includes("legacy-item")) return;
        const items = qa(".legacy-item", ).length ? qa(".legacy-item") : [];
        // pick best candidate by rarity class + name
        const rarityRank = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Heirloom: 4 };
        let best = null, bestScore = -1;
        items.forEach(el => {
            const p = el.querySelector("p");
            const cls = p ? p.className : "";
            const sc = rarityRank[cls] ?? 0;
            if (sc > bestScore) { bestScore = sc; best = el; }
        });
        // only stash if we have a decent item and storage isn't full
        if (best && bestScore >= 2 && (player.storage || []).length < 20) {
            best.click();
            const send = document.querySelector("#stash-send");
            if (vis(send)) send.click();
        }
        const close = document.querySelector("#stash-close");
        if (vis(close)) close.click();
    }

    // ---------- Death / legacy modal ----------
    function handleDeath() {
        const items = qa(".legacy-item").filter(vis);
        if (!items.length) return;
        // choose best by rarity class
        const rarityRank = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Heirloom: 4 };
        let best = items[0], bestScore = -1;
        items.forEach(el => {
            const p = el.querySelector("p");
            const sc = p ? (rarityRank[p.className] ?? 0) : 0;
            if (sc > bestScore) { bestScore = sc; best = el; }
        });
        best.click();
        const send = Array.from(document.querySelectorAll("button")).find(b => vis(b) && /send to storage|倉庫/i.test(b.innerText || ""));
        if (send) send.click();
        state.deathHandled = true;
    }

    // ---------- Item info modal (equip/sell decisions) ----------
    function handleItemInfo() {
        const info = document.querySelector("#equipmentInfo");
        if (!info || info.style.display === "none" || !vis(info)) return;
        // figure out which item this is: it's the last clicked; we track via index is hard.
        // Instead: read displayed stats? Simpler — we only open this modal ourselves in equip flow.
        // If user/bot opened it, just close unless we flagged an action.
        if (state.pendingItemAction) {
            const act = state.pendingItemAction; state.pendingItemAction = null;
            const btn = document.querySelector(act === "sell" ? "#sell-equip" : act === "close" ? "#close-item-info" : "#un-equip");
            if (act === "sell") {
                if (btn) btn.click();
                // confirm sell modal
                setTimeout(() => { const cf = document.querySelector("#sell-confirm"); if (vis(cf)) cf.click(); }, 300);
            } else if (btn) btn.click();
            return;
        }
        const close = document.querySelector("#close-item-info");
        if (vis(close)) close.click();
    }

    // ---------- Equipment manager ----------
    function equippedScores() {
        return (player.equipped || []).map(it => ({ it, sc: itemScore(it) }));
    }
    function manageEquipment() {
        if (player.inCombat || dungeon.status.event) return;
        if (modalOpen("#equipmentInfo") || modalOpen("#defaultModal") || modalOpen("#lvlupPanel")) return;
        const inv = (player.inventory.equipment || []).map((s, i) => ({ i, item: parseItem(s), raw: s })).filter(x => x.item);
        if (!inv.length) return;
        const eq = equippedScores();
        const slotsFree = (player.equipped || []).length < 6;

        // best inventory candidate
        inv.sort((a, b) => itemScore(b.item) - itemScore(a.item));
        const best = inv[0];
        const bestSc = itemScore(best.item);

        if (slotsFree && bestSc > 10) {
            // click the DOM element for this inventory index, then Equip
            const domItems = qa("#playerInventory .items");
            if (domItems[best.i]) {
                domItems[best.i].click();
                state.pendingItemAction = "equip";
                return;
            }
        }
        if (!slotsFree && eq.length) {
            eq.sort((a, b) => a.sc - b.sc);
            const worst = eq[0];
            if (bestSc > worst.sc * CFG.equipMargin) {
                // unequip worst first (next tick equips)
                const domEq = qa("#playerEquipment .items");
                const idx = (player.equipped || []).indexOf(worst.it);
                if (domEq[idx]) {
                    domEq[idx].click();
                    state.pendingItemAction = "unequip";
                    return;
                }
            }
        }
        // junk sell: too many items, sell lowest-score Common
        if (inv.length > CFG.invSoftCap && player.gold < 3000) {
            const junk = inv.filter(x => x.item.rarity === "Common").sort((a, b) => itemScore(a.item) - itemScore(b.item))[0];
            if (junk && itemScore(junk.item) < CFG.sellJunkBelow) {
                const domItems = qa("#playerInventory .items");
                if (domItems[junk.i]) {
                    domItems[junk.i].click();
                    state.pendingItemAction = "sell";
                    return;
                }
            }
        }
        state.pendingItemAction = "equip"; // clear stale flag
        state.pendingItemAction = null;
    }

    // ---------- Explore control ----------
    function handleExplore() {
        const ex = document.getElementById("dungeonActivity");
        if (!vis(ex)) return;
        const label = (ex.innerText || "").trim();
        // ensure we are exploring (not paused)
        if (/explore|探索/i.test(label) && dungeon.status.paused) ex.click();
    }

    // ---------- New run / title ----------
    function handleTitle() {
        // Death -> back to menu -> title screen -> restart run automatically
        const tap = Array.from(document.querySelectorAll("p, div, span, a"))
            .find(e => vis(e) && e.children.length < 3 && /tap to explore|ダンジョンを探索/i.test(e.innerText || ""));
        if (tap) { tap.click(); state.runCount++; return true; }
        return false;
    }

    function handleRunSetup() {
        const confirm = document.querySelector("#allocate-confirm");
        if (!vis(confirm)) return false;
        // stats
        const map = { hp: "hpAdd", atk: "atkAdd", def: "defAdd", atkSpd: "atkSpdAdd" };
        for (const k in CFG.alloc) {
            const btn = document.getElementById(map[k]);
            for (let i = 0; i < CFG.alloc[k]; i++) if (btn) btn.click();
        }
        // class / passive / difficulty
        const set = (id, val) => { const s = document.getElementById(id); if (s) { s.value = val; s.dispatchEvent(new Event("change", { bubbles: true })); } };
        set("select-class", CFG.cls);
        set("select-skill", CFG.passive);
        set("select-difficulty", CFG.difficulty);
        // legacy items: pick top-N by rarity
        const rarityRank = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Heirloom: 4 };
        const items = qa(".legacy-item").filter(vis);
        items.map(el => ({ el, sc: rarityRank[el.querySelector("p")?.className] ?? 0 }))
            .sort((a, b) => b.sc - a.sc)
            .slice(0, CFG.legacyCount)
            .forEach(x => x.el.click());
        confirm.click();
        return true;
    }

    // ---------- Main loop ----------
    function tick() {
        try {
            if (typeof player === "undefined" || typeof dungeon === "undefined") return;
            // 1. title / run setup (highest priority — nothing else works without a run)
            if (handleTitle()) return;
            if (handleRunSetup()) return;
            // 3. stash modal (defaultModal with #stash-close) — must precede generic legacy-item death check
            if (modalOpen("#defaultModal") && document.querySelector("#defaultModal #stash-close")) { handleStashModal(); return; }
            // 4. death legacy modal (.legacy-item + Send to Storage / Lose All)
            if (qa(".legacy-item").some(vis) && Array.from(document.querySelectorAll("button")).some(b => vis(b) && /send to storage|lose all|倉庫|すべて失う/i.test(b.innerText || ""))) { handleDeath(); return; }
            // 4. level-up
            handleLevelUp();
            // 5. item info modal
            handleItemInfo();
            // 6. combat decisions
            handleCombatExtras();
            handleAbilities();
            // 7. dungeon choices
            handleChoices();
            // 8. equipment management (idle moments)
            manageEquipment();
            // 9. keep exploring
            handleExplore();
        } catch (e) { /* never let the bot crash the game */ }
    }

    const API = {
        cfg: CFG,
        state,
        start() {
            if (state.timer) return "already running";
            state.timer = setInterval(tick, 350);
            return "AI player started (" + JSON.stringify({ cls: CFG.cls, passive: CFG.passive, diff: CFG.difficulty }) + ")";
        },
        stop() { if (state.timer) { clearInterval(state.timer); state.timer = null; } return "stopped"; },
        stats() { return { ...state, timer: !!state.timer }; },
    };
    window.AIPlayer = API;
    console.log("[AIPlayer] loaded. Run AIPlayer.start() to begin, AIPlayer.cfg to tune.");
})();
