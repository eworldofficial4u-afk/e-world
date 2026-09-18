# E-WORLD Community Platform

A responsive, cinematic single-page foundation for the E-WORLD Discord community.

## Run locally

Open `index.html` directly, or serve the folder with any static web server, for example:

```powershell
npx serve .
```

## Integration notes

- Dynamic Discord/member data is intentionally represented as frontend-ready placeholders.
- The contact webhook relay is implemented in `worker/src/index.js`. It sanitizes input, blocks foreign origins, disables Discord mentions, and keeps the webhook credential server-side.
- OAuth, giveaways, eligibility checks, platform rate limits, audit logs, and winner selection must remain server-side (recommended: Cloudflare Workers + D1).
- Never place bot tokens, webhook URLs, OAuth secrets, or other credentials in `script.js`.
- The current giveaway date/data is demonstrative and can later be supplied by the API layer.

## Secure webhook setup

The webhook URL is deliberately not committed. Rotate any webhook that has been shared publicly, then store the replacement as a Cloudflare Pages secret named `DISCORD_WEBHOOK_URL`. Also set `ALLOWED_ORIGIN` to the exact production website origin.

### Local development secrets

Cloudflare Wrangler uses `.dev.vars` for local Pages Function secrets. Copy `.dev.vars.example` to `.dev.vars`, replace its placeholder values locally, and never commit that file:

```powershell
Copy-Item .dev.vars.example .dev.vars
npx wrangler pages dev public
```

Both `.dev.vars` and `.env` variants are excluded through `.gitignore`. The example files contain placeholders only.

### Production secrets

Production does not read `.env` from the deployed website. Values are stored encrypted in the Cloudflare Pages project:

```powershell
npx wrangler pages secret put DISCORD_WEBHOOK_URL --project-name e-world-community
npx wrangler pages secret put ALLOWED_ORIGIN --project-name e-world-community
```

## Password-gated admin panel

The command center is available at `/staff-panel` (`/admin.html` redirects there). Authentication uses a server-side password hash stored as the encrypted Pages secret `ADMIN_PASSWORD_HASH`. The plaintext password is never stored by Cloudflare or committed to the project. Admin sessions expire after two hours, state-changing requests require CSRF validation, failed logins are throttled, and all content mutations are recorded in `admin_audit_log`.

To change the password, calculate its SHA-256 hash locally and replace the production secret:

```powershell
$password = Read-Host 'New admin password'
$bytes = [Text.Encoding]::UTF8.GetBytes($password)
$hash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
$hash | npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name e-world-community
```

The D1 database is `eworld-community-data`, bound to Pages Functions as `DB`. Apply future migrations with:

```powershell
npx wrangler d1 execute eworld-community-data --remote --file migrations\<migration>.sql
```

For a standalone Worker deployment, configure the same secret with:

```powershell
cd worker
npx wrangler secret put DISCORD_WEBHOOK_URL
```

Update `ALLOWED_ORIGIN` in `worker/wrangler.toml` to the production website origin, then deploy:

```powershell
npx wrangler deploy
```

Route `/api/*` from the website domain to this Worker. Add a Cloudflare rate-limiting rule for `/api/contact` before production launch.

## Discord bot

The optional bot in `bot/` registers the guild-scoped `/eworld status` and `/eworld publish` commands. Publishing reads the active giveaway, community, or event from the protected website data flow and posts it as a Discord embed. Only members with Manage Server or the configured staff role can use it.

Rotate any token that has been pasted into chat, copy `bot/.env.example` to `bot/.env`, and place the replacement token there. Then run `npm install` and `npm start` from the `bot` folder. The `.env` file is ignored and must never be committed or deployed with the public site.

## COD Mobile tournament registration

The featured Search & Destroy tournament is available at `/events/codm-search-destroy`. Team registration uses JSON and D1 only: five starters, up to two substitutes, captain contact details, player UIDs and rule confirmations. No screenshot uploads or R2 binding are required. Apply migration `0005_registration_without_uploads.sql` after the earlier migrations to permit registrations without screenshot metadata.

Staff can review rosters, update statuses, save notes and export CSV in the Registrations section. Registration availability is controlled by staff. Run `tests/registration-json.ps1` against local Pages development for the current no-upload validation suite; the older multipart test describes the retired upload flow.
