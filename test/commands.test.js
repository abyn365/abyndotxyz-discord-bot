import test from 'node:test';
import assert from 'node:assert/strict';
import { COMMANDS } from '../lib/commands.js';

test('includes a ping command for interaction smoke testing', () => {
  assert.ok(COMMANDS.some((command) => command.name === 'ping'));
});

test('location command exposes view and set subcommands', () => {
  const location = COMMANDS.find((command) => command.name === 'location');
  assert.ok(location);
  assert.deepEqual(location.options.map((option) => option.name), ['view', 'set']);
});
