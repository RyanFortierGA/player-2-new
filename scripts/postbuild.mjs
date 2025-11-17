import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(process.cwd());
const source = resolve(projectRoot, "apps/web/public/_redirects");
const target = resolve(projectRoot, "apps/web/.netlify/publish/_redirects");

try {
  if (!existsSync(source)) {
    console.warn(`[postbuild] No _redirects found at ${source} — skipping copy.`);
    process.exit(0);
  }
  const dir = dirname(target);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  copyFileSync(source, target);
  console.log(`[postbuild] Copied _redirects to ${target}`);
} catch (err) {
  console.error("[postbuild] Failed to copy _redirects:", err);
  process.exit(1);
}


