import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { readSupabaseConfig } from "./config";
import type { Database } from "./database.types";

/**
 * Cliente de Supabase para código de servidor (Server Components, route handlers, server actions).
 *
 * Sin estado: no lee cookies ni cabeceras, así que usarlo no convierte una ruta en dinámica.
 * Devuelve `null` si falta la configuración; en ese caso se sigue usando `lib/data.ts`.
 *
 * El cliente con cookies (`createServerClient` de `@supabase/ssr`) y `proxy.ts` llegarán con la
 * funcionalidad de sesiones.
 */
export function getServerSupabase(): SupabaseClient<Database> | null {
  const config = readSupabaseConfig();
  if (!config.ok) return null;

  return createClient<Database>(config.url, config.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
