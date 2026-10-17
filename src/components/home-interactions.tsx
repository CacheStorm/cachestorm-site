"use client";
import { useId, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Code2,
  Database,
  Hash,
  List,
  Radio,
  Tags,
  Terminal,
} from "lucide-react";
import { CopyButton, CodeBlock } from "./ui";
import { INSTALL } from "@/lib/site";
const installs = [
  { name: "macOS / Linux", code: INSTALL },
  {
    name: "Windows",
    code: "irm https://raw.githubusercontent.com/CacheStorm/CacheStorm/main/scripts/install.ps1 | iex",
  },
  {
    name: "Docker",
    code: "docker run -d --name cachestorm -p 6380:6380 -p 8080:8080 ghcr.io/cachestorm/cachestorm:v0.3.0",
  },
];
export function InstallTabs({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState(0);
  if (compact)
    return (
      <div className="compact-install">
        <Terminal size={16} />
        <code title={INSTALL}>curl -fsSL …/install.sh | bash</code>
        <CopyButton text={INSTALL} label="Copy install command" />
      </div>
    );
  return (
    <div className="install-tabs">
      <div
        className="tab-buttons"
        role="group"
        aria-label="Installation platform"
      >
        {installs.map((i, n) => (
          <button
            key={i.name}
            type="button"
            aria-pressed={tab === n}
            onClick={() => setTab(n)}
          >
            {i.name}
          </button>
        ))}
      </div>
      <div className="install-command">
        <code>{installs[tab].code}</code>
        <CopyButton
          text={installs[tab].code}
          label={`Copy ${installs[tab].name} install command`}
        />
      </div>
    </div>
  );
}
const examples = [
  {
    name: "Redis CLI",
    title: "terminal",
    code: '$ redis-cli -p 6380\n\n127.0.0.1:6380> PING\nPONG\n\n127.0.0.1:6380> SET hello "world" EX 3600\nOK\n\n127.0.0.1:6380> GET hello\n"world"',
    note: "Your existing tools. A familiar first connection.",
  },
  {
    name: "Node.js",
    title: "app.mjs · node-redis",
    code: 'import { createClient } from "redis";\n\nconst client = createClient({\n  url: "redis://localhost:6380",\n});\nclient.on("error", console.error);\nawait client.connect();\n\nawait client.set("hello", "world", { EX: 3600 });\nconsole.log(await client.get("hello"));\nawait client.quit();',
    note: "Install the Redis client: npm install redis",
  },
  {
    name: "Python",
    title: "app.py · redis-py",
    code: 'import redis\n\nclient = redis.Redis(\n    host="localhost",\n    port=6380,\n    decode_responses=True,\n)\n\nclient.set("hello", "world", ex=3600)\nprint(client.get("hello"))\nclient.close()',
    note: "Install the Redis client: pip install redis",
  },
  {
    name: "Go",
    title: "main.go · go-redis",
    code: 'package main\n\nimport (\n  "context"\n  "github.com/redis/go-redis/v9"\n)\n\nfunc main() {\n  c := redis.NewClient(&redis.Options{Addr: "localhost:6380"})\n  defer c.Close()\n  c.Set(context.Background(), "hello", "world", 0)\n}',
    note: "Install the Redis client: go get github.com/redis/go-redis/v9",
  },
];
export function HomeExamples() {
  const [active, setActive] = useState(0);
  return (
    <div className="home-examples">
      <div className="example-tabs" role="group" aria-label="Client language">
        {examples.map((e, i) => (
          <button
            aria-pressed={active === i}
            key={e.name}
            onClick={() => setActive(i)}
          >
            {e.name}
          </button>
        ))}
      </div>
      <CodeBlock code={examples[active].code} title={examples[active].title} />
      <p className="example-note">
        <Check size={14} />
        {examples[active].note}
      </p>
    </div>
  );
}
const structures = [
  {
    name: "Strings",
    icon: Code2,
    use: "A home for the hot path.",
    text: "Fast key-value access with optional expiry. Keep sessions, cached responses and counters close.",
    code: 'SET session:42 "user_128" EX 3600\nGET session:42\nTTL session:42',
    output: 'OK\n"user_128"\n(integer) 3600',
    shape: ["session:42", "user_128", "TTL 3600s"],
  },
  {
    name: "Hashes",
    icon: Hash,
    use: "An object, in its element.",
    text: "Store and retrieve individual fields. Model profiles, settings and structured application state.",
    code: 'HSET user:42 name "Ada" language "Go"\nHGETALL user:42',
    output: '(integer) 2\n1) "name"       2) "Ada"\n3) "language"   4) "Go"',
    shape: ["user:42", "name → Ada", "language → Go"],
  },
  {
    name: "Sorted sets",
    icon: List,
    use: "Give your leaders a board.",
    text: "Associate members with scores. Build live rankings and query ranges in score order.",
    code: 'ZADD leaderboard 2400 "ada" 1800 "linus"\nZREVRANGE leaderboard 0 1 WITHSCORES',
    output: '(integer) 2\n1) "ada"     2) "2400"\n3) "linus"   4) "1800"',
    shape: ["leaderboard", "01 / ada / 2400", "02 / linus / 1800"],
  },
  {
    name: "Streams",
    icon: Radio,
    use: "Keep the story moving.",
    text: "Append events to a stream and consume them in order. A foundation for event-driven applications.",
    code: "XADD events * type pageview path /home\nXRANGE events - + COUNT 1",
    output:
      '"1710000000000-0"\n1) "1710000000000-0"\n2) ["type", "pageview", "path", "/home"]',
    shape: ["events", "→ pageview /home", "→ next event"],
  },
  {
    name: "Tags",
    icon: Tags,
    use: "Invalidate with intention.",
    text: "Group related keys with tags. Remove stale data together when the underlying content changes.",
    code: 'SET product:1 "chair" TAGS catalog\nSET product:2 "desk" TAGS catalog\nTAGKEYS catalog',
    output: 'OK\nOK\n1) "product:1"\n2) "product:2"',
    shape: ["catalog", "product:1 → chair", "product:2 → desk"],
  },
];
export function DataExplorer() {
  const [active, setActive] = useState(0);
  const e = structures[active];
  const Icon = e.icon;
  return (
    <div className="data-explorer">
      <div
        className="structure-tabs"
        role="group"
        aria-label="Explore data structures"
      >
        {structures.map((s, i) => (
          <button
            key={s.name}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            <s.icon size={17} />
            {s.name}
            <ArrowUpRight size={13} />
          </button>
        ))}
      </div>
      <div className="structure-body">
        <div className="structure-copy">
          <Icon size={24} />
          <h3>{e.use}</h3>
          <p>{e.text}</p>
          <div className="data-shape">
            <Database size={22} />
            <span>{e.shape[0]}</span>
            {e.shape.slice(1).map((s) => (
              <code key={s}>{s}</code>
            ))}
          </div>
        </div>
        <div className="structure-code">
          <div className="code-toolbar">
            <span className="mono">{e.name.toLowerCase()}.resp</span>
            <CopyButton text={e.code} />
          </div>
          <pre>
            <code>{e.code}</code>
          </pre>
          <div className="output-head">
            ILLUSTRATIVE OUTPUT{" "}
            <span>
              <span className="status-dot" /> OK
            </span>
          </div>
          <pre className="output">
            <code>{e.output}</code>
          </pre>
        </div>
      </div>
      <p className="example-disclaimer">
        Examples show expected command shapes and illustrative output. No server
        runs in your browser.
      </p>
    </div>
  );
}
const questions = [
  [
    "What is CacheStorm?",
    "CacheStorm is an open-source, Redis-compatible in-memory data store written in Go. It combines a 256-shard storage engine with rich data structures, an HTTP API, observability and optional persistence in a single binary.",
  ],
  [
    "Can I use my existing Redis client?",
    "Yes. CacheStorm speaks the RESP protocol and supports familiar Redis commands. Point your client at port 6380, then test your application’s command usage and behavior before migrating a production workload.",
  ],
  [
    "How are the performance numbers measured?",
    "The numbers are reported in the upstream repository. The fastest results measure direct in-memory store operations without networking. End-to-end TCP results are listed separately on the benchmarks page. Results depend on hardware and workload.",
  ],
  [
    "Does my data survive a restart?",
    "You can enable append-only files (AOF) and snapshots. The default example configuration has persistence disabled, so enable it explicitly and test backup and recovery for your deployment.",
  ],
  [
    "Can I use it commercially?",
    "Yes. The CacheStorm source is licensed under Apache 2.0. You can use, modify and distribute it commercially subject to the license terms, including the required notices.",
  ],
  [
    "Where should I start?",
    "Start with the quick start, connect using redis-cli, then try the commands your application needs. The configuration, security and monitoring guides cover the next steps for running your own instance.",
  ],
];
export function FAQ() {
  const id = useId();
  const [open, setOpen] = useState<number | null>(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="faq-list">
      {questions.map(([q, a], i) => (
        <div className="faq-item" key={q}>
          <h3>
            <button
              type="button"
              ref={(el) => {
                buttons.current[i] = el;
              }}
              aria-expanded={open === i}
              aria-controls={`${id}-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  buttons.current[
                    (i + (e.key === "ArrowDown" ? 1 : -1) + questions.length) %
                      questions.length
                  ]?.focus();
                }
              }}
            >
              <span className="mono">0{i + 1}</span>
              {q}
              <span className="faq-plus">{open === i ? "−" : "+"}</span>
            </button>
          </h3>
          <div id={`${id}-${i}`} hidden={open !== i}>
            <p>{a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
