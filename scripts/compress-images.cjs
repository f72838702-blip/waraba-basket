/* Compresse les images du site dans public/images (qualité web).
   Usage: node scripts/compress-images.cjs */
const sharp = require("sharp");
const path = require("node:path");

const dir = path.join(__dirname, "..", "public", "images");

// maxDimension = limite de la plus grande arête (px), quality = qualité JPEG.
const jobs = [
  { file: "hero.jpg", maxDimension: 1920, quality: 82 },
  { file: "team.jpg", maxDimension: 1600, quality: 82 },
  { file: "action-1.jpg", maxDimension: 1280, quality: 82 },
  { file: "action-2.jpg", maxDimension: 1200, quality: 82 },
  { file: "action-3.jpg", maxDimension: 1280, quality: 82 },
];

(async () => {
  let totalBefore = 0;
  let totalAfter = 0;
  for (const { file, maxDimension, quality } of jobs) {
    const src = path.join(dir, file);
    const tmp = path.join(dir, file + ".tmp.jpg");
    const before = require("node:fs").statSync(src).size;
    await sharp(src)
      .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true, progressive: true })
      .toFile(tmp);
    require("node:fs").renameSync(tmp, src);
    const after = require("node:fs").statSync(src).size;
    totalBefore += before;
    totalAfter += after;
    console.log(`${file}: ${(before / 1024).toFixed(0)} Ko -> ${(after / 1024).toFixed(0)} Ko`);
  }
  console.log(`--- total: ${(totalBefore / 1024 / 1024).toFixed(2)} Mo -> ${(totalAfter / 1024 / 1024).toFixed(2)} Mo`);
})();