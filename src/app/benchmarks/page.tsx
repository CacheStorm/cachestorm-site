import type { Metadata } from "next";
import { CodeBlock } from "@/components/ui";
import { SOURCE } from "@/lib/site";
export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "CacheStorm benchmark results with hardware, workload scope and reproduction commands. Direct storage and TCP results are reported separately.",
  alternates: { canonical: "/benchmarks/" },
};
const storage = [
  ["GET · sequential", "20M", "50 ns", "0"],
  ["GET · parallel, 32 logical processors", "106M", "9.4 ns", "0"],
  ["SET · sequential", "1.3M", "796 ns", "3"],
  ["SET · parallel, 32 logical processors", "2.2M", "449 ns", "3"],
  ["Tag count", "73M", "13.7 ns", "0"],
  ["Tag invalidation · 10K keys", "510", "1.96 ms", "—"],
];
const tcp = [
  ["SET", "32K", "37 µs"],
  ["GET", "33K", "37 µs"],
  ["HSET", "33K", "38 µs"],
  ["ZADD", "31K", "36 µs"],
  ["XADD", "31K", "39 µs"],
];
export default function Benchmarks() {
  return (
    <div className="container">
      <header className="page-hero">
        <p className="eyebrow">FAST. WITH CONTEXT.</p>
        <h1>
          Performance you
          <br />
          can <em>look into.</em>
        </h1>
        <p>
          Numbers tell a better story when you know what they measure. Here are
          the upstream results, their scope and a starting point for your own
          benchmarks.
        </p>
      </header>
      <div className="page-section">
        <div className="benchmark-context">
          <h2>Context is part of the result.</h2>
          <p>
            These are repository-reported measurements from the pinned upstream
            README, not fresh benchmarks run for this website. Hardware: AMD
            Ryzen 9 9950X3D, 64 GB RAM, Windows 11. In-memory results exclude
            network transport; end-to-end results include the TCP round trip.
            Persistence, client behavior, key sizes, contention and hardware can
            change the outcome.
          </p>
          <a
            href={`${SOURCE}/README.md#performance`}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            Read the original results ↗
          </a>
        </div>
        <section className="benchmark-section">
          <p className="eyebrow">01 / INSIDE THE ENGINE</p>
          <h2>Direct storage operations.</h2>
          <p>
            In-memory store benchmarks. No TCP connection, protocol parsing or
            network round trip.
          </p>
          <div className="table-scroll">
            <table className="benchmark-table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Operations / second</th>
                  <th>Time / operation</th>
                  <th>Allocations / operation</th>
                </tr>
              </thead>
              <tbody>
                {storage.map((row) => (
                  <tr key={row[0]}>
                    {row.map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="benchmark-section">
          <p className="eyebrow">02 / THE COMPLETE CONNECTION</p>
          <h2>End-to-end TCP operations.</h2>
          <p>
            A separate workload including the full TCP round trip. These results
            describe a different measurement from direct storage calls.
          </p>
          <div className="table-scroll">
            <table className="benchmark-table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Operations / second</th>
                  <th>Reported time / operation</th>
                </tr>
              </thead>
              <tbody>
                {tcp.map((row) => (
                  <tr key={row[0]}>
                    {row.map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="benchmark-fineprint">
            Values are reproduced as reported upstream, including rounding.
            Operations per second and listed timings are not always exact
            reciprocals. Treat them as upstream observations and reproduce your
            own workload.
          </p>
        </section>
        <div className="benchmark-method">
          <div>
            <p className="eyebrow">03 / MAKE IT YOUR MEASUREMENT</p>
            <h2>
              Your workload is
              <br />
              the benchmark that matters.
            </h2>
            <p>
              Run the benchmark suite on the version you plan to deploy. Record
              the commit, Go version, CPU, OS, dataset size, concurrency and
              whether persistence is enabled.
            </p>
            <p>
              Then exercise the complete application path with your selected
              client, real command mix and representative data. Measure tail
              latency as well as throughput.
            </p>
            <a
              href={`${SOURCE}/benchmarks`}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              Explore benchmark source ↗
            </a>
          </div>
          <CodeBlock
            title="run your own benchmarks"
            code={
              "git clone https://github.com/CacheStorm/CacheStorm.git\ncd CacheStorm\ngit checkout baf028b1276b411641edd92e7135202fd114f4e1\n\n# Record the environment\ngo version\n\n# Storage benchmarks\ngo test ./internal/store/... -run=^$ -bench=. -benchmem\n\n# Additional benchmark workloads\ngo test ./benchmarks/... -run=^$ -bench=. -benchmem"
            }
          />
        </div>
      </div>
    </div>
  );
}
