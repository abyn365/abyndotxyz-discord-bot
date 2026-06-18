import { createPublicKey, verify } from 'node:crypto';
import { ALLOWED_ROLE_IDS, ALLOWED_USER_IDS, SITE_URL } from './config.js';

export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2
};

export const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4
};

export const COLORS = {
  primary: 0x8b5cf6,
  success: 0x22c55e,
  warning: 0xf59e0b,
  danger: 0xef4444,
  info: 0x38bdf8
};

export const ComponentType = {
  ACTION_ROW: 1,
  BUTTON: 2
};

export const ButtonStyle = {
  LINK: 5
};

export function verifyDiscordRequest(rawBody, signature, timestamp, publicKey) {
  try {
    const key = createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), Buffer.from(publicKey, 'hex')]), format: 'der', type: 'spki' });
    return verify(null, Buffer.from(`${timestamp}${rawBody}`), key, Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

export function isAllowed(interaction) {
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const roleIds = interaction.member?.roles || [];

  if (ALLOWED_USER_IDS.length === 0 && ALLOWED_ROLE_IDS.length === 0) {
    return { allowed: false, userId, reason: 'No allowed Discord users or roles are configured.' };
  }

  if (userId && ALLOWED_USER_IDS.includes(userId)) {
    return { allowed: true, userId };
  }

  if (roleIds.some((roleId) => ALLOWED_ROLE_IDS.includes(roleId))) {
    return { allowed: true, userId };
  }

  return { allowed: false, userId, reason: 'This bot is locked to approved Discord users or roles.' };
}

export function baseEmbed(title, description, color = COLORS.primary) {
  return {
    title,
    description,
    color,
    url: SITE_URL,
    timestamp: new Date().toISOString(),
    footer: { text: 'abyn.xyz • private control panel' }
  };
}

export function siteLinkButton(url = SITE_URL) {
  return {
    type: ComponentType.ACTION_ROW,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        label: 'Open abyn.xyz',
        url
      }
    ]
  };
}

export function denyEmbed(reason) {
  return baseEmbed('🔒 Access denied', `${reason}\n\nAsk the bot owner to add your Discord user ID to \`ALLOWED_USER_IDS\` or a role ID to \`ALLOWED_ROLE_IDS\`.`, COLORS.danger);
}
