import test from 'node:test';
import assert from 'node:assert/strict';
import { ButtonStyle, ComponentType, siteLinkButton } from '../lib/discord.js';

test('siteLinkButton builds a Discord link button', () => {
  assert.deepEqual(siteLinkButton('https://abyn.xyz'), {
    type: ComponentType.ACTION_ROW,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        label: 'Open abyn.xyz',
        url: 'https://abyn.xyz'
      }
    ]
  });
});
