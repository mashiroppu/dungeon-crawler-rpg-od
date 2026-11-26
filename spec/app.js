/* ============================================================
 * Game Spec — データ駆動型 仕様書システム
 * ------------------------------------------------------------
 * 仕様の追加方法:
 *   SECTIONS 配列に1オブジェクトを追加するだけ。
 *   - id        : URLアンカー / 目次リンク用（英数字とハイフン）
 *   - title     : セクション見出し
 *   - desc      : 見出し下の一言説明（省略可）
 *   - status    : "new" | "changed" | "removed" | "planned" | "tbd"（省略可）
 *   - body      : HTML文字列。h3/p/ul/table/.note が使える
 *   - owner     : 担当者メモ（省略可）
 *   - updated   : 更新日メモ（省略可）
 * 目次・番号・バッジ・検索は全て自動生成される。
 * ============================================================ */

const DOC_TITLE = "Game Spec";

const STATUS_LABEL = {
    new:     "NEW",
    changed: "変更",
    removed: "廃止",
    planned: "未実装",
    tbd:     "TBD",
};

// ===================== ここから仕様データ =====================
const SECTIONS = [
    {
        id: "overview",
        title: "概要",
        desc: "ゲームの一言コンセプトと設計方針",
        status: "tbd",
        body: `
            <p>（ここに概要を書く）</p>
            <div class="note">このセクションはサンプルです。SECTIONS に項目を追加して仕様を書いてください。</div>
        `,
    },
    {
        id: "core-loop",
        title: "コアゲームプレイ",
        desc: "ゲームの基本ループと勝利条件",
        status: "planned",
        body: `
            <h3>基本ループ</h3>
            <ol>
                <li>（例： ダンジョンを探索する）</li>
                <li>（例： 敵と戦う）</li>
                <li>（例： 報酬を得て成長する）</li>
            </ol>
            <h3>勝利条件</h3>
            <p>（未定）</p>
        `,
    },
    {
        id: "double-tag",
        title: "ダブルタッグシステム",
        desc: "プレイヤー＋仲間1人の2人パーティ制（共闘式）",
        status: "planned",
        body: `
            <h3>コンセプト</h3>
            <p>プレイヤー1人ではなく、<strong>仲間を1人連れて2人でダンジョンを攻略する</strong>システム。
            単独プレイの延長ではなく、「2人だからできること」を軸に据えたコアシステム。</p>

            <h3>基本ルール（案）</h3>
            <ul>
                <li>パーティは <strong>プレイヤー1人 + 仲間1人</strong> の固定2名編成</li>
                <li>仲間はAIが自律行動する（プレイヤーの操作は自分のみ）</li>
                <li>仲間はステータス・アビリティ・パッシブを独自に持つ</li>
                <li>敵との戦闘は2人が同時に行動（リアルタイム共闘）</li>
            </ul>

            <h3>タグの概念</h3>
            <p>「タグ」は交代制ではなく、<strong>2人の連携・シナジー</strong>を指す。
            例：</p>
            <ul>
                <li>片方が敵をスタン/鈍足 → もう片方の追撃ダメージボーナス</li>
                <li>一方が瀕死 → もう一方がかばう/回復する</li>
                <li>特定の組み合わせで発動する「連携技」</li>
            </ul>

            <h3>仲間の入手・育成</h3>
            <p>（未定 — 以下は案）</p>
            <ul>
                <li>仲間はNPCとしてダンジョン内で勧誘 or 拠点で雇用</li>
                <li>仲間にもレベル・装備・パッシブがある</li>
                <li>仲間のロスト（戦闘不能→退場）のルール要検討</li>
            </ul>

            <h3>未決事項</h3>
            <div class="note todo">
                <ul>
                    <li>仲間のHP管理： 共通HP？ 個別HP？ 一方が倒れたら交代？</li>
                    <li>画面構成： 2人分のステータス/HPバーをどう表示するか</li>
                    <li>操作性： プレイヤーのアビリティと仲間AIの干渉（同時発動の制御）</li>
                    <li>セーブ形式： 仲間データを playerData に含めるか別キーか</li>
                    <li>既存システムとの整合： クラス/パッシブ/装備を仲間も使うか、仲間専用にするか</li>
                </ul>
            </div>

            <h3>既存実装への影響（メモ）</h3>
            <p>現在のコードは <code>player</code> 単一オブジェクト前提（戦闘・ステータス・セーブ）。
            ダブルタッグ化する場合、敵側の対象選択（現状 enemy→player 固定）を
            「2人のうちランダム or 優先度付き」に拡張する必要がある。</p>
        `,
        updated: "2025-01-01",
    },
    {
        id: "example-table",
        title: "記述例： テーブル",
        desc: "表の書き方サンプル",
        status: "tbd",
        body: `
            <table>
                <tr><th>項目</th><th>値</th><th>備考</th></tr>
                <tr><td>サンプルA</td><td>100</td><td>通常時</td></tr>
                <tr><td>サンプルB</td><td>200</td><td>強化時</td></tr>
            </table>
            <div class="note warn">数値は <code>code</code> タグで囲むと読みやすい。</div>
            <div class="note todo">未決事項は .note.todo、注意点は .note.warn を使う。</div>
        `,
    },
];
// ===================== ここまで仕様データ =====================

// ---------- レンダリング ----------
const contentEl = document.getElementById("content");
const tocEl = document.getElementById("toc");
const searchEl = document.getElementById("spec-search");
document.getElementById("doc-title").textContent = DOC_TITLE;
document.title = DOC_TITLE;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function render() {
    tocEl.innerHTML = "";
    contentEl.innerHTML = "";

    SECTIONS.forEach((sec, i) => {
        const num = String(i + 1).padStart(2, "0");
        const badge = sec.status ? `<span class="badge ${sec.status}">${STATUS_LABEL[sec.status] || sec.status}</span>` : "";

        // TOC
        const a = document.createElement("a");
        a.href = `#${sec.id}`;
        a.innerHTML = `<span class="toc-num">${num}</span>${esc(sec.title)}`;
        a.dataset.target = sec.id;
        tocEl.appendChild(a);

        // Section
        const el = document.createElement("section");
        el.className = "spec-section";
        el.id = sec.id;
        el.innerHTML = `
            <h2><span class="sec-num">${num}</span>${esc(sec.title)} ${badge}</h2>
            ${sec.desc ? `<p class="sec-desc">${esc(sec.desc)}</p>` : ""}
            <div class="spec-body">${sec.body || ""}</div>
            ${(sec.owner || sec.updated) ? `
                <div class="sec-meta">
                    ${sec.owner ? `<span class="owner">${esc(sec.owner)}</span>` : ""}
                    ${sec.updated ? `<span class="updated">${esc(sec.updated)}</span>` : ""}
                </div>` : ""}
        `;
        contentEl.appendChild(el);
    });
}

// ---------- 検索フィルタ ----------
function applyFilter() {
    const q = searchEl.value.trim().toLowerCase();
    document.querySelectorAll(".spec-section").forEach(el => {
        const hit = !q || el.textContent.toLowerCase().includes(q);
        el.style.display = hit ? "" : "none";
    });
    document.querySelectorAll("#toc a").forEach(a => {
        const target = document.getElementById(a.dataset.target);
        a.style.display = target && target.style.display !== "none" ? "" : "none";
    });
}
searchEl.addEventListener("input", applyFilter);

// ---------- スクロールスパイ ----------
const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            document.querySelectorAll("#toc a").forEach(a =>
                a.classList.toggle("active", a.dataset.target === e.target.id));
        }
    });
}, { rootMargin: "-10% 0px -80% 0px" });

render();
document.querySelectorAll(".spec-section").forEach(el => spy.observe(el));
