# CacheStorm website

The CacheStorm product website, built with **Next.js 16.4.2**, React 19, TypeScript and Motion. Deploys as a static export to GitHub Pages at [cachestorm.com](https://cachestorm.com).

## Develop

```bash
npm ci
npm run dev
```

The default development URL is `http://127.0.0.1:3000`. For a different port, invoke the Next CLI directly: `node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3017`.

## Check and build

```bash
npm run format:check
npm run lint
npm run commands:check
npm run build
npm run typecheck
npm run verify:export
```

The production export is in `out/`. It contains real HTML for every route, `.nojekyll`, `CNAME`, a 404 page, sitemap, robots file and self-hosted fonts. No Node.js server is needed in production.

## Content provenance

Product content was checked against [CacheStorm source commit baf028b](https://github.com/CacheStorm/CacheStorm/tree/baf028b1276b411641edd92e7135202fd114f4e1), with release downloads from **v0.3.0** (October 8, 2026).

- Configuration follows `config/cachestorm.example.yaml`, including `server.requirepass`, `memory.max_memory` and `persistence.aof`.
- The command explorer indexes **711 documented signatures in 68 categories**, extracted from `docs/commands.md`. The upstream source is retained in `src/content/upstream-commands.md`; regenerate with `npm run commands`. This is not a live inventory or a complete-compatibility claim.
- Benchmark figures are attributed to the upstream README. Direct in-memory measurements and TCP measurements are presented separately; no fresh product benchmarks were run for this website.
- The actual upstream `LICENSE` is Apache 2.0, despite older README copy referring to MIT.
- UI code examples and output are illustrative. The website does not connect to a CacheStorm instance.
- The Light/Dark/System appearance picker follows the CobaltDB website. The OXOGNET symbol paths and signature animation follow the NineDeploy footer, adapted to CacheStorm.

When updating product content, pin a new upstream commit, recheck configuration fields and release metadata, update the retained command reference, regenerate the index and run all checks.

## Brand assets

`public/logo-mark.svg`, `public/logo.svg` and `public/logo-white.svg` are real vector assets. Wordmark glyphs are outlined, so downloads do not require an installed font. The logo is a hand-built vector interpretation of the supplied CacheStorm artwork.

`npm run assets` regenerates SVGs, the Open Graph PNG and the Apple icon. The generation script uses Manrope under the included SIL Open Font License. Fonts served by the site are bundled through Fontsource.

## Interaction and accessibility

- Appearance choice persists locally, syncs between tabs and includes a device-driven System mode. CSS resolves the system scheme without JavaScript; a small head script restores explicit choices before hydration.
- `Ctrl/Cmd+K` opens the searchable documentation dialog. Escape closes it; arrow keys move between results.
- Mobile navigation, documentation selection, platform and language selectors, data structure examples, FAQ, command filtering and clipboard controls work without a backend.
- Copy errors are announced, and users can manually select code.
- Motion respects `prefers-reduced-motion`. Content is server-rendered and remains visible without animation.

## GitHub Pages

`.github/workflows/pages.yml` checks and builds pull requests, and publishes `main` using the GitHub Pages artifact workflow. Repository Settings → Pages must use **GitHub Actions**. The custom domain is **cachestorm.com**; the tracked `public/CNAME` is copied to the export.

The apex domain uses the four GitHub Pages A records; `www` points at `cachestorm.github.io`. HTTPS is enforced after GitHub issues the domain certificate. The Pages project URL is secondary: assets intentionally use root paths for the requested custom domain.

## Dependency audit boundary

At initial delivery, `npm audit --omit=dev` reported no production advisories. The Next.js ESLint toolchain has a transitive `braces` advisory without a patched upstream version available in the registry. It is a development-only dependency and is not included in the exported website. Do not apply the audit tool's suggested Next.js downgrade; update the lint toolchain when upstream publishes a compatible fix.

## License

Apache 2.0. See `LICENSE`.
