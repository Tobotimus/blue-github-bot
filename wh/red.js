exports.flows = [
  {
    id: 518347,
    flows: [
      {
        label: 'Add v3 label for new v3 RPs'
        events: ['opened'],
        object: 'pull_request',
        conditions: [
          { key: 'base.ref', includes: ['V3/'] },
          {
            key: 'repository.name',
            includes: ['Red-DiscordBot']
          }
        ],
        action: {
          labels: ['V3', 'QA: Unassigned']
        }
      }
    ]
  },
  {
    id: 516410,
    flows: [
      {
        label: 'Add bug label'
        events: ['opened'],
        object: 'pull_request',
        conditions: [
          { key: 'head.ref', includes: ['patch'] },
        ],
        action: {
          labels: ['bug']
        }
      }
    ]
  }
];
