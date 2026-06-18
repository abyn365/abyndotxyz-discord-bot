import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../lib/config.js';
import { formatLocation, formatWeather } from '../lib/format.js';

test('parseCsv trims empty values', () => {
  assert.deepEqual(parseCsv(' 1, ,2 '), ['1', '2']);
});

test('formatLocation renders city and timezone', () => {
  const result = formatLocation({ city: 'Paris', country: 'France', timezone: 'Europe/Paris', latitude: 48.85, longitude: 2.34 });
  assert.match(result, /Paris, France/);
  assert.match(result, /Europe\/Paris/);
});

test('formatWeather supports current weather payloads', () => {
  const result = formatWeather({ city: 'Yogyakarta', country: 'Indonesia', timezone: 'Asia/Jakarta', current_weather: { temperature: 23 } });
  assert.match(result, /23°C/);
});
