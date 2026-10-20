"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Github,
  Menu,
  Search,
  X,
} from "lucide-react";
import { Logo } from "./brand";
import { ThemePicker } from "./theme-picker";
import { AnimationToggle } from "./animation-toggle";
import { navigation, REPO, searchItems } from "@/lib/site";
export function Navigation() {
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const searchReturnTarget = useRef<HTMLElement | null>(null);
  const path = usePathname();
  const openSearch = useCallback(() => {
    if (dialog.current?.open) return;
    searchReturnTarget.current = document.activeElement as HTMLElement;
    setMenu(false);
    setQuery("");
    dialog.current?.showModal();
    input.current?.focus();
  }, []);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") {
        setMenu(false);
        if (trigger.current?.getAttribute("aria-expanded") === "true")
          trigger.current.focus();
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [openSearch]);
  useEffect(() => {
    if (!menu) return;
    const desktop = window.matchMedia("(min-width: 901px)");
    const close = () => setMenu(false);
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", outside);
    desktop.addEventListener("change", close);
    return () => {
      document.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", close);
    };
  }, [menu]);
  const items = searchItems.filter((item) =>
    `${item.title} ${item.description}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <header
        className="site-header"
        ref={header}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setMenu(false);
        }}
      >
        <div className="container header-inner">
          <Link
            href="/"
            aria-label="CacheStorm home"
            onClick={() => setMenu(false)}
          >
            <Logo />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map(([name, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  path.startsWith(href.split("/").slice(0, 2).join("/"))
                    ? "page"
                    : undefined
                }
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <ThemePicker />
            <AnimationToggle />
            <button
              className="search-trigger"
              type="button"
              aria-label="Search documentation"
              ref={searchTrigger}
              aria-haspopup="dialog"
              onClick={openSearch}
            >
              <Search size={18} />
              <kbd>⌘ K</kbd>
            </button>
            <a
              href={REPO}
              className="github-link"
              aria-label="CacheStorm on GitHub"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} />
              <span>GitHub</span>
              <ArrowUpRight size={14} />
            </a>
            <button
              type="button"
              className="menu-trigger"
              ref={trigger}
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav
            id="mobile-menu"
            className="mobile-nav container"
            aria-label="Mobile navigation"
          >
            {[
              ...navigation,
              ["Command reference", "/docs/commands/"],
              ["Changelog", "/changelog/"],
              ["Brand assets", "/brand/"],
            ].map(([name, href]) => (
              <Link key={href} href={href} onClick={() => setMenu(false)}>
                {name}
                <ArrowUpRight size={17} />
              </Link>
            ))}
            <a href={REPO}>
              GitHub
              <Github size={17} />
            </a>
          </nav>
        )}
      </header>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-label="Search documentation"
        onClose={() => {
          const previous = searchReturnTarget.current;
          if (previous?.isConnected && previous.getClientRects().length)
            previous.focus();
          else searchTrigger.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
          const elements = Array.from(
            dialog.current?.querySelectorAll<HTMLElement>("input, a") ?? [],
          );
          const current = elements.indexOf(
            document.activeElement as HTMLElement,
          );
          e.preventDefault();
          elements[
            (current + (e.key === "ArrowDown" ? 1 : -1) + elements.length) %
              elements.length
          ]?.focus();
        }}
      >
        <div className="search-shell">
          <div className="search-top">
            <Search size={22} />
            <input
              ref={input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documentation…"
              aria-label="Search documentation pages"
            />
            <button
              aria-label="Close search"
              onClick={() => dialog.current?.close()}
            >
              <kbd>ESC</kbd>
            </button>
          </div>
          <div className="search-results">
            <p className="sr-only" role="status">
              {items.length} {items.length === 1 ? "page" : "pages"} found.
            </p>
            {items.length ? (
              items.map((item) => (
                <Link
                  href={item.href}
                  key={item.href}
                  onClick={() => dialog.current?.close()}
                >
                  <BookOpen size={18} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <ArrowRight size={17} />
                </Link>
              ))
            ) : (
              <p className="empty-state">
                No pages found for “{query}”. Try “TLS”, “clients” or
                “commands”.
              </p>
            )}
          </div>
          <div className="search-foot">
            <span>↑ ↓ to navigate · Enter to open</span>
            <span>CacheStorm docs</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
