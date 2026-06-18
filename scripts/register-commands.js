import { DISCORD_APPLICATION_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID } from '../lib/config.js';
import { inviteUrl, registerCommands } from '../lib/discord-api.js';

try {
  const result = await registerCommands({
    applicationId: DISCORD_APPLICATION_ID,
    botToken: DISCORD_BOT_TOKEN,
    guildId: DISCORD_GUILD_ID
  });

  console.log(`Registered ${result.registered} Discord slash commands (${result.scope}).`);
  console.log(`Commands: ${result.commands.join(', ')}`);
  console.log(`Invite URL: ${inviteUrl(DISCORD_APPLICATION_ID)}`);

  if (!DISCORD_GUILD_ID) {
    console.log('Global commands can take time to appear. Set DISCORD_GUILD_ID for near-instant server testing.');
  }
} catch (error) {
  console.error('Failed to register commands:', error.status || '', error.details || error.message);
  process.exit(1);
}
