// src/data/equipmentData.js
export default [
    {
      id: 1,
      name: 'Fender Twin Reverb',
      type: 'Guitar Amp',
      status: 'Working alright',
      notes: 'Slight hum at high volume',
      imageUrl: '',
      lastUpdated: '2025-06-30',
      problems: [],
      history: [
        { date: '2025-06-20', description: 'Volume knob crackles' },
        { date: '2025-06-25', description: 'Marked for repair' }
      ]
    },
    {
      id: 2,
      name: 'Shure SM58',
      type: 'Microphone',
      status: 'Mint condition',
      notes: '',
      imageUrl: '',
      lastUpdated: '2025-06-25',
      problems: [],
      history: [
        { date: '2025-06-10', description: 'Checked and cleaned' }
      ]
    },
    {
      id: 3,
      name: 'Yamaha DSR115',
      type: 'Speaker',
      status: 'Send for fix',
      notes: 'Distortion at high SPL',
      imageUrl: '',
      lastUpdated: '2025-06-28',
      problems: ['Distortion'],
      history: [
        { date: '2025-06-15', description: 'Reported distortion' },
        { date: '2025-06-20', description: 'Removed from inventory' }
      ]
    }
    // ... Add more items with unique IDs
  ];
  