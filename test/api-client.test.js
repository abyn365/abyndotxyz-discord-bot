import test from 'node:test';
import assert from 'node:assert/strict';

process.env.LOCATION_SECRET = 'top-secret';
process.env.SITE_URL = 'https://example.test';

const { updateLocation } = await import('../lib/api-client.js');

test('updateLocation sends bearer location secret first', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://example.test/api/location');
    assert.equal(init.method, 'POST');
    assert.equal(init.headers.Authorization, 'Bearer top-secret');
    assert.equal(init.headers['X-Location-Secret'], 'top-secret');
    assert.deepEqual(JSON.parse(init.body), { city: 'Paris', country: 'France' });

    return new Response(JSON.stringify({ location: { city: 'Paris', country: 'France' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const result = await updateLocation('Paris', 'France');
  assert.deepEqual(result, { location: { city: 'Paris', country: 'France' } });
});

test('updateLocation retries legacy raw authorization after unauthorized bearer response', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const authorizations = [];
  globalThis.fetch = async (url, init) => {
    authorizations.push(init.headers.Authorization);

    if (authorizations.length === 1) {
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

  assert.deepEqual(authorizations, ['Bearer top-secret', 'top-secret']);
  assert.deepEqual(result, { location: { city: 'Tokyo', country: 'Japan' } });
});
