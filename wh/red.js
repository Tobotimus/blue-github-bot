exports.flows = [
  {
    id: 518347,
    flows: [
      {
        label: 'Add v3 label for new v3 RPs',
        events: ['opened'],
        object: 'pull_request',
        conditions: [
          { key: 'base.ref', includes: ['V3/'] },
          {
            key: 'base.repo.name',
            equals: 'Red-DiscordBot'
          }
        ],
        action: {
          labels: ['V3', 'QA: Unassigned']
        }
      },
      {
        label: 'Add v2 label for new v2 RPs',
        events: ['opened'],
        object: 'pull_request',
        conditions: [
          { key: 'base.ref', equals: ['develop'] },
          {
            key: 'base.repo.name',
            equals: 'Red-DiscordBot'
          }
        ],
        action: {
          labels: ['V2']
        }
      }
    ]
  }
  // rawg-toolkit
  // {
  //   id: 516410,
  //   flows: [
  //     {
  //       label: 'Add bug label',
  //       events: ['opened'],
  //       object: 'pull_request',
  //       conditions: [
  //         { key: 'head.ref', equals: 'orels1-patch-1' },
  //         {
  //           key: 'base.repo.name',
  //           equals: 'rawg-toolkit'
  //         }
  //       ],
  //       action: {
  //         labels: ['question']
  //       }
  //     }
  //   ]
  // }
];
