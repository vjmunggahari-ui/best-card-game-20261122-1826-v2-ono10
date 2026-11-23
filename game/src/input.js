// Lantern Lanes — input, sound and turn flow (game/src/input.js)
// One job: wire clicks and keys to the rules, and play tiny WebAudio blips.

import { CARD_BY_ID, LANES } from './cards.js';
import { keeperTurn, chooseIntent } from './keeper.js';
import { newDuel, playCard, resolveRound, startDuel } from './rules.js';
import { render } from './render.js';

let audio = null;
let muted = false;

export function blip(kind) {
  if (muted) return;
  try {
    audio = audio ?? new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audio;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = kind === 'play' ? 520 : kind === 'win' ? 780 : kind === 'loss' ? 180 : kind === 'select' ? 660 : 440;
    osc.frequency.value = freq;
    osc.type = kind === 'loss' ? 'sawtooth' : 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // No audio device: the game plays on silently.
  }
}

export function bindInput(duel, rerender) {
  const hooks = {
    selectCard(index) {
      if (duel.phase !== 'play') return;
      const def = CARD_BY_ID[duel.playerHand[index]];
      if (!def) return;
      if (def.cost > duel.playerEnergy) return;
      if (def.effect === 'mend') {
        playCard(duel, 'player', index, null);
        blip('play');
        duel.selected = -1;
        rerender();
        return;
      }
      duel.selected = duel.selected === index ? -1 : index;
      blip('select');
      rerender();
    },
    playInLane(laneId) {
      if (duel.phase !== 'play' || duel.selected < 0) return;
      const played = playCard(duel, 'player', duel.selected, laneId);
      duel.selected = -1;
      if (played) blip('play');
      rerender();
    },
  };

  document.getElementById('endTurn').addEventListener('click', () => endTurn(duel, rerender));
  document.getElementById('newDuel').addEventListener('click', () => {
    const fresh = newDuel(duel.seed + 1);
    Object.assign(duel, fresh);
    startDuel(duel);
    chooseIntent(duel);
    blip('select');
    rerender();
  });
  document.getElementById('startBtn').addEventListener('click', () => {
    startDuel(duel);
    chooseIntent(duel);
    blip('play');
    rerender();
  });
  for (const id of ['winAgain', 'lossAgain']) {
    document.getElementById(id).addEventListener('click', () => {
      const fresh = newDuel(duel.seed + 1);
      Object.assign(duel, fresh);
      startDuel(duel);
      chooseIntent(duel);
      rerender();
    });
  }
  document.getElementById('muteBtn').addEventListener('click', (event) => {
    muted = !muted;
    event.currentTarget.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
  });

  document.addEventListener('keydown', (event) => {
    if (duel.phase === 'title' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      document.getElementById('startBtn').click();
      return;
    }
    if (duel.phase === 'won' || duel.phase === 'lost') {
      if (event.key === 'n' || event.key === 'N') document.getElementById('newDuel').click();
      return;
    }
    if (duel.phase !== 'play') return;
    if (event.key >= '1' && event.key <= '5') {
      hooks.selectCard(Number(event.key) - 1);
    } else if (event.key === 'q' || event.key === 'Q') {
      hooks.playInLane(LANES[0].id);
    } else if (event.key === 'w' || event.key === 'W') {
      hooks.playInLane(LANES[1].id);
    } else if (event.key === 'e' || event.key === 'E') {
      hooks.playInLane(LANES[2].id);
    } else if (event.key === ' ') {
      event.preventDefault();
      endTurn(duel, rerender);
    } else if (event.key === 'm' || event.key === 'M') {
      document.getElementById('muteBtn').click();
    }
  });
  return hooks;
}

export function endTurn(duel, rerender) {
  if (duel.phase !== 'play') return;
  duel.selected = -1;
  keeperTurn(duel);
  const result = resolveRound(duel);
  blip(result.wonLanes > result.lostLanes ? 'play' : 'loss');
  if (duel.phase === 'won') blip('win');
  if (duel.phase === 'play') chooseIntent(duel);
  rerender();
}
