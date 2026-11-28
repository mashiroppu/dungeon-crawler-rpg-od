# Dungeon Crawler RPG OD

https://mashiroppu.github.io/dungeon-crawler-rpg-od/

A browser-based roguelite dungeon crawler. Climb 1000 floors of procedurally
generated dungeons across 10 difficulty tiers, loot Diablo-style equipment,
and build your perfect run.
No build step required — just open `index.html`.

> 日本語版: [README.ja.md](README.ja.md)

## Features

### Classes
Choose one of five classes at character creation. Each class has unique
stat scaling and its own set of unlockable abilities:

| Class | Role | Bonuses |
|---|---|---|
| **Warrior** | Frontline tank | +25% HP, +10% ATK, +20% DEF |
| **Mage** | Glass cannon | +15% ATK, +25% C.DMG, +5% C.RATE |
| **Rogue** | Speedster | +30% ATK.SPD, +12% C.RATE |
| **Lancer** | Reach fighter | +20% ATK.SPD, +8% ATK, +5% DEF |
| **Paladin** | Holy defender | +30% HP, +25% DEF — reflect, shields, heals |

### Abilities
Each class has 6 abilities unlocked by level, shown on the ability bar
during combat. Abilities use a charge + cooldown + recovery system and
cover nukes, multi-hit, damage-over-time, crowd control, buffs, shields,
and heals. Up to 3 abilities can be slotted in the loadout.
**P1–P3 presets** save your ability picks plus currently equipped gear
(by reference — items are moved, never duplicated).

### Equipment & Loot
- 6 equipment rarities: Common, Uncommon, Rare, Epic, Legendary, Heirloom
- 6 equipment slots
- **Affixes** (Rare+): bonus stats such as ATK%, HP%, DEF%, ATK.SPD%,
  VAMP, C.RATE, C.DMG, **PEN** (armor penetration), **THORN** (damage
  reflect), **DODGE**, **G.FIND** (gold find), **E.FIND** (EXP find),
  **N.ATK** (normal-attack damage), and hidden stats
- **Set bonuses**: 20 equipment sets with hidden 2-piece/4-piece bonuses.
  Set effects are not shown in the stats panel — check the **TIP** menu
  for currently active set effects

### Enemies
- **Elites**: empowered monsters with boosted stats and guaranteed drops
- **Modifiers**: enemies can spawn with traits like Burning, Frenzy,
  Vampiric, Regenerating, Armored, and Volatile (explodes on death).
  Their tags appear in red at the encounter, before battle starts

### Progression
- **200 floors / 10 difficulty tiers** — NORMAL, HARD, TERROR, ABYSS,
  INFERNO, ECLIPSE, OBLIVION, GENESIS, APOCALYPSE, OMEGA. Difficulty rises
  every 20 floors; defeat the band-end Guardian to unlock the next tier.
  Each difficulty starts at its band's first floor (e.g. HARD = floor 21).
  Clearing OMEGA (floor 200) extends the dungeon by 20 floors per NG+
  cycle (NG+1 cap = floor 220, NG+2 = 240, ...) — enemies and rewards
  scale up each cycle, endlessly
- Level cap 500. Level up by choosing 1 of 3 stat boosts (with rerolls);
  rare picks include **N.ATK** (+6% normal attack damage, ~20% drop rate,
  cap 300%) and **THORN** (damage reflect, cap 10%)
- **Revive**: once per 100-floor band, spend your entire gold purse
  (minimum 500,000) to revive mid-battle — the enemy is finished
- **Warehouse**: wayside caches every 5 floors let you stash 1 item per
  floor (up to 20 per band). Capacity starts at 20 and expands ×2
  (40→80→160) for 200k gold each; contents persist between runs
- Death ends your run — on death you may send ONE item into the warehouse;
  everything else from the run is lost
- Rename your character from Menu → Statistics

### Extras
- **TIP menu**: in-game knowledge base (stats, affixes, combat,
  progression, systems) with a category index, plus your active set effects
- Grid-room animated battle backdrop
- **Language toggle**: Menu → Language switches English / 日本語

## How to Play

1. Open `index.html` in any modern browser (or serve the folder with any
   static file server).
2. Enter a character name, allocate stat points, pick a class and passive,
   then descend.

## Planned

See [ROADMAP.md](ROADMAP.md) for upcoming features — currently the
ability overhaul: 6 loadout slots (final maximum), ~18 abilities per class,
data-driven ability definitions, and balance notes.

## Tech

Plain HTML/CSS/JavaScript — no framework, no build step. Audio via
[Howler.js](https://howlerjs.com/).

## Credits

- [Aekashics](https://aekashics.itch.io/) — Monster sprites
- [Leohpaz](https://leohpaz.itch.io/) — RPG SFX
- [phoenix1291](https://phoenix1291.itch.io/sound-effects-pack-2) — Level up SFX
- [Leviathan_Music](https://soundcloud.com/leviathan254) — Battle music
- [Sara Garrard](https://sonatina.itch.io/letsadventure) — Dungeon music
- [ぴぽや倉庫](https://pipoya.net/) — Effect animations
- [rute (shelf somewhere anybody)](https://sites.google.com/view/shelf-somewhere-anybody/) — Effect animations
- [効果音ラボ](https://soundeffect-lab.info/) — Sound effects
- [OtoLogic](https://otologic.jp/) — Sound effects
- [TheManki](https://lmaomonkey.itch.io/) — Ability icons
- [歩夢 (IllustAC)](https://www.ac-illust.com/main/profile.php?id=UcZy0agl&area=1) — Battle background

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).
This project is a fork of [Dungeon Crawler On Demand](https://repulzor.itch.io/dungeon-crawler-od)
by Repulzor, extended with classes, abilities, affixes, sets, and elite enemies.

## Author

mashiroppu — https://github.com/mashiroppu

<a href='https://ko-fi.com/W7W4I2XU6' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=8F4LBS6QB4PVC)
