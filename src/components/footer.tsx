"use client";
import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import { useInView } from "motion/react";
import { useRef } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
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
        <div className="studio-card" ref={ref}>
          <div className="studio-glow" aria-hidden="true" />
          <a
            href="https://oxog.net"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit OXOGNET"
            className="studio-logo"
          >
            <OxogMark draw={seen} />
          </a>
          <div className="studio-copy">
            <p>CacheStorm is built and maintained by</p>
            <a
              href="https://oxog.net"
              target="_blank"
              rel="noreferrer"
              className="oxog-wordmark"
            >
              oxog<span>net</span>
              <b>.</b>
              <ArrowUpRight size={22} />
            </a>
            <p>
              A small studio in Estonia building AI agents, developer tools and
              the infrastructure behind them.
            </p>
            <a
              href="https://oxog.net/projects"
              className="studio-explore"
              target="_blank"
              rel="noreferrer"
            >
              Explore the ecosystem <ArrowUpRight size={14} />
            </a>
          </div>
          <nav className="studio-projects" aria-label="More from OXOGNET">
            {[
              ["AGEZT", "An agentic operating system"],
              ["WrongStack", "AI coding orchestration"],
              ["WrongTrace", "Agent observability"],
              ["UWAS", "Unified web app server"],
            ].map(([name, what]) => (
              <a
                href="https://oxog.net/projects"
                key={name}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <strong>{name}</strong>
                  <small>{what}</small>
                </span>
                <ArrowUpRight size={14} />
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© 2026 OXOGNET OÜ. Open source under Apache 2.0.</p>
          <span>Made in Estonia, shipped worldwide.</span>
          <a
            href="https://github.com/CacheStorm/cachestorm-site"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={14} /> Website source
          </a>
        </div>
      </div>
    </footer>
  );
}
