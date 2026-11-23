// Lantern Lanes — DOM rendering (game/src/render.js)
// One job: turn duel state into the visible table. It never changes the rules.

import { CARD_BY_ID, LANES, LANE_BY_ID, MAX_LIFE } from './cards.js';
import { laneTotals } from './rules.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function cardNode(def, opts) {
  const card = el('div', `card${opts.affinity ? ` aff-${opts.affinity}` : ''}${opts.selected ? ' selected' : ''}${opts.disabled ? ' disabled' : ''}${opts.mini ? ' mini' : ''}`);
  const lane = opts.affinity ? LANE_BY_ID[opts.affinity] : null;
  const cost = el('span', 'cost', String(def.cost));
  card.appendChild(cost);
  const power = el('div', 'power', def.kind === 'spirit' ? String(opts.power ?? def.power) : '\u2726');
  card.appendChild(power);
  const name = el('div', 'cname', def.name);
  card.appendChild(name);
  const suit = el('div', 'suit', lane ? `${lane.symbol} ${lane.name}` : 'TRICK');
  if (lane) suit.style.color = lane.color;
  card.appendChild(suit);
  const text = el('div', 'ctext', def.text);
  card.appendChild(text);
  if (opts.bonus) {
    const badge = el('div', 'bonus', `\u2605 +${opts.bonus} in ${LANE_BY_ID[opts.affinity].name}`);
    card.appendChild(badge);
  }
  if (opts.onClick) {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.addEventListener('click', opts.onClick);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); opts.onClick(); }
    });
  }
  return card;
}

function placedChip(placed, who) {
  const def = CARD_BY_ID[placed.id];
  const lane = placed.lane ? LANE_BY_ID[placed.lane] : null;
  const chip = el('div', `chip ${who}`);
  const symbol = el('span', 'chip-symbol', def.kind === 'spirit' ? (lane ? lane.symbol : '') : '\u2726');
  if (lane) symbol.style.color = lane.color;
  chip.appendChild(symbol);
  chip.appendChild(el('span', 'chip-name', def.name));
  chip.appendChild(el('span', 'chip-power', def.kind === 'spirit' ? String(placed.power) : def.effect === 'flare' ? '+3' : def.effect === 'douse' ? '\u22123' : ''));
  return chip;
}

function lifeBar(label, life, cls) {
  const wrap = el('div', `life ${cls}`);
  wrap.appendChild(el('span', 'life-label', label));
  const bar = el('div', 'bar');
  const fill = el('div', 'fill');
  fill.style.width = `${Math.max(0, (life / MAX_LIFE) * 100)}%`;
  bar.appendChild(fill);
  wrap.appendChild(bar);
  wrap.appendChild(el('span', 'life-num', `${life} / ${MAX_LIFE}`));
  return wrap;
}

export function render(duel, hooks) {
  const root = document.getElementById('table');
  root.querySelector('#roundLabel').textContent = `ROUND ${duel.round}`;
  const lives = root.querySelector('#lives');
  lives.replaceChildren(
    lifeBar('YOU', duel.playerLife, 'you'),
    lifeBar('KEEPER', duel.keeperLife, 'keeper'),
  );
  const energy = root.querySelector('#energy');
  energy.replaceChildren();
  energy.appendChild(el('span', 'energy-label', `ENERGY ${duel.playerEnergy}`));
  for (let i = 0; i < duel.playerEnergy; i += 1) energy.appendChild(el('span', 'pip', '\u25CF'));
  const mercy = root.querySelector('#mercy');
  mercy.textContent = duel.mercy ? "LANTERN'S MERCY: your affinity bonus is +3 while you trail on life" : '';
  mercy.style.display = duel.mercy ? 'block' : 'none';

  const intent = root.querySelector('#intent');
  intent.textContent = duel.intent
    ? `Keeper eyes the ${duel.intent.toUpperCase()} bridge ${LANE_BY_ID[duel.intent].symbol} — match it or strike where it is weak.`
    : 'The Keeper is watching the bridges…';
  const lastPlay = root.querySelector('#lastPlay');
  lastPlay.textContent = duel.lastPlay || '';
  const log = root.querySelector('#log');
  log.textContent = duel.log.slice(-2).join('  |  ');

  const foeHand = root.querySelector('#foeHand');
  foeHand.replaceChildren();
  for (let i = 0; i < duel.keeperHand.length; i += 1) {
    foeHand.appendChild(el('div', 'card-back', '?'));
  }
  foeHand.appendChild(el('span', 'foe-count', `${duel.keeperHand.length} cards in the Keeper's hand`));

  const mine = laneTotals(duel.playerLanes);
  const theirs = laneTotals(duel.keeperLanes);
  const lanesNode = root.querySelector('#lanes');
  lanesNode.replaceChildren();
  for (const lane of LANES) {
    const col = el('div', 'lane');
    col.style.setProperty('--lane', lane.color);
    col.style.setProperty('--lane-dark', lane.dark);
    const head = el('div', 'lane-head');
    head.appendChild(el('span', 'lane-symbol', lane.symbol));
    head.appendChild(el('span', 'lane-name', `${lane.name} BRIDGE`));
    col.appendChild(head);
    const totals = el('div', 'lane-totals');
    const youTotal = el('span', `lane-total you${mine[lane.id] > theirs[lane.id] ? ' winning' : ''}`, String(mine[lane.id]));
    const sep = el('span', 'lane-vs', 'vs');
    const foeTotal = el('span', `lane-total keeper${theirs[lane.id] > mine[lane.id] ? ' winning' : ''}`, String(theirs[lane.id]));
    totals.append(youTotal, sep, foeTotal);
    col.appendChild(totals);
    const keeperRow = el('div', 'lane-row keeper-row');
    for (const placed of duel.keeperLanes.filter((p) => p.lane === lane.id)) keeperRow.appendChild(placedChip(placed, 'keeper'));
    if (keeperRow.childElementCount === 0) keeperRow.appendChild(el('span', 'lane-empty', 'Keeper: —'));
    col.appendChild(keeperRow);
    const yourRow = el('div', 'lane-row your-row');
    for (const placed of duel.playerLanes.filter((p) => p.lane === lane.id)) yourRow.appendChild(placedChip(placed, 'you'));
    if (yourRow.childElementCount === 0) yourRow.appendChild(el('span', 'lane-empty', 'You: —'));
    col.appendChild(yourRow);
    const hint = el('div', 'lane-hint', `Affinity ${lane.symbol}: +${duel.mercy ? 3 : 2} power here`);
    col.appendChild(hint);
    if (duel.selected >= 0 && duel.phase === 'play') {
      col.classList.add('targetable');
      col.addEventListener('click', () => hooks.playInLane(lane.id));
    }
    lanesNode.appendChild(col);
  }

  const hand = root.querySelector('#hand');
  hand.replaceChildren();
  duel.playerHand.forEach((cardId, index) => {
    const def = CARD_BY_ID[cardId];
    const selected = duel.selected === index;
    const disabled = def.cost > duel.playerEnergy || duel.phase !== 'play';
    const bonus = def.kind === 'spirit' && def.affinity ? (duel.mercy ? 3 : 2) : 0;
    const node = cardNode(def, {
      affinity: def.affinity, selected, disabled, bonus,
      onClick: () => hooks.selectCard(index),
    });
    node.setAttribute('data-key', String(index + 1));
    hand.appendChild(node);
  });
  const hint = root.querySelector('#handHint');
  hint.textContent = duel.selected >= 0
    ? 'Now click a bridge to place it — or press Q / W / E for Moon / Sun / Tide.'
    : 'Click a card (or press 1–5), then click a bridge. Space ends your turn.';

  const endBtn = root.querySelector('#endTurn');
  endBtn.disabled = duel.phase !== 'play';
  const newBtn = root.querySelector('#newDuel');
  newBtn.disabled = duel.phase === 'title';

  const title = document.getElementById('titleOverlay');
  title.style.display = duel.phase === 'title' ? 'flex' : 'none';
  const win = document.getElementById('winOverlay');
  win.style.display = duel.phase === 'won' ? 'flex' : 'none';
  const loss = document.getElementById('lossOverlay');
  loss.style.display = duel.phase === 'lost' ? 'flex' : 'none';
  if (duel.phase === 'won') {
    win.querySelector('.end-life').textContent = `You ${duel.playerLife} — Keeper ${duel.keeperLife}  ·  ${duel.round} rounds`;
    launchConfetti(win);
  }
  if (duel.phase === 'lost') {
    loss.querySelector('.end-life').textContent = `You ${duel.playerLife} — Keeper ${duel.keeperLife}  ·  ${duel.round} rounds`;
  }
}

let confettiDone = false;
export function launchConfetti(overlay) {
  if (confettiDone) return;
  confettiDone = true;
  const layer = overlay.querySelector('.confetti');
  const colors = ['#ffc93c', '#b78cff', '#3fd2c0', '#ff6b6b', '#ffffff'];
  for (let i = 0; i < 48; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${(i * 37) % 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${(i % 12) * 0.12}s`;
    layer.appendChild(piece);
  }
}
