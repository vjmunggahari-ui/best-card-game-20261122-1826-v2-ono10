// Lantern Lanes — the Lantern Keeper AI (game/src/keeper.js)
// One job: choose the Keeper's intent and its cards, so the player can read and counter it.

import { CARD_BY_ID, LANES } from './cards.js';
import { cardPower, laneTotals, playCard } from './rules.js';
import { pickRandom } from './random.js';

// Pick the lane the Keeper will fight hardest for this round and announce it.
export function chooseIntent(duel) {
  const mine = laneTotals(duel.playerLanes);
  const theirs = laneTotals(duel.keeperLanes);
  const gaps = LANES.map((lane) => mine[lane.id] - theirs[lane.id]);
  const worst = Math.min(...gaps);
  const weakest = LANES.filter((lane, i) => gaps[i] === worst);
  // At a fresh round every lane is tied: fight a random bridge, not always Moon.
  const focus = weakest.length === LANES.length
    ? pickRandom(LANES, duel.random).id
    : pickRandom(weakest, duel.random).id;
  const options = [focus, pickRandom(LANES, duel.random).id];
  duel.intent = pickRandom(options, duel.random);
  duel.log.push(`Keeper eyes the ${duel.intent.toUpperCase()} bridge.`);
  return duel.intent;
}

function cheapestAffordableIndex(duel, want) {
  let best = -1;
  let bestCost = Infinity;
  for (let i = 0; i < duel.keeperHand.length; i += 1) {
    const def = CARD_BY_ID[duel.keeperHand[i]];
    if (def.kind !== 'spirit') continue;
    if (want && def.affinity !== want) continue;
    if (def.cost <= duel.keeperEnergy && def.cost < bestCost) {
      best = i;
      bestCost = def.cost;
    }
  }
  return best;
}

function findCard(duel, effect) {
  for (let i = 0; i < duel.keeperHand.length; i += 1) {
    const def = CARD_BY_ID[duel.keeperHand[i]];
    if (def.effect === effect && def.cost <= duel.keeperEnergy) return i;
  }
  return -1;
}

// The Keeper takes its turn: heal when hurt, douse when badly behind in a lane,
// then play spirits — strongest into its focus lane, the rest where they fit.
export function keeperTurn(duel) {
  // The intent was announced at the start of the player's turn; keep it so the
  // player can counter it. Only pick one here if none was announced yet.
  if (!duel.intent) chooseIntent(duel);
  const mine = laneTotals(duel.playerLanes);
  const theirs = laneTotals(duel.keeperLanes);
  if (duel.keeperLife <= 8) {
    const mend = findCard(duel, 'mend');
    if (mend >= 0) playCard(duel, 'keeper', mend, null);
  }
  for (const lane of LANES) {
    if (mine[lane.id] - theirs[lane.id] >= 4) {
      const douse = findCard(duel, 'douse');
      if (douse >= 0) {
        playCard(duel, 'keeper', douse, lane.id);
        break;
      }
    }
  }
  let plays = 0;
  const maxPlays = duel.round <= 1 ? 1 : 2;
  while (plays < maxPlays) {
    const focusIndex = cheapestAffordableIndex(duel, duel.intent);
    const anyIndex = cheapestAffordableIndex(duel, null);
    const index = focusIndex >= 0 ? focusIndex : anyIndex;
    if (index < 0) break;
    const def = CARD_BY_ID[duel.keeperHand[index]];
    const laneId = def.affinity === duel.intent ? duel.intent : pickRandom(LANES, duel.random).id;
    if (!playCard(duel, 'keeper', index, laneId)) break;
    plays += 1;
  }
  if (plays === 0) duel.log.push('Keeper holds its cards this round.');
}
