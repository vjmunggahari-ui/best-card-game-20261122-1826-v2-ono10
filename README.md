# Lantern Lanes — Duel of the Three Bridges

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/vjmunggahari-ui/best-card-game-20261122-1826-v2-ono10/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/vjmunggahari-ui/best-card-game-20261122-1826-v2-ono10/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An original card game for make.fun's best-card-game-20261122-1826 bounty ($50 in USDC).
Three bridges, three lanterns, one Keeper to outwit. v2 entry — a new game, not a tweak of v1.

## The game

- **Both sides 20 life.** Energy starts at 3, grows +1 per turn (max 8). Hand of 5 from a 24-card deck.
- **Three lanes, told apart by colour AND shape:** Moon ☾ violet, Sun ☀ gold, Tide ≈ teal.
- **Affinity:** a spirit played on its own bridge gains +2 power (+3 while you trail on life — Lantern's Mercy).
- **Tricks bend a lane:** Lantern Flare +3, Douse −3 foe power, Mend heal 5.
- **Each round** the stronger side of a bridge deals the difference (max 5) as damage. First lantern out loses.
- **A readable opponent:** the Keeper announces the bridge it eyes each round — match it or strike where it is weak.
- **Complete:** title screen, table with your hand and the Keeper's, readable values/suits/costs, life + energy, win screen (with confetti) and loss screen.

## Play

Open `game/index.html` in desktop Chrome (or `node serve.ts`, then http://localhost:8080). No network request, no build step.

- Click a card (or press 1–5) to select it, then click a bridge — or press Q / W / E for Moon / Sun / Tide. **Space** ends the turn, **N** starts a new duel, **M** mutes, **Enter** starts.
- Screenshots: `?shot=title|play|win|loss&seed=7` renders deterministic states through the real game rules.

## Layout

- `game/index.html` — page + overlays
- `game/style.css` — night table, bridges, cards
- `game/src/cards.js` — lanes, card catalogue, tuning numbers
- `game/src/random.js` — seeded RNG (mulberry32)
- `game/src/rules.js` — pure rules: play, affinity, round resolution, win/loss
- `game/src/keeper.js` — Keeper intent + card choice
- `game/src/render.js` — DOM rendering
- `game/src/input.js` — mouse + keyboard + sounds + turn flow
- `game/src/shots.js` — deterministic screenshot states
- `game/src/main.js` — bootstrap
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output`, writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's library, unchanged

## Build / verify

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # run twice; both runs byte-identical
```

Playtested headless (chrome-headless-shell + CDP): scripted aggressive play reaches WIN on seeds 1, 3, 7, 11, 21, 42 (rounds 4–6); passive play reaches LOSS on all six (rounds 4–5); real mouse clicks play a card and end a turn with zero console/page errors. See `COMPARISON.md` for the 3-concept comparison, relay votes, and revision notes.

## License

MIT — see LICENSE.
