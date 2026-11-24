// PostToolUse hook: formats every file Claude writes/edits with Prettier,
// then runs ESLint --fix on JS/TS files. Unfixable lint errors exit 2 so
// Claude sees them and fixes them.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
const bin = (name) => path.join(projectDir, "node_modules", ".bin", name);

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const abs = path.resolve(projectDir, filePath);
const rel = path.relative(projectDir, abs);
if (rel.startsWith("..") || path.isAbsolute(rel) || !existsSync(abs)) process.exit(0);

const run = (cmd, args) =>
  spawnSync(cmd, args, { cwd: projectDir, encoding: "utf8" });

const problems = [];

if (existsSync(bin("prettier"))) {
  const r = run(bin("prettier"), ["--write", "--ignore-unknown", "--log-level", "warn", abs]);
  if (r.status !== 0) problems.push(`Prettier falló en ${rel}:\n${r.stderr || r.stdout}`);
}

if (/\.(m|c)?[jt]sx?$/.test(abs) && existsSync(bin("eslint"))) {
  const r = run(bin("eslint"), ["--fix", "--no-warn-ignored", "--quiet", abs]);
  if (r.status !== 0) problems.push(`ESLint encontró errores en ${rel}:\n${r.stdout || r.stderr}`);
}

if (problems.length) {
  process.stderr.write(problems.join("\n\n"));
  process.exit(2);
}
