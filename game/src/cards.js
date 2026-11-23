// Lantern Lanes — card catalogue and lanes (game/src/cards.js)
// One job: the static data of the game. Nothing here knows about turns or the DOM.

export const LANES = [
  { id: 'moon', name: 'MOON', symbol: '\u263E', color: '#b78cff', dark: '#7a4fd0', hint: 'Violet bridge' },
  { id: 'sun', name: 'SUN', symbol: '\u2600', color: '#ffc93c', dark: '#d99400', hint: 'Golden bridge' },
  { id: 'tide', name: 'TIDE', symbol: '\u2248', color: '#3fd2c0', dark: '#0f8a7d', hint: 'Teal bridge' },
];

export const LANE_BY_ID = Object.fromEntries(LANES.map((lane) => [lane.id, lane]));

// Spirits carry power into a lane. Tricks carry an effect instead of power.
// affinity: the lane a spirit loves — played there it gains AFFINITY_BONUS power.
export const CARD_DEFS = [
  { id: 'moth', name: 'Moonmoth', kind: 'spirit', power: 2, cost: 1, affinity: 'moon', text: 'Flutters in by moonlight.' },
  { id: 'eel', name: 'Tide Eel', kind: 'spirit', power: 2, cost: 1, affinity: 'tide', text: 'Slips through the teal water.' },
  { id: 'fox', name: 'Sunfox', kind: 'spirit', power: 3, cost: 2, affinity: 'sun', text: 'A quick golden spark.' },
  { id: 'wisp', name: 'Dusk Wisp', kind: 'spirit', power: 3, cost: 2, affinity: 'moon', text: 'Glows violet at dusk.' },
  { id: 'turtle', name: 'Tide Turtle', kind: 'spirit', power: 4, cost: 2, affinity: 'tide', text: 'Slow, heavy, unstoppable.' },
  { id: 'bat', name: 'Glimmer Bat', kind: 'spirit', power: 4, cost: 3, affinity: 'moon', text: 'Wings of faint starlight.' },
  { id: 'stag', name: 'Sun Stag', kind: 'spirit', power: 5, cost: 3, affinity: 'sun', text: 'Antlered king of the gold bridge.' },
  { id: 'crab', name: 'Coral Crab', kind: 'spirit', power: 5, cost: 3, affinity: 'tide', text: 'Claws like coral, grip like tide.' },
  { id: 'phoenix', name: 'Dawn Phoenix', kind: 'spirit', power: 6, cost: 3, affinity: 'sun', text: 'Rises with the first sun.' },
  { id: 'flare', name: 'Lantern Flare', kind: 'trick', power: 0, cost: 2, affinity: null, effect: 'flare', text: '+3 power in one lane.' },
  { id: 'douse', name: 'Douse', kind: 'trick', power: 0, cost: 2, affinity: null, effect: 'douse', text: '\u22123 foe power in one lane.' },
  { id: 'mend', name: 'Mend', kind: 'trick', power: 0, cost: 2, affinity: null, effect: 'mend', text: 'Heal 5 life.' },
];

export const CARD_BY_ID = Object.fromEntries(CARD_DEFS.map((card) => [card.id, card]));

export const MAX_LIFE = 20;
export const HAND_SIZE = 5;
export const DECK_COPIES = 2;
export const AFFINITY_BONUS = 2;
export const MERCY_BONUS = 3;
export const MEND_HEAL = 5;
export const FLARE_POWER = 3;
export const DOUSE_POWER = 3;
export const LANE_DAMAGE_CAP = 5;
