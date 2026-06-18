import { DISCORD_APPLICATION_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, REGISTER_SECRET } from '../lib/config.js';
import { inviteUrl, registerCommands } from '../lib/discord-api.js';

export default async function handler(request, response) {
  if (request.method === 'GET') {
    return send(response, {
      ok: true,
      message: 'POST to this endpoint with Authorization: $REGISTER_SECRET to register Discord slash commands.',
      inviteUrl: safeInviteUrl()
    });
  }

  if (request.method !== 'POST') {
    return send(response, { error: 'Method not allowed' }, 405);
  }

  if (!REGISTER_SECRET || request.headers.authorization !== REGISTER_SECRET) {
    return send(response, { error: 'Unauthorized' }, 401);
  }

  try {
    const result = await registerCommands({
      applicationId: DISCORD_APPLICATION_ID,
      botToken: DISCORD_BOT_TOKEN,
      guildId: DISCORD_GUILD_ID
    });

    return send(response, {
      ok: true,
      ...result,
      inviteUrl: safeInviteUrl()
    });
  } catch (error) {
    return send(response, {
      ok: false,
      error: error.message,
      status: error.status,
      details: error.details
    }, error.status || 500);
  }
}

function safeInviteUrl() {
  try {
    return inviteUrl(DISCORD_APPLICATION_ID);
  } catch {
    return null;
  }
}

function send(response, body, status = 200) {
  response.status(status).json(body);
}
