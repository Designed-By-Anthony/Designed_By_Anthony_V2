## Learned User Preferences

- Prefer Playwright coverage that asserts real user flows, API behavior, and D1-backed outcomes instead of brittle layout or pixel counting.
- Typography: Playfair Display for headings and the ANTHONY. wordmark (bold/black weights, tight tracking around -0.05em); Inter or Geist for body text, labels, and UI at normal tracking for legibility.
- Marketing shell is permanently light and high-contrast: no theme switching or dark mode; use the linen, deep indigo, and slate blue system rather than bronze, gold, or heavy gradients.
- Primary actions and CTAs use slate blue with light text; hovers shift to a deeper slate or clean indigo, not bronze or gold.
- Sticky site header should use a frosted treatment (semi-transparent linen, backdrop blur, strong z-index, subtle border) so scroll content does not overlap or bleed through the nav.
- Keep root Playwright and API fuzzing patterns compatible with Codex-merged workflows and expand scenarios when a handful of tests is not enough for security or regression confidence.

## Learned Workspace Facts

- Local development defaults: marketing web on port 3000, admin on 3100, Workers API on 8787.
- Public marketing lead forms should use the Worker `POST /api/lead-email` route; legacy `POST /leads` remains mounted for older flows.
- Repository root `playwright.config.ts` backs `bun run test`; suites that hit the live worker often use low parallelism so rate limits and D1 state are not corrupted by interleaved workers.
- Cloudflare Workers and OpenNext need static assets bound and routed so JS, CSS, and fonts return the right MIME types; HTML fallbacks for those URLs surface as browser “refused to load/execute” errors.
