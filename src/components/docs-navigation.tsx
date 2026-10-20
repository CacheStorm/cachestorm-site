"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal } from "lucide-react";
import { docLinks } from "@/lib/site";
const groups = [...new Set(docLinks.map((d) => d.group))];
export function DocsNavigation() {
  const path = usePathname();
  const router = useRouter();
  const currentPath = path === "/docs/api/" ? "/docs/http-api/" : path;
  return (
    <>
      <aside className="docs-sidebar" aria-label="Documentation navigation">
        {groups.map((group) => (
          <div key={group}>
            <p className="eyebrow">{group}</p>
            {docLinks
              .filter((d) => d.group === group)
              .map((d) => (
                <Link
                  href={`/docs/${d.slug}/`}
                  key={d.slug}
                  className={currentPath === `/docs/${d.slug}/` ? "active" : ""}
                  aria-current={
                    currentPath === `/docs/${d.slug}/` ? "page" : undefined
                  }
                >
                  {d.title}
                </Link>
              ))}
          </div>
        ))}
        <Link
          href="/docs/commands/"
          className={`docs-command-link ${path === "/docs/commands/" ? "active" : ""}`}
          aria-current={path === "/docs/commands/" ? "page" : undefined}
        >
          <Terminal size={15} />
          Command reference
        </Link>
      </aside>
      <div className="docs-mobile-select">
        <label className="sr-only" htmlFor="docs-select">
          Documentation page
        </label>
        <select
          id="docs-select"
          value={currentPath}
          onChange={(e) => router.push(e.target.value)}
        >
          <option value="/docs/">Documentation overview</option>
          {docLinks.map((d) => (
            <option key={d.slug} value={`/docs/${d.slug}/`}>
              {d.title}
            </option>
          ))}
          <option value="/docs/commands/">Command reference</option>
        </select>
      </div>
    </>
  );
}
