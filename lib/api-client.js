import { LOCATION_SECRET, SITE_URL } from './config.js';

export class SiteApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'SiteApiError';
    this.status = status;
    this.details = details;
  }
}

export async function getJson(path) {
  return requestJson(path, { method: 'GET' });
}

export async function updateLocation(city, country) {
  const locationSecret = normalizeLocationSecret(LOCATION_SECRET);

  if (!locationSecret) {
    throw new SiteApiError(
      'LOCATION_SECRET is not configured for this bot deployment.',
      500
    );
  }

  return requestJson('/api/location', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      city,
      country,
      secret: locationSecret
    })
  });
}

export function normalizeLocationSecret(secret) {
  return String(secret ?? '')
    .trim()
    .replace(/^LOCATION_SECRET\s*=\s*/i, '')
    .replace(/^Authorization\s*:\s*/i, '')
    .replace(/^['"]|['"]$/g, '')
    .trim()
    .replace(/^Bearer\s+/i, '')
    .trim();
}

async function requestJson(path, init) {
  const response = await fetch(`${SITE_URL}${path}`, init);
  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    throw new SiteApiError(
      payload?.message || payload?.error || `Site API returned ${response.status}`,
      response.status,
      payload
    );
  }

  return payload;
}
