import fs from "node:fs/promises";
import sharp from "sharp";
const mark = `<defs><linearGradient id="blue" x1="12" y1="15" x2="72" y2="109" gradientUnits="userSpaceOnUse"><stop stop-color="#72d6f4"/><stop offset=".48" stop-color="#248ac5"/><stop offset="1" stop-color="#105181"/></linearGradient><linearGradient id="silver" x1="40" y1="17" x2="91" y2="107" gradientUnits="userSpaceOnUse"><stop stop-color="#d6e1e8"/><stop offset="1" stop-color="#718895"/></linearGradient></defs><path d="M48 8C36 6 26 20 11 28C5 31 5 38 7 49L7 87C7 95 17 99 29 106L36 91C18 81 13 66 17 49C20 33 31 21 47 19Z" fill="url(#blue)" stroke="#24607e" stroke-width="2.5"/><path d="M42 15C29 22 19 33 17 48C12 70 21 84 32 91M10 39C10 64 16 83 29 94" stroke="#a7e4f5" stroke-width="2" stroke-linecap="round"/><path d="m69 17 23 16-20 10-7-13ZM72 78l21 11c-5 17-22 27-43 28l8-16c13-2 20-9 21-16" fill="url(#silver)" stroke="#788b97" stroke-width="2.5"/><path d="m72 23 13 10-12 6M62 108c12-4 20-10 24-17" stroke="#eef5f8" stroke-width="2" stroke-linecap="round"/><g fill="#b9edff"><circle cx="14" cy="37" r="2.5"/><circle cx="43" cy="15" r="2.5"/><circle cx="15" cy="89" r="2.5"/></g><g fill="#f2f7fa"><circle cx="77" cy="30" r="2.5"/><circle cx="65" cy="107" r="2.5"/></g><path d="M66 3 27 65h22l-19 52 45-66H54L66 3Z" fill="url(#blue)" stroke="#143f5c" stroke-width="2.4" stroke-linejoin="round"/><path d="M61 16 37 61h20l-16 39 25-45H49L61 16Z" fill="#89d8ed" opacity=".72"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none" role="img" aria-label="CacheStorm">${mark}</svg>`;
await fs.writeFile("public/logo-mark.svg", svg);
// Convert the wordmark to vector outlines so downloads need no installed fonts.
const { default: opentype } = await import("opentype.js");
const fontData = await fs.readFile("scripts/Manrope-Bold.ttf");
const font = opentype.parse(
  fontData.buffer.slice(
    fontData.byteOffset,
    fontData.byteOffset + fontData.byteLength,
  ),
);
const wordPath = font.getPath("CacheStorm", 122, 80, 67).toPathData(2);
for (const [file, color] of [
  ["logo.svg", "#111e31"],
  ["logo-white.svg", "#f4f8ff"],
]) {
  await fs.writeFile(
    `public/${file}`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 120" fill="none" role="img" aria-label="CacheStorm">${mark}<path d="${wordPath}" fill="${color}"/></svg>`,
  );
}
await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" rx="38" fill="#f8fafc"/><g transform="translate(30 18) scale(1.2)">${mark}</g></svg>`,
  ),
)
  .png()
  .toFile("public/apple-touch-icon.png");
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><radialGradient id="g"><stop stop-color="#b5d6ff"/><stop offset="1" stop-color="#f8fafc"/></radialGradient></defs><rect width="1200" height="630" fill="#f8fafc"/><circle cx="1000" cy="300" r="470" fill="url(#g)"/><g transform="translate(870 110) scale(2.7)">${mark}</g><text x="70" y="90" fill="#185cbb" font-size="22" font-family="Arial,sans-serif" letter-spacing="4">CACHESTORM</text><text x="66" y="242" fill="#111e31" font-size="84" font-family="Arial,sans-serif" font-weight="bold" letter-spacing="-4">Your data.</text><text x="66" y="340" fill="#111e31" font-size="84" font-family="Arial,sans-serif" font-weight="bold" letter-spacing="-4">At the speed</text><text x="66" y="438" fill="#1765cd" font-size="84" font-family="Arial,sans-serif" font-weight="bold" letter-spacing="-4">of thought.</text><text x="72" y="542" fill="#536477" font-family="Arial,sans-serif" font-size="23">Redis-compatible. Pure Go. One binary.</text><path d="M70 585H1130" stroke="#dce4ee"/><text x="1130" y="547" text-anchor="end" font-family="Arial,sans-serif" font-size="17" fill="#536477">cachestorm.com</text></svg>`;
await sharp(Buffer.from(og)).png().toFile("public/og.png");
console.log("Generated SVG brand assets, Open Graph image and Apple icon.");
