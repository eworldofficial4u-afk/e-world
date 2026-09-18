# E-WORLD Website — ChatGPT Classic Handoff and Audit

Audit date: 2026-09-01  
Workspace: `C:\E-World_Website`  
Production: https://e-world-community.pages.dev  
Staff panel: https://e-world-community.pages.dev/staff-panel

## Instructions for the next ChatGPT session

This document describes the current working implementation. Inspect the existing files before changing anything, preserve the current visual system, and never put credentials in HTML, CSS, browser JavaScript, source control, or chat output. Treat every previously shared Discord webhook, bot token, client secret, and admin password as compromised and rotate it before further production use.

## Current status

- The public E-WORLD community website is deployed on Cloudflare Pages.
- Cloudflare Pages Functions provide the contact relay, Discord widget proxy, public content API, authentication, and protected administration API.
- Cloudflare D1 stores staff sessions, content items, login-attempt throttling data, and the audit trail.
- The administrator panel currently uses password authentication. Discord OAuth endpoints deliberately return HTTP 410 and are disabled.
- The optional Discord bot scaffold exists under `bot/`, but it is not required for the website or password admin panel and should not be run until its token has been rotated.
- All three D1 migrations have been applied remotely; the latest migration check reported no pending migrations.

## Public website

The public site is a responsive, dark, lime-accented, cinematic single-page design with:

- Animated globe/space visual treatment and loading animation.
- Glassmorphism panels, restrained button animation, 3D tilt cards, responsive sections, and themed scrollbars.
- Full responsive layouts for phone, tablet, desktop, wide display, and reduced-motion users.
- Discord invite: `https://discord.gg/ewld`.
- Live Discord widget data proxied through the backend, including online presence, visible voice rooms, active voice rooms, members currently in voice, avatar presence, and sync freshness.
- Dynamic active giveaway, community, and event content loaded from D1.
- A “Contact the Community” form relayed to Discord through a server-side webhook.
- Khan’s owner/staff profile image from `assets/khan.jpg` and `assets/khan-profile.webp`.
- Browser-level text selection, context-menu, and image-drag deterrents. These only discourage casual copying; browser-delivered content can never be made impossible to copy.

Primary frontend files:

- `index.html` — source homepage.
- `styles.css` — main design and responsive styles.
- `site-content.css` — dynamic giveaway metadata styles.
- `script.js` — animations, live Discord data, D1 content rendering, contact form, and copy deterrents.
- `assets/` — logo, globe visuals, and staff imagery.
- `public/` — Cloudflare Pages deployment artifact.

When changing a public source file, keep the corresponding `public/` file synchronized before deploying.

## Staff panel

The new staff command center is available at `/staff-panel`. Homepage navigation and footer buttons point to this route. `/admin.html` remains as a compatibility page that sends users to `/staff-panel`.

Staff panel features:

- Signed-out login screen that does not leak or render the dashboard underneath it.
- Overview, Giveaways, Community, and Events views.
- Live, upcoming, participant, and local-time metrics.
- Content cards with scheduled/active/completed/cancelled/expired state handling.
- Create and edit dialog with type-specific giveaway/community fields.
- Delete confirmation dialog, loading states, error messages, and toast feedback.
- Public visibility toggle backed by `notification_enabled`.
- Start/end time validation and live countdowns.
- Audit history for create, update, and delete actions.
- Responsive desktop and mobile layouts.

Staff panel files:

- `staff-panel.html` — source HTML.
- `staff-panel.css` — panel visual system.
- `staff-panel.js` — login, session, filtering, CRUD, countdowns, and UI state.
- `public/staff-panel-page.txt` — deployment backing asset served as HTML by the secured `/staff-panel` Function.
- `functions/staff-panel.js` and `functions/_lib/staff-response.js` — protected page response and browser security headers.
- `public/_routes.json` — routes `/staff-panel`, `/admin.html`, and `/api/*` through Pages Functions.

The `.txt` deployment backing asset is intentional. It prevents Cloudflare Pages clean-URL redirects from bypassing or looping the secured `/staff-panel` Function.

## Password authentication

The plaintext password must not be stored in source. Production stores only its SHA-256 digest as the encrypted Cloudflare Pages secret `ADMIN_PASSWORD_HASH`.

Login flow:

1. The browser posts JSON containing the entered password to `POST /api/auth/password-login` over HTTPS.
2. The Function hashes the supplied password and performs a constant-time comparison with `ADMIN_PASSWORD_HASH`.
3. A successful login creates a random session token and CSRF token.
4. Only the SHA-256 hash of the session token is stored in D1.
5. The raw session token is returned in the `__Host-eworld_admin` cookie with `HttpOnly`, `Secure`, `SameSite=Lax`, and a two-hour lifetime.
6. Mutating admin requests require both the valid session cookie and the session’s `x-csrf-token` value.
7. Logout deletes the D1 session and expires the cookie.

Login hardening:

- Same-origin validation.
- JSON content-type enforcement.
- 4 KB login request size cap.
- Failed attempts stored against a salted hash of the connecting IP, never the raw IP.
- Five failures within fifteen minutes cause a fifteen-minute block.
- A small delay is added to failed responses.
- Expired sessions are cleaned up during successful login.

The current plaintext admin password is deliberately omitted from this handoff. Rotate it because it was previously sent through chat.

Password rotation command:

```powershell
$newAdminPassword = Read-Host 'New admin password'
$passwordBytes = [Text.Encoding]::UTF8.GetBytes($newAdminPassword)
$passwordHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($passwordBytes)).ToLowerInvariant()
$passwordHash | npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name e-world-community
```

## API inventory

Public endpoints:

- `GET /api/discord-status` — fetches and sanitizes the Discord Server Widget JSON, caches briefly, and returns online members, public channels, and active voice counts.
- `GET /api/community-content` — returns at most 30 public content records. It excludes hidden records and active records whose end time has passed.
- `POST /api/contact` — validates and sanitizes the contact form, blocks foreign origins, includes a honeypot, disables Discord mentions, and sends a Discord embed through the server-side webhook.

Authentication endpoints:

- `POST /api/auth/password-login` — establishes the password session.
- `GET /api/auth/me` — returns authenticated user display data, CSRF token, and session expiry; otherwise returns 401.
- `POST /api/auth/logout` — requires session plus CSRF and deletes the session.
- `/api/auth/login` and `/api/auth/callback` — Discord OAuth is intentionally disabled and returns 410.

Protected administration endpoints:

- `GET /api/admin/content` — returns up to 200 content records plus audit history.
- `POST /api/admin/content` — creates a content item and audit record.
- `PATCH /api/admin/content/:id` — updates an item and writes an audit record.
- `DELETE /api/admin/content/:id` — deletes an item and writes an audit record.

All mutation endpoints require authentication and CSRF validation.

## Content rules

Supported content types are `giveaway`, `community`, `event`, and the legacy-compatible `alert` type.

Supported states are `draft`, `active`, `completed`, and `cancelled`.

Validation and integrity rules:

- Title is required.
- Participant count cannot be negative.
- Active giveaways require an end time.
- Active events require a start time.
- End time must be later than start time.
- Only one giveaway can be active at once.
- Only one community notice can be active at once.
- `notification_enabled = 1` means the item may appear publicly.
- Expired active records are omitted from the public API even if their stored status has not yet been changed.
- Giveaway metadata supports grand prize and bonus prizes.
- Community metadata supports channel, role, and boost counts.
- Text and metadata are sanitized and length-limited server-side.

## D1 database

Binding: `DB`  
Database name: `eworld-community-data`  
Database ID: `15a58ba0-8672-4458-8157-8faf08e089a0`

Tables:

- `admin_sessions` — hashed tokens, display identity, CSRF token, and expiry.
- `content_items` — giveaway/community/event/alert records and metadata JSON.
- `admin_audit_log` — actor, action, entity, detail, and timestamp.
- `admin_login_attempts` — hashed address keys, failure window, and block expiry.

Migrations:

- `0001_admin.sql` — initial sessions, content, and audit tables.
- `0002_staff_content_system.sql` — adds community support and `metadata_json`.
- `0003_admin_hardening.sql` — login throttling and partial unique index for singleton active giveaway/community records.

Apply a future migration with:

```powershell
npx wrangler d1 execute eworld-community-data --remote --file migrations\NEW_MIGRATION.sql
```

Check migration state with:

```powershell
npx wrangler d1 migrations list eworld-community-data --remote
```

## Discord configuration

Non-secret identifiers:

- Guild/server ID: `1539496402890133574`.
- Staff role ID reserved for the optional bot/OAuth design: `1543263077502554123`.
- Discord application/client ID: `1543275777146097755`.
- Invite: `https://discord.gg/ewld`.
- Widget JSON: `https://discord.com/api/guilds/1539496402890133574/widget.json`.

The server widget must remain enabled in Discord for live website status to work.

Sensitive Discord values are intentionally redacted:

- `DISCORD_WEBHOOK_URL`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`
- `OAUTH_STATE_SECRET`

Several old values were pasted into chat. Revoke/rotate every old webhook, client secret, bot token, and admin password rather than reusing them.

## Optional Discord bot

The bot lives in `bot/` and has its own `package.json`. The website root intentionally has no Node package manifest, which is why running `npm install` from `C:\E-World_Website` previously returned `ENOENT`.

Correct bot setup after rotating the token:

```powershell
Set-Location C:\E-World_Website\bot
Copy-Item .env.example .env
# Put the newly rotated bot token in bot/.env without sharing it.
npm install
npm run check
npm start
```

Bot commands:

- `/eworld status`
- `/eworld publish`

Publishing reads the public content API and posts an embed. Manage Server permission or the configured staff role is required. The bot is optional and is not currently part of admin authentication.

## Environment and secrets

Local Pages Functions use an uncommitted `.dev.vars` file copied from `.dev.vars.example`. Generic tooling may use an uncommitted `.env` copied from `.env.example`.

Required/available variables:

- `DISCORD_WEBHOOK_URL`
- `ALLOWED_ORIGIN`
- `ADMIN_PASSWORD_HASH`
- `DISCORD_CLIENT_ID` — dormant while OAuth is disabled.
- `DISCORD_CLIENT_SECRET` — dormant while OAuth is disabled.
- `OAUTH_STATE_SECRET` — dormant while OAuth is disabled.

Production secrets are managed with `wrangler pages secret put`. They are not read from the public deployment’s `.env` file.

The project `.gitignore` excludes `.env`, `.dev.vars`, bot environment files, and other credential-bearing variants.

## Cloudflare deployment

Cloudflare account: `starkopian@gmail.com`  
Pages project: `e-world-community`  
Build output: `public`  
Compatibility date: `2026-08-29`

Deploy command:

```powershell
Set-Location C:\E-World_Website
npx wrangler pages deploy public --project-name e-world-community
```

The latest verified deployment is live on the canonical domain. `/staff-panel` is served through a Page Function with:

- `Cache-Control: no-store`
- strict Content Security Policy
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- restrictive `Permissions-Policy`
- `X-Robots-Tag: noindex, nofollow, noarchive`

## Verification already completed

- Production public homepage loads and links to `/staff-panel`.
- Production staff panel returns HTTP 200 with the correct title and security headers.
- Signed-out `/api/auth/me` returns HTTP 401.
- Desktop and 390 × 844 mobile login layouts were visually checked.
- An authenticated production API test successfully logged in, created a hidden community item, updated it, verified that it remained absent from the public API, and deleted it.
- A second active community item was correctly rejected with HTTP 409.
- An active giveaway without an end time was correctly rejected with HTTP 400.
- Create, update, and delete audit entries were produced.
- The temporary QA content record was removed after testing.
- JavaScript syntax checks passed.
- Remote D1 migration status reported no pending migrations.
- The site was migrated to the `starkopian@gmail.com` Cloudflare account on 2026-09-08 with a new APAC D1 database and all four migrations applied.
- R2 was intentionally omitted at the user's request; tournament registration is closed while the public event information remains available.

## Major defects that were fixed

- The former desktop CSS forced the hidden dashboard to render behind the login screen.
- The former mobile page displayed both the login and dashboard and created an excessively tall page.
- Public visibility toggles did not previously affect the public API.
- Expired active content was returned publicly and counted as active.
- Content-loading failures incorrectly returned users to the login view.
- Login had no throttling.
- Admin responses lacked dependable CSP and clickjacking headers.
- Creating from a filtered section defaulted to the wrong content type.
- Active time requirements and singleton active giveaway/community rules were not enforced.
- Session expiry and error feedback were unclear.
- Mutation endpoints lacked adequate content-type/body-size validation.
- Obsolete admin CSS/JavaScript assets were removed after the rebuild.

## Remaining security and operational actions

1. Rotate the Discord webhook URL, Discord bot token, Discord client secret, and admin password because old values appeared in chat history.
2. Confirm the rotated values are saved only as Cloudflare secrets or ignored local environment values.
3. If the optional bot is needed, host it on a persistent Node runtime; Cloudflare Pages alone will not keep a Discord gateway bot connected.
4. Add Cloudflare rate limiting or Turnstile to `/api/contact` if spam becomes a problem.
5. Consider moving from a single shared password to Discord OAuth/role authentication only after implementing and testing a complete secure OAuth flow.
6. Consider a slow password KDF or managed identity provider for future password changes; the current high-entropy password is compared as a SHA-256 secret digest.
7. Back up/export D1 periodically if the content and audit history become operationally important.

## Next-session guardrails

Security hardening: see SECURITY_AUDIT.md. Migration 0007 adds atomic rate limits. The administrator password has been rotated; the current value is only in the ignored, user-restricted `.admin-access.txt`. Old chat passwords no longer apply. Old sessions were revoked. Never publish this file or copy its contents into a report.

- Do not expose secrets in client-side code.
- Do not repeat credentials from old chat messages.
- Do not re-enable the old Discord OAuth endpoints without a complete authorization-code flow, state validation, secure secret storage, guild membership lookup, and staff-role enforcement.
- Do not treat CSS/JavaScript copy deterrents as true content protection.
- Preserve server-side authorization, CSRF checks, content validation, audit logging, and the public visibility filter.
- Run production verification after every backend or routing deployment.

## COD Mobile tournament system (local implementation complete)

- Public route: `/events/codm-search-destroy`
- Public registration API: `/api/tournament/registrations`
- Staff registration APIs: `/api/admin/tournament/registrations/*`
- D1 migration: `migrations/0004_tournament_registrations.sql`
- Private screenshot storage support is implemented, but the R2 binding was intentionally removed at the user's request.
- Local multipart validation tests pass for 4/5/7/8 player rosters, duplicate UIDs, invalid images, and closed registration.
- Staff API verification passes for listing, detail, state changes, CSV export, and authenticated screenshot delivery.
- Responsive browser checks passed at 1920, 1440, 768, 390, and 320 pixel widths.
- Superseded by the no-upload registration release: migration 0005 makes screenshot metadata optional, public registration accepts bounded JSON, and team/player details are stored in D1 with no R2 dependency. Registration is open. A live five-player submission was confirmed in the authenticated staff list and the QA roster was removed afterward. Use `tests/registration-json.ps1` for current validation.
