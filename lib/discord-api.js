import { COMMANDS } from './commands.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export function commandRegistrationRoute(applicationId, guildId) {
  if (!applicationId) {
    throw new Error('DISCORD_APPLICATION_ID is required.');
  }

  return guildId
    ? `applications/${applicationId}/guilds/${guildId}/commands`
    : `applications/${applicationId}/commands`;
}

export async function registerCommands({ applicationId, botToken, guildId }) {
  if (!botToken) {
    throw new Error('DISCORD_BOT_TOKEN is required.');
  }

  const route = commandRegistrationRoute(applicationId, guildId);
  const response = await fetch(`${DISCORD_API_BASE}/${route}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(COMMANDS)
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.message || `Discord API returned ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = body;
    throw error;
  }

  return {
    registered: Array.isArray(body) ? body.length : COMMANDS.length,
    scope: guildId ? 'guild' : 'global',
    guildId: guildId || null,
    commands: Array.isArray(body) ? body.map((command) => command.name) : COMMANDS.map((command) => command.name)
  };
}

export function inviteUrl(applicationId) {
  if (!applicationId) {
    throw new Error('DISCORD_APPLICATION_ID is required.');
  }

  const params = new URLSearchParams({
    client_id: applicationId,
    scope: 'bot applications.commands',
    permissions: '0'
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
