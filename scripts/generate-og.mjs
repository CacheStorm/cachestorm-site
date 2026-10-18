import fs from "node:fs/promises";
import opentype from "opentype.js";
import sharp from "sharp";

// Keep the share image reproducible and independent of system-installed fonts.
const fontData = await fs.readFile("scripts/Manrope-Bold.ttf");
const font = opentype.parse(
  fontData.buffer.slice(
    fontData.byteOffset,
    fontData.byteOffset + fontData.byteLength,
  ),
);
const mark = (await fs.readFile("public/logo-mark.svg", "utf8"))
  .replace(/^<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");

function text(value, x, y, size, color, weight = 600) {
  font.variation.set({ wght: weight });
  // Serialize coordinates directly: opentype's path optimizer can emit NaN.
  const coordinates = {
    M: ["x", "y"],
    L: ["x", "y"],
    Q: ["x1", "y1", "x", "y"],
    C: ["x1", "y1", "x2", "y2", "x", "y"],
    Z: [],
  };
  const path = font
    .getPath(value, x, y, size)
    .commands.map(
      (command) =>
        command.type +
        coordinates[command.type]
          .map((key) => command[key].toFixed(2))
          .join(" "),
    )
    .join("");
  if (/NaN|Infinity/.test(path))
    throw new Error(`Invalid text outline: ${value}`);
  return `<path d="${path}" fill="${color}"/>`;
}

function pill(label, x, width) {
  return `<rect x="${x}" y="553" width="${width}" height="34" rx="17" fill="#112239" stroke="#263e5a"/>${text(label, x + 15, 575, 14, "#c3d6ed")}`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <linearGradient id="background" x2="1200" y2="630" gradientUnits="userSpaceOnUse"><stop stop-color="#0a101c"/><stop offset="1" stop-color="#0d1b30"/></linearGradient>
    <radialGradient id="halo"><stop stop-color="#276fc8" stop-opacity=".38"/><stop offset="1" stop-color="#276fc8" stop-opacity="0"/></radialGradient>
    <linearGradient id="plate" x1="700" y1="240" x2="1050" y2="410" gradientUnits="userSpaceOnUse"><stop stop-color="#244e7c"/><stop offset="1" stop-color="#10223b"/></linearGradient>
    <linearGradient id="edge"><stop stop-color="#7ddcff"/><stop offset="1" stop-color="#2b78de"/></linearGradient>
    <linearGradient id="headline"><stop stop-color="#7bd9ff"/><stop offset="1" stop-color="#6ba4ff"/></linearGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#7da7db" fill-opacity=".13"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <ellipse cx="928" cy="298" rx="400" ry="350" fill="url(#halo)"/>
  <path d="M650 0H1200V530H650Z" fill="url(#dots)"/>
  <path d="M0 0H1200" stroke="#589be8" stroke-opacity=".35" stroke-width="2"/>

  <g transform="translate(62 40) scale(.43)">${mark}</g>
  ${text("CacheStorm", 118, 79, 32, "#f4f8ff", 750)}
  ${text("BUILT FOR THE FAST PATH", 66, 166, 13, "#87b8ef", 700)}
  ${text("Your data.", 62, 259, 76, "#f4f8ff", 750)}
  ${text("At the speed", 62, 344, 76, "#f4f8ff", 750)}
  ${text("of thought.", 62, 429, 76, "url(#headline)", 750)}
  ${text("The Redis-compatible in-memory data store.", 66, 482, 20, "#a1b6ce", 500)}

  <g stroke="#3e78b5" stroke-opacity=".5" stroke-width="1.5">
    <path d="M694 245V360L771 404M1110 231V354L1034 397M890 440V485"/>
    <path d="M725 190L774 218M1064 191L1015 219"/>
    <circle cx="694" cy="239" r="5" fill="#77caff"/>
    <circle cx="1110" cy="225" r="5" fill="#77caff"/>
    <circle cx="890" cy="491" r="5" fill="#77caff"/>
  </g>
  <path d="m680 371 210-114 210 114-210 115Z" fill="#0a1627" stroke="#22446c"/>
  <path d="m680 352 210-114 210 114v19L890 486 680 371Z" fill="#10223c" stroke="#294e78"/>
  <path d="m680 352 210-114 210 114-210 115Z" fill="url(#plate)" stroke="#3b70a9"/>
  <path d="m710 321 180-98 180 98v21l-180 98-180-98Z" fill="#122d4e" stroke="#3269a1"/>
  <path d="m710 321 180-98 180 98-180 98Z" fill="url(#plate)" stroke="url(#edge)" stroke-width="2"/>
  <path d="m742 305 148-81 148 81-148 81Z" fill="#0b1a2e" stroke="#488acb" stroke-opacity=".55"/>
  <path d="m710 342 180 98 180-98" stroke="#63b9ff" stroke-opacity=".6"/>
  <g transform="translate(803 131) scale(1.78)">${mark}</g>
  <g fill="#90d8ff"><circle cx="756" cy="356" r="2"/><circle cx="768" cy="363" r="2"/><circle cx="780" cy="370" r="2"/></g>

  <path d="M66 532H1134" stroke="#273b54"/>
  ${pill("Pure Go", 66, 87)}
  ${pill("One binary", 163, 110)}
  ${pill("Apache 2.0", 283, 113)}
  ${text("cachestorm.com", 954, 576, 19, "#c3d6ed", 650)}
  <path d="M1121 570h13m-5-5 5 5-5 5" stroke="#72b7ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

await sharp(Buffer.from(svg))
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toFile("public/og.png");
console.log("Generated public/og.png (1200 × 630).");
