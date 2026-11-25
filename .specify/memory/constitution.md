<!--
Sync Impact Report (remove before committing)
- Version: 1.0.0 → 1.0.1 (PATCH: clarifies Principle I with a closed, explicit exception)
- Modified principles: I. Spanish-First Experience (title unchanged; adds arcade-terms exception)
- Added sections: none · Removed sections: none
- Templates: no changes needed (plan/spec/tasks templates read the constitution at runtime)
- Follow-up TODOs: none
-->

# La Maquinita Constitution

## Core Principles

### I. Spanish-First Experience

- All user-facing copy (labels, buttons, empty states, errors, metadata, `alt` text, ARIA labels)
  MUST be written in Spanish.
- Code identifiers, comments, and developer documentation MAY stay in English.
- A feature is not complete while any visible English string remains in the UI.
- Exception: the arcade terms that appear in the Claude Design reference MAY be shown verbatim, as
  visual style (like the pixel font). The list is closed: "PRESS START", "GAME OVER",
  "INSERT COIN TO CONTINUE". Any other user-facing text, including new arcade-style titles, MUST
  be in Spanish. Adding a term to this list requires a constitution amendment.

Rationale: La Maquinita is a Spanish-language arcade portal; mixed-language UI breaks the product's
identity and the reference design. The listed terms come from that design (Principle II) and are
shared by the whole portal; translating them is a separate, portal-wide decision.

### II. Design Fidelity

- Screens MUST match the Claude Design reference ("La Maquinita.dc.html"): 1440 px desktop and
  390 px mobile variants.
- Layouts MUST be implemented responsively in one tree: unprefixed classes target mobile, `lg:`
  targets desktop. Separate mobile/desktop component trees are not allowed.
- Colors, fonts, and effects MUST come from the tokens in `app/globals.css` (`@theme inline`) and
  the shared `lm-*` classes. Glow, shadow, and neon values MUST NOT be re-inlined when an `lm-*`
  class already covers them.
- Elements with both an explicit size and a border MUST use `box-content` to reproduce the
  reference's `content-box` sizing.
- Animated effects MUST respect `prefers-reduced-motion`, and the CRT overlay MUST stay togglable.

Rationale: pixel parity with the design is the acceptance bar, and the reference relies on quirks
(`line-height: normal`, `content-box`) that silently drift if bypassed.

### III. Cache Components Compliance

`cacheComponents` and `partialPrefetching` are enabled, so every route MUST stay prerenderable:

- Runtime data (`searchParams`, `cookies()`, headers, session) MUST be read inside a `<Suspense>`
  boundary with a meaningful skeleton fallback.
- Dynamic routes MUST provide `generateStaticParams` when their params are known at build time.
- Shared layout chrome MUST NOT call `usePathname`/`useSearchParams`; pages pass state such as the
  active tab explicitly (e.g. `<SiteShell active="juegos">`).
- Non-deterministic values (`Date.now()`, `Math.random()`) MUST only be produced in client effects
  or event handlers, never during render.
- Page and layout props MUST use the global `PageProps<"/route">` / `LayoutProps<"/route">` types,
  treating `params` and `searchParams` as Promises.
- Before using a Next.js API, contributors MUST check the bundled docs in
  `node_modules/next/dist/docs/`; this Next.js version differs from older conventions.

Rationale: `npm run build` enforces these rules; violating them breaks prerendering or causes
hydration mismatches.

### IV. Server-First Components

- Components MUST be Server Components by default. `"use client"` is allowed only where state,
  effects, browser APIs, or event handlers are required.
- Server-safe shared primitives live in `components/ui.tsx`; interactive pieces live in
  per-screen client folders (`components/catalog`, `detail`, `game`, `rankings`, …).
- Client boundaries MUST be kept as small as practical: wrap the interactive leaf, not the page.
- The play screen (`/juegos/[slug]/jugar`) MUST keep rendering without `SiteShell` ("modo foco").

Rationale: small client islands keep pages fast and prerenderable, and keep structure predictable.

### V. Data Behind a Seam

- UI components MUST NOT fetch or persist data directly against a backend. Data access goes
  through a single module (today `lib/data.ts`; later a data layer backed by the real API or
  Supabase) that exposes typed functions.
- Mock data MAY stand in for the backend; every place that will need real fetching or saving
  MUST carry a `TODO` marker.
- When a database backend (e.g. Supabase) is introduced, every table exposed to clients MUST have
  Row Level Security enabled with explicit policies, schema changes MUST go through versioned
  migrations, and secrets MUST live in environment variables (`.env`, never committed;
  `.env.template` documents required keys).

Rationale: the backend is not built yet; a narrow seam lets it be swapped in without touching
screens, and security defaults are cheapest to get right from the first table.

## Technology Constraints

- Stack: Next.js 16 (App Router), React 19 with the React Compiler lint rules, TypeScript, and
  Tailwind CSS v4. Fonts are loaded via `next/font` (Space Grotesk, JetBrains Mono, Silkscreen).
- New runtime dependencies MUST be justified in the feature plan; prefer platform features and
  existing primitives over new libraries.
- Client-side persistence that is per-browser only (e.g. favorites) MAY use `localStorage` via
  `useSyncExternalStore`, and MUST tolerate storage being unavailable.
- The game canvas is a slot for a future engine; demo modes MUST keep every `GameScreen` state
  (`loading → start → playing ⇄ pause → over | record`) reachable until a real engine exists.

## Development Workflow & Quality Gates

- Work happens on feature branches merged to `main` through pull requests; direct commits to
  `main` are not allowed.
- Every change MUST pass, before merge: `npm run lint`, `npx tsc --noEmit`,
  `npm run format:check`, and `npm run build`.
- The project hook that runs Prettier and `eslint --fix` after edits MUST stay enabled;
  unfixable lint errors MUST be fixed, not suppressed, unless the suppression is justified inline.
- There is no automated test suite. UI changes MUST be verified manually in the running app at
  both 390 px and 1440 px widths, including loading, empty, and error states where they apply.
  Adding automated tests is welcome and MUST NOT be blocked by this rule.
- Spec Kit plans MUST include a Constitution Check against Principles I–V and record any
  justified deviation in the plan's complexity tracking.

## Governance

- This constitution supersedes conflicting practices. `CLAUDE.md` and `AGENTS.md` hold runtime
  development guidance and MUST stay consistent with it; on conflict, amend one or the other in
  the same change.
- Amendments are made via `/speckit-constitution` in a pull request that states the change, the
  rationale, and any migration needed for existing code.
- Versioning follows semantic versioning: MAJOR for removing or redefining a principle, MINOR
  for adding a principle or section or materially expanding guidance, PATCH for clarifications
  and wording.
- Reviewers MUST check pull requests for compliance with the principles above; deviations MUST be
  justified explicitly or fixed before merge.

**Version**: 1.0.1 | **Ratified**: 2026-11-23 | **Last Amended**: 2026-11-25
