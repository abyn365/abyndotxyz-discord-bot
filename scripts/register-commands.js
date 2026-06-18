import { COMMANDS } from '../lib/commands.js';

const { DISCORD_APPLICATION_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_APPLICATION_ID || !DISCORD_BOT_TOKEN) {
  console.error('Missing DISCORD_APPLICATION_ID or DISCORD_BOT_TOKEN.');
  process.exit(1);
}

const route = DISCORD_GUILD_ID
  ? `applications/${DISCORD_APPLICATION_ID}/guilds/${DISCORD_GUILD_ID}/commands`
  : `applications/${DISCORD_APPLICATION_ID}/commands`;

const response = await fetch(`https://discord.com/api/v10/${route}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(COMMANDS)
});

const body = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error('Failed to register commands:', response.status, body);
  process.exit(1);
}

console.log(`Registered ${Array.isArray(body) ? body.length : COMMANDS.length} Discord slash commands.`);
