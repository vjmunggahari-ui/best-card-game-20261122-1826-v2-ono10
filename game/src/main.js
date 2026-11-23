// Lantern Lanes — bootstrap (game/src/main.js)
// One job: start a duel, or stage a screenshot scene, then render it.

import { newDuel } from './rules.js';
import { bindInput } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') ?? 7) || 7;
const shot = params.get('shot');

const duel = shot ? stageShot(shot, seed) : newDuel(seed);
window.LANTERN = { duel };

function rerender() {
  render(duel, window.LANTERN.hooks);
}

window.LANTERN.hooks = bindInput(duel, rerender);
rerender();
