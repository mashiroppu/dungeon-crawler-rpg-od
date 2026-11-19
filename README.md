# Dungeon Crawler RPG OD

A browser-based roguelite dungeon crawler. Climb 100 floors of procedurally
generated dungeons, loot Diablo-style equipment, and build your perfect run.
No build step required — just open `index.html`.

## Features

### Classes
Choose one of four classes at character creation. Each class has unique
stat scaling and its own set of unlockable abilities:

| Class | Role | Bonuses |
|---|---|---|
| **Warrior** | Frontline tank | +25% HP, +10% ATK, +20% DEF |
| **Mage** | Glass cannon | +15% ATK, +25% C.DMG, +5% C.RATE |
| **Rogue** | Speedster | +30% ATK.SPD, +12% C.RATE |
| **Lancer** | Reach fighter | +20% ATK.SPD, +8% ATK, +5% DEF |

### Abilities
Each class unlocks 3 active abilities at Lv.1 / Lv.12 / Lv.25, shown on the
ability bar during combat with cooldowns. Abilities include nukes, buffs,
shields, damage-over-time, and debuffs.

### Equipment & Loot
- 6 equipment rarities: Common, Uncommon, Rare, Epic, Legendary, Heirloom
- 6 equipment slots
- **Affixes** (Rare+): bonus stats such as ATK%, HP%, DEF%, ATK.SPD%,
  VAMP, C.RATE, C.DMG, **PEN** (armor penetration), **THORN** (damage
  reflect), **DODGE**, **G.FIND** (gold find), and **E.FIND** (EXP find)
- **Reroll**: spend gold to re-roll an item's affixes
- **Set bonuses**: Emberforged, Rimescale, Galestep, and Nyxweave sets
  grant 2-piece and 4-piece bonuses

### Enemies
- **Elites**: empowered monsters with boosted stats and guaranteed drops
- **Modifiers**: enemies can spawn with traits like Burning, Frenzy,
  Vampiric, Regenerating, Armored, and Volatile (explodes on death)

### Progression
- Procedurally generated floors up to 100
- Level up by choosing 1 of 3 stat boosts (with rerolls)
- Death resets your run, but equipment is kept

## How to Play

1. Open `index.html` in any modern browser (or serve the folder with any
   static file server).
2. Enter a character name, allocate stat points, pick a class and passive,
   then descend.

## Tech

Plain HTML/CSS/JavaScript — no framework, no build step. Audio via
[Howler.js](https://howlerjs.com/).

## Credits

- [Aekashics](https://aekashics.itch.io/) — Monster sprites
- [Leohpaz](https://leohpaz.itch.io/) — RPG SFX
- [phoenix1291](https://phoenix1291.itch.io/sound-effects-pack-2) — Level up SFX
- [Leviathan_Music](https://soundcloud.com/leviathan254) — Battle music
- [Sara Garrard](https://sonatina.itch.io/letsadventure) — Dungeon music

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).
This project is a fork of [Dungeon Crawler On Demand](https://repulzor.itch.io/dungeon-crawler-od)
by Repulzor, extended with classes, abilities, affixes, sets, and elite enemies.

## Author

WLeln — https://github.com/mashiroppu

<a href='https://ko-fi.com/W7W4I2XU6' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=8F4LBS6QB4PVC)
