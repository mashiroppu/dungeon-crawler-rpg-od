/* ============================================================
 * SVGDraw Prompt Builder — ラフな指示をAI向け詳細プロンプトに変換
 * ------------------------------------------------------------
 * ブラウザ: window.SVGDrawPrompt / Node.js: require("./prompt.js")
 *
 * 使い方:
 *   const prompt = SVGDrawPrompt.build("ドラゴンのアイコン", {
 *       width: 512, height: 512, style: "flat vector, bold outlines"
 *   });
 *   // → そのままSWE/LLMに貼れる詳細プロンプト文字列
 * ============================================================ */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        const SVGDraw = require("./svgdraw.js");
        module.exports = factory(SVGDraw);
    } else {
        root.SVGDrawPrompt = factory(root.SVGDraw);
    }
})(typeof self !== "undefined" ? self : this, function (SVGDraw) {
    "use strict";

    /**
     * ラフな描画指示を、ライブラリ使用を前提とした最適化プロンプトに変換する。
     *
     * @param {string} idea        ユーザーのラフな指示（例: "炎の剣"）
     * @param {object} [opts]
     * @param {number} [opts.width=800]   キャンバス幅
     * @param {number} [opts.height=600]  キャンバス高さ
     * @param {string} [opts.style]       スタイル指定（flat / realistic / pixel art 等）
     * @param {string[]} [opts.palette]   使用したい色
     * @param {string} [opts.mood]        雰囲気（dark / neon / retro 等）
     * @param {string} [opts.output]      出力形式指示（デフォルト: HTMLファイル）
     * @param {string} [opts.extra]       追加要件
     * @param {string} [opts.lang="ja"]   プロンプトの言語 ja|en
     * @param {string} [opts.mode="standard"]  描画モード: "draft" | "standard" | "ultra"
     */
    function build(idea, opts = {}) {
        const {
            width = 800, height = 600,
            style = "", palette = [], mood = "",
            output = "単一のHTMLファイル（インラインSVGまたはsvgdraw.jsをscriptタグで読み込み）",
            extra = "",
            lang = "ja",
            mode = "standard",
        } = opts;

        // ---- 描画モード別の詳細度プリセット ----
        const MODES = {
            draft: {
                ja: [
                    "ラフ画風でよい。全体の構図とシルエットを優先し、細部は最低限でよい",
                    "SVGサイズは数KB〜数十KBでよい",
                ],
                en: [
                    "Sketch-style is fine. Prioritize composition and silhouette; minimal detail",
                    "SVG size of a few KB to tens of KB is acceptable",
                ],
            },
            standard: {
                ja: [
                    "完成SVGのコード量は **最低でも50KB〜200KB規模** を目安にする。数個の図形で済ませるな",
                    "必ず多段描画で作る: ①ベース形状 → ②陰影・グラデーション → ③ハイライト/反射 → ④テクスチャ・細部（毛・鱗・木目・ひび等）",
                    "有機物（植物・生物・炎・雲等）は scene.blob() / scene.smoothPath() / pathBuilder().smooth() で描く。直線と円弧だけの機械的な形は禁止",
                    "質感は scene.hatchPattern() / scene.textureStroke() / scene.noiseFilter() / scene.roughenFilter() を活用する",
                    "細部パーツは group() でレイヤー分けし、個別に変形・発光・ぼかしをかけられるようにする",
                    "「大体の形」ではなく「寄って見ても破綻しない密度」を目指す",
                ],
                en: [
                    "Target **at least 50KB–200KB of SVG code**. Do not settle for a handful of shapes",
                    "Always build in passes: ① base shapes → ② shading/gradients → ③ highlights/reflections → ④ texture & micro-details (fur, scales, grain, cracks)",
                    "For organic subjects (plant, creatures, fire, clouds) use scene.blob() / scene.smoothPath() / pathBuilder().smooth(). Mechanical straight lines and arcs only = rejected",
                    "Use scene.hatchPattern() / scene.textureStroke() / scene.noiseFilter() / scene.roughenFilter() for texture",
                    "Organize detail parts into group() layers so they can be transformed/glowed/blurred individually",
                    "Aim for density that holds up when zoomed in — not 'roughly the right shape'",
                ],
            },
            ultra: {
                ja: [
                    "**超微細モード**: 完成SVGは **500KB〜1MB規模** を目安にする。これが絶対条件",
                    "描画パスは最低10段階: ①ラフなシルエット → ②ベース形状 → ③大まかな陰影 → ④中間調 → ⑤細かい陰影 → ⑥ハイライト → ⑦反射・スペキュラ → ⑧テクスチャ1（素材感） → ⑨テクスチャ2（傷・汚れ・経年） → ⑩微細ディテール（毛穴・鱗・木目・繊維） → ⑪縁の処理 → ⑫発光/雰囲気 → ⑬仕上げ",
                    "すべての有機物に scene.blob() または10点以上の制御点による smoothPath を使う。単純な円・楕円・矩形の組み合わせは禁止",
                    "質感は必ず3種類以上を併用: hatchPattern + textureStroke + noiseFilter + roughenFilter + 個別グラデーション",
                    "部位ごとに group() で独立レイヤー化し、それぞれに専用のグラデーション・フィルタ・透明度を設定する",
                    "小さなディテール（汗・水滴・埃・傷・模様）を最低15個以上配置する",
                    "scene.stats() を実行し、svgBytes が500KB未満なら細部を追加してから出力すること",
                ],
                en: [
                    "**ULTRA mode**: target **500KB–1MB of SVG code**. This is a hard requirement",
                    "Build in at least 10 passes: ① rough silhouette → ② base shapes → ③ broad shadow → ④ midtones → ⑤ fine shadow → ⑥ highlights → ⑦ reflections/specular → ⑧ texture 1 (material) → ⑨ texture 2 (wear/grime) → ⑩ micro-details (pores, scales, grain, fibers) → ⑪ edge treatment → ⑫ glow/atmosphere → ⑬ finish",
                    "Every organic form must use scene.blob() or smoothPath with 10+ control points. Plain circles/ellipses/rects combinations are forbidden",
                    "Use at least 3 texture types together: hatchPattern + textureStroke + noiseFilter + roughenFilter + per-part gradients",
                    "Isolate every part into its own group() layer with dedicated gradient/filter/opacity",
                    "Place at least 15 small details (sweat, droplets, dust, scratches, patterns)",
                    "Run scene.stats() — if svgBytes < 500KB, add more detail before outputting",
                ],
            },
        };
        const modeKey = MODES[mode] ? mode : "standard";
        const detail = MODES[modeKey][lang === "ja" ? "ja" : "en"];

        const apiRef = (SVGDraw && SVGDraw.API_REFERENCE) || "";

        const ja = lang === "ja";
        const L = ja ? {
            title: "# 描画タスク",
            ideaLabel: "## 描いてほしいもの",
            canvasLabel: "## キャンバス",
            styleLabel: "スタイル",
            paletteLabel: "パレット",
            moodLabel: "雰囲気",
            libLabel: "## 使用ライブラリ: SVGDraw",
            libNote: "以下のAPIのみを使ってSVGを生成すること。生のSVG文字列を直接書かないこと。",
            rulesTitle: "## ルール",
            rules: [
                "出力は「SVGDrawを使ったJSコード + 完成SVG」の両方を含める",
                "scene.toSVG() で最終SVG文字列を取得する",
                "グラデーション・フィルタ・グループを積極的に使い、平坦な図形の羅列にしない",
                "座標はキャンバス内に収める。はみ出し禁止",
                "外部画像・フォント・ネットワーク依存は禁止",
                "コードはそのまま実行可能な完全なものにする",
            ],
            detailTitle: "## 詳細度（最重要）",
            extraLabel: "## 追加要件",
            qualityTitle: "## 品質チェック",
            quality: [
                "指示された対象が一目で判別できるか",
                "色・光・陰影に奥行きがあるか",
                "余白と構図が整っているか",
            ],
        } : {
            title: "# Drawing Task",
            ideaLabel: "## What to draw",
            canvasLabel: "## Canvas",
            styleLabel: "Style",
            paletteLabel: "Palette",
            moodLabel: "Mood",
            libLabel: "## Library: SVGDraw",
            libNote: "Generate the SVG using ONLY the API below. Do not hand-write raw SVG markup.",
            rulesTitle: "## Rules",
            rules: [
                "Output must include both the JS code using SVGDraw and the resulting SVG",
                "Obtain the final SVG via scene.toSVG()",
                "Use gradients, filters and groups actively — avoid flat shape soup",
                "Keep all coordinates inside the canvas",
                "No external images, fonts, or network dependencies",
                "Code must be complete and runnable as-is",
            ],
            detailTitle: "## Detail level (CRITICAL)",
            extraLabel: "## Additional requirements",
            qualityTitle: "## Quality checklist",
            quality: [
                "Subject is instantly recognizable",
                "Color, light and shadow have depth",
                "Composition and margins are clean",
            ],
        };

        const parts = [
            L.title,
            "",
            L.ideaLabel,
            idea,
            "",
            L.canvasLabel,
            `- サイズ: ${width} x ${height}px`,
            `- 出力形式: ${output}`,
            style ? `- ${L.styleLabel}: ${style}` : "",
            palette.length ? `- ${L.paletteLabel}: ${palette.join(", ")}` : "",
            mood ? `- ${L.moodLabel}: ${mood}` : "",
            "",
            L.libLabel,
            "```js",
            '// 使い方: const scene = SVGDraw.create(W, H, { bg }); ... scene.toSVG()',
            "```",
            "",
            apiRef,
            "",
            L.rulesTitle,
            ...L.rules.map(r => `- ${r}`),
            "",
            L.detailTitle,
            ...detail.map(r => `- ${r}`),
            extra ? `\n${L.extraLabel}\n${extra}` : "",
            "",
            L.qualityTitle,
            ...L.quality.map(q => `- ${q}`),
        ];

        return parts.filter(p => p !== "").join("\n");
    }

    /** APIリファレンス単体を返す（プロンプトに手動で埋め込みたい場合用） */
    function apiReference() { return SVGDraw ? SVGDraw.API_REFERENCE : ""; }

    return { build, apiReference };
});
