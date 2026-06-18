export const COMMANDS = [
  {
    name: 'ping',
    description: 'Check whether the Vercel interactions endpoint is responding.'
  },
  {
    name: 'location',
    description: 'View or securely update the abyn.xyz location.',
    options: [
      {
        name: 'view',
        description: 'Show the currently saved site location.',
        type: 1
      },
      {
        name: 'set',
        description: 'Update the site location used by weather widgets.',
        type: 1,
        options: [
          {
            name: 'city',
            description: 'City name, for example Paris.',
            type: 3,
            required: true,
            max_length: 80
          },
          {
            name: 'country',
            description: 'Country name, for example France.',
            type: 3,
            required: true,
            max_length: 80
          }
        ]
      }
    ]
  },
  {
    name: 'weather',
    description: 'Show the weather currently displayed on abyn.xyz.'
  },
  {
    name: 'site-status',
    description: 'Show Discord presence, visitor stats, and API health for abyn.xyz.'
  }
];
