import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { readSupabaseConfig } from "./config";
import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | undefined;

/**
 * Cliente de Supabase para Client Components. Una única instancia por pestaña.
 *
 * Devuelve `null` durante el render en servidor (no se crea nunca allí) y cuando falta la
 * configuración. Llamarlo desde efectos o manejadores de eventos.
 */
export function getBrowserSupabase(): SupabaseClient<Database> | null {
  if (typeof window === "undefined") return null;
  if (browserClient) return browserClient;

  const config = readSupabaseConfig();
  if (!config.ok) return null;

  browserClient = createBrowserClient<Database>(
    config.url,
    config.publishableKey,
  );
  return browserClient;
}
