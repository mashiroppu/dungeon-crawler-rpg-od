// Volume settings
let volume;
if (JSON.parse(localStorage.getItem("volumeData")) == undefined) {
    volume = {
        master: 100 / 100,
        bgm: (80 / 100) / 2,
        sfx: 100 / 100
    }
} else {
    volume = JSON.parse(localStorage.getItem("volumeData"));
}


// BGM
let bgmDungeon;
let bgmBattleMain;
let bgmBattleBoss;
let bgmBattleGuardian;

// SFX
let sfxEncounter;
let sfxEnemyDeath;
let sfxAttack;
let sfxLvlUp;
let sfxConfirm;
let sfxDecline;
let sfxDeny;
let sfxEquip;
let sfxUnequip;
let sfxOpen;
let sfxPause;
let sfxUnpause;
let sfxSell;
let sfxItem;
let sfxBuff;
let sfxAbility;
let sfxHolyStrike;
let sfxThornsNova;
let sfxAegisOath;
let sfxJudgmentCounter;

const setVolume = () => {
    // ===== BGM =====
    bgmDungeon = new Howl({
        html5: true,
        src: ['./assets/bgm/dungeon.webm', './assets/bgm/dungeon.mp3'],
        volume: volume.bgm * volume.master,
        loop: true
    });

    bgmBattleMain = new Howl({
        html5: true,
        src: ['./assets/bgm/battle_main.webm', './assets/bgm/battle_main.mp3'],
        volume: volume.bgm * volume.master,
        loop: true
    });

    bgmBattleBoss = new Howl({
        html5: true,
        src: ['./assets/bgm/battle_boss.webm', './assets/bgm/battle_boss.mp3'],
        volume: volume.bgm * volume.master,
        loop: true
    });

    bgmBattleGuardian = new Howl({
        html5: true,
        src: ['./assets/bgm/battle_guardian.webm', './assets/bgm/battle_guardian.mp3'],
        volume: volume.bgm * volume.master,
        loop: true
    });

    // ===== SFX =====
    sfxEncounter = new Howl({
        html5: true,
        src: ['./assets/sfx/encounter.wav'],
        volume: volume.sfx * volume.master
    });

    sfxCombatEnd = new Howl({
        html5: true,
        src: ['./assets/sfx/combat_end.wav'],
        volume: volume.sfx * volume.master
    });

    sfxAttack = new Howl({
        html5: true,
        src: ['./assets/sfx/attack.wav'],
        volume: volume.sfx * volume.master
    });

    sfxLvlUp = new Howl({
        html5: true,
        src: ['./assets/sfx/level_up.wav'],
        volume: volume.sfx * volume.master
    });

    sfxConfirm = new Howl({
        html5: true,
        src: ['./assets/sfx/confirm.wav'],
        volume: volume.sfx * volume.master
    });

    sfxDecline = new Howl({
        html5: true,
        src: ['./assets/sfx/decline.wav'],
        volume: volume.sfx * volume.master
    });

    sfxDeny = new Howl({
        html5: true,
        src: ['./assets/sfx/denied.wav'],
        volume: volume.sfx * volume.master
    });

    sfxEquip = new Howl({
        html5: true,
        src: ['./assets/sfx/equip.wav'],
        volume: volume.sfx * volume.master
    });

    sfxUnequip = new Howl({
        html5: true,
        src: ['./assets/sfx/unequip.wav'],
        volume: volume.sfx * volume.master
    });

    sfxOpen = new Howl({
        html5: true,
        src: ['./assets/sfx/hover.wav'],
        volume: volume.sfx * volume.master
    });

    sfxPause = new Howl({
        html5: true,
        src: ['./assets/sfx/pause.wav'],
        volume: volume.sfx * volume.master
    });

    sfxUnpause = new Howl({
        html5: true,
        src: ['./assets/sfx/unpause.wav'],
        volume: volume.sfx * volume.master
    });

    sfxSell = new Howl({
        html5: true,
        src: ['./assets/sfx/sell.wav'],
        volume: volume.sfx * volume.master
    });

    sfxItem = new Howl({
        html5: true,
        src: ['./assets/sfx/item_use.wav'],
        volume: volume.sfx * volume.master
    });

    sfxBuff = new Howl({
        html5: true,
        src: ['./assets/sfx/buff.wav'],
        volume: volume.sfx * volume.master
    });

    sfxAbility = new Howl({
        html5: true,
        src: ['./assets/sfx/attack.wav'],
        volume: volume.sfx * volume.master,
        rate: 0.6
    });

    sfxHolyStrike = new Howl({
        html5: true,
        src: ['./assets/sfx/holy_strike.mp3'],
        volume: volume.sfx * volume.master
    });

    sfxThornsNova = new Howl({
        html5: true,
        src: ['./assets/sfx/thorns_nova.mp3'],
        volume: volume.sfx * volume.master * 0.6
    });

    sfxAegisOath = new Howl({
        html5: true,
        src: ['./assets/sfx/aegis_oath.mp3'],
        volume: volume.sfx * volume.master
    });

    sfxJudgmentCounter = new Howl({
        html5: true,
        src: ['./assets/sfx/judgment_counter.mp3'],
        volume: volume.sfx * volume.master
    });
}

document.querySelector("#title-screen").addEventListener("click", function () {
    setVolume();
    sfxOpen.play();
});
