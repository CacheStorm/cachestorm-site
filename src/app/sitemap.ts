import type { MetadataRoute } from "next";
import { docLinks } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/features/",
    "/benchmarks/",
    "/changelog/",
    "/brand/",
    "/docs/",
    "/docs/commands/",
    ...docLinks.map((d) => `/docs/${d.slug}/`),
  ].map((path) => ({
    url: `https://cachestorm.com${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
