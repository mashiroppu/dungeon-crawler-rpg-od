# Dungeon Crawler RPG OD

ブラウザで遊べるローグライト・ダンジョンクローラー。手続き生成される
全1000階・10段階の難易度を攻略し、ディアブロ風の装備を集めて
最強のランを築き上げよう。ビルド不要 — `index.html` を開くだけで遊べます。

> English version: [README.md](README.md)

## 特徴

### クラス
キャラクター作成時に5つのクラスから1つを選択。それぞれ固有の
ステータス補正と、レベルで解放されるアビリティを持ちます：

| クラス | 役割 | ボーナス |
|---|---|---|
| **Warrior** | 前衛タンク | HP+25%, ATK+10%, DEF+20% |
| **Mage** | ガラスキャノン | ATK+15%, C.DMG+25%, C.RATE+5% |
| **Rogue** | スピードスター | ATK.SPD+30%, C.RATE+12% |
| **Lancer** | リーチファイター | ATK.SPD+20%, ATK+8%, DEF+5% |
| **Paladin** | 聖なる防御者 | HP+30%, DEF+25% — 反射・シールド・回復 |

### アビリティ
各クラスに6種類のアビリティがあり、レベルで解放。戦闘中は
チャージ数＋クールダウン＋リカバリのシステムで使用します。
範囲は nukes・多段ヒット・継続ダメージ・CC・バフ・シールド・回復。
編成スロットは最大3つまで。
**P1〜P3プリセット**でアビリティ編成と装備中の装備をまとめて保存・呼び出し可能
（参照型なのでアイテムは移動するだけで複製されません）。

### 装備と戦利品
- レアリティ6段階： Common, Uncommon, Rare, Epic, Legendary, Heirloom
- 装備スロット6つ
- **オプション**（Rare以上）： ATK%、HP%、DEF%、ATK.SPD%、VAMP、
  C.RATE、C.DMG、**PEN**（防御貫通）、**THORN**（ダメージ反射）、
  **DODGE**、**G.FIND**（ゴールド増加）、**E.FIND**（EXP増加）、
  **N.ATK**（通常攻撃ダメージ）、および隠しステータス
- **リロール**： ゴールドを消費してオプションを振り直し
- **確定（Finalize）**： オプションをロックして全値+40%
- **セットボーナス**： 20種類の装備セットに隠しの2個/4個ボーナス。
  ステータス欄には表示されません — **TIP** メニューで
  発動中のセット効果を確認できます

### 敵
- **エリート**: 強化されたモンスター。ステータス上昇・確定ドロップ
- **モディファイア**: 燃焼・激昂・吸血・再生・装甲・揮発（死亡時爆発）
  などの特性を持って出現することがある。タグは遭遇時（戦闘開始前）に
  赤色で表示される

### 進行
- **全1000階 / 難易度10段階** — NORMAL, HARD, TERROR, ABYSS, INFERNO,
  ECLIPSE, OBLIVION, GENESIS, APOCALYPSE, OMEGA。100階ごとに難易度上昇。
  各帯の最後のガーディアンを倒すと次の難易度が解放され、解放済みの
  難易度はその帯の先頭フロアから開始できる（例： HARD=101階〜）。
  1000階到達後はその階を無限周回
- レベル上限500。レベルアップごとに3つのステータス強化から1つ選択
  （リロール可）。レアな選択肢に **N.ATK**（通常攻撃+6%、排出率約20%、
  上限300%）と **THORN**（ダメージ反射、上限10%）
- **復活**： 100階帯ごとに1回、所持金50万以上あれば全額を消費して
  戦闘中に復活可能（敵は撃破扱いで戦闘終了）
- **倉庫**： 5階ごとの道端の物置で1フロア1個までアイテムを倉庫へ送れる
  （帯あたり最大20個）。容量は初期20で20万ゴールドで×2ずつ拡張
  （40→80→160）。中身はランを跨いで保持
- 死亡するとランは終了。死亡時にアイテムを1つだけ倉庫へ送れる。
  それ以外のラン中のアイテムは失われます
- Menu → Statistics から名前を変更可能

### その他
- **TIPメニュー**: ゲーム内知識データベース（ステータス、オプション、
  戦闘、進行、システム）＋カテゴリ目次＋発動中のセット効果
- グリッドルーム風の戦闘背景アニメーション
- **言語切替**: Menu → Language で English / 日本語 を切替

## 遊び方

1. 任意のブラウザで `index.html` を開く（または静的サーバーで配信）
2. 名前を入力し、ステータスを配分、クラスとパッシブを選んでダンジョンへ

## 今後の予定

[ROADMAP.ja.md](ROADMAP.ja.md) を参照 — 現在はアビリティ拡張の予定：
編成スロット6（最終上限）、各クラス約18種、データ駆動化、バランス調整。

## 技術

プレーンなHTML/CSS/JavaScript — フレームワーク・ビルド不要。
音声は [Howler.js](https://howlerjs.com/) を使用。

## クレジット

- [Aekashics](https://aekashics.itch.io/) — モンスタースプライト
- [Leohpaz](https://leohpaz.itch.io/) — RPG効果音
- [phoenix1291](https://phoenix1291.itch.io/sound-effects-pack-2) — レベルアップ音
- [Leviathan_Music](https://soundcloud.com/leviathan254) — バトル音楽
- [Sara Garrard](https://sonatina.itch.io/letsadventure) — ダンジョン音楽
- [ぴぽや](https://pipoya.net/) — 効果音・素材
- 倉庫 — ゲーム素材
- The manki — ゲーム素材
- [効果音ラボ](https://soundeffect-lab.info/) — 効果音
- [OtoLogic](https://otologic.jp/) — BGM
- rute — ゲーム素材

## ライセンス

GNU General Public License v3.0 — [LICENSE](LICENSE) を参照。
本プロジェクトは [Repulzor](https://repulzor.itch.io/dungeon-crawler-od)
の [Dungeon Crawler On Demand](https://repulzor.itch.io/dungeon-crawler-od)
のフォークで、クラス・アビリティ・オプション・セット・エリート敵を拡張しています。

## 作者

mashiroppu — https://github.com/mashiroppu

<a href='https://ko-fi.com/W7W4I2XU6' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=8F4LBS6QB4PVC)
