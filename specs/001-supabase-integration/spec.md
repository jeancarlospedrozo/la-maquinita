# Feature Specification: Supabase Integration

**Feature Branch**: `001-supabase-integration`

**Created**: 2026-11-24

**Status**: Approved

**Input**: User description: "vamos a implementar Supabase en el proyecto y crea una rama para hacer la especificación"

**Scope note**: This feature only connects the portal to the existing Supabase project and sets up
the groundwork other features will build on. Moving catalog content, player accounts, scores and
favorites to the backend are separate, later features.

## Clarifications

### Session 2026-11-24

- Q: ¿Los cambios de base de datos se prueban primero en un Supabase local (Docker) o se aplican
  directamente al proyecto remoto? → A: Entorno local (`supabase start` con Docker) para
  desarrollar y probar; las migraciones se aplican al remoto con `supabase db push`.
- Q: ¿Cómo se comprueba que el portal está bien conectado a Supabase? → A: Un comando npm
  (`npm run db:check`) que informa de éxito o del motivo del fallo; no se añade ninguna ruta.
- Q: ¿Se prepara ya el manejo de la sesión del usuario o solo la conexión básica? → A: Solo la
  conexión básica (servidor y navegador por separado); el manejo de la sesión llega con la futura
  especificación de cuentas.
- Q: ¿Se incluye ya la clave secreta de Supabase o solo la URL y la clave pública? → A: Solo la URL
  y la clave pública; `SUPABASE_SECRET_KEY` no se declara en esta fase (revisado a petición del
  usuario; antes se había decidido declararla sin uso).
- Q: Con `@supabase/ssr`, ¿se incluye también la capa que renueva la sesión en cada petición
  (`proxy.ts`)? → A: Solo se añade `@supabase/ssr` como dependencia y se usa su cliente de
  navegador; nada de cookies, `proxy.ts` ni manejo de sesión hasta la futura especificación de
  sesiones.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - The portal can talk to the backend (Priority: P1)

A developer sets the project's backend connection settings in their local environment and starts
the portal. Both server-rendered pages and interactive browser components have a single, shared
way to reach the backend through the project's data layer, and the developer can confirm that the
connection works.

**Why this priority**: It is the whole point of the feature: without a working connection no later
backend feature can start.

**Independent Test**: With valid settings, start the portal and run the connection check; it
reports success. Every existing screen still looks and behaves exactly as before.

**Acceptance Scenarios**:

1. **Given** valid connection settings, **When** the developer runs the connection check, **Then**
   it reports that the backend is reachable.
2. **Given** valid connection settings, **When** a visitor uses any existing screen, **Then** it
   shows the same content and behavior as before the integration.
3. **Given** server-side code and browser-side code, **When** each needs the backend, **Then** both
   obtain it from the same data-layer entry point instead of creating their own connection.

---

### User Story 2 - Safe configuration (Priority: P2)

Connection settings live outside the code. Only values meant to be public reach the browser;
privileged keys stay on the server. A new developer can find every required setting documented in
the environment template.

**Why this priority**: A leaked privileged key would expose the whole database; getting this right
before any table exists is cheapest.

**Independent Test**: Inspect the built browser bundle and the repository history for the
privileged key; it is absent. Follow the environment template on a fresh clone and reach a
working connection.

**Acceptance Scenarios**:

1. **Given** the environment template, **When** a new developer copies and fills it in, **Then**
   the portal connects without any other undocumented step.
2. **Given** a production build, **When** its browser assets are inspected, **Then** they contain
   only public connection values.
3. **Given** missing or invalid settings, **When** the portal starts or builds, **Then** it still
   runs on the current example data, and the connection check reports a clear message naming the
   missing setting.

---

### User Story 3 - Versioned database changes (Priority: P3)

Any future change to the database structure is recorded as a versioned file in the repository and
applied the same way in every environment. Type definitions describing the database can be
regenerated from it so code stays in sync.

**Why this priority**: The database is empty today; this keeps it reproducible from the first
table onward, but it is not needed for the connection itself.

**Independent Test**: Start the local backend, reset it so it applies the recorded changes from
scratch, and regenerate the type definitions; both succeed and produce no unexpected differences.

**Acceptance Scenarios**:

1. **Given** the repository, **When** a developer looks for how to change the database, **Then**
   the documented workflow tells them how to create, apply and review a versioned change.
2. **Given** the current (empty) database, **When** type definitions are regenerated, **Then** the
   result matches what is committed.

---

### Edge Cases

- Backend unreachable or settings missing: the portal keeps building, rendering and playing on the
  example data; nothing crashes.
- Settings present but wrong (bad URL or revoked key): the connection check fails with a message
  that distinguishes "unreachable" from "rejected credentials".
- Prerendered pages must not depend on a per-visitor backend session, so they stay fast.
- No request passes through a session-refresh layer in this feature, so adding the integration
  adds no per-request work to any page.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The project MUST include the backend client libraries needed to reach the existing
  Supabase project from server-rendered code and from browser components: `@supabase/supabase-js`
  and `@supabase/ssr`. The browser entry point MUST be built with `@supabase/ssr`'s browser client
  so the future sessions feature can reuse it unchanged.
- **FR-002**: All backend access MUST go through the project's data layer; screens and components
  MUST NOT create their own connections.
- **FR-003**: Connection settings MUST be read from environment variables, and every required
  variable MUST be documented in the environment template with a placeholder value.
- **FR-004**: Only public values (project URL and publishable key) MAY be exposed to the browser;
  privileged keys and the database password MUST be server-only and never committed.
- **FR-004a**: No secret (privileged) key is declared, documented or used in this feature. The only
  server-only value is the database password used by the developer tooling. The server-side entry
  point MUST still be impossible to import from browser components (build fails if it is), so a
  secret key can be added safely in a future feature.
- **FR-005**: The project MUST provide a terminal command (`npm run db:check`) that checks the
  connection using the same settings the portal uses and reports success, or a specific failure
  reason (missing setting, unreachable, rejected credentials), with a non-zero exit code on
  failure. No new page or route is added to the portal for this.
- **FR-006**: When settings are missing or invalid, the portal MUST keep working on the existing
  example data, and the build MUST still succeed.
- **FR-007**: Existing screens MUST keep their current content, look and behavior; the example data
  stays the source for screens in this feature.
- **FR-008**: This feature MUST provide only basic, session-less access, with separate entry points
  for server-side and browser-side code. Reading or refreshing user sessions (cookie-based server
  client, `proxy.ts` per-request session refresh) is out of scope and MUST NOT be added, even though
  `@supabase/ssr` is installed; it belongs to the future sessions feature.
  No current page may switch to per-request rendering because of this integration.
- **FR-009**: Database structure changes MUST be stored as versioned files in the repository, with
  a documented workflow to create and apply them. Changes MUST be developed and tested against a
  local backend instance (run in Docker) first, and only then pushed to the remote project; the
  remote project MUST NOT be used to try out unreviewed changes.
- **FR-009a**: The project MUST document how to start, stop and reset the local backend instance,
  and how to point the portal at it or at the remote project via environment settings.
- **FR-010**: The project MUST be able to generate type definitions from the database, with a
  documented command.
- **FR-011**: Project guidance (`CLAUDE.md`) MUST describe the integration: where the backend entry
  point lives, which variables are needed, and the migration and type-generation workflow.
- **FR-012**: Any table added in the future MUST have access rules enabled before it is exposed;
  this rule MUST be stated in the documented workflow.

### Key Entities

- **Connection settings**: project URL and publishable key (public); database password and project
  reference (developer tooling only).
- **Backend entry point**: the single data-layer access point used by server and browser code.
- **Migration**: a versioned, ordered description of a database structure change.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A developer on a fresh clone reaches a successful connection check in under 10
  minutes by following only the environment template and project guidance.
- **SC-002**: 100% of existing screens look and behave the same as before, at 390 px and 1440 px.
- **SC-003**: Page load speed for catalog and detail pages is unchanged for visitors.
- **SC-004**: Zero privileged keys appear in browser assets or in the repository.
- **SC-005**: With settings removed, the portal still builds and every public page renders.
- **SC-006**: All quality gates (lint, typecheck, format check, build) pass.

## Assumptions

- The existing Supabase project (currently no application tables) is the backend; no new project
  is created.
- No tables, data migration, authentication, scores or favorites are part of this feature; each will
  get its own specification (sign-in methods and score integrity are decided there).
- `.env` is already ignored by git and `.env.template` exists; this feature extends the template.
- The official Supabase client libraries and CLI are acceptable dependencies.
- Developers who change the database need Docker installed to run the local backend; developers
  who only work on screens can keep using the example data without Docker.
- Type definitions are generated from the local backend, which mirrors the committed migrations.
- No admin UI and no production deployment changes are included beyond documenting the variables
  the hosting environment will need.
