import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const sizes = [16, 32, 48, 128];
const outputDir = path.resolve('public/icons');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

sizes.forEach(size => {
  const png = new PNG({ width: size, height: size });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Center distance for rounded corner
      const cx = x / size - 0.5;
      const cy = y / size - 0.5;

      // Rounded rectangle mask (radius ~ 22%)
      const cornerDist = Math.hypot(Math.max(0, Math.abs(cx) - 0.35), Math.max(0, Math.abs(cy) - 0.35));
      if (cornerDist > 0.14) {
        png.data[idx + 3] = 0; // transparent
        continue;
      }

      // Violet-to-indigo gradient
      const t = (x + y) / (2 * size);
      const rVal = Math.round(99 * (1 - t) + 59 * t);
      const gVal = Math.round(102 * (1 - t) + 130 * t);
      const bVal = Math.round(241 * (1 - t) + 246 * t);

      const nx = x / size;
      const ny = y / size;

      let isFg = false;

      // Draw "M" on the left: nx in [0.2, 0.54], ny in [0.28, 0.72]
      if (ny >= 0.28 && ny <= 0.72) {
        const thickness = 0.065;
        // Left bar
        if (nx >= 0.20 && nx <= 0.20 + thickness) isFg = true;
        // Right bar
        if (nx >= 0.52 - thickness && nx <= 0.52) isFg = true;
        // Diagonals of M
        const midX = 0.36;
        const leftDiag = (ny - 0.28) / (0.58 - 0.28) * (midX - 0.20) + 0.20;
        if (ny <= 0.58 && Math.abs(nx - leftDiag) < thickness * 0.7) isFg = true;
        const rightDiag = 0.52 - (ny - 0.28) / (0.58 - 0.28) * (0.52 - midX);
        if (ny <= 0.58 && Math.abs(nx - rightDiag) < thickness * 0.7) isFg = true;
      }

      // Draw downward arrow on the right
      if (nx >= 0.60 && nx <= 0.82) {
        const arrX = 0.71;
        const stemThickness = 0.045;
        // Stem
        if (ny >= 0.28 && ny <= 0.58 && Math.abs(nx - arrX) <= stemThickness) {
          isFg = true;
        }
        // Arrow head
        if (ny >= 0.48 && ny <= 0.72) {
          const dy = ny - 0.48;
          const arrowHalfW = dy * 0.55;
          if (Math.abs(nx - arrX) <= arrowHalfW + 0.02 && ny >= 0.58 - (arrowHalfW * 0.5)) {
            isFg = true;
          }
        }
      }

      if (isFg) {
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 255;
      } else {
        png.data[idx] = rVal;
        png.data[idx + 1] = gVal;
        png.data[idx + 2] = bVal;
        png.data[idx + 3] = 255;
      }
    }
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(path.join(outputDir, `icon${size}.png`), buffer);
  console.log(`Generated icon${size}.png`);
});
