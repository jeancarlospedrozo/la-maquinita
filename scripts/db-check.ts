// Comprueba la conexión con Supabase usando la misma configuración que el portal.
// Uso: npm run db:check   (contrato: specs/001-supabase-integration/contracts/db-check-cli.md)
//
// Códigos de salida: 0 conectado · 1 respuesta inesperada · 2 falta configuración
//                    3 no se puede alcanzar · 4 clave rechazada

import { existsSync } from "node:fs";

import { readSupabaseConfig } from "../lib/supabase/config.ts";

const TIMEOUT_MS = 5000;

// Misma prioridad que Next.js: variables del entorno > .env.local > .env.
// process.loadEnvFile no sobrescribe variables ya definidas, por eso .env.local va primero.
function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}

function fail(message: string, code: number): never {
  console.error(`✗ ${message}`);
  process.exit(code);
}

function reason(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "TimeoutError")
      return `sin respuesta en ${TIMEOUT_MS / 1000} s`;
    const cause = (error as { cause?: { code?: string; message?: string } })
      .cause;
    return cause?.code ?? cause?.message ?? error.message;
  }
  return String(error);
}

async function main() {
  loadEnvFiles();
  const config = readSupabaseConfig();

  if (!config.ok) {
    const parts: string[] = [];
    if (config.missing.length) parts.push(`falta ${config.missing.join(", ")}`);
    if (config.invalid.length) {
      parts.push(`valor no válido en ${config.invalid.join(", ")}`);
    }
    fail(
      `Falta configuración: ${parts.join("; ")}. Revisa .env.local (ver .env.template).`,
      2,
    );
  }

  const { url, publishableKey } = config;

  let response: Response;
  try {
    response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: publishableKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    fail(`No se puede alcanzar Supabase en ${url}: ${reason(error)}`, 3);
  }

  if (response.ok) {
    console.log(`✓ Conectado a Supabase (${url})`);
    return;
  }
  if (response.status === 401 || response.status === 403) {
    fail(`Supabase rechazó la clave publicable (HTTP ${response.status}).`, 4);
  }
  if (response.status >= 500) {
    fail(`No se puede alcanzar Supabase en ${url}: HTTP ${response.status}`, 3);
  }
  fail(`Respuesta inesperada de Supabase (HTTP ${response.status}).`, 1);
}

await main();
