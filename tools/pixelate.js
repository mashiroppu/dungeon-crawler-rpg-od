const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const DIR = process.argv[2];
const TARGET_H = parseInt(process.argv[3] || '128'); // EVERY sprite -> this height
const Q = parseInt(process.argv[4] || '10');

const quant = v => Math.round(v / 255 * (Q - 1)) / (Q - 1) * 255;

for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.png'))) {
    const src = PNG.sync.read(fs.readFileSync(path.join(DIR, f)));
    const { width: w, height: h, data } = src;
    const nh = TARGET_H;
    const nw = Math.max(1, Math.round(w * (nh / h)));
    const sx = w / nw, sy = h / nh; // source px per dest px
    const out = new PNG({ width: nw, height: nh });
    for (let y = 0; y < nh; y++) {
        for (let x = 0; x < nw; x++) {
            const px = Math.min(w - 1, Math.floor((x + 0.5) * sx));
            const py = Math.min(h - 1, Math.floor((y + 0.5) * sy));
            const si = (py * w + px) << 2, di = (y * nw + x) << 2;
            out.data[di]     = quant(data[si]);
            out.data[di + 1] = quant(data[si + 1]);
            out.data[di + 2] = quant(data[si + 2]);
            out.data[di + 3] = data[si + 3];
        }
    }
    fs.writeFileSync(path.join(DIR, f), PNG.sync.write(out));
    console.log(`${f}: ${w}x${h} -> ${nw}x${nh}`);
}
