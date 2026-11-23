// Lantern Lanes — pure rules (game/src/rules.js)
// One job: the state of a duel and every rule that changes it. No DOM, no AI here.

import {
  AFFINITY_BONUS, CARD_BY_ID, CARD_DEFS, DECK_COPIES, DOUSE_POWER, FLARE_POWER,
  HAND_SIZE, LANES, LANE_DAMAGE_CAP, MAX_LIFE, MEND_HEAL, MERCY_BONUS,
} from './cards.js';
import { mulberry32, shuffle } from './random.js';

export function laneTotals(side) {
  const totals = {};
  for (const lane of LANES) totals[lane.id] = 0;
  for (const placed of side) totals[placed.lane] += placed.power;
  return totals;
}

export function buildDeck(random) {
  const deck = [];
  for (const def of CARD_DEFS) {
    for (let copy = 0; copy < DECK_COPIES; copy += 1) deck.push(def.id);
  }
  return shuffle(deck, random);
}

export function newDuel(seed) {
  const random = mulberry32(seed);
  const duel = {
    seed,
    random,
    round: 1,
    phase: 'title',
    playerLife: MAX_LIFE,
    keeperLife: MAX_LIFE,
    playerEnergy: 3,
    keeperEnergy: 3,
    playerDeck: buildDeck(random),
    keeperDeck: buildDeck(random),
    playerDiscard: [],
    keeperDiscard: [],
    playerHand: [],
    keeperHand: [],
    playerLanes: [],
    keeperLanes: [],
    selected: -1,
    intent: null,
    log: ['The lanterns are lit. Three bridges wait.'],
    lastPlay: '',
    mercy: false,
    winner: null,
  };
  drawUp(duel, 'player');
  drawUp(duel, 'keeper');
  return duel;
}

export function drawUp(duel, who) {
  const hand = who === 'player' ? duel.playerHand : duel.keeperHand;
  let deck = who === 'player' ? duel.playerDeck : duel.keeperDeck;
  const discard = who === 'player' ? duel.playerDiscard : duel.keeperDiscard;
  while (hand.length < HAND_SIZE) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = shuffle(discard.splice(0), duel.random);
      if (who === 'player') duel.playerDeck = deck;
      else duel.keeperDeck = deck;
    }
    hand.push(deck.pop());
  }
}

export function affinityBonus(duel, who) {
  if (who === 'player') return duel.mercy ? MERCY_BONUS : AFFINITY_BONUS;
  return AFFINITY_BONUS;
}

export function cardPower(duel, who, cardId, laneId) {
  const def = CARD_BY_ID[cardId];
  if (def.kind !== 'spirit') return 0;
  return def.power + (def.affinity === laneId ? affinityBonus(duel, who) : 0);
}

// Play one card from a hand. Spirits and lane tricks need a lane; Mend needs none.
// Returns a short human line for the log, or null when the play is illegal.
export function playCard(duel, who, handIndex, laneId) {
  const hand = who === 'player' ? duel.playerHand : duel.keeperHand;
  const energyKey = who === 'player' ? 'playerEnergy' : 'keeperEnergy';
  if (handIndex < 0 || handIndex >= hand.length) return null;
  const def = CARD_BY_ID[hand[handIndex]];
  if (duel[energyKey] < def.cost) return null;
  if (def.kind === 'spirit' && !laneId) return null;
  if (def.effect === 'flare' || def.effect === 'douse') {
    if (!laneId) return null;
  }
  duel[energyKey] -= def.cost;
  hand.splice(handIndex, 1);
  const discard = who === 'player' ? duel.playerDiscard : duel.keeperDiscard;
  discard.push(def.id);
  const name = who === 'player' ? 'You' : 'Keeper';
  if (def.effect === 'mend') {
    const key = who === 'player' ? 'playerLife' : 'keeperLife';
    duel[key] = Math.min(MAX_LIFE, duel[key] + MEND_HEAL);
    duel.lastPlay = `${name} played Mend (+${MEND_HEAL} life)`;
    duel.log.push(duel.lastPlay);
    return duel.lastPlay;
  }
  if (def.effect === 'flare') {
    const lanes = who === 'player' ? duel.playerLanes : duel.keeperLanes;
    lanes.push({ id: def.id, lane: laneId, power: FLARE_POWER, trick: true });
    duel.lastPlay = `${name} lit a Flare (+${FLARE_POWER}) on ${laneId.toUpperCase()}`;
    duel.log.push(duel.lastPlay);
    return duel.lastPlay;
  }
  if (def.effect === 'douse') {
    const foeLanes = who === 'player' ? duel.keeperLanes : duel.playerLanes;
    let left = DOUSE_POWER;
    for (const placed of foeLanes) {
      if (placed.lane !== laneId || left <= 0) continue;
      const cut = Math.min(placed.power, left);
      placed.power -= cut;
      left -= cut;
    }
    const lanes = who === 'player' ? duel.playerLanes : duel.keeperLanes;
    lanes.push({ id: def.id, lane: laneId, power: 0, trick: true });
    duel.lastPlay = `${name} doused ${laneId.toUpperCase()} (\u2212${DOUSE_POWER - left} foe power)`;
    duel.log.push(duel.lastPlay);
    return duel.lastPlay;
  }
  const power = cardPower(duel, who, def.id, laneId);
  const lanes = who === 'player' ? duel.playerLanes : duel.keeperLanes;
  const bonus = power > def.power ? ` \u2605+${power - def.power}` : '';
  lanes.push({ id: def.id, lane: laneId, power, trick: false });
  duel.lastPlay = `${name} played ${def.name} (${power}) on ${laneId.toUpperCase()}${bonus}`;
  duel.log.push(duel.lastPlay);
  return duel.lastPlay;
}

// Compare the three lanes, deal the differences as damage, clear the boards.
export function resolveRound(duel) {
  const mine = laneTotals(duel.playerLanes);
  const theirs = laneTotals(duel.keeperLanes);
  let wonLanes = 0;
  let lostLanes = 0;
  const lines = [];
  for (const lane of LANES) {
    if (mine[lane.id] > theirs[lane.id]) {
      const damage = Math.min(LANE_DAMAGE_CAP, mine[lane.id] - theirs[lane.id]);
      duel.keeperLife = Math.max(0, duel.keeperLife - damage);
      wonLanes += 1;
      lines.push(`${lane.name} ${mine[lane.id]} vs ${theirs[lane.id]}: Keeper \u2212${damage}`);
    } else if (theirs[lane.id] > mine[lane.id]) {
      const damage = Math.min(LANE_DAMAGE_CAP, theirs[lane.id] - mine[lane.id]);
      duel.playerLife = Math.max(0, duel.playerLife - damage);
      lostLanes += 1;
      lines.push(`${lane.name} ${mine[lane.id]} vs ${theirs[lane.id]}: You \u2212${damage}`);
    } else {
      lines.push(`${lane.name} ${mine[lane.id]} vs ${theirs[lane.id]}: tied`);
    }
  }
  duel.log.push(`Round ${duel.round} — ${lines.join(' · ')}`);
  duel.playerLanes = [];
  duel.keeperLanes = [];
  duel.selected = -1;
  if (duel.keeperLife <= 0) {
    duel.phase = 'won';
    duel.winner = 'player';
    duel.log.push('The Keeper\u2019s last lantern goes dark. You win!');
    return { wonLanes, lostLanes };
  }
  if (duel.playerLife <= 0) {
    duel.phase = 'lost';
    duel.winner = 'keeper';
    duel.log.push('Your last lantern goes dark. The Keeper wins.');
    return { wonLanes, lostLanes };
  }
  duel.round += 1;
  duel.playerEnergy = Math.min(8, 2 + duel.round);
  duel.keeperEnergy = Math.min(6, 1 + duel.round);
  duel.mercy = duel.playerLife < duel.keeperLife;
  drawUp(duel, 'player');
  drawUp(duel, 'keeper');
  return { wonLanes, lostLanes };
}

export function startDuel(duel) {
  duel.phase = 'play';
  duel.log.push('Round 1 — play a card, then end your turn.');
}
