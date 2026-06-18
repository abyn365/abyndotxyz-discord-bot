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

  for (const authorization of locationAuthorizationHeaders(locationSecret)) {
    try {
      return await requestJson('/api/location', locationUpdateRequest(body, authorization));
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }
      unauthorizedError = error;
    }
  }

  throw new SiteApiError(
    'The website rejected LOCATION_SECRET. Make sure the bot and website Vercel projects use the same raw secret value, without "Authorization:", "Bearer", quotes, or shell syntax.',
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
  return [locationSecret, `Bearer ${locationSecret}`];
}

function locationUpdateRequest(body, authorization) {
  return {
    method: 'POST',
    headers: {
      Authorization: authorization,
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
