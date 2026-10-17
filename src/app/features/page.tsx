import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CodeBlock, Reveal } from "@/components/ui";
export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore CacheStorm’s sharded storage, RESP compatibility, data structures, persistence, security and observability.",
  alternates: { canonical: "/features/" },
};
const features = [
  {
    number: "01",
    title: "A focused engine.\nRoom to go fast.",
    description:
      "256 shards distribute keys across a concurrent in-memory store. A Go runtime handles connections, command routing and data structures inside a single process.",
    items: [
      "Native Go build without a CGO toolchain",
      "Goroutine-based client connections",
      "Configurable memory limits and eviction",
      "Sequential and parallel benchmarks documented",
    ],
    code: '$ redis-cli -p 6380\n\n127.0.0.1:6380> SET cache:home "ready" EX 60\nOK\n\n127.0.0.1:6380> GET cache:home\n"ready"',
    file: "the fast path",
    href: "/docs/architecture/",
  },
  {
    number: "02",
    title: "Familiar commands.\nMore ways to build.",
    description:
      "Redis-compatible protocol handling meets rich data structures. Start with strings and hashes, then build with streams, sorted sets and CacheStorm extensions.",
    items: [
      "Strings, lists, hashes, sets and sorted sets",
      "Streams, Pub/Sub and transactions",
      "Lua scripting and function support",
      "Tags, namespaces and extended modules",
    ],
    code: 'HSET user:42 name "Ada" language "Go"\nZADD leaderboard 2400 "ada"\nXADD events * type pageview path /home\n\nSET product:1 "chair" TAGS catalog\nTAGKEYS catalog',
    file: "a shape for every idea",
    href: "/docs/data-structures/",
  },
  {
    number: "03",
    title: "Persistence.\nOn your terms.",
    description:
      "Use the engine as an ephemeral cache, or enable AOF and snapshots for data you want to recover after a restart. The configuration keeps the choice explicit.",
    items: [
      "Append-only file persistence",
      "Configurable AOF synchronization",
      "Snapshot interval and data directory settings",
      "Container-friendly persistent volumes",
    ],
    code: 'persistence:\n  enabled: true\n  aof: true\n  aof_sync: "everysec"\n  data_dir: "./data"\n  snapshot_interval: "5m"',
    file: "cachestorm.yaml",
    href: "/docs/persistence/",
  },
  {
    number: "04",
    title: "Access with\nintention.",
    description:
      "Build clear boundaries around your data with password authentication, TLS and per-user access rules. Keep your configuration aligned with your deployment.",
    items: [
      "TLS certificate and key configuration",
      "Server and HTTP authentication",
      "ACL command grants and key patterns",
      "HTTP identity and command enforcement",
    ],
    code: 'server:\n  bind: "127.0.0.1"\n  port: 6380\n  tls_cert_file: "/etc/tls/server.crt"\n  tls_key_file: "/etc/tls/server.key"\n\n# Configure passwords and scoped ACL users\n# before exposing your instance.',
    file: "good boundaries",
    href: "/docs/security/",
  },
  {
    number: "05",
    title: "A clear view\nunder the hood.",
    description:
      "Metrics, HTTP status endpoints and slow logs make the engine easier to operate. Use your existing monitoring stack to watch the signals that matter.",
    items: [
      "Built-in Prometheus metrics plugin",
      "HTTP health and statistics endpoints",
      "Configurable slow-log threshold",
      "Structured JSON logging",
    ],
    code: 'plugins:\n  metrics:\n    enabled: true\n    port: 9090\n    path: "/metrics"\n  slowlog:\n    enabled: true\n    threshold: "10ms"\n    max_entries: 128',
    file: "observability included",
    href: "/docs/monitoring/",
  },
  {
    number: "06",
    title: "One node today.\nYour topology tomorrow.",
    description:
      "Clustering, replication and Sentinel-related commands provide the building blocks for multi-node operation. Evaluate failover and client behavior with your workload.",
    items: [
      "Gossip-based cluster membership",
      "Hash-slot routing",
      "Primary and replica configuration",
      "Cluster and Sentinel command groups",
    ],
    code: 'cluster:\n  enabled: true\n  node_name: "node1"\n  bind_addr: "0.0.0.0"\n  bind_port: 7946\n  seeds:\n    - "node2:7946"\n    - "node3:7946"',
    file: "a connected foundation",
    href: "/docs/clustering/",
  },
];
export default function Features() {
  return (
    <div className="container">
      <header className="page-hero">
        <p className="eyebrow">EVERYTHING IN ITS ELEMENT</p>
        <h1>
          One binary.
          <br />
          <em>A whole lot of possibility.</em>
        </h1>
        <p>
          A capable data engine, a familiar protocol and the tools to run it
          your way. Build on a foundation you can understand.
        </p>
        <div className="button-row">
          <Link href="/docs/getting-started/" className="button primary">
            Start building
            <ArrowRight size={16} />
          </Link>
          <Link href="/docs/commands/" className="button secondary">
            Explore commands
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      <div className="page-section">
        {features.map((f) => (
          <Reveal className="feature-detail" key={f.number}>
            <div className="feature-detail-copy">
              <span className="eyebrow">{f.number} / INSIDE THE BINARY</span>
              <h2>
                {f.title.split("\n").map((s, i) => (
                  <span
                    className={i === 0 ? "feature-title-first" : ""}
                    key={s}
                  >
                    {s}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h2>
              <p>{f.description}</p>
              <ul>
                {f.items.map((i) => (
                  <li key={i}>
                    <Check />
                    {i}
                  </li>
                ))}
              </ul>
              <Link href={f.href} className="text-link">
                Go deeper
                <ArrowRight size={16} />
              </Link>
            </div>
            <CodeBlock code={f.code} title={f.file} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
