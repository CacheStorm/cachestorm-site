import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Database,
  Github,
  Layers3,
  Radio,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { EngineArt } from "@/components/engine-art";
import { Reveal } from "@/components/ui";
import {
  HomeExamples,
  InstallTabs,
  DataExplorer,
  FAQ,
} from "@/components/home-interactions";
import { REPO, VERSION } from "@/lib/site";
export default function Home() {
  return (
    <>
      <section className="hero-scene" aria-labelledby="hero-title">
        <div className="hero container">
          <div className="hero-copy">
            <Reveal>
              <Link href="/changelog/" className="release-pill">
                <span className="status-dot" />v{VERSION}
                <span className="pill-divider" />
                Small binary. Serious possibilities.
                <ArrowRight size={14} />
              </Link>
              <h1 id="hero-title">
                Your data.
                <br />
                At the speed
                <br />
                of <em>thought.</em>
              </h1>
              <p className="hero-lead">Less waiting. More building.</p>
              <p className="hero-description">
                A Redis-compatible in-memory data store written in Go. Your
                favorite clients, a powerful engine, and everything you need in
                one binary.
              </p>
              <div className="button-row">
                <Link href="/docs/getting-started/" className="button primary">
                  Start building
                  <ArrowRight size={17} />
                </Link>
                <a
                  href={REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="button secondary"
                >
                  <Github size={17} />
                  View source
                  <ArrowUpRight size={15} />
                </a>
              </div>
              <InstallTabs compact />
              <div className="hero-promises">
                <span>
                  <Check />
                  Pure Go. No CGO.
                </span>
                <span>
                  <Check />
                  Apache 2.0
                </span>
                <span>
                  <Check />
                  Your infrastructure
                </span>
              </div>
            </Reveal>
          </div>
          <Reveal className="hero-visual" delay={0.12}>
            <EngineArt />
          </Reveal>
        </div>
      </section>
      <div className="capability-strip">
        <div className="container">
          <p>
            ONE SMALL BINARY.
            <br />
            <strong>A WHOLE LOT INSIDE.</strong>
          </p>
          {[
            [Code2, "Redis-compatible"],
            [Layers3, "256 memory shards"],
            [Database, "Rich data structures"],
            [ShieldCheck, "TLS & ACL"],
            [Radio, "Pub/Sub & streams"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Code2;
            return (
              <span key={label as string}>
                <I size={18} />
                {label as string}
              </span>
            );
          })}
        </div>
      </div>
      <section className="section container" id="features">
        <Reveal className="section-heading split">
          <div>
            <p className="eyebrow">FAST IS JUST THE BEGINNING</p>
            <h2>
              A simpler stack.
              <br />
              <span>A stronger foundation.</span>
            </h2>
          </div>
          <p>
            From your first cache key to your busiest day.
            <br />
            An engine that gives you room to grow.
          </p>
        </Reveal>
        <div className="feature-bento">
          <Reveal className="feature-main">
            <div>
              <span className="mono blue">01 / THE ENGINE</span>
              <h3>
                A fast lane
                <br />
                for every request.
              </h3>
              <p>
                256 shards distribute the work. Goroutines handle connections.
                Your data lives in memory, right where speed happens.
              </p>
              <Link href="/docs/architecture/" className="text-link">
                Look under the hood
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <div
              className="shard-visual"
              aria-label="256 shards arranged as a sixteen by sixteen grid"
            >
              <div className="shard-grid">
                {Array.from({ length: 256 }, (_, i) => (
                  <span
                    key={i}
                    style={{ animationDelay: `${(i % 17) * 0.27}s` }}
                  />
                ))}
              </div>
              <div className="shard-caption">
                <span className="status-dot" />
                256 SHARDS · ONE ENGINE
              </div>
            </div>
          </Reveal>
          <Reveal className="feature-small" delay={0.05}>
            <div className="feature-icon">
              <Terminal />
            </div>
            <h3>
              Keep your clients.
              <br />
              Meet your new engine.
            </h3>
            <p>
              Connect over RESP with the Redis libraries you already know.
              Familiar commands. A fresh foundation.
            </p>
            <div className="mini-code">
              <span>redis-cli</span>
              <span className="blue">-p 6380 PING</span>
              <b>
                PONG
                <span className="status-dot" />
              </b>
            </div>
            <Link className="text-link" href="/docs/clients/">
              Find your client
              <ArrowUpRight size={16} />
            </Link>
          </Reveal>
          <Reveal className="feature-small">
            <div className="feature-icon">
              <ShieldCheck />
            </div>
            <h3>
              Good boundaries.
              <br />
              Built in.
            </h3>
            <p>
              TLS encryption, authentication and access control lists. Give each
              application the access it needs.
            </p>
            <span className="feature-tag">TLS + per-user ACL</span>
          </Reveal>
          <Reveal className="feature-small feature-wide">
            <div className="feature-icon">
              <Database />
            </div>
            <h3>
              Memory for speed.
              <br />
              Persistence for peace of mind.
            </h3>
            <p>
              Keep it ephemeral or turn on AOF and snapshots. Choose the
              durability your workload needs.
            </p>
            <span className="feature-tag">Your data. Your decision.</span>
          </Reveal>
          <Reveal className="feature-small feature-wide">
            <div className="feature-icon">
              <Zap />
            </div>
            <h3>
              One binary.
              <br />
              All the essentials.
            </h3>
            <p>
              HTTP API, Prometheus metrics, Lua scripting, transactions and a
              plugin architecture. Ready when you are.
            </p>
            <Link className="text-link" href="/features/">
              Explore every capability
              <ArrowUpRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="section setup-section">
        <div className="container">
          <Reveal className="section-heading split">
            <div>
              <p className="eyebrow">FROM ZERO TO YOUR FIRST PONG</p>
              <h2>
                Ready when
                <br />
                <span>your idea is.</span>
              </h2>
            </div>
            <p>
              Install it. Start it. Connect.
              <br />
              Keep the ceremony to a minimum.
            </p>
          </Reveal>
          <div className="setup-grid">
            <div className="setup-copy">
              <span className="step-number">01 — INSTALL</span>
              <h3>
                Your machine.
                <br />
                Your way to run.
              </h3>
              <p>
                A native binary for your platform or a container in your stack.
                Pick your starting point.
              </p>
              <InstallTabs />
              <Link href="/docs/getting-started/" className="text-link">
                The complete quick start
                <ArrowRight size={16} />
              </Link>
            </div>
            <HomeExamples />
          </div>
        </div>
      </section>
      <section className="section container">
        <Reveal className="section-heading split">
          <div>
            <p className="eyebrow">MORE THAN KEY. VALUE.</p>
            <h2>
              One engine.
              <br />
              <span>So many possibilities.</span>
            </h2>
          </div>
          <p>
            Sessions. Leaderboards. Live events.
            <br />
            Choose the shape your data needs.
          </p>
        </Reveal>
        <DataExplorer />
      </section>
      <section className="performance-section">
        <div className="container">
          <Reveal className="section-heading">
            <p className="eyebrow">MADE FOR THE HOT PATH</p>
            <h2>
              Small footprint.
              <br />
              <span>Storm-sized potential.</span>
            </h2>
            <p>Purpose-built storage. Carefully measured performance.</p>
          </Reveal>
          <div className="metric-grid">
            {[
              [
                "20",
                "M",
                "GET operations / second",
                "Sequential · in-memory store",
              ],
              [
                "106",
                "M",
                "GET operations / second",
                "Parallel · 32 logical processors",
              ],
              [
                "33",
                "K",
                "GET operations / second",
                "End-to-end · TCP round trip",
              ],
            ].map(([n, u, t, c]) => (
              <Reveal key={c} className="metric">
                <div>
                  {n}
                  <span>{u}</span>
                  <ArrowUpRight />
                </div>
                <strong>{t}</strong>
                <p>{c}</p>
              </Reveal>
            ))}
          </div>
          <div className="benchmark-note">
            <p>
              Repository-reported benchmarks · AMD Ryzen 9 9950X3D · 64 GB RAM ·
              Windows 11.
              <br />
              Storage benchmarks exclude networking. TCP results include the
              full round trip. Performance varies by workload.
            </p>
            <Link href="/benchmarks/" className="text-link">
              See the full picture
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section container use-cases">
        <Reveal className="section-heading">
          <p className="eyebrow">WHAT WILL YOU BUILD?</p>
          <h2>
            Your next big thing.
            <br />
            <span>A little less infrastructure.</span>
          </h2>
        </Reveal>
        <div className="use-case-grid">
          {[
            [
              "01",
              "Keep the good stuff close.",
              "Cache expensive database queries and API responses. Add TTLs and invalidate related keys with tags.",
              "Application caching",
              "/docs/data-structures/",
            ],
            [
              "02",
              "Make real time feel real.",
              "Build event-driven features with Pub/Sub and streams. Keep leaderboards moving with sorted sets.",
              "Live experiences",
              "/docs/commands/",
            ],
            [
              "03",
              "Give every session a home.",
              "Store sessions, counters and per-user state. Use namespaces to organize your application’s data.",
              "Sessions & state",
              "/docs/configuration/",
            ],
          ].map(([num, title, desc, tag, href]) => (
            <Reveal key={num} className="use-case">
              <span className="mono">
                {num} / {tag}
              </span>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link href={href} aria-label={`Explore ${tag}`}>
                <ArrowUpRight />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section container faq-section">
        <Reveal>
          <p className="eyebrow">A FEW GOOD QUESTIONS</p>
          <h2>
            Before you
            <br />
            <span>dive in.</span>
          </h2>
          <p>The source is open. So is the conversation.</p>
          <a
            href={`${REPO}/issues`}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            Ask a question
            <ArrowUpRight size={16} />
          </a>
        </Reveal>
        <FAQ />
      </section>
      <section className="container">
        <Reveal className="cta-section">
          <div className="cta-art" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="cta-content">
            <p className="eyebrow">OPEN SOURCE. OPEN POSSIBILITIES.</p>
            <h2>
              Great ideas
              <br />
              deserve a <em>fast start.</em>
            </h2>
            <div className="button-row">
              <Link href="/docs/getting-started/" className="button white">
                Let’s build something
                <ArrowRight size={18} />
              </Link>
              <a
                href={REPO}
                target="_blank"
                rel="noreferrer"
                className="cta-source"
              >
                <Github size={18} /> Star on GitHub
                <ArrowUpRight size={15} />
              </a>
            </div>
            <p className="cta-foot">Pure Go. Apache 2.0. Yours to build on.</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
