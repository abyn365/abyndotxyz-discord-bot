export const SITE_URL = normalizeUrl(process.env.SITE_URL || 'https://abyn.xyz');
export const LOCATION_SECRET = process.env.LOCATION_SECRET || '';
export const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '';
export const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID || '';
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '';
export const REGISTER_SECRET = process.env.REGISTER_SECRET || '';
export const ALLOWED_USER_IDS = parseCsv(process.env.ALLOWED_USER_IDS || process.env.ALLOWED_DISCORD_USER_IDS || '');
export const ALLOWED_ROLE_IDS = parseCsv(process.env.ALLOWED_ROLE_IDS || '');

export function parseCsv(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeUrl(value) {
  return value.replace(/\/+$/, '');
}
