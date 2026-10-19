"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { Logo, OxogMark } from "./brand";
import { REPO, SOURCE, VERSION } from "@/lib/site";
const columns = [
  {
    name: "Product",
    links: [
      ["Features", "/features/"],
      ["Benchmarks", "/benchmarks/"],
      ["Changelog", "/changelog/"],
      ["Brand assets", "/brand/"],
    ],
  },
  {
    name: "Build",
    links: [
      ["Quick start", "/docs/getting-started/"],
      ["Commands", "/docs/commands/"],
      ["Client libraries", "/docs/clients/"],
      ["HTTP API", "/docs/http-api/"],
    ],
  },
  {
    name: "Open source",
    links: [
      ["GitHub", REPO],
      ["Releases", `${REPO}/releases`],
      ["Contributing", `${SOURCE}/CONTRIBUTING.md`],
      ["Apache 2.0", `${SOURCE}/LICENSE`],
    ],
  },
];
export function Footer() {
  const ref = useRef<HTMLAnchorElement>(null);
  const visible = useInView(ref);
  useEffect(() => {
    const studio = ref.current;
    if (!studio) return;
    const syncVisibility = () => {
      studio.dataset.pageVisible = String(!document.hidden);
    };
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () =>
      document.removeEventListener("visibilitychange", syncVisibility);
  }, []);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" aria-label="CacheStorm home">
              <Logo />
            </Link>
            <p>
              Built for the fast path.
              <br />
              Open for the long run.
            </p>
            <span className="mono">v{VERSION} · Pure Go · Apache 2.0</span>
          </div>
          <div className="footer-columns">
            {columns.map((c) => (
              <div key={c.name}>
                <h3>{c.name}</h3>
                {c.links.map(([name, href]) => (
                  <Link
                    key={href}
                    href={href}
                    {...(href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <a
          className="studio"
          href="https://oxog.net"
          ref={ref}
          data-visible={visible}
        >
          <OxogMark />
          <div>
            <span className="eyebrow">PART OF A BIGGER PICTURE</span>
            <h2>
              Small studio. <span>Big ideas.</span>
            </h2>
            <p>Explore the tools and infrastructure from Oxog.</p>
          </div>
          <span className="studio-link">
            Meet oxog.net <ArrowUpRight size={18} />
          </span>
        </a>
      </div>
    </footer>
  );
}
