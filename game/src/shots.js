// Lantern Lanes — deterministic screenshot states (game/src/shots.js)
// One job: build the four screenshot scenes by PLAYING the real rules forward
// from a fresh duel, never by faking a screen. ?shot=title|play|win|loss&seed=N

import { CARD_BY_ID, LANES } from './cards.js';
import { chooseIntent, keeperTurn } from './keeper.js';
import { laneTotals, newDuel, playCard, resolveRound, startDuel } from './rules.js';

function bestSpiritIndex(duel) {
  let best = -1;
  let bestPower = -1;
  for (let i = 0; i < duel.playerHand.length; i += 1) {
    const def = CARD_BY_ID[duel.playerHand[i]];
    if (def.kind !== 'spirit' || def.cost > duel.playerEnergy) continue;
    if (def.power > bestPower) {
      best = i;
      bestPower = def.power;
    }
  }
  return best;
}

function trickIndex(duel, effect) {
  for (let i = 0; i < duel.playerHand.length; i += 1) {
    const def = CARD_BY_ID[duel.playerHand[i]];
    if (def.effect === effect && def.cost <= duel.playerEnergy) return i;
  }
  return -1;
}

// One aggressive player turn: Mend when hurt, Douse the worst lane,
// Flare the closest lane, then every affordable spirit into its own bridge.
export function playAggressiveTurn(duel) {
  if (duel.playerLife <= 10) {
    const mend = trickIndex(duel, 'mend');
    if (mend >= 0) playCard(duel, 'player', mend, null);
  }
  const mine = laneTotals(duel.playerLanes);
  const theirs = laneTotals(duel.keeperLanes);
  for (const lane of LANES) {
    if (theirs[lane.id] - mine[lane.id] >= 3) {
      const douse = trickIndex(duel, 'douse');
      if (douse >= 0) playCard(duel, 'player', douse, lane.id);
      break;
    }
  }
  let flare = trickIndex(duel, 'flare');
  if (flare >= 0) {
    let laneId = LANES[0].id;
    let bestGap = -Infinity;
    for (const lane of LANES) {
      const gap = mine[lane.id] + 3 - theirs[lane.id];
      if (gap > bestGap) {
        bestGap = gap;
        laneId = lane.id;
      }
    }
    playCard(duel, 'player', flare, laneId);
  }
  let index = bestSpiritIndex(duel);
  while (index >= 0) {
    const def = CARD_BY_ID[duel.playerHand[index]];
    playCard(duel, 'player', index, def.affinity);
    index = bestSpiritIndex(duel);
  }
}

export function autoRound(duel, aggressive) {
  if (aggressive) playAggressiveTurn(duel);
  keeperTurn(duel);
  resolveRound(duel);
  if (duel.phase === 'play') chooseIntent(duel);
}

export function stageShot(name, seed) {
  const duel = newDuel(seed);
  startDuel(duel);
  chooseIntent(duel);
  if (name === 'title') {
    duel.phase = 'title';
    return duel;
  }
  if (name === 'play') {
    autoRound(duel, true);
    autoRound(duel, true);
    if (duel.phase === 'play') playAggressiveTurn(duel);
    return duel;
  }
  if (name === 'win') {
    let guard = 0;
    while (duel.phase === 'play' && guard < 30) {
      autoRound(duel, true);
      guard += 1;
    }
    return duel;
  }
  if (name === 'loss') {
    let guard = 0;
    while (duel.phase === 'play' && guard < 30) {
      autoRound(duel, false);
      guard += 1;
    }
    return duel;
  }
  duel.phase = 'title';
  return duel;
}
