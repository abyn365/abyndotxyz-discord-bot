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
      return await requestJson('/api/location', locationUpdateRequest(body, locationSecret, authorization));
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }
      unauthorizedError = error;
    }
  }

  throw unauthorizedError;
}

function normalizeLocationSecret(secret) {
  return secret.trim().replace(/^['"]|['"]$/g, '').trim().replace(/^Bearer\s+/i, '').trim();
}

function locationAuthorizationHeaders(locationSecret) {
  return [locationSecret, `Bearer ${locationSecret}`];
}

function locationUpdateRequest(body, locationSecret, authorization) {
  return {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'X-Location-Secret': locationSecret,
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
