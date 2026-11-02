import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Build with the compiler used by the direct publication command. Pages Git
// builds still run their own old final compiler, so do not use that pipeline.
const compiler = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
mkdirSync('work', { recursive: true });
const result = spawnSync(process.execPath, [
  compiler, 'pages', 'functions', 'build', 'functions',
  '--outdir', 'dist/client/_worker.js',
  '--compatibility-date', '2026-11-02',
  '--compatibility-flags', 'nodejs_compat',
  '--env-file', '/dev/null',
], {
  stdio: 'inherit',
  env: { ...process.env, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false', CLOUDFLARE_INCLUDE_PROCESS_ENV: 'false', WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: resolve('work/wrangler-build.log') },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
