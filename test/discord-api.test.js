import test from 'node:test';
import assert from 'node:assert/strict';
import { commandRegistrationRoute, inviteUrl } from '../lib/discord-api.js';

test('builds guild command registration routes', () => {
  assert.equal(commandRegistrationRoute('app-id', 'guild-id'), 'applications/app-id/guilds/guild-id/commands');
});

test('builds global command registration routes', () => {
  assert.equal(commandRegistrationRoute('app-id'), 'applications/app-id/commands');
});

test('builds an invite URL with applications.commands scope', () => {
  const url = inviteUrl('123');
  assert.match(url, /client_id=123/);
  assert.match(url, /applications\.commands/);
});
