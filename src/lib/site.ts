export const REPO = "https://github.com/CacheStorm/CacheStorm";
export const COMMIT = "baf028b1276b411641edd92e7135202fd114f4e1";
export const SOURCE = `${REPO}/blob/${COMMIT}`;
export const VERSION = "0.3.0";
export const INSTALL =
  "curl -fsSL https://raw.githubusercontent.com/CacheStorm/CacheStorm/main/scripts/install.sh | bash";
export const navigation = [
  ["Why CacheStorm", "/features/"],
  ["Documentation", "/docs/getting-started/"],
  ["Benchmarks", "/benchmarks/"],
] as const;
export const docLinks = [
  {
    slug: "getting-started",
    title: "Getting started",
    description: "Install, connect and make your first request.",
    group: "Start building",
  },
  {
    slug: "configuration",
    title: "Configuration",
    description: "Server, memory, persistence and environment settings.",
    group: "Start building",
  },
  {
    slug: "clients",
    title: "Clients & SDKs",
    description: "Connect with Go, Node.js, Python or the Redis CLI.",
    group: "Start building",
  },
  {
    slug: "data-structures",
    title: "Data structures",
    description: "Strings, hashes, lists, sets, streams and more.",
    group: "The engine",
  },
  {
    slug: "architecture",
    title: "Architecture",
    description: "256 shards, RESP networking and the storage engine.",
    group: "The engine",
  },
  {
    slug: "persistence",
    title: "Persistence",
    description: "Snapshots, append-only files and recovery.",
    group: "The engine",
  },
  {
    slug: "security",
    title: "Security & ACL",
    description: "Authentication, TLS and scoped command access.",
    group: "Operate",
  },
  {
    slug: "clustering",
    title: "Clustering & replication",
    description: "Gossip, hash slots, replicas and Sentinel.",
    group: "Operate",
  },
  {
    slug: "monitoring",
    title: "Monitoring",
    description: "Prometheus, slow logs and health checks.",
    group: "Operate",
  },
  {
    slug: "http-api",
    title: "HTTP API",
    description: "Integrate using JSON over HTTP.",
    group: "Operate",
  },
];
export const searchItems = [
  ...docLinks.map((d) => ({
    title: d.title,
    description: d.description,
    href: `/docs/${d.slug}/`,
  })),
  {
    title: "Command reference",
    description: "Search command syntax across the upstream modules.",
    href: "/docs/commands/",
  },
  {
    title: "Benchmarks",
    description: "Storage and TCP results, hardware and methodology.",
    href: "/benchmarks/",
  },
  {
    title: "Features",
    description: "Everything inside the CacheStorm binary.",
    href: "/features/",
  },
  {
    title: "Changelog",
    description: "Releases and development changes.",
    href: "/changelog/",
  },
  {
    title: "Brand assets",
    description: "Download the CacheStorm SVG logo and mark.",
    href: "/brand/",
  },
];
