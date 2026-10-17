import type { Metadata } from "next";
import { CommandExplorer } from "@/components/commands";
import { COMMIT, SOURCE } from "@/lib/site";
export const metadata: Metadata = {
  title: "Command reference",
  description:
    "Search and filter the command syntax documented by CacheStorm upstream.",
  alternates: { canonical: "/docs/commands/" },
};
export default function CommandsPage() {
  return (
    <article className="doc-content">
      <p className="eyebrow">THE COMMAND EXPLORER</p>
      <h1>A command for that.</h1>
      <p className="doc-description">
        Find the right operation. See its shape. Make it yours.
      </p>
      <div className="doc-source">
        <span>Extracted from docs/commands.md · {COMMIT.slice(0, 7)}</span>
        <a href={`${SOURCE}/docs/commands.md`} target="_blank" rel="noreferrer">
          Full upstream reference ↗
        </a>
      </div>
      <p className="command-intro">
        This explorer indexes the signatures present in the upstream reference.
        It is a documentation index, not a live command inventory or a guarantee
        of complete Redis compatibility.
      </p>
      <CommandExplorer />
    </article>
  );
}
