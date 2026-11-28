/* ==========================================================================
 * AI Player v2 for Dungeon Crawler on Demand
 * --------------------------------------------------------------------------
 * In-page bot: reads live game state (player/enemy/dungeon globals) and plays
 * through the UI with real decisions — fight evaluation, ability usage and
 * auto-loadout, level-up picks, equipment scoring/equip/sell, blacksmith
 * (gold enhance / crystal rank / ward), stash & legacy, full run automation.
 *
 * Usage (on the game page):
 *   fetch('ai-player.js').then(r=>r.text()).then(eval)   (same origin)
 *   AIPlayer.start()  /  AIPlayer.stop()  /  AIPlayer.cfg to tune
 * ========================================================================== */
(function () {
    "use strict";

    const CFG = {
        // ---- New run build ----
        alloc: { hp: 4, atk: 8, def: 6, atkSpd: 2 },
        cls: "warrior",
        passive: "Second Wind",
        difficulty: "normal",
        legacyCount: 3,

        // ---- Combat ----
        abilities: true,
        fleeBelowHp: 35,
        fleeRiskRatio: 1.0,
        allowFlee: true,
        reviveMinFloor: 15,

        // ---- Economy ----
        blessingMax: 15,
        blessingGoldMult: 2.5,
        totem: true,            // accept cursed totem when rich (better loot)
        totemGoldMult: 4,
        totemMinFloor: 10,      // only offer totem past this floor
        rerollGold: 400,
        maxRerolls: 2,

        // ---- Blacksmith ----
        smith: true,
        wardCrystalReserve: 100,   // buy Crystal Ward whenever affordable
        rankCrystalReserve: 20,    // keep this many crystals for revive/ward
        enhanceGoldReserve: 80000, // only gold-enhance when gold above this
        enhanceMaxTier: 5,         // stop buying gold enhance past this tier

        // ---- Loot ----
        equipMargin: 1.15,
        stashMinScore: 60,
        sellJunkBelow: 25,
        invSoftCap: 12,
        warehouseExpandGold: 250000,

        // ---- Progression ----
        monarchMinLvl: 20,
        monarchMinHp: 75,
    };

    const state = { timer: null, tick: 0, rerolls: 0, lastAbility: {}, runCount: 0, pendingItemAction: null, lastUnequipAt: 0 };

    // ---------- DOM helpers ----------
    const vis = (el) => {
        if (!el) return false;
        const s = getComputedStyle(el);
        return s.display !== "none" && s.visibility !== "hidden" && el.getClientRects().length > 0;
    };
    const qa = (sel) => Array.from(document.querySelectorAll(sel));
    const modalOpen = (sel) => { const m = document.querySelector(sel); return !!(m && vis(m) && m.style.display !== "none"); };
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
    // Score a .legacy-item DOM node by mapping data-i -> carryCandidates()
    function legacyItemScore(el) {
        try {
            const idx = Number(el.dataset.i);
            if (typeof carryCandidates === "function") {
                const c = carryCandidates()[idx];
                if (c && c.item) return itemScore(c.item);
            }
        } catch (e) {}
        const p = el.querySelector("p");
        const r = p ? ({ Heirloom: 4, Legendary: 3, Epic: 2, Rare: 1 })[p.className] ?? 0 : 0;
        return r * 100;
    }

    // ---------- Fight evaluation ----------
    function fightEstimate() {
        const p = player.stats, e = enemy.stats || {};
        const defMit = (d) => 1 - Math.min(0.75, (d || 0) / ((d || 0) + 400));
        const pDps = Math.max(1, (p.atk || 1) * (p.atkSpd || 1) * defMit(e.def));
        const eDps = Math.max(0.5, (e.atk || 1) * (e.atkSpd || 1) * defMit(p.def));
        const ttk = (e.hpMax || e.hp || 1) / pDps;
        const ttd = Math.max(1, (p.hp || p.hpMax || 1)) / eDps;   // uses CURRENT hp
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
        if (ratio > CFG.fleeRiskRatio * 1.6 || (danger >= 60 && ratio > 1.1)) return false;
        if (hpPct() < CFG.fleeBelowHp && ratio > CFG.fleeRiskRatio) return false;
        return true;
    }

    // ---------- Ability auto-loadout ----------
    // Preference order per class; first 3 unlocked get slotted.
    const ABILITY_PREF = {
        warrior: ["warcry", "cleave", "execute", "shield_wall", "temporal_snare", "undying_oath"],
        mage:    ["fireball", "flame_nova", "mana_shield", "stasis", "frostbolt", "petrify"],
        rogue:   ["backstab", "godspeed", "deadly_precision", "fan_of_knives", "thousand_cuts", "venom_dagger"],
        lancer:  ["impale", "sky_piercer", "dragon_fall", "dragon_thrust", "afterimage", "dragon_roar"],
        paladin: ["holy_strike", "sanctuary", "aegis_oath", "divine_judgement", "thorns_nova", "judgment_counter"],
    };
    function syncAbilityLoadout() {
        if (!CFG.abilities || typeof unlockedAbilities !== "function") return;
        const unlocked = unlockedAbilities().map(a => a.id);
        const pref = ABILITY_PREF[playerClassKey()] || [];
        const want = pref.filter(id => unlocked.includes(id)).slice(0, 3);
        const cur = (player.abilityLoadout || []).filter(id => unlocked.includes(id));
        // fill missing slots anyway (engine auto-fills, but explicit is safer)
        for (const id of unlocked) { if (want.length >= 3) break; if (!want.includes(id)) want.push(id); }
        if (want.join() !== cur.join()) {
            player.abilityLoadout = want.slice(0, 3);
            try { saveData(); } catch (e) {}
        }
    }
    function playerClassKey() { try { return (player && CLASSES[player.cls]) ? player.cls : "warrior"; } catch (e) { return "warrior"; } }

    // ---------- Level-up ----------
    const LVL_PREF = ["N.ATK UP", "ATK UP", "ATK.SPD UP", "HP UP", "DEF UP", "C.DMG UP", "C.RATE UP", "VAMP UP", "THORN UP"];
    function handleLevelUp() {
        if (!modalOpen("#lvlupPanel")) { state.rerolls = 0; return; }
        const slots = qa("#lvlSlot0, #lvlSlot1, #lvlSlot2").filter(vis);
        if (!slots.length) return;
        let best = -1, bestRank = 99;
        slots.forEach((s, i) => {
            const h = s.querySelector("h3");
            const name = h ? h.innerText.trim().toUpperCase() : "";
            const rank = LVL_PREF.findIndex(p => name.startsWith(p));
            const r = rank === -1 ? 50 : rank;
            if (r < bestRank) { bestRank = r; best = i; }
        });
        const rerollBtn = document.querySelector("#lvlReroll");
        if (bestRank > 3 && rerollBtn && vis(rerollBtn) && state.rerolls < CFG.maxRerolls && player.gold > CFG.rerollGold) {
            state.rerolls++;
            rerollBtn.click();
            return;
        }
        if (best >= 0) slots[best].click();
    }

    // ---------- Abilities in combat ----------
    function classifyAbility(title) {
        const t = title || "";
        if (/shield|aegis|wall|guard|barrier|oath|sanctuary/i.test(t)) return "def";
        if (/snare|slow|root|stun|freeze|bind|petrify|stasis/i.test(t)) return "cc";
        if (/war cry|warcry|roar|precision|godspeed|fan of/i.test(t)) return "buff";
        if (/execute|judgement|dragon's fall|thousand|finisher/i.test(t)) return "exec"; // hold for low-HP enemies
        return "nuke";
    }
    function enemyHpPct() {
        try {
            const e = enemy.stats || {};
            const max = e.hpMax || 1, cur = e.hp != null ? e.hp : max;
            return (cur / max) * 100;
        } catch (err) { return 100; }
    }
    function handleAbilities() {
        if (!CFG.abilities || !player.inCombat || enemyDeadFlag()) return;
        const now = Date.now();
        const isBoss = !!(enemy && enemy.isBoss);
        const dangerous = enemy && enemy.stats && enemy.stats.atk > (player.stats.atk || 1) * 1.4;
        const eHp = enemyHpPct();
        const fightRatio = fightEstimate().ratio;
        qa(".ability-btn").filter(vis).forEach(btn => {
            const title = btn.title || btn.getAttribute("data-ability") || "";
            const key = title || btn.className;
            const charges = parseInt((btn.innerText || "").match(/x(\d+)/)?.[1] || "1", 10);
            if (charges <= 0) return;
            if (now - (state.lastAbility[key] || 0) < 2200) return;
            const kind = classifyAbility(title);
            const hp = hpPct();
            let use = false;
            if (kind === "def") use = hp < 55 || (isBoss && hp < 80) || fightRatio > 1.3;
            else if (kind === "cc") use = isBoss || dangerous || fightRatio > 0.9 || (enemy && enemy.stats && enemy.stats.atkSpd > (player.stats.atkSpd || 1) * 1.3);
            else if (kind === "exec") use = eHp < 35 || (isBoss && eHp < 60) || fightRatio > 1.5;
            else if (kind === "buff") use = true; // cheap team buffs: use on CD
            else use = isBoss || dangerous || fightRatio > 0.8 || hp < 100; // nukes: nearly always worth a charge
            if (use) { state.lastAbility[key] = now; btn.click(); }
        });
    }
    function enemyDeadFlag() { try { return typeof enemyDead !== "undefined" && enemyDead; } catch (e) { return false; } }
    function playerDeadFlag() { try { return typeof playerDead !== "undefined" && playerDead; } catch (e) { return false; } }

    // ---------- Combat extras ----------
    function handleCombatExtras() {
        if (!player.inCombat) return;
        if (playerDeadFlag()) {
            const rb = document.querySelector("#reviveButton");
            if (vis(rb) && dungeon.progress.floor >= CFG.reviveMinFloor) { rb.click(); return; }
            return;
        }
        if (CFG.allowFlee && !enemyDeadFlag()) {
            const fb = document.querySelector("#fleeButton");
            if (vis(fb) && hpPct() < 20) { fb.click(); return; }
        }
    }

    // ---------- Blacksmith ----------
    // Eligible stats for gold enhance, ranked by our weights
    const ENHANCEABLE = ["hp", "atk", "def", "atkSpd", "critRate", "critDmg"];
    function topEnhanceStats(item, n = 2) {
        const present = new Set();
        for (const st of (item.stats || [])) for (const k in st) present.add(k);
        return ENHANCEABLE.filter(k => present.has(k))
            .sort((a, b) => (STAT_W[b] || 1) - (STAT_W[a] || 1))
            .slice(0, n);
    }
    function handleBlacksmithModal() {
        if (!CFG.smith) return;
        const modal = document.querySelector("#blacksmith-modal");
        if (!modal || !vis(modal)) return;
        // 1) Crystal Ward
        const wardBtn = document.querySelector("#smith-ward-buy");
        if (vis(wardBtn) && !player.crystalWard) { wardBtn.click(); return; }
        // 2) Crystal rank-ups on best equipped item while crystals > reserve
        if ((player.crystals || 0) > CFG.rankCrystalReserve) {
            const eq = (player.equipped || []).map((it, idx) => ({ idx, it, sc: itemScore(it) })).sort((a, b) => b.sc - a.sc);
            if (eq.length) {
                const btn = modal.querySelector(`.smith-rank[data-lvup="eq:${eq[0].idx}"]`);
                if (btn && !btn.disabled) { btn.click(); return; }
            }
        }
        // 3) Gold enhance on a top equipped item when rich
        if (player.gold > CFG.enhanceGoldReserve) {
            const eq = (player.equipped || []).map((it, idx) => ({ idx, it, sc: itemScore(it) })).sort((a, b) => b.sc - a.sc);
            for (const c of eq.slice(0, 3)) {
                if ((c.it.goldTier || 0) >= CFG.enhanceMaxTier) continue;
                const btn = modal.querySelector(`.smith-gold[data-gold="eq:${c.idx}"]`);
                if (btn && !btn.disabled) {
                    state.enhanceItem = c.it;
                    btn.click(); // opens enhance modal next tick
                    return;
                }
            }
        }
        // nothing to do -> close
        const close = document.querySelector("#smith-close");
        if (vis(close)) close.click();
    }
    function handleEnhanceModal() {
        const modal = document.querySelector("#enhance-modal");
        if (!modal || !vis(modal)) return;
        // auto-pick top-2 eligible stats if none chosen
        const item = state.enhanceItem;
        if (item && !(item.goldStats || []).length) {
            const want = topEnhanceStats(item, 2);
            want.forEach(k => {
                const b = modal.querySelector(`.enhance-stat[data-stat="${k}"]`);
                if (b) b.click();
            });
            return; // re-render happens; next tick buys
        }
        const buy = document.querySelector("#enhance-buy");
        const back = document.querySelector("#enhance-back");
        if (vis(buy) && !buy.disabled && player.gold > CFG.enhanceGoldReserve) { buy.click(); return; }
        if (vis(back)) { back.click(); state.enhanceItem = null; }
    }
    // ---------- Dungeon choices ----------
    function handleChoices() {
        const c1 = document.querySelector("#choice1");
        const c2 = document.querySelector("#choice2");
        if (!vis(c1) || !vis(c2)) return;
        const t1 = (c1.innerText || "").trim();
        const t2 = (c2.innerText || "").trim();
        const log = lastLog();

        if (/engage|fight|戦う/i.test(t1) && /flee|逃げる/i.test(t2)) {
            if (shouldEngage()) c1.click(); else c2.click();
            return;
        }
        if (/open the chest|宝箱を開ける/i.test(t1)) { c1.click(); return; }
        if (/offer|捧げる/i.test(t1) && /ignore|無視/i.test(t2)) {
            if (/blessing|祝福/i.test(log)) {
                const bless = player.blessing || 1;
                const cost = bless * (500 * (bless * 0.5)) + 750;
                if (bless < CFG.blessingMax && player.gold > cost * CFG.blessingGoldMult) c1.click(); else c2.click();
            } else if (/curse|呪い|totem/i.test(log)) {
                const curseLvl = Math.round(((dungeon.settings.enemyScaling || 1) - 1) * 10);
                const cost = curseLvl * (10000 * (curseLvl * 0.5)) + 5000;
                if (CFG.totem && dungeon.progress.floor >= CFG.totemMinFloor && player.gold > cost * CFG.totemGoldMult) c1.click(); else c2.click();
            } else c2.click();
            return;
        }
        if (/enter|進む/i.test(t1) && /ignore|無視/i.test(t2)) {
            if (/mysterious|謎の部屋/i.test(log)) {
                if ((player.lvl || 1) >= CFG.monarchMinLvl && hpPct() >= CFG.monarchMinHp && player.stats.hpMax > 800) c1.click();
                else c2.click();
            } else if (/wayside cache|物置/i.test(log)) {
                c1.click();
            } else if (/blacksmith|鍛冶屋/i.test(log)) {
                c1.click(); // visit blacksmith now
            } else {
                c1.click();
            }
            return;
        }
        if (/open cache|物置を開ける/i.test(t1)) { c1.click(); return; }
        if (/visit the blacksmith|鍛冶屋を訪ねる/i.test(t1)) { c1.click(); return; }
        c1.click();
    }

    // ---------- Stash modal ----------
    function handleStashModal() {
        const modal = document.querySelector("#defaultModal");
        if (!modal || modal.style.display === "none" || !vis(modal) || !modal.querySelector("#stash-close")) return;
        const items = qa(".legacy-item").filter(vis);
        let best = null, bestScore = -1e9;
        items.forEach(el => { const s = legacyItemScore(el); if (s > bestScore) { bestScore = s; best = el; } });
        if (best && bestScore > CFG.stashMinScore && (player.storage || []).length < 20) {
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
        let best = items[0], bestScore = -1e9;
        items.forEach(el => { const s = legacyItemScore(el); if (s > bestScore) { bestScore = s; best = el; } });
        best.click();
        const send = document.querySelector("#legacy-send");
        if (vis(send)) send.click();
    }

    // ---------- Item info modal ----------
    function handleItemInfo() {
        const info = document.querySelector("#equipmentInfo");
        if (!info || info.style.display === "none" || !vis(info)) return;
        if (state.pendingItemAction) {
            const act = state.pendingItemAction; state.pendingItemAction = null;
            const btn = document.querySelector(act === "sell" ? "#sell-equip" : act === "close" ? "#close-item-info" : "#un-equip");
            if (act === "sell") {
                if (btn) btn.click();
                setTimeout(() => { const cf = document.querySelector("#sell-confirm"); if (vis(cf)) cf.click(); }, 300);
            } else if (btn) btn.click();
            return;
        }
        const close = document.querySelector("#close-item-info");
        if (vis(close)) close.click();
    }

    // ---------- Equipment manager ----------
    function manageEquipment() {
        if (player.inCombat || dungeon.status.event) return;
        if (modalOpen("#equipmentInfo") || modalOpen("#defaultModal") || modalOpen("#lvlupPanel") || modalOpen("#blacksmith-modal") || modalOpen("#enhance-modal")) return;
        if (Date.now() - state.lastUnequipAt < 3000) return;
        const inv = (player.inventory.equipment || []).map((s, i) => ({ i, item: parseItem(s), raw: s })).filter(x => x.item);
        if (!inv.length) return;
        inv.sort((a, b) => itemScore(b.item) - itemScore(a.item));
        const best = inv[0];
        const bestSc = itemScore(best.item);
        const eq = (player.equipped || []).map(it => ({ it, sc: itemScore(it) })).sort((a, b) => a.sc - b.sc);
        const slotsFree = (player.equipped || []).length < 6;

        if (slotsFree && bestSc > 10) {
            const domItems = qa("#playerInventory .items");
            if (domItems[best.i]) { domItems[best.i].click(); state.pendingItemAction = "equip"; return; }
        }
        if (!slotsFree && eq.length) {
            const worst = eq[0];
            if (bestSc > worst.sc * CFG.equipMargin) {
                const domEq = qa("#playerEquipment .items");
                const idx = (player.equipped || []).indexOf(worst.it);
                if (domEq[idx]) { domEq[idx].click(); state.pendingItemAction = "unequip"; state.lastUnequipAt = Date.now(); return; }
            }
        }
        if (inv.length > CFG.invSoftCap && player.gold < 3000) {
            const junk = inv.filter(x => x.item.rarity === "Common").sort((a, b) => itemScore(a.item) - itemScore(b.item))[0];
            if (junk && itemScore(junk.item) < CFG.sellJunkBelow) {
                const domItems = qa("#playerInventory .items");
                if (domItems[junk.i]) { domItems[junk.i].click(); state.pendingItemAction = "sell"; return; }
            }
        }
        state.pendingItemAction = null;
    }

    // ---------- Warehouse expand ----------
    function handleWarehouse() {
        if (player.gold > CFG.warehouseExpandGold && storageMax && storageMax() < 160) {
            const btn = document.getElementById("warehouse-expand");
            if (vis(btn) && !btn.disabled) btn.click();
        }
    }

    // ---------- Explore control ----------
    function handleExplore() {
        const ex = document.getElementById("dungeonActivity");
        if (!vis(ex)) return;
        const label = (ex.innerText || "").trim();
        if (/explore|探索/i.test(label) && dungeon.status.paused) ex.click();
    }

    // ---------- Title / run setup ----------
    function handleTitle() {
        const tap = Array.from(document.querySelectorAll("p, div, span, a"))
            .find(e => vis(e) && e.children.length < 3 && /tap to explore|ダンジョンを探索/i.test(e.innerText || ""));
        if (tap) { tap.click(); state.runCount++; return true; }
        return false;
    }
    function handleRunSetup() {
        const confirm = document.querySelector("#allocate-confirm");
        if (!vis(confirm)) return false;
        const map = { hp: "hpAdd", atk: "atkAdd", def: "defAdd", atkSpd: "atkSpdAdd" };
        for (const k in CFG.alloc) {
            const btn = document.getElementById(map[k]);
            for (let i = 0; i < CFG.alloc[k]; i++) if (btn) btn.click();
        }
        const set = (id, val) => { const s = document.getElementById(id); if (s) { s.value = val; s.dispatchEvent(new Event("change", { bubbles: true })); } };
        set("select-class", CFG.cls);
        set("select-skill", CFG.passive);
        set("select-difficulty", CFG.difficulty);
        const items = qa(".legacy-item").filter(vis);
        items.map(el => ({ el, sc: legacyItemScore(el) }))
            .sort((a, b) => b.sc - a.sc)
            .slice(0, CFG.legacyCount)
            .forEach(x => x.el.click());
        confirm.click();
        return true;
    }

    // ---------- Confirmation modal (curse accept etc.) ----------
    function handleConfirmModal() {
        const m = document.querySelector("#confirmationModal");
        if (!m || m.style.display === "none" || !vis(m)) return false;
        const yes = document.querySelector("#curse-confirm");
        const no = document.querySelector("#curse-cancel");
        if (vis(yes)) { yes.click(); return true; }
        if (vis(no)) { no.click(); return true; }
        return false; // unrelated confirm (e.g. import) — don't block the loop
    }

    // ---------- Main loop ----------
    function tick() {
        try {
            if (typeof player === "undefined" || typeof dungeon === "undefined") return;
            if (handleTitle()) return;
            if (handleRunSetup()) return;
            syncAbilityLoadout();
            // stash modal first (has #stash-close), then death legacy
            if (modalOpen("#defaultModal") && document.querySelector("#defaultModal #stash-close")) { handleStashModal(); return; }
            if (qa(".legacy-item").some(vis) && document.querySelector("#legacy-send")) { handleDeath(); return; }
            handleLevelUp();
            handleBlacksmithModal();
            handleEnhanceModal();
            handleItemInfo();
            handleConfirmModal();
            handleCombatExtras();
            handleAbilities();
            const bb = document.querySelector("#battleButton");
            if (vis(bb) && !player.inCombat) { bb.click(); return; }
            handleChoices();
            manageEquipment();
            handleWarehouse();
            handleExplore();
        } catch (e) { /* never let the bot crash the game */ }
    }

    const API = {
        cfg: CFG,
        state,
        start() {
            if (state.timer) return "already running";
            state.timer = setInterval(tick, 350);
            return "AI player v2 started";
        },
        stop() { if (state.timer) { clearInterval(state.timer); state.timer = null; } return "stopped"; },
        stats() { return { ...state, timer: !!state.timer }; },
    };
    window.AIPlayer = API;
    console.log("[AIPlayer v2] loaded. AIPlayer.start() to begin.");
})();
