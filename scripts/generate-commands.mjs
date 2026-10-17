import fs from "node:fs/promises";
const md = await fs.readFile("src/content/upstream-commands.md", "utf8");
let section = "Commands",
  category = "Commands",
  code = false;
const found = new Map();
for (const line of md.split(/\r?\n/)) {
  if (line.startsWith("## ")) {
    section = line.slice(3);
    category = section;
  }
  if (line.startsWith("### ")) category = line.slice(4);
  if (line.startsWith("```")) {
    code = !code;
    continue;
  }
  if (code && /^[A-Z][A-Z0-9_.:-]*(?: |$)/.test(line.trim())) {
    const syntax = line.trim();
    const name = syntax.split(/\s/)[0];
    if (!found.has(syntax))
      found.set(syntax, { name, syntax, category, section });
  }
}
const entries = [...found.values()];
if (process.argv.includes("--check")) {
  const existing = JSON.parse(
    await fs.readFile("src/content/commands.json", "utf8"),
  );
  if (JSON.stringify(existing) !== JSON.stringify(entries))
    throw new Error(
      "Command index differs from its pinned source. Run npm run commands.",
    );
  console.log(
    `PASS: ${entries.length} signatures match the pinned upstream reference.`,
  );
} else {
  await fs.writeFile(
    "src/content/commands.json",
    JSON.stringify(entries, null, 2) + "\n",
  );
  console.log(`Generated ${entries.length} documented command signatures.`);
}
