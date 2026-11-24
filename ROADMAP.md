# Development Roadmap

This file collects planned features and improvements. Remove or mark items
as "Done" once implemented.

> 日本語版: [ROADMAP.ja.md](ROADMAP.ja.md)

## Planned Features

### 1. Ability Expansion

**Status: Planning**

#### Goals

- **Loadout slots: 3 → 6** (`MAX_ABILITY_SLOTS` in `classes.js`) — **6 is the final maximum**
- **Abilities per class: ~20** (currently 6 × 5 classes = 30 → target ~100 total)

#### Design direction

##### Core experience: active selection — "pick the best option for the situation"

- During combat the player **actively chooses one equipped ability to unleash**
- With 3 slots: 1–2 are on cooldown, so the choice is passive — "pick the least bad one"
- With 6 slots: several are usually Ready → the choice becomes **"pick the best move for this moment"**
- This shift is the essence of the strategy upgrade. **Just adding numbers is not enough**

##### Prioritize kits where "the optimal pick changes by situation"

If all 6 slots are damage abilities, the player just presses the biggest nuke
every time and the choice dies. Keep this balance in mind:

| Situation | Abilities that could be optimal |
|---|---|
| Enemy nearly dead | Execute-type (conditional) |
| Fight dragging on | DoT / buffs first (buff → nuke combos) |
| Taking heavy damage | Shield / heal / reflect |
| Enemy is tanky | DEF-ignore / penetration |
| Trash mobs | Multi-hit / AoE |

- **Add more conditional abilities**: bonus below X% HP, bonus while shielded,
  bonus effects while enemy is stunned, etc.
- **Buff → damage combo lines**: e.g. nukes effectively strengthened during
  warcry — design with these synergies in mind
- **Show role tags (nuke / buff / debuff / sustain / defense)** in the UI so
  loadout diversity is visible

#### Implementation notes

##### 1. Data-driven refactor (prerequisite)

`useAbility()` is currently one giant switch. The mechanics collapse into
about 10 patterns:

- nuke (single-target heavy hit)
- dot (damage over time)
- debuff (enemy stat reduction)
- cc (stun / slow / petrify)
- buff (self buff)
- shield / heal (defense & recovery)
- multi-hit
- reflect / thorns
- conditional (situation-triggered)
- summon / field (future)

Refactor the switch into parameter-driven mechanics (a `mech` field, etc.)
before mass-producing abilities. **Avoid reskins — prioritize mechanically
distinct abilities** (copies of the same effect reduce strategic depth).

##### 2. Balance impact (important)

- 3 → 6 slots is a large effective DPS increase → **enemy HP/attack and
  floor scaling must be revisited**
- Tune CD / `uses` / `rec` so "something is always Ready, but not everything
  can be fired" tension is preserved
- Save compatibility: `player.abilityLoadout` is an ID array, so 6 slots is
  compatible — but existing players instantly get 6 slots, so balance shifts
  at once

##### 3. UI/UX

- Combat ability bar grows to 6 buttons → check fit on small screens
- Loadout screen (`showLoadoutModal`) needs 6-slot support
- Consider showing a role tag or short category label on ability descriptions

##### 4. Save data

- `player.abilityLoadout`: ID array → just allow up to 6 entries
- `player.abilityCharges` / `abilityCds` / `abilityRecs`: ID-keyed objects →
  new abilities work as-is
- Old saves with removed IDs are harmless thanks to the
  `unlockedAbilities()` filter

#### Phased rollout

1. Change `MAX_ABILITY_SLOTS` to 6 → feel-test balance
   with the current 6 abilities per class
2. Fine-tune enemy stats / scaling
3. Add 3–4 mechanically distinct abilities per class (~9–10 total) and observe
4. If more are needed, mass-produce via templates toward ~15 → final ~20 per class

#### Per-ability checklist

- Add an entry to `ABILITIES` (cls / lvl / cd / rec / uses / name / desc / icon / mech params)
- Add a `useAbility()` case (after data-driven refactor this is mostly data only)
- Optionally add `ABILITY_FX` / `ABILITY_SFX` entries
- `unlockedAbilities()` auto-unlocks by lvl — no extra work needed

### 2. Language Switching (EN/JA)

**Status: Partially implemented**

- `assets/js/i18n.js` provides `t()` / `setLang()` / `STRINGS`. Toggle via
  Menu → Language (persisted in localStorage `gameLang`)
- Translated: title/character creation (stat allocation, class, passive,
  difficulty, legacy), dungeon header, all dungeon exploration events,
  stats panel, inventory (item names, buttons, dialogs, legacy), all menu
  tabs, level-up, full Tips modal, ability loadout modal, combat & dungeon logs
- **Not yet translated**: ability/enemy names & descriptions (kept in English
  by policy), strings stored inside save data
- Policy: keep proper nouns (ability/enemy/set names) in English; translate
  UI text and descriptions

### 3. (Add future plans here)

- TBD
