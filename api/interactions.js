import { getJson, updateLocation } from '../lib/api-client.js';
import { DISCORD_PUBLIC_KEY, SITE_URL } from '../lib/config.js';
import { baseEmbed, COLORS, denyEmbed, InteractionResponseType, InteractionType, isAllowed, verifyDiscordRequest } from '../lib/discord.js';
import { formatDiscordStatus, formatLocation, formatWeather } from '../lib/format.js';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(request, response) {
  if (request.method === 'GET') {
    return send(response, { ok: true, service: 'abyn.xyz Discord bot', interactionEndpoint: true });
  }

  if (request.method !== 'POST') {
    return send(response, { error: 'Method not allowed' }, 405);
  }

  const rawBody = await readBody(request);
  const signature = request.headers['x-signature-ed25519'];
  const timestamp = request.headers['x-signature-timestamp'];

  if (!DISCORD_PUBLIC_KEY || !signature || !timestamp || !verifyDiscordRequest(rawBody, signature, timestamp, DISCORD_PUBLIC_KEY)) {
    return send(response, { error: 'Invalid Discord request signature' }, 401);
  }

  const interaction = JSON.parse(rawBody);

  if (interaction.type === InteractionType.PING) {
    return send(response, { type: InteractionResponseType.PONG });
  }

  if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
    return sendInteraction(response, { embeds: [baseEmbed('Unsupported interaction', 'This bot currently supports slash commands only.', COLORS.warning)], flags: 64 });
  }

  try {
    const data = await routeCommand(interaction);
    return sendInteraction(response, data);
  } catch (error) {
    return sendInteraction(response, { embeds: [baseEmbed('⚠️ Something went wrong', `${error.message || 'Unknown error'}${error.status ? `\nStatus: ${error.status}` : ''}`, COLORS.danger)], flags: 64 });
  }
}

async function routeCommand(interaction) {
  const command = interaction.data.name;

  if (command === 'ping') {
    return { embeds: [baseEmbed('🏓 Pong', 'The abyn.xyz Discord bot is online and ready for slash commands.', COLORS.success)] };
  }

  if (command === 'location') {
    return handleLocation(interaction);
  }

  if (command === 'weather') {
    const weather = await getJson('/api/weather');
    return { embeds: [baseEmbed('🌦️ abyn.xyz weather', formatWeather(weather), COLORS.info)] };
  }

  if (command === 'site-status') {
    const [presence, visitors, location] = await Promise.all([
      getJson('/api/discord-status'),
      getJson('/api/visitor-stats'),
      getJson('/api/location')
    ]);
    return {
      embeds: [
        {
          ...baseEmbed('✨ abyn.xyz live status', formatDiscordStatus(presence), COLORS.primary),
          fields: [
            { name: 'Visitors today', value: `Active: **${visitors.active}**\nPageviews: **${visitors.pageviews}**\nUniques: **${visitors.uniques}**`, inline: true },
            { name: 'Location', value: formatLocation(location), inline: true },
            { name: 'Website', value: `[Open ${SITE_URL}](${SITE_URL})`, inline: false }
          ]
        }
      ]
    };
  }

  return { embeds: [baseEmbed('Unknown command', `I do not know how to handle /${command}.`, COLORS.warning)], flags: 64 };
}

async function handleLocation(interaction) {
  const subcommand = interaction.data.options?.[0];

  if (subcommand?.name === 'view') {
    const location = await getJson('/api/location');
    return { embeds: [baseEmbed('📍 Current abyn.xyz location', formatLocation(location), COLORS.info)] };
  }

  if (subcommand?.name === 'set') {
    const guard = isAllowed(interaction);
    if (!guard.allowed) {
      return { embeds: [denyEmbed(guard.reason)], flags: 64 };
    }

    const city = subcommand.options?.find((option) => option.name === 'city')?.value?.trim();
    const country = subcommand.options?.find((option) => option.name === 'country')?.value?.trim();

    if (!city || !country) {
      return { embeds: [baseEmbed('Missing location', 'Please provide both city and country.', COLORS.warning)], flags: 64 };
    }

    const result = await updateLocation(city, country);
    return {
      embeds: [
        {
          ...baseEmbed('✅ Location updated', `abyn.xyz now uses:\n${formatLocation(result.location)}`, COLORS.success),
          fields: [{ name: 'Updated by', value: `<@${guard.userId}>`, inline: true }]
        }
      ]
    };
  }

  return { embeds: [baseEmbed('Choose a subcommand', 'Use `/location view` or `/location set`.', COLORS.warning)], flags: 64 };
}

function sendInteraction(response, data) {
  return send(response, { type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data });
}

function send(response, body, status = 200) {
  response.status(status).json(body);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}
