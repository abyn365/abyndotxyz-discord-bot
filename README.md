# abyndotxyz Discord Bot

A beautiful, secure Discord slash-command bot for [abyn.xyz](https://abyn.xyz), built for Vercel serverless functions.

The main priority is safe location control: `/location set` updates `https://abyn.xyz/api/location` with the shared `LOCATION_SECRET`, and the bot only permits Discord users or roles listed in environment variables.

## Features

- 🔐 Discord request signature verification with your application public key.
- 👤 Allow-list security using `ALLOWED_USER_IDS` and/or `ALLOWED_ROLE_IDS`.
- 📍 `/location view` and `/location set city country` for the site location API.
- 🌦️ `/weather` for the weather currently displayed on the site.
- ✨ `/site-status` for presence, visitor stats, location, and a polished embed linking to the site.
- ▲ Vercel-ready `api/interactions.js` endpoint.

## Commands

| Command | Who can use it? | Description |
| --- | --- | --- |
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
| `DISCORD_BOT_TOKEN` | Register script only | Bot token used locally/CI to register slash commands. Do not expose it publicly. |
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

6. Register slash commands:

   ```sh
   npm install
   npm run register
   ```

7. Invite the bot to your server with the `applications.commands` scope.

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
