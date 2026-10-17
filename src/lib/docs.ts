import fs from "node:fs";
import path from "node:path";
import { docLinks } from "./site";
export function readDoc(slug: string) {
  const meta = docLinks.find((d) => d.slug === slug);
  if (!meta) return null;
  return {
    ...meta,
    body: fs.readFileSync(
      path.join(process.cwd(), "src/content/docs", `${slug}.md`),
      "utf8",
    ),
  };
}
