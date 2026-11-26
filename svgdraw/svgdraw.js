/* ============================================================
 * SVGDraw — SVGを超える描画ライブラリ
 * ------------------------------------------------------------
 * ブラウザ: window.SVGDraw / Node.js: require("./svgdraw.js")
 *
 * 使い方:
 *   const scene = SVGDraw.create(800, 600, { bg: "#0f1117" });
 *   scene.circle(400, 300, 100, { fill: "#6ea8fe" });
 *   const svg = scene.toSVG();
 * ============================================================ */
(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.SVGDraw = factory();
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    let _uid = 0;
    const uid = (p) => `${p}${++_uid}`;

    const esc = (s) => String(s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

    const num = (n) => (Math.round(n * 100) / 100).toString();

    // 決定的乱数（再現性のある有機的な揺らぎ用）
    function mulberry32(seed) {
        return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    // 属性オブジェクト → SVG属性文字列
    const attrs = (o = {}) => Object.entries(o)
        .filter(([, v]) => v !== undefined && v !== null && v !== false)
        .map(([k, v]) => `${k}="${esc(v)}"`)
        .join(" ");

    // ============================================================
    // Scene
    // ============================================================
    class Scene {
        /**
         * @param {number} width
         * @param {number} height
         * @param {object} [opts] { bg, viewBox }
         */
        constructor(width, height, opts = {}) {
            this.width = width;
            this.height = height;
            this.bg = opts.bg ?? "#ffffff";
            this.viewBox = opts.viewBox || `0 0 ${width} ${height}`;
            this.defs = [];       // gradients / filters / clips / patterns
            this.styles = [];     // <style> ブロック（CSSアニメーション用）
            this.elements = [];   // top-level svg nodes
            this._groupStack = [];
        }

        // ---------- defs ----------
        _addDef(xml) { this.defs.push(xml); return xml.match(/id="([^"]+)"/)?.[1]; }

        /**
         * 線形グラデーション
         * @param {string} id          参照ID（fill="url(#id)" で使う）
         * @param {Array<[number,string]>} stops  [[offset, color], ...] offsetは0-1
         * @param {object} [geo] {x1,y1,x2,y2} 既定は左→右
         */
        linearGradient(id, stops, geo = {}) {
            const { x1 = 0, y1 = 0, x2 = 1, y2 = 0 } = geo;
            const s = stops.map(([o, c]) =>
                `<stop offset="${o}" stop-color="${esc(c)}"/>`).join("");
            return this._addDef(
                `<linearGradient id="${esc(id)}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${s}</linearGradient>`);
        }

        /**
         * 円形グラデーション
         * @param {string} id
         * @param {Array<[number,string]>} stops
         * @param {object} [geo] {cx,cy,r,fx,fy}
         */
        radialGradient(id, stops, geo = {}) {
            const { cx = 0.5, cy = 0.5, r = 0.5, fx, fy } = geo;
            const s = stops.map(([o, c]) =>
                `<stop offset="${o}" stop-color="${esc(c)}"/>`).join("");
            return this._addDef(
                `<radialGradient id="${esc(id)}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}"` : ""}${fy !== undefined ? ` fy="${fy}"` : ""}>${s}</radialGradient>`);
        }

        /**
         * パターン（タイル状の繰り返し描画）
         * @param {string} id
         * @param {number} w / h  タイルサイズ
         * @param {string|function} content  SVG文字列 or (scene)=>void
         */
        pattern(id, w, h, content) {
            const inner = typeof content === "function"
                ? (() => { const sub = new Scene(w, h); content(sub); return sub.toSVGInner(); })()
                : content;
            return this._addDef(
                `<pattern id="${esc(id)}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${inner}</pattern>`);
        }

        /**
         * クリップパス
         * @param {string} id
         * @param {string|function} content
         */
        clipPath(id, content) {
            const inner = typeof content === "function"
                ? (() => { const sub = new Scene(0, 0); content(sub); return sub.toSVGInner(); })()
                : content;
            return this._addDef(`<clipPath id="${esc(id)}">${inner}</clipPath>`);
        }

        // ---------- フィルタプリセット ----------
        /** ガウシアンブラー単体 */
        blurFilter(id = uid("f_blur_"), stdDev = 4) {
            return this._addDef(
                `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">` +
                `<feGaussianBlur stdDeviation="${stdDev}"/></filter>`);
        }

        /** 発光（ブラー＋元画像合成） */
        glowFilter(id = uid("f_glow_"), { color = "#6ea8fe", blur = 6, opacity = 0.9 } = {}) {
            return this._addDef(
                `<filter id="${id}" x="-80%" y="-80%" width="260%" height="260%">` +
                `<feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="b"/>` +
                `<feFlood flood-color="${esc(color)}" flood-opacity="${opacity}" result="c"/>` +
                `<feComposite in="c" in2="b" operator="in" result="g"/>` +
                `<feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
        }

        /** ドロップシャドウ */
        shadowFilter(id = uid("f_shdw_"), { color = "#000000", blur = 6, dx = 3, dy = 3, opacity = 0.5 } = {}) {
            return this._addDef(
                `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%">` +
                `<feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur}" flood-color="${esc(color)}" flood-opacity="${opacity}"/></filter>`);
        }

        /** ノイズ（feTurbulence） */
        noiseFilter(id = uid("f_noise_"), { baseFreq = 0.9, octaves = 2, opacity = 0.15 } = {}) {
            return this._addDef(
                `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="${octaves}" result="n"/>` +
                `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity} 0"/></filter>`);
        }

        /**
         * 手描き風のがたつき（feTurbulence + feDisplacementMap）
         * 線画・輪郭に適用すると「描いた」質感になる
         */
        roughenFilter(id = uid("f_rough_"), { scale = 3, octaves = 3, seed = 1 } = {}) {
            return this._addDef(
                `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">` +
                `<feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="${octaves}" seed="${seed}" result="n"/>` +
                `<feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`);
        }

        /** 鉛筆/スケッチ風（roughen + 弱いブラーで粒状感） */
        pencilFilter(id = uid("f_pencil_"), { scale = 4, blur = 0.6 } = {}) {
            return this._addDef(
                `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">` +
                `<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/>` +
                `<feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" result="d"/>` +
                `<feGaussianBlur in="d" stdDeviation="${blur}"/></filter>`);
        }

        // ---------- グループ / レイヤー ----------
        /**
         * グループ。transformとclipをまとめて子要素に適用。
         * fnの中でthisがサブシーンになるので、内部で this.rect(...) 等が使える。
         */
        group(opts = {}, fn) {
            const sub = new Scene(this.width, this.height);
            sub.defs = this.defs; // defsを共有
            fn.call(sub);
            const t = this._transform(opts);
            const clip = opts.clip ? ` clip-path="url(#${esc(opts.clip)})"` : "";
            const opacity = opts.opacity !== undefined ? ` opacity="${opts.opacity}"` : "";
            const cls = opts.cls ? ` class="${esc(opts.cls)}"` : "";
            const anim = this._animXml(opts);
            this.elements.push(`<g${t}${clip}${opacity}${cls}>${sub.toSVGInner()}${anim}</g>`);
        }

        /** CSSを<style>として埋め込む（cls + keyframesでCSSアニメーション） */
        style(css) { this.styles.push(css); return this; }

        /** 変換ヘルパー: {x,y} translate, {rotate}, {scale}, {skew} */
        _transform(o = {}) {
            const parts = [];
            if (o.x !== undefined || o.y !== undefined)
                parts.push(`translate(${num(o.x || 0)} ${num(o.y || 0)})`);
            if (o.rotate) parts.push(`rotate(${num(o.rotate)}${o.rx !== undefined ? ` ${num(o.rx)} ${num(o.ry ?? 0)}` : ""})`);
            if (o.scale !== undefined) parts.push(`scale(${num(o.scale)})`);
            if (o.scaleX !== undefined || o.scaleY !== undefined)
                parts.push(`scale(${num(o.scaleX ?? 1)} ${num(o.scaleY ?? 1)})`);
            return parts.length ? ` transform="${parts.join(" ")}"` : "";
        }

        // ---------- 基本図形 ----------
        // opts共通: fill, stroke, strokeWidth, opacity, filter(url(#id)), clip(url(#id)), transform系, cls, anim
        _style(o = {}) {
            const a = {};
            if (o.fill !== undefined) a.fill = o.fill;
            if (o.stroke !== undefined) a.stroke = o.stroke;
            if (o.strokeWidth !== undefined) a["stroke-width"] = o.strokeWidth;
            if (o.opacity !== undefined) a.opacity = o.opacity;
            if (o.filter) a.filter = `url(#${o.filter})`;
            if (o.clip) a["clip-path"] = `url(#${o.clip})`;
            if (o.cls) a.class = o.cls;
            const t = this._transform(o);
            return { a, t };
        }

        // SMILアニメーション指定 → <animate>/<animateTransform> XML
        // anim: { attr:"opacity", values:"1;0.2;1", dur:"2s", repeat:"indefinite" }
        // animTransform: { type:"rotate", values:"0 50 50;360 50 50", dur:"8s", repeat:"indefinite" }
        _animXml(o) {
            const out = [];
            const mk = (tag, m) => {
                const parts = [];
                for (const k of ["attributeName", "type", "from", "to", "values", "by", "dur", "begin", "repeatCount", "fill", "calcMode", "keyTimes", "keySplines"]) {
                    if (m[k] !== undefined) parts.push(`${k}="${esc(m[k])}"`);
                }
                return `<${tag} ${parts.join(" ")}/>`;
            };
            (Array.isArray(o.anim) ? o.anim : o.anim ? [o.anim] : []).forEach(m => out.push(mk("animate", m)));
            (Array.isArray(o.animTransform) ? o.animTransform : o.animTransform ? [o.animTransform] : []).forEach(m => out.push(mk("animateTransform", { attributeName: "transform", type: m.type || "translate", ...m })));
            return out.join("");
        }

        _push(tag, extraAttrs, children = "", opts = {}) {
            const { a, t } = this._style(opts);
            const xml = `<${tag} ${attrs({ ...a, ...extraAttrs })}${t}>${children}${this._animXml(opts)}</${tag}>`;
            this.elements.push(xml);
            return xml;
        }

        rect(x, y, w, h, opts = {}) {
            const extra = {};
            if (opts.rx !== undefined) extra.rx = opts.rx;
            if (opts.ry !== undefined) extra.ry = opts.ry;
            return this._push("rect", { x: num(x), y: num(y), width: num(w), height: num(h), ...extra }, "", opts);
        }

        circle(cx, cy, r, opts = {}) {
            return this._push("circle", { cx: num(cx), cy: num(cy), r: num(r) }, "", opts);
        }

        ellipse(cx, cy, rx, ry, opts = {}) {
            return this._push("ellipse", { cx: num(cx), cy: num(cy), rx: num(rx), ry: num(ry) }, "", opts);
        }

        line(x1, y1, x2, y2, opts = {}) {
            return this._push("line", { x1: num(x1), y1: num(y1), x2: num(x2), y2: num(y2) }, "", opts);
        }

        /**
         * パス。dはSVGパス記法そのまま。
         * 便利メソッド: scene.move(x,y).lineTo(x,y).curveTo(...).close().stroke({...})
         * もしくは文字列で直接。
         */
        path(d, opts = {}) {
            return this._push("path", { d }, "", opts);
        }

        /** points: [[x,y],...] or "x,y x,y ..." */
        polygon(points, opts = {}) {
            const pts = Array.isArray(points[0])
                ? points.map(p => p.join(",")).join(" ")
                : points;
            return this._push("polygon", { points: pts }, "", opts);
        }

        /**
         * テキスト
         * opts: fontSize, fontFamily, fontWeight, fill, anchor(start|middle|end),
         *       letterSpacing, rotate, opacity
         */
        text(x, y, str, opts = {}) {
            const a = {
                x: num(x), y: num(y),
                "font-size": opts.fontSize ?? 16,
                "font-family": opts.fontFamily ?? "sans-serif",
                "font-weight": opts.fontWeight ?? 400,
                "text-anchor": opts.anchor ?? "start",
                fill: opts.fill ?? "#000",
            };
            if (opts.letterSpacing) a["letter-spacing"] = opts.letterSpacing;
            if (opts.opacity !== undefined) a.opacity = opts.opacity;
            if (opts.cls) a["class"] = opts.cls;
            const t = opts.rotate ? ` transform="rotate(${num(opts.rotate)} ${num(x)} ${num(y)})"` : "";
            const anim = this._animXml(opts);
            const xml = `<text ${attrs(a)}${t}>${esc(str)}${anim}</text>`;
            this.elements.push(xml);
            return xml;
        }

        // ---------- 高度なヘルパー ----------
        /** 矢印（線＋矢尻） */
        arrow(x1, y1, x2, y2, opts = {}) {
            const { headSize = 10, color = "#6ea8fe", strokeWidth = 2 } = opts;
            const ang = Math.atan2(y2 - y1, x2 - x1);
            const bx = x2 - headSize * Math.cos(ang - Math.PI / 6);
            const by = y2 - headSize * Math.sin(ang - Math.PI / 6);
            const cx = x2 - headSize * Math.cos(ang + Math.PI / 6);
            const cy = y2 - headSize * Math.sin(ang + Math.PI / 6);
            this.line(x1, y1, x2, y2, { stroke: color, strokeWidth });
            return this.polygon([[x2, y2], [bx, by], [cx, cy]], { fill: color });
        }

        /** グリッド（補助線） */
        grid(step = 50, opts = {}) {
            const { color = "#ffffff22", strokeWidth = 1, opacity = 1 } = opts;
            for (let x = 0; x <= this.width; x += step)
                this.line(x, 0, x, this.height, { stroke: color, strokeWidth, opacity });
            for (let y = 0; y <= this.height; y += step)
                this.line(0, y, this.width, y, { stroke: color, strokeWidth, opacity });
        }

        /** 簡易フローチャート用ボックス＋接続テキスト */
        card(x, y, w, h, title, opts = {}) {
            const { fill = "#1d212e", stroke = "#3d5a8a", fontSize = 14 } = opts;
            this.rect(x, y, w, h, { fill, stroke, strokeWidth: 1.5, rx: 8 });
            if (title) this.text(x + w / 2, y + h / 2 + fontSize / 3, title,
                { fontSize, fill: "#d8dce6", anchor: "middle", fontWeight: 600 });
        }

        // ---------- 有機的描画（詳細度重視） ----------

        /**
         * パスビルダー。有機的な曲線描画用。
         * 使い方:
         *   scene.pathBuilder()
         *       .move(100,100).line(150,80).curve(180,60,200,100,160,140)
         *       .quad(120,160,100,100).close()
         *       .fill({ fill:"#3fb96b", stroke:"#1a5c33", strokeWidth:2 });
         *   または .smooth([[x,y],...], true) でCatmull-Romスムージング
         *   .toPath() で "d" 文字列だけ取得も可。
         */
        pathBuilder() { return new PathBuilder(this); }

        /**
         * Catmull-Romスプラインで滑らかな閉/開パスを生成。
         * points: [[x,y],...] をなめらかに繋ぐ。機械的な折れ線を避けたい時に。
         * closed=true で閉じたblob状の形になる。
         */
        smoothPath(points, { closed = false, tension = 0.5 } = {}) {
            const pb = new PathBuilder(this);
            pb.smooth(points, { closed, tension });
            return pb.toPath();
        }

        /**
         * 有機的なblob（不定形の塊）。つた・岩・細胞・雲等に。
         * 楕円の周上の点を乱数で揺らがせ、Catmull-Romで滑らかに繋ぐ。
         * @param {number} cx,cy 中心
         * @param {number} rx,ry 半径
         * @param {object} opts { points=14, jitter=0.35, rotation=0, seed=1 }
         * @returns "d" 文字列（path()に渡せる）
         */
        blob(cx, cy, rx, ry, opts = {}) {
            const { points = 14, jitter = 0.35, rotation = 0, seed = 1 } = opts;
            const rand = mulberry32(seed);
            const pts = [];
            for (let i = 0; i < points; i++) {
                const a = rotation + (i / points) * Math.PI * 2;
                const j = 1 + (rand() - 0.5) * 2 * jitter;
                pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
            }
            return this.smoothPath(pts, { closed: true });
        }

        /**
         * ハッチング（斜線）パターンをdefsに登録。
         * @param {string} id
         * @param {object} opts { angle=45, spacing=6, color="#000", strokeWidth=1, opacity=1 }
         */
        hatchPattern(id, opts = {}) {
            const { angle = 45, spacing = 6, color = "#000000", strokeWidth = 1, opacity = 1 } = opts;
            const rad = angle * Math.PI / 180;
            const size = spacing * 2;
            const dx = Math.cos(rad) * size, dy = Math.sin(rad) * size;
            const content =
                `<line x1="${num(-size)}" y1="${num(size)}" x2="${num(size)}" y2="${num(-size)}" stroke="${esc(color)}" stroke-width="${strokeWidth}" opacity="${opacity}"/>` +
                `<line x1="0" y1="${num(size * 2)}" x2="${num(size * 2)}" y2="0" stroke="${esc(color)}" stroke-width="${strokeWidth}" opacity="${opacity}"/>` +
                `<line x1="${num(size)}" y1="${num(size * 3)}" x2="${num(size * 3)}" y2="${num(size)}" stroke="${esc(color)}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
            return this.pattern(id, size * 2, size * 2, content);
        }

        /**
         * 塗りつぶし用の「多重ストローク」テクスチャ。
         * 同心状の揺らぎパスを複数重ねて手描きの陰影っぽくする。
         * @param {string} d ベースパス
         * @param {object} opts { count=8, spread=4, color="#000", opacity=0.15, seed=1 }
         */
        textureStroke(d, opts = {}) {
            const { count = 8, spread = 4, color = "#000000", opacity = 0.12, seed = 1 } = opts;
            const rand = mulberry32(seed);
            for (let i = 0; i < count; i++) {
                const jx = (rand() - 0.5) * spread;
                const jy = (rand() - 0.5) * spread;
                this.path(d, {
                    fill: "none", stroke: color,
                    strokeWidth: 0.8 + rand() * 0.8,
                    opacity: opacity * (0.5 + rand() * 0.5),
                    x: jx, y: jy,
                });
            }
        }

        // ---------- 出力 ----------
        /** defs以外の中身だけ（サブシーンやpattern用） */
        toSVGInner() { return this.elements.join("\n"); }

        /**
         * 密度計測。AIが「十分詳細か」を自己検証するための統計。
         * @returns {{ elements:number, paths:number, circles:number, groups:number, defs:number, svgBytes:number }}
         */
        stats() {
            const inner = this.toSVGInner();
            const count = (re) => (inner.match(re) || []).length;
            return {
                elements: this.elements.length,
                paths: count(/<path[\s>]/g),
                circles: count(/<circle[\s>]/g),
                ellipses: count(/<ellipse[\s>]/g),
                texts: count(/<text[\s>]/g),
                groups: count(/<g[\s>]/g),
                defs: this.defs.length,
                svgBytes: this.toSVG().length,
            };
        }

        toSVG() {
            const styleXml = this.styles.length ? `<style>\n${this.styles.join("\n")}\n</style>` : "";
            const defs = (this.defs.length || styleXml) ? `<defs>\n${styleXml}${this.defs.join("\n")}\n</defs>` : "";
            const bg = this.bg ? `<rect width="100%" height="100%" fill="${esc(this.bg)}"/>` : "";
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${this.viewBox}" width="${this.width}" height="${this.height}">\n${defs}\n${bg}\n${this.toSVGInner()}\n</svg>`;
        }
    }

    // ============================================================
    // PathBuilder — 有機的な曲線パスを組み立てるチェーンAPI
    // ============================================================
    class PathBuilder {
        constructor(scene) { this.scene = scene; this.d = ""; }

        move(x, y) { this.d += `M${num(x)} ${num(y)} `; return this; }
        line(x, y) { this.d += `L${num(x)} ${num(y)} `; return this; }
        /** 3次ベジェ: c(c1x,c1y, c2x,c2y, x,y) */
        curve(c1x, c1y, c2x, c2y, x, y) { this.d += `C${num(c1x)} ${num(c1y)} ${num(c2x)} ${num(c2y)} ${num(x)} ${num(y)} `; return this; }
        /** 2次ベジェ: q(cx,cy, x,y) */
        quad(cx, cy, x, y) { this.d += `Q${num(cx)} ${num(cy)} ${num(x)} ${num(y)} `; return this; }
        /** 円弧: a(rx,ry,rotation,largeArc,sweep,x,y) */
        arc(rx, ry, rot, large, sweep, x, y) { this.d += `A${num(rx)} ${num(ry)} ${num(rot)} ${large ? 1 : 0} ${sweep ? 1 : 0} ${num(x)} ${num(y)} `; return this; }
        close() { this.d += "Z "; return this; }

        /**
         * Catmull-Romスプラインでpointsを滑らかに繋ぐ。
         * tension: 0=直線的, 1=ゆるい曲線（デフォルト0.5）
         */
        smooth(points, { closed = false, tension = 0.5 } = {}) {
            if (!points.length) return this;
            const n = points.length;
            const at = (i) => closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))];
            this.move(points[0][0], points[0][1]);
            const segs = closed ? n : n - 1;
            for (let i = 0; i < segs; i++) {
                const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
                const c1x = p1[0] + (p2[0] - p0[0]) * tension / 3;
                const c1y = p1[1] + (p2[1] - p0[1]) * tension / 3;
                const c2x = p2[0] - (p3[0] - p1[0]) * tension / 3;
                const c2y = p2[1] - (p3[1] - p1[1]) * tension / 3;
                this.curve(c1x, c1y, c2x, c2y, p2[0], p2[1]);
            }
            if (closed) this.close();
            return this;
        }

        toPath() { return this.d.trim(); }

        /** 塗りつぶしでシーンに追加 */
        fill(opts = {}) { return this.scene.path(this.toPath(), opts); }
        /** 線画でシーンに追加 */
        stroke(opts = {}) { return this.scene.path(this.toPath(), { fill: "none", ...opts }); }
        /** 塗り＋線画 */
        both(opts = {}) { const { strokeOpts = {}, ...rest } = opts; this.scene.path(this.toPath(), rest); return this.stroke(strokeOpts); }
    }

    // ---------- ファクトリ ----------
    function create(width, height, opts) { return new Scene(width, height, opts); }

    // ============================================================
    // APIリファレンス（プロンプト生成用・SVGDraw.prompt()から参照）
    // ============================================================
    const API_REFERENCE = `
## SVGDraw API リファレンス

\`\`\`js
const scene = SVGDraw.create(WIDTH, HEIGHT, { bg: "#color" });  // シーン生成
\`\`\`

### 図形（全て opts: { fill, stroke, strokeWidth, opacity, rx, filter:"id", clip:"id", x,y,rotate,scale }）
- \`scene.rect(x, y, w, h, opts)\` — 角丸は \`rx\`
- \`scene.circle(cx, cy, r, opts)\`
- \`scene.ellipse(cx, cy, rx, ry, opts)\`
- \`scene.line(x1, y1, x2, y2, opts)\`
- \`scene.path("M0,0 L10,10 C... Z", opts)\` — SVGパス記法
- \`scene.polygon([[x,y],...], opts)\` — 三角形・矢尻等
- \`scene.text(x, y, "文字", { fontSize, fill, anchor:"middle", fontWeight, rotate })\`

### 高度な描画
- \`scene.linearGradient("id", [[0,"#f00"],[1,"#00f"]], {x1,y1,x2,y2})\` → \`fill:"url(#id)"\`
- \`scene.radialGradient("id", stops, {cx,cy,r})\`
- \`scene.pattern("id", w, h, content)\` — 繰り返しタイル
- \`scene.clipPath("id", content)\` — 切り抜き
- \`scene.blurFilter(id?, stdDev)\` / \`scene.glowFilter(id?, {color,blur})\` / \`scene.shadowFilter(id?, {color,blur,dx,dy})\` / \`scene.noiseFilter(id?, {...})\` → \`filter:"id"\`
- \`scene.group({x,y,rotate,scale,opacity,clip}, fn)\` — グループ化・レイヤー
- \`scene.arrow(x1,y1,x2,y2,{color,strokeWidth,headSize})\`
- \`scene.grid(step, {color,opacity})\` — 補助グリッド
- \`scene.card(x,y,w,h,title,opts)\` — 見出し付きボックス

### 有機的・高密度描画（重要：機械的な図形の羅列は禁止）
- \`scene.pathBuilder()\` → PathBuilderチェーン:
  \`.move(x,y).line(x,y).curve(c1x,c1y,c2x,c2y,x,y).quad(cx,cy,x,y).arc(...).close()\`
  \`.smooth([[x,y],...],{closed,tension})\` でCatmull-Romスムージング
  最後に \`.fill(opts)\` / \`.stroke(opts)\` / \`.both(opts)\` でシーンに追加
- \`scene.smoothPath(points,{closed,tension})\` → 滑らかな "d" 文字列
- \`scene.blob(cx,cy,rx,ry,{points,jitter,rotation,seed})\` → 有機的な不定形（つた・岩・雲・細胞）
- \`scene.hatchPattern("id",{angle,spacing,color,strokeWidth,opacity})\` → 斜線ハッチングを \`fill:"url(#id)"\` で使用
- \`scene.textureStroke(d,{count,spread,color,opacity,seed})\` → 同じパスを揺らして重ね描き（手描き陰影）
- \`scene.roughenFilter(id?,{scale,octaves,seed})\` → 手描き風のがたつき
- \`scene.pencilFilter(id?,{scale,blur})\` → 鉛筆/スケッチ風

### 出力
- \`scene.toSVG()\` → 完成SVG文字列
- \`scene.toSVGInner()\` → defs以外の中身
- \`scene.stats()\` → { elements, paths, circles, groups, defs, svgBytes } 密度の自己検証用

### アニメーション（全図形のoptsで使用可）
- SMIL: \`anim: { attributeName:"opacity", values:"1;0.2;1", dur:"2s", repeatCount:"indefinite" }\`
- 変形: \`animTransform: { type:"rotate", values:"0 50 50;360 50 50", dur:"8s" }\` （type: translate/rotate/scale）
- CSS: \`cls:"my-class"\` でクラス付与 + \`scene.style(".my-class{animation:...}")\` でキーフレーム埋め込み
- 複数指定は \`anim: [ {...}, {...} ]\` の配列で。\`begin:"2s"\` で遅延開始可

### 詳細度の指針
完成SVGは数十KB〜数百KB規模のコード量を目安にする。
ベース形状→陰影→ハイライト→テクスチャ/細部の**多段描画**で作る。
有機物は必ず smooth/blob/curve で描き、直線と円弧だけの構成にしない。`.trim();

    return { create, Scene, API_REFERENCE };
});
