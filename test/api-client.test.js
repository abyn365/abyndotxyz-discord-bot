import test from 'node:test';
import assert from 'node:assert/strict';

process.env.LOCATION_SECRET = 'top-secret';
process.env.SITE_URL = 'https://example.test';

const { normalizeLocationSecret, updateLocation } = await import('../lib/api-client.js');

test('updateLocation sends raw authorization matching the public API docs first', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://example.test/api/location');
    assert.equal(init.method, 'POST');
    assert.equal(init.headers.Authorization, 'top-secret');
    assert.equal(init.headers['X-Location-Secret'], undefined);
    assert.equal(init.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(init.body), { city: 'Paris', country: 'France' });

    return new Response(JSON.stringify({ location: { city: 'Paris', country: 'France' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const result = await updateLocation('Paris', 'France');
  assert.deepEqual(result, { location: { city: 'Paris', country: 'France' } });
});

test('updateLocation retries alternate supported location secret header styles after unauthorized responses', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push(init.headers);

    if (requests.length < 4) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ location: { city: 'Tokyo', country: 'Japan' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const result = await updateLocation('Tokyo', 'Japan');

  assert.deepEqual(requests, [
    { Authorization: 'top-secret', 'Content-Type': 'application/json' },
    { Authorization: 'top-secret', 'X-Location-Secret': 'top-secret', 'Content-Type': 'application/json' },
    { Authorization: 'Bearer top-secret', 'Content-Type': 'application/json' },
    { Authorization: 'Bearer top-secret', 'X-Location-Secret': 'top-secret', 'Content-Type': 'application/json' }
  ]);
  assert.deepEqual(result, { location: { city: 'Tokyo', country: 'Japan' } });
});

test('normalizeLocationSecret accepts common pasted header and env formats', () => {
  assert.equal(normalizeLocationSecret('Authorization: top-secret'), 'top-secret');
  assert.equal(normalizeLocationSecret('LOCATION_SECRET="Bearer top-secret"'), 'top-secret');
  assert.equal(normalizeLocationSecret("'Bearer top-secret'"), 'top-secret');
});
