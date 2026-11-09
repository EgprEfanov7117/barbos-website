# NOVARY

This repository is the published NOVARY site at https://novary.pages.dev/. Keep the approved graphite/ivory/orange direction and upright typography. There are three app routes: /, /development, /creative. The service selector heading is exactly «Выбери своё решение» and stays white; only the active left tab is orange. Keep concept imagery separated from readable headings and paragraphs.

Production is Cloudflare Pages, main branch, npm run build:cloudflare, dist/client. Publish only with the pinned modern Wrangler via npm run deploy:cloudflare; built-in Pages Git compilation is incompatible with the SMTP runtime. Git auto-publication for production and preview was disabled with user consent on 2026-11-02. Pushing source does not publish it. Functions live in functions/api/leads.js and use the Cloudflare adapter plus D1 receipts. Preserve both Telegram and email delivery, canonical server-side pricing, length limits, origin checks, persistent rate limiting and retries of only the unconfirmed channel. The concept coffee bot is a local demo. Do not modify the existing production Telegram bot webhook or polling.

Credentials belong only in local ignored configuration or Cloudflare secret bindings. Never commit .env.local, tokens, app passwords, private notification destinations, logs, or local work files. Use .env.example for empty settings.

Checks: npm run test:leads, npm run test:cloudflare, npm run test:sites, npm run build. Keep the rollback tag novary-before-refresh-20261102.

Portfolio 2026-11-03: user approved and explicitly requested publication of the Ryadom case. App routes now include /projects/ryadom, with a portfolio card on /#concepts. Functional cafe demonstration is bundled at /demos/ryadom/; ?bot=1 opens its scripted local demo. Preserve approved editorial layout and six original campaign PNGs. Cafe and its marketing are concepts, with no real orders or deployed cafe Telegram claims. Build generates public/demos/ryadom from versioned demos/ryadom sources before building the main app. Keep generated public/demos output ignored.

Povod case approved and publication/source save authorized by the user: /projects/povod plus a second homepage portfolio card. Reuse .project-case editorial layout; Ryadom remains unchanged. All five original approved PNGs under public/assets/portfolio/povod must be shown uncropped with their typography intact. Cover is 1280×720, key visual 1080×1350, three info posts 1080×1080. The florist and Telegram materials are a portfolio concept; no live channel, real orders, video or advertising metrics are claimed. New CTA preselects creative design package with total: service.price; keep that field to avoid NaN in Contact. Main form delivery stays unchanged. Use Pages SPA fallback for /projects/*, not an explicit rewrite to /index.html or a broad legacy /projects/* redirect.

Services presentation 2026-11-03: approved task-fit guidance for all nine services, links to the relevant portfolio concepts, a shared individual-service/complex section and form hints. Preserve the original catalog prices, scopes, times and add-ons. Complex CTA clears selected package and preserves in-page form fields; requested contact direction resets on route changes/history. User authorized publishing this update and saving source to main, and asked to publish future agreed NOVARY updates without repeated publication confirmation. Keep local/browser checks and use the existing direct Cloudflare workflow.

Services publication completed: production deployment e06a0fd7-198d-4e37-aee3-36a16e4c81cb (https://e06a0fd7.novary.pages.dev/). Public home and both service pages show approved guidance; service-to-complex selection preserves the task and clears the old package. Both portfolio cards and the Povod service link are present. Build and 16 tests passed; notification settings and the production bot were not changed, and no live lead was sent. QA: service-guidance-qa.md.


Rebrand 2026-11-09: user renamed NOVARY to BARBOS and authorized updating all accessible surfaces. Public copy, metadata and notification branding use BARBOS. Preserve existing technical URLs and resource identities until a verified migration is available. Do not develop a new concept yet.


Address migration 2026-11-09: main public URL and direct deployment target are https://barbos.pages.dev/ (Pages project barbos). The existing notification recipients and D1 database are retained. The legacy novary.pages.dev project redirects GET/HEAD page visits to the new host with path/query preserved; API POST requests still run normally. Deploy the new project first and verify it before deploying the same build to the legacy project with CLOUDFLARE_PAGES_PROJECT=novary. Continue using pinned Wrangler 4.154.0.


Telegram migration 2026-11-09: public contact buttons open https://t.me/barbos_studio_bot/. Website notifications use the new bot through server-only bindings. The legacy bot and its support database remain separate for existing conversations. Never commit either bot token.
