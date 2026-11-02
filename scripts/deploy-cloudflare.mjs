import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

mkdirSync('work', { recursive: true });
const compiler = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
const result = spawnSync(process.execPath, [
  compiler, 'pages', 'deploy', 'dist/client', '--project-name', 'novary',
  '--branch', 'main', '--commit-dirty=true', '--env-file', '/dev/null',
], {
  stdio: 'inherit',
  env: { ...process.env, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false', CLOUDFLARE_INCLUDE_PROCESS_ENV: 'false', WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: resolve('work/wrangler-deploy.log') },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
