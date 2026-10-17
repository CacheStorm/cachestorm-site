import type { Metadata } from "next";
import { REPO, SOURCE } from "@/lib/site";
export const metadata: Metadata = {
  title: "Changelog",
  description: "CacheStorm release downloads and upstream development notes.",
  alternates: { canonical: "/changelog/" },
};
export default function Changelog() {
  return (
    <div className="container">
      <header className="page-hero">
        <p className="eyebrow">THE ENGINE KEEPS MOVING</p>
        <h1>
          Small changes.
          <br />
          <em>Forward momentum.</em>
        </h1>
        <p>
          Release milestones and a direct line to the source. Check the upstream
          release notes before updating your deployment.
        </p>
      </header>
      <div className="page-section">
        <article className="release-entry">
          <aside>
            v0.3.0<small>October 8, 2026</small>
            <span className="feature-tag">Latest release</span>
          </aside>
          <div>
            <h2>Your platform. Your binary.</h2>
            <p>
              The latest GitHub release publishes platform archives for Linux,
              macOS, Windows and FreeBSD, plus a versioned container image.
            </p>
            <ul>
              <li>Linux AMD64, ARM64 and ARMv7 builds.</li>
              <li>macOS Intel and Apple Silicon builds.</li>
              <li>Windows AMD64 and FreeBSD AMD64 archives.</li>
              <li>
                Container image:{" "}
                <code>ghcr.io/cachestorm/cachestorm:v0.3.0</code>.
              </li>
            </ul>
            <a
              className="text-link"
              href={`${REPO}/releases/tag/v0.3.0`}
              target="_blank"
              rel="noreferrer"
            >
              Release notes & downloads ↗
            </a>
          </div>
        </article>
        <article className="release-entry">
          <aside>
            Development notes<small>Upstream “Unreleased”</small>
          </aside>
          <div>
            <h2>Security and behavior, refined.</h2>
            <p>
              The pinned source changelog includes development notes for ACL
              enforcement, HTTP identity handling, scripting behavior and
              regression coverage. “Unreleased” is the label used in that file;
              it is not presented here as a separate published release.
            </p>
            <ul>
              <li>
                ACL command and key-pattern enforcement across command paths.
              </li>
              <li>HTTP ACL identity handling and session binding.</li>
              <li>Lua script and registered function argument handling.</li>
              <li>
                Regression tests for authentication and authorization behavior.
              </li>
            </ul>
            <a
              className="text-link"
              href={`${SOURCE}/CHANGELOG.md`}
              target="_blank"
              rel="noreferrer"
            >
              Read the complete source changelog ↗
            </a>
          </div>
        </article>
        <article className="release-entry">
          <aside>
            v0.2.0<small>March 21, 2026</small>
          </aside>
          <div>
            <h2>A harder working foundation.</h2>
            <p>
              The upstream changelog records TLS hardening, cluster input
              validation, HTTP command restrictions and fixes across
              persistence, replication and concurrent access.
            </p>
            <a
              className="text-link"
              href={`${SOURCE}/CHANGELOG.md#020---2026-03-21`}
              target="_blank"
              rel="noreferrer"
            >
              Read the historical entry ↗
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
