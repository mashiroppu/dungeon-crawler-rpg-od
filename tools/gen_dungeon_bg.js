// Procedurally generate a dungeon combat backdrop (brick wall + stone floor + torchlight)
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const W = 640, H = 400;
const FLOOR_Y = Math.round(H * 0.55);
const png = new PNG({ width: W, height: H });
const d = png.data;

// seeded rng for deterministic output
let seed = 1337;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

const setPx = (x, y, r, g, b) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 4;
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
};
const clamp = v => Math.max(0, Math.min(255, Math.round(v)));

// color helpers: base stone palette
const brickColor = (variation) => {
    // dusty purple-gray stone bricks
    const l = 48 + variation * 14;         // lightness jitter
    const warm = variation > 0.6 ? 6 : 0; // occasional warm brick
    return [clamp(l + warm + rnd() * 6 - 3), clamp(l * 0.82 + warm), clamp(l * 1.15 + 8)];
};
const mortar = [14, 12, 10];

// ---------- WALL: running-bond bricks ----------
const BH = 24, BW = 64, M = 3; // brick h/w, mortar thickness
for (let row = 0, y = 0; y < FLOOR_Y; row++, y += BH) {
    const offset = (row % 2) * (BW / 2);
    for (let x = -BW; x < W + BW; x += BW) {
        const bx = x + offset;
        const variation = rnd();
        const [br, bg, bb] = brickColor(variation);
        for (let py = y; py < Math.min(y + BH - M, FLOOR_Y); py++) {
            for (let px = bx; px < bx + BW - M; px++) {
                if (px < 0 || px >= W || py < 0) continue;
                // per-pixel speckle noise
                const n = (rnd() - 0.5) * 14;
                // darker toward mortar edges (bevel)
                const edge = Math.min(px - bx, bx + BW - M - px, py - y, y + BH - M - py);
                const bevel = edge < 3 ? -14 : 0;
                setPx(px, py, br + n + bevel, bg + n + bevel, bb + n + bevel);
            }
        }
    }
    // horizontal mortar line
    for (let px = 0; px < W; px++) {
        for (let m = 0; m < M; m++) {
            setPx(px, y + BH - M + m, mortar[0], mortar[1], mortar[2]);
        }
    }
}
// vertical mortar (draw after bricks so it sits on top)
for (let row = 0, y = 0; y < FLOOR_Y; row++, y += BH) {
    const offset = (row % 2) * (BW / 2);
    for (let x = -BW; x < W + BW; x += BW) {
        const bx = x + offset;
        for (let px = bx; px < Math.min(bx + M, W); px++) {
            for (let py = y; py < Math.min(y + BH - M, FLOOR_Y); py++) {
                if (px >= 0) setPx(px, py, mortar[0], mortar[1], mortar[2]);
            }
        }
    }
}

// ---------- FLOOR: large stone slabs ----------
const TH = 34;
for (let y = FLOOR_Y; y < H; y += TH) {
    const rowShade = (y - FLOOR_Y) / (H - FLOOR_Y); // darker toward bottom
    for (let x = 0; x < W; x++) {
        // tile grid: offset every other row
        const row = Math.floor((y - FLOOR_Y) / TH);
        const tx = Math.floor(x / 96) * 96 + (row % 2 ? 48 : 0);
        const inV = x % 96 === 0 || (x - 48) % 96 === 0;
        const tileNoise = (Math.sin(tx * 12.9898 + row * 78.233) * 43758.5453) % 1;
        const base = 44 - rowShade * 14 + tileNoise * 10;
        let r = base * 0.9, g = base * 0.78, b = base * 0.66;
        if (y % TH < 3 || inV) { r = 12; g = 10; b = 9; } // mortar lines
        setPx(x, y, clamp(r), clamp(g), clamp(b));
    }
}
// floor front edge shadow (wall/floor seam)
for (let y = FLOOR_Y - 6; y < FLOOR_Y + 4; y++) {
    for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const f = 0.55;
        d[i] = d[i] * f; d[i + 1] = d[i + 1] * f; d[i + 2] = d[i + 2] * f;
    }
}

// ---------- CRACKS: a few random dark fissures on the wall ----------
for (let c = 0; c < 7; c++) {
    let x = Math.floor(rnd() * W), y = Math.floor(rnd() * FLOOR_Y * 0.8);
    const len = 15 + Math.floor(rnd() * 30);
    for (let s = 0; s < len; s++) {
        setPx(x, y, 18, 15, 13);
        x += Math.floor(rnd() * 3) - 1;
        y += Math.floor(rnd() * 3);
        if (y >= FLOOR_Y) break;
    }
}

// ---------- LIGHTING: torch glows + vignette ----------
const torches = [[W * 0.07, H * 0.10, 150], [W * 0.93, H * 0.10, 150]];
for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        for (const [tx, ty, rad] of torches) {
            const dist = Math.hypot(x - tx, y - ty) / rad;
            if (dist < 1) {
                const glow = (1 - dist) * (1 - dist) * 110;
                d[i] = clamp(d[i] + glow * 1.15);       // warm red
                d[i + 1] = clamp(d[i + 1] + glow * 0.62); // less green
                d[i + 2] = clamp(d[i + 2] + glow * 0.25); // little blue
            }
        }
        // vignette: darken corners/edges
        const nx = (x / W - 0.5) * 2, ny = (y / H - 0.5) * 2;
        const vig = Math.min(1, Math.hypot(nx * 0.9, ny) * 0.55);
        const vf = 1 - vig * 0.42;
        d[i] *= vf; d[i + 1] *= vf; d[i + 2] *= vf;
    }
}

fs.mkdirSync(path.dirname(process.argv[2]), { recursive: true });
fs.writeFileSync(process.argv[2], PNG.sync.write(png));
console.log('wrote', process.argv[2], W + 'x' + H);
