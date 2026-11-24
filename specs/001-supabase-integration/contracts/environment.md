# Contract: Environment variables

Documented in `.env.template` (committed, placeholders only). Real values live in `.env`
(git-ignored). The hosting environment needs the same variables.

| Variable                               | Required           | Exposure         | Consumer                    | Placeholder                            |
| -------------------------------------- | ------------------ | ---------------- | --------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | yes for connection | browser + server | `lib/supabase/config.ts`    | `https://your-project-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes for connection | browser + server | `lib/supabase/config.ts`    | `sb_publishable_your_key`              |
| `SUPABASE_PROJECT_REF`                 | for `db:link`      | CLI only         | `supabase link`             | `your-project-ref`                     |
| `SUPABASE_DB_PASSWORD`                 | for `db:push`      | CLI only         | `supabase link` / `db push` | `your_password`                        |

Rules:

- Only `NEXT_PUBLIC_*` variables may appear in browser bundles (SC-004).
- Missing public variables never fail `next build` or page render; they make
  `getServerSupabase()` / `getBrowserSupabase()` return `null` and `db:check` exit 2.
- Pointing at the local stack: set the URL to `http://127.0.0.1:54321` and the publishable key
  printed by `npm run db:status`.
