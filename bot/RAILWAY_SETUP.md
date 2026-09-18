# E-WORLD Railway bot

## Run without Railway

The same bot works on an existing computer or a Linux VM. With Node 22 installed, run `npm ci --omit=dev` then `npm start` from this directory. With Docker Compose installed, run `docker compose up -d --build`; its restart policy restarts the bot after process failure or machine reboot when Docker starts. Keep `.env` only on the host. No public port, domain, or incoming firewall rule is required. The host must remain awake and connected to the internet.

The bot is prepared but not yet running on a hosting provider. Railway authorization was not completed. The owner will replace the Discord token at the end; do not deploy the previously shared token.

Deploy only this `bot` directory using `railway up` after linking a dedicated Railway service. The Docker build copies only manifests and source. Environment files and node_modules are excluded from uploaded source.

Railway variables: `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_GUILD_ID`, `DISCORD_STAFF_ROLE_ID`, `EWORLD_API_URL`, `BOT_STATS_URL`, `BOT_STATS_SECRET`. Transfer values from the ignored local environment through stdin; do not commit them. `BOT_STATS_SECRET` must match the encrypted Pages secret of the same name.

Invite the application to E-WORLD and enable Server Members Intent and Presence Intent. The bot requests Guilds, GuildMembers, GuildPresences and GuildVoiceStates; Message Content intent is not needed. No administrator permission is required. Send Messages and Embed Links are needed only for staff-triggered publishing.

The bot sends aggregate statistics once per minute. It does not upload member names, private channel names or messages. Pages serves a bot snapshot for up to three minutes, then falls back to the public Discord widget. D1 stores only the latest snapshot, not activity history. Railway must keep the service running; no scheduled sleep or scale-to-zero mode should be enabled.

Run `node --test src/stats.test.js` and `npm run check` before deployment. After deploy, verify Railway logs show Discord login and successful stats sync, and the website `/api/discord-status` reports `source: bot`.
