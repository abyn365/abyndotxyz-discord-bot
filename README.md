# abyndotxyz Discord Bot

A beautiful, secure Discord slash-command bot for [abyn.xyz](https://abyn.xyz), built for Vercel serverless functions.

The main priority is safe location control: `/location set` updates `https://abyn.xyz/api/location` with the shared `LOCATION_SECRET`, and the bot only permits Discord users or roles listed in environment variables.

## Features

- 🔐 Discord request signature verification with your application public key.
- 👤 Allow-list security using `ALLOWED_USER_IDS` and/or `ALLOWED_ROLE_IDS`.
- 🏓 `/ping` smoke test for the Discord ↔ Vercel interaction path.
- 📍 `/location view` and `/location set city country` for the site location API.
- 🌦️ `/weather` for the weather currently displayed on the site.
- ✨ `/site-status` for presence, visitor stats, location, and a polished embed linking to the site.
- ▲ Vercel-ready `api/interactions.js` endpoint.

## Commands

| Command | Who can use it? | Description |
| --- | --- | --- |
| `/ping` | Everyone with access to the bot | Confirms Discord can reach the Vercel interactions endpoint. |
| `/location view` | Everyone with access to the bot | Shows the current saved city, country, timezone, and coordinates. |
| `/location set city country` | Allowed user IDs or role IDs only | Updates the site location through `POST /api/location`. |
| `/weather` | Everyone with access to the bot | Shows current weather from `GET /api/weather`. |
| `/site-status` | Everyone with access to the bot | Shows Discord presence, visitor stats, location, and a website link. |

## Environment variables

Copy `.env.example` and configure these values in Vercel Project Settings → Environment Variables.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | Yes | Defaults to `https://abyn.xyz`; change only for staging/local testing. |
| `DISCORD_PUBLIC_KEY` | Yes | Verifies requests are actually from Discord. |
| `LOCATION_SECRET` | Yes for location updates | Must match the `LOCATION_SECRET` configured on the website. |
| `ALLOWED_USER_IDS` | Yes unless roles are used | Comma-separated Discord user IDs that may run `/location set`. |
| `ALLOWED_ROLE_IDS` | Optional | Comma-separated Discord role IDs that may run `/location set`. |
| `DISCORD_APPLICATION_ID` | Register script only | Application ID used by `npm run register`. |
<<<<<<< codex/create-discord-bot-for-site-api-5edb3i
| `DISCORD_BOT_TOKEN` | Command registration only | Bot token used by `npm run register` or `POST /api/register-commands`. Do not expose it publicly. |
| `REGISTER_SECRET` | Optional but recommended | Secret required by `POST /api/register-commands` for Vercel-side command registration. |
=======
| `DISCORD_BOT_TOKEN` | Register script only | Bot token used locally/CI to register slash commands. Do not expose it publicly. |
>>>>>>> main
| `DISCORD_GUILD_ID` | Optional | Registers guild commands for fast testing when set; otherwise registers global commands. |

## Deployment on Vercel

1. Create a Discord application at the Discord Developer Portal.
2. Add a bot user, copy the application public key, application ID, and bot token.
3. Deploy this repository to Vercel.
4. In Vercel, set `SITE_URL=https://abyn.xyz`, `DISCORD_PUBLIC_KEY`, `LOCATION_SECRET`, and at least one of `ALLOWED_USER_IDS` or `ALLOWED_ROLE_IDS`.
5. In the Discord Developer Portal, set the interactions endpoint URL to:

   ```txt
   https://your-bot.vercel.app/api/interactions
   ```

<<<<<<< codex/create-discord-bot-for-site-api-5edb3i
6. Register slash commands with one of these options:

   Local/CI registration:
=======
6. Register slash commands:
>>>>>>> main

   ```sh
   npm install
   npm run register
   ```

<<<<<<< codex/create-discord-bot-for-site-api-5edb3i
   Vercel-side registration after deploy:

   ```sh
   curl -X POST https://your-bot.vercel.app/api/register-commands \
     -H "Authorization: $REGISTER_SECRET"
   ```

7. Open `https://your-bot.vercel.app/api/register-commands` in a browser to get the invite URL, then invite the bot with the `applications.commands` scope.
=======
7. Invite the bot to your server with the `applications.commands` scope.
>>>>>>> main
8. Run `/ping` in Discord first. If it works, the Discord application, command registration, and Vercel endpoint are connected correctly.

## Why you might not be able to interact with the bot

This project is an interactions-only slash command bot. It does not connect to Discord Gateway, so it will not answer normal chat messages or prefix commands such as `!ping`. Use Discord slash commands instead.

Common setup issues:

<<<<<<< codex/create-discord-bot-for-site-api-5edb3i
1. **Commands were not registered.** The JSON health response only means Vercel is alive; it does not create Discord slash commands. Run `npm run register`, or call `POST /api/register-commands` with `Authorization: $REGISTER_SECRET`, after setting `DISCORD_APPLICATION_ID` and `DISCORD_BOT_TOKEN`. If `DISCORD_GUILD_ID` is set, commands appear almost immediately in that server; global commands can take longer to propagate.
=======
1. **Commands were not registered.** Run `npm run register` after setting `DISCORD_APPLICATION_ID` and `DISCORD_BOT_TOKEN`. If `DISCORD_GUILD_ID` is set, commands appear almost immediately in that server; global commands can take longer to propagate.
>>>>>>> main
2. **The bot was invited without slash-command permissions.** Re-invite it with the `applications.commands` scope.
3. **The interaction endpoint is not set.** In the Discord Developer Portal, set it to `https://your-bot.vercel.app/api/interactions`.
4. **`DISCORD_PUBLIC_KEY` is wrong or missing in Vercel.** Discord will reject or fail interactions when signature verification cannot pass.
5. **You are trying `/location set` without being allowed.** Add your Discord user ID to `ALLOWED_USER_IDS` or a trusted role ID to `ALLOWED_ROLE_IDS`. The bot intentionally denies location updates when no allow-list is configured.
6. **You are testing with normal messages.** The bot only supports `/ping`, `/location`, `/weather`, and `/site-status`.

<<<<<<< codex/create-discord-bot-for-site-api-5edb3i
Open `https://your-bot.vercel.app/api/interactions` in a browser after deploying. It should return a small JSON health response. That confirms the Vercel function exists, but it does **not** mean slash commands have been registered. Use `POST /api/register-commands` or `npm run register` to create the commands in Discord.
=======
Open `https://your-bot.vercel.app/api/interactions` in a browser after deploying. It should return a small JSON health response. That confirms the Vercel function exists, but Discord POST signature verification is still required for real interactions.
>>>>>>> main

## Security notes

- `/location set` is denied when no allow-list is configured, so a missing environment variable fails closed.
- The site `LOCATION_SECRET` is never shown in Discord responses.
- Discord signatures are verified before command handling, so random HTTP clients cannot invoke bot actions.
- Prefer user IDs for a single-owner setup and role IDs when multiple trusted maintainers need access.

## Local development

```sh
npm install
cp .env.example .env
npm run dev
```

Use a tunnel such as Vercel's dev URL or another HTTPS tunnel for Discord interactions during local testing.
