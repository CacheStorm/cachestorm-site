import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { docLinks } from "@/lib/site";
export const metadata: Metadata = {
  title: "Documentation",
  alternates: { canonical: "/docs/" },
};
export default function DocsIndex() {
  return (
    <article className="doc-content">
      <p className="eyebrow">THE DEVELOPER’S FIELD GUIDE</p>
      <h1>Build something fast.</h1>
      <p className="doc-description">
        Everything you need to connect, build and run CacheStorm.
      </p>
      <div className="docs-index-grid">
        {docLinks.map((d) => (
          <Link href={`/docs/${d.slug}/`} key={d.slug}>
            <span className="mono">{d.group}</span>
            <h2>
              {d.title}
              <ArrowUpRight size={17} />
            </h2>
            <p>{d.description}</p>
          </Link>
        ))}
        <Link href="/docs/commands/">
          <span className="mono">Reference</span>
          <h2>
            Command explorer
            <ArrowUpRight size={17} />
          </h2>
          <p>
            Search the command signatures documented in the upstream reference.
          </p>
        </Link>
      </div>
    </article>
  );
}
