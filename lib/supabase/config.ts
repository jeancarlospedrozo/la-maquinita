// Lectura y validación de la configuración pública de Supabase.
// Sin imports: lo usan tanto Next.js (servidor y navegador) como scripts/db-check.ts (Node).

export type SupabaseConfig =
  | { ok: true; url: string; publishableKey: string }
  | { ok: false; missing: string[]; invalid: string[] };

const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_VAR = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeUrl(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol === "https:") return raw.replace(/\/+$/, "");
  if (parsed.protocol === "http:" && LOCAL_HOSTS.has(parsed.hostname)) {
    return raw.replace(/\/+$/, "");
  }
  return null;
}

export function readSupabaseConfig(): SupabaseConfig {
  // Acceso estático a process.env para que Next.js pueda incrustar los valores en el bundle.
  const rawUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const rawKey = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  const missing: string[] = [];
  const invalid: string[] = [];

  let url: string | null = null;
  if (!rawUrl) missing.push(URL_VAR);
  else {
    url = normalizeUrl(rawUrl);
    if (!url) invalid.push(URL_VAR);
  }

  if (!rawKey) missing.push(KEY_VAR);
  // Una clave secreta en una variable pública acabaría en el navegador.
  else if (rawKey.startsWith("sb_secret_")) invalid.push(KEY_VAR);

  if (missing.length > 0 || invalid.length > 0 || !url || !rawKey) {
    return { ok: false, missing, invalid };
  }
  return { ok: true, url, publishableKey: rawKey };
}
