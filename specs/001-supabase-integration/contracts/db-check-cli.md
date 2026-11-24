# Contract: `npm run db:check`

Runs `node --env-file-if-exists=.env scripts/db-check.ts`. No arguments. Reads settings through
`lib/supabase/config.ts` (same rules as the portal), then requests
`GET {NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health` with header `apikey: <publishable key>` and a
5-second timeout.

Messages are in Spanish (developer-facing, consistent with the portal). Output goes to stdout on
success, stderr on failure.

| Outcome                                  | Exit code | Message (example)                                                                   |
| ---------------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| Connected                                | 0         | `✓ Conectado a Supabase (https://abc.supabase.co)`                                  |
| Missing / invalid settings               | 2         | `✗ Falta configuración: NEXT_PUBLIC_SUPABASE_URL. Revisa .env (ver .env.template).` |
| Unreachable (DNS, network, timeout, 5xx) | 3         | `✗ No se puede alcanzar Supabase en https://abc.supabase.co: <motivo>`              |
| Rejected credentials (401/403)           | 4         | `✗ Supabase rechazó la clave publicable (HTTP 401).`                                |
| Any other unexpected status              | 1         | `✗ Respuesta inesperada de Supabase (HTTP <code>).`                                 |

The command never prints key values, only the URL.
