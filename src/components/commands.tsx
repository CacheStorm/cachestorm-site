"use client";
import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import commands from "@/content/commands.json";
import { CopyButton } from "./ui";
import { SOURCE } from "@/lib/site";
const categories = [...new Set(commands.map((c) => c.category))];
export function CommandExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [limit, setLimit] = useState(60);
  const filtered = useMemo(
    () =>
      commands.filter(
        (c) =>
          (category === "all" || c.category === category) &&
          `${c.name} ${c.syntax} ${c.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, category],
  );
  return (
    <>
      <div className="command-controls">
        <label className="command-search">
          <Search size={18} />
          <span className="sr-only">Search commands</span>
          <input
            placeholder="Search GET, JSON, TTL…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(60);
            }}
          />
        </label>
        <label className="sr-only" htmlFor="command-category">
          Command category
        </label>
        <select
          id="command-category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setLimit(60);
          }}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <p className="command-count" role="status">
        {filtered.length} documented signatures
        {query ? ` matching “${query}”` : ""} · {categories.length} categories
      </p>
      <div className="command-list">
        {filtered.slice(0, limit).map((c) => (
          <details className="command-row" key={c.syntax}>
            <summary>
              <ChevronRight size={15} />
              <code>{c.name}</code>
              <span>{c.category}</span>
            </summary>
            <div className="command-syntax">
              <code>{c.syntax}</code>
              <CopyButton text={c.syntax} label={`Copy ${c.name} syntax`} />
            </div>
            <a
              href={`${SOURCE}/docs/commands.md#${c.category
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")}`}
              target="_blank"
              rel="noreferrer"
            >
              Read upstream reference ↗
            </a>
          </details>
        ))}
      </div>
      {!filtered.length && (
        <p className="empty-state">
          No commands found. Try a shorter name or choose “All categories”.
        </p>
      )}
      {filtered.length > limit && (
        <button className="command-more" onClick={() => setLimit(limit + 100)}>
          Show more ({filtered.length - limit} remaining)
        </button>
      )}
    </>
  );
}
export const commandCount = commands.length;
