# Contract: Data-layer entry points (`lib/supabase/`)

The only modules allowed to create Supabase clients (FR-002). Components and pages import from
here, never from `@supabase/supabase-js` or `@supabase/ssr` directly.

| Export               | Module                           | Importable from                                                                                                           | Signature                                |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `readSupabaseConfig` | `lib/supabase/config.ts`         | anywhere (no deps)                                                                                                        | `() => SupabaseConfig` (see data-model)  |
| `getServerSupabase`  | `lib/supabase/server.ts`         | Server Components, route handlers, server actions only (`server-only`; importing from a Client Component fails the build) | `() => SupabaseClient<Database> \| null` |
| `getBrowserSupabase` | `lib/supabase/client.ts`         | Client Components                                                                                                         | `() => SupabaseClient<Database> \| null` |
| `Database`           | `lib/supabase/database.types.ts` | anywhere (type only)                                                                                                      | generated                                |

Guarantees:

- The server client never reads request cookies, headers or sessions (FR-008), so importing it
  never makes a route dynamic. The browser client (`createBrowserClient`) only touches
  `document.cookie` in the browser and is never created during server render.
- Both return `null` instead of throwing when not configured (FR-006).
- No privileged key is configured (FR-004a); if one is added later it may only be read inside
  `server.ts`.
- `client.ts` wraps `createBrowserClient` from `@supabase/ssr`; `createServerClient` and
  `proxy.ts` are not used until the sessions feature.
