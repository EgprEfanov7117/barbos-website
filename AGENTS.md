# NOVARY

This repository is the published NOVARY site at https://novary.pages.dev/. Keep the approved graphite/ivory/orange direction and upright typography. There are three app routes: /, /development, /creative. The service selector heading is exactly «Выбери своё решение» and stays white; only the active left tab is orange. Keep concept imagery separated from readable headings and paragraphs.

Production is Cloudflare Pages, main branch, npm run build:cloudflare, dist/client. Publish only with the pinned modern Wrangler via npm run deploy:cloudflare; built-in Pages Git compilation is incompatible with the SMTP runtime. Git auto-publication for production and preview was disabled with user consent on 2026-11-02. Pushing source does not publish it. Functions live in functions/api/leads.js and use the Cloudflare adapter plus D1 receipts. Preserve both Telegram and email delivery, canonical server-side pricing, length limits, origin checks, persistent rate limiting and retries of only the unconfirmed channel. The concept coffee bot is a local demo. Do not modify the existing production Telegram bot webhook or polling.

Credentials belong only in local ignored configuration or Cloudflare secret bindings. Never commit .env.local, tokens, app passwords, private notification destinations, logs, or local work files. Use .env.example for empty settings.

Checks: npm run test:leads, npm run test:cloudflare, npm run test:sites, npm run build. Keep the rollback tag novary-before-refresh-20261102.
