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
    throw new SiteApiError('LOCATION_SECRET is not configured for this bot deployment.', 500);
  }

  const body = JSON.stringify({ city, country });
  let unauthorizedError = null;

  for (const headers of locationAuthorizationHeaders(locationSecret)) {
    try {
      return await requestJson('/api/location', locationUpdateRequest(body, headers));
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }
      unauthorizedError = error;
    }
  }

  throw new SiteApiError(
    'The website rejected LOCATION_SECRET. Confirm the bot and website Vercel projects both use the same raw LOCATION_SECRET value for Production and Preview, then redeploy both projects.',
    unauthorizedError?.status || 401,
    unauthorizedError?.details
  );
}

export function normalizeLocationSecret(secret) {
  return secret
    .trim()
    .replace(/^LOCATION_SECRET\s*=\s*/i, '')
    .replace(/^Authorization\s*:\s*/i, '')
    .replace(/^['"]|['"]$/g, '')
    .trim()
    .replace(/^Bearer\s+/i, '')
    .trim();
}

function locationAuthorizationHeaders(locationSecret) {
  return [
    { Authorization: locationSecret },
    { Authorization: locationSecret, 'X-Location-Secret': locationSecret },
    { Authorization: `Bearer ${locationSecret}` },
    { Authorization: `Bearer ${locationSecret}`, 'X-Location-Secret': locationSecret }
  ];
}

function locationUpdateRequest(body, authorizationHeaders) {
  return {
    method: 'POST',
    headers: {
      ...authorizationHeaders,
      'Content-Type': 'application/json'
    },
    body
  };
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
    throw new SiteApiError(payload?.message || payload?.error || `Site API returned ${response.status}`, response.status, payload);
  }

  return payload;
}
