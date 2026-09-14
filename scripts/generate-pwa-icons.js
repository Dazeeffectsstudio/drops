// Régénère les icônes PWA (public/icons/*.png) à partir de public/favicon.svg
// et public/icons/icon-maskable-source.svg. À relancer si le logo change :
//   node scripts/generate-pwa-icons.js
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const regularSvg = fs.readFileSync(path.join(root, "public", "favicon.svg"));
const maskableSvg = fs.readFileSync(path.join(iconsDir, "icon-maskable-source.svg"));

async function main() {
  const jobs = [
    { src: regularSvg, size: 192, out: "icon-192.png" },
    { src: regularSvg, size: 512, out: "icon-512.png" },
    { src: regularSvg, size: 180, out: "apple-touch-icon.png" },
    { src: maskableSvg, size: 192, out: "icon-maskable-192.png" },
    { src: maskableSvg, size: 512, out: "icon-maskable-512.png" },
  ];
  for (const job of jobs) {
    await sharp(job.src, { density: 384 }).resize(job.size, job.size).png().toFile(path.join(iconsDir, job.out));
    console.log(`✓ ${job.out}`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
