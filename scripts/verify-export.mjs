import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
const root = path.resolve("out");
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? walk(path.join(dir, e.name))
          : [path.join(dir, e.name)],
      ),
    )
  ).flat();
}
const files = await walk(root);
const htmlFiles = files.filter((f) => f.endsWith(".html"));
const known = new Set(files);
assert.equal(
  (await fs.readFile(path.join(root, "CNAME"), "utf8")).trim(),
  "cachestorm.com",
);
for (const file of [
  ".nojekyll",
  "404.html",
  "logo.svg",
  "logo-white.svg",
  "logo-mark.svg",
  "og.png",
  "apple-touch-icon.png",
  "robots.txt",
  "sitemap.xml",
]) {
  assert(known.has(path.join(root, file)), `Missing ${file}`);
}
const failures = [];
let links = 0;
for (const file of htmlFiles) {
  const html = await fs.readFile(file, "utf8");
  if (
    !file.endsWith("404.html") &&
    !file.includes(`${path.sep}_not-found${path.sep}`)
  ) {
    assert.match(html, /<h1[\s>]/, `Missing h1: ${file}`);
    assert.match(html, /<title>[^<]+<\/title>/, `Missing title: ${file}`);
  }
  const relative = path
    .relative(root, file)
    .replaceAll(path.sep, "/")
    .replace(/index\.html$/, "");
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll("&amp;", "&");
    if (/^(data:|mailto:|tel:|javascript:)/.test(value)) continue;
    const url = new URL(value, `https://cachestorm.com/${relative}`);
    if (url.origin !== "https://cachestorm.com") continue;
    const destination = path.join(root, decodeURIComponent(url.pathname));
    if (
      !known.has(destination) &&
      !known.has(path.join(destination, "index.html"))
    )
      failures.push(`${relative} -> ${url.pathname}`);
    links++;
  }
}
assert.deepEqual([...new Set(failures)], [], "Broken internal export URLs");
for (const file of ["logo.svg", "logo-white.svg", "logo-mark.svg"]) {
  const svg = await fs.readFile(path.join(root, file), "utf8");
  assert(!svg.includes("<image"), `${file} must be vector`);
  assert(!svg.includes("<text"), `${file} must use outlined lettering`);
}
console.log(
  `PASS: ${htmlFiles.length} HTML documents, ${links} internal asset/page links, CNAME, 404, metadata, brand vectors and SEO files.`,
);
