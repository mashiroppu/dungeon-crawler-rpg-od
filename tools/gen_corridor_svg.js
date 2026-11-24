// Generates assets/bg/corridor.svg — a perspective dungeon corridor.
// Corner lines converge to a vanishing point; wall masonry is laid out
// on the wall's TRUE boundary curves (kinked top/bottom edges) so brick
// courses run all the way into the ceiling and floor lines.
const fs = require('fs');
const path = require('path');

const W = 480, H = 360;
const VP = { x: 240, y: 168 };

const LTn = { x: 70, y: 0 },   RTn = { x: 410, y: 0 };
const LBn = { x: 30, y: 360 }, RBn = { x: 450, y: 360 };

const T_END = 0.88;
const lerp = (a, b, t) => a + (b - a) * t;
const lerpP = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
const pt = p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

// end-wall corners at T_END along each corner line
const LT = lerpP(LTn, VP, T_END), RT = lerpP(RTn, VP, T_END);
const LB = lerpP(LBn, VP, T_END), RB = lerpP(RBn, VP, T_END);

// ---- wall surface parameterization ----
// Each wall is bounded by a kinked top path and bottom path.
// f in [0,1] walks the boundary by arc length (0 = screen edge, 1 = end wall).
// v in [0,1] interpolates top->bottom at that depth.
function makeWall(topPts, botPts) {
  const chain = pts => {
    const segs = [];
    let L = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const l = dist(pts[i], pts[i + 1]);
      segs.push({ a: pts[i], b: pts[i + 1], l0: L, l });
      L += l;
    }
    return { segs, L };
  };
  const T = chain(topPts), B = chain(botPts);
  const at = (c, d) => {
    d = Math.min(Math.max(d, 0), c.L - 1e-4);
    const s = c.segs.find(s => d <= s.l0 + s.l) || c.segs[c.segs.length - 1];
    return lerpP(s.a, s.b, (d - s.l0) / s.l);
  };
  return (f, v) => lerpP(at(T, f * T.L), at(B, f * B.L), v);
}

// left wall boundary paths: (0,0)->(70,0)->LT  /  (0,360)->(30,360)->LB
const lwP = makeWall([{ x: 0, y: 0 }, LTn, LT], [{ x: 0, y: 360 }, LBn, LB]);
// right wall mirrored
const rwP = makeWall([{ x: W, y: 0 }, RTn, RT], [{ x: W, y: 360 }, RBn, RB]);

// floor / ceiling keep simple bilinear (their edges are straight)
function bil(A, B, C, D, u, v) {
  return lerpP(lerpP(A, C, u), lerpP(B, D, u), v);
}
const flP = (u, v) => bil(LBn, LB, RBn, RB, u, v); // u:0 near->1 far, v:0 left->1 right
const ceP = (u, v) => bil(LTn, LT, RTn, RT, u, v);

let out = [];
const add = s => out.push(s);

add(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`);
add(`<defs>`);
add(`<linearGradient id="wallL" gradientUnits="userSpaceOnUse" x1="0" y1="180" x2="${LT.x.toFixed(0)}" y2="${LT.y.toFixed(0)}">
  <stop offset="0" stop-color="#38304e"/><stop offset="0.45" stop-color="#2a2340"/>
  <stop offset="0.8" stop-color="#1a1428"/><stop offset="1" stop-color="#120d1e"/></linearGradient>`);
add(`<linearGradient id="wallR" gradientUnits="userSpaceOnUse" x1="${W}" y1="180" x2="${RT.x.toFixed(0)}" y2="${RT.y.toFixed(0)}">
  <stop offset="0" stop-color="#38304e"/><stop offset="0.45" stop-color="#2a2340"/>
  <stop offset="0.8" stop-color="#1a1428"/><stop offset="1" stop-color="#120d1e"/></linearGradient>`);
add(`<linearGradient id="floorG" gradientUnits="userSpaceOnUse" x1="240" y1="360" x2="240" y2="${((LB.y + RB.y) / 2).toFixed(0)}">
  <stop offset="0" stop-color="#3a2d22"/><stop offset="0.5" stop-color="#2a211a"/>
  <stop offset="0.85" stop-color="#181310"/><stop offset="1" stop-color="#0d0a08"/></linearGradient>`);
add(`<linearGradient id="ceilG" gradientUnits="userSpaceOnUse" x1="240" y1="0" x2="240" y2="${((LT.y + RT.y) / 2).toFixed(0)}">
  <stop offset="0" stop-color="#1c1626"/><stop offset="0.6" stop-color="#131022"/>
  <stop offset="1" stop-color="#0a0712"/></linearGradient>`);
add(`<linearGradient id="endG" gradientUnits="userSpaceOnUse" x1="240" y1="148" x2="240" y2="192">
  <stop offset="0" stop-color="#241c33"/><stop offset="1" stop-color="#0c0916"/></linearGradient>`);
add(`<radialGradient id="flameG" cx="0.5" cy="0.65" r="0.6">
  <stop offset="0" stop-color="#fff3c0"/><stop offset="0.4" stop-color="#ffb347"/>
  <stop offset="0.75" stop-color="#ff6a1a" stop-opacity="0.7"/>
  <stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient>`);
add(`<radialGradient id="torchPool" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="#ff9a40" stop-opacity="0.30"/>
  <stop offset="0.6" stop-color="#ff8a30" stop-opacity="0.10"/>
  <stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>`);
add(`<radialGradient id="fogG" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="#8d86b8" stop-opacity="0.16"/>
  <stop offset="1" stop-color="#8d86b8" stop-opacity="0"/></radialGradient>`);
add(`<radialGradient id="vig" cx="0.5" cy="0.46" r="0.75">
  <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
  <stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>`);
add(`</defs>`);

// ---------- planes ----------
add(`<polygon points="${pt(LTn)} ${pt(RTn)} ${pt(RT)} ${pt(LT)}" fill="url(#ceilG)"/>`);
add(`<polygon points="${pt(LBn)} ${pt(RBn)} ${pt(RB)} ${pt(LB)}" fill="url(#floorG)"/>`);
add(`<polygon points="${pt(LT)} ${pt(RT)} ${pt(RB)} ${pt(LB)}" fill="url(#endG)"/>`);
add(`<polygon points="0,0 ${pt(LTn)} ${pt(LT)} ${pt(LB)} ${pt(LBn)} 0,${H}" fill="url(#wallL)"/>`);
add(`<polygon points="${W},0 ${pt(RTn)} ${pt(RT)} ${pt(RB)} ${pt(RBn)} ${W},${H}" fill="url(#wallR)"/>`);

// ---------- masonry: courses + staggered joints on TRUE wall boundaries ----------
function mortar(wallP) {
  const courses = 12, bands = courses - 1;
  let lines = '';
  // horizontal courses: connect wall's left edge to end-wall edge at height v
  for (let i = 1; i < courses; i++) {
    const v = i / courses;
    const p0 = wallP(0, v), p1 = wallP(1, v);
    lines += `<line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="rgba(0,0,0,0.5)" stroke-width="1.6"/>`;
  }
  // vertical joints: segmented per course band, staggered
  const perBand = 6;
  for (let i = 0; i < bands; i++) {
    const v0 = i / courses, v1 = (i + 1) / courses;
    const off = (i % 2) * 0.5;
    for (let j = 0; j < perBand; j++) {
      const f = ((j + off) / perBand) * 0.94 + 0.03;
      const a = wallP(f, v0), b = wallP(f, v1);
      lines += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="rgba(0,0,0,0.42)" stroke-width="1.2"/>`;
    }
  }
  return `<g>${lines}</g>`;
}
add(mortar(lwP));
add(mortar(rwP));

// ---------- floor slabs ----------
let floorLines = '';
for (let i = 1; i < 9; i++) {
  const v = i / 9;
  const p0 = flP(0, v), p1 = flP(1, v);
  floorLines += `<line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="rgba(0,0,0,0.5)" stroke-width="1.6"/>`;
}
for (let i = 1; i < 8; i++) {
  const u = i / 8;
  const p0 = flP(u, 0), p1 = flP(u, 1);
  floorLines += `<line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="rgba(0,0,0,0.42)" stroke-width="1.3"/>`;
}
add(`<g>${floorLines}</g>`);

// ---------- ceiling beams ----------
let ceilLines = '';
for (let i = 1; i < 7; i++) {
  const v = i / 7;
  const p0 = ceP(0, v), p1 = ceP(1, v);
  ceilLines += `<line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="rgba(0,0,0,0.55)" stroke-width="2.6"/>`;
}
for (let i = 1; i < 6; i++) {
  const u = i / 6;
  const p0 = ceP(u, 0), p1 = ceP(u, 1);
  ceilLines += `<line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="rgba(0,0,0,0.4)" stroke-width="1.4"/>`;
}
add(`<g>${ceilLines}</g>`);

// ---------- torches on walls ----------
const torchPos = [
  { wall: 'L', u: 0.16 }, { wall: 'R', u: 0.30 },
  { wall: 'L', u: 0.48 }, { wall: 'R', u: 0.62 },
  { wall: 'L', u: 0.78 }, { wall: 'R', u: 0.88 }
];
let torchEls = '';
for (const t of torchPos) {
  const P = t.wall === 'L' ? lwP : rwP;
  const c = P(t.u, 0.30);
  const depthScale = 1 - t.u * 0.72;
  const fw = 10 * depthScale + 3, fh = 14 * depthScale + 3;
  const b = [P(t.u - 0.012, 0.335), P(t.u + 0.012, 0.335), P(t.u + 0.012, 0.375), P(t.u - 0.012, 0.375)];
  const gw = 46 * depthScale + 8, gh = 40 * depthScale + 8;
  const fx = lerp(c.x, 240, 0.35), fy = lerp(c.y + 60 * depthScale + 20, 300, t.u * 0.55);
  const pw = 90 * depthScale + 14, ph = 34 * depthScale + 6;
  torchEls += `<ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="${pw.toFixed(1)}" ry="${ph.toFixed(1)}" fill="url(#torchPool)"/>`;
  torchEls += `<ellipse cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" rx="${(gw / 2).toFixed(1)}" ry="${(gh / 2).toFixed(1)}" fill="url(#flameG)" opacity="0.8"/>`;
  torchEls += `<polygon points="${b.map(pt).join(' ')}" fill="#1c130c"/>`;
  torchEls += `<ellipse cx="${c.x.toFixed(1)}" cy="${(c.y - fh * 0.3).toFixed(1)}" rx="${(fw / 2).toFixed(1)}" ry="${(fh / 2).toFixed(1)}" fill="url(#flameG)"/>`;
}
add(`<g>${torchEls}</g>`);

// ---------- end wall: plain arch doorway (no glow) ----------
const ecx = (LT.x + RT.x + RB.x + LB.x) / 4, ecy = (LT.y + RT.y + RB.y + LB.y) / 4;
add(`<path d="M ${ecx - 15} ${LB.y - 2} L ${ecx - 15} ${ecy - 6} Q ${ecx - 15} ${ecy - 26} ${ecx} ${ecy - 30} Q ${ecx + 15} ${ecy - 26} ${ecx + 15} ${ecy - 6} L ${ecx + 15} ${LB.y - 2} Z"
  fill="#05030a" stroke="#3a2f52" stroke-width="1.4"/>`);
let endLines = '';
for (let i = 1; i < 4; i++) {
  const y = lerp(LT.y, LB.y, i / 4);
  const xl = lerp(LT.x, LB.x, i / 4), xr = lerp(RT.x, RB.x, i / 4);
  endLines += `<line x1="${xl.toFixed(1)}" y1="${y.toFixed(1)}" x2="${xr.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>`;
}
add(`<g>${endLines}</g>`);

// ---------- atmosphere ----------
add(`<ellipse cx="${VP.x}" cy="${VP.y}" rx="150" ry="90" fill="url(#fogG)"/>`);
add(`<ellipse cx="${VP.x - 60}" cy="${VP.y + 20}" rx="110" ry="60" fill="url(#fogG)" opacity="0.7"/>`);
add(`<rect x="0" y="0" width="${W}" height="${H}" fill="url(#vig)"/>`);

add(`</svg>`);

const svg = out.join('\n');
const dest = path.join(__dirname, '..', 'assets', 'bg', 'corridor.svg');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, svg);
console.log('wrote', dest, svg.length, 'bytes,', out.length, 'elements');
