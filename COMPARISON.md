# Lantern Lanes — concept comparison, playtest, revision (best-card-game v2)

## Brief in 8 lines (muse-juara)
1. Build a SUBSTANTIALLY better, NEW card game for best-card-game-20261122-1826 ($50, closes 13:26 WIB 23 Nov). v1 "Ember Sigil Duel" ranked 2332/2744 — a flat single-table combo duel.
2. Judge (pairwise, z-ai/glm-5.3-flash) ranks: (1) complete game in screenshots, (2) fun+depth, (3) feel/polish, (4) look/originality, (5) code structure.
3. Game: static files under game/, no network, keyboard + mouse, title + table + both hands + readable values/suits/costs + life total + win AND loss screens.
4. main.ts (Node 22, stdlib only) copies game/ + screenshots/ to /output, writes dossier.json via vendor/makefun-game.ts; two runs byte-identical; grader-like verify (read-only copy, su nobody).
5. 4 real screenshots (≤256 KiB, long ≤1280, short ≥480), first = cover.
6. Original idea/art/names only; lanes told apart by colour AND shape.
7. Repo best-card-game-20261122-1826-v2-ono10 under vjmunggahari-ui, created after opening, MIT license, beacon-root history.
8. Build FRESH in this session; genuine revision step (write → run → EDIT → re-run twice) is mandatory.

## 3-concept comparison (scored 1–5 per judge criterion)

| Criterion | A: Lantern Lanes (3-lane control) | B: Draft-and-ban duel | C: Trick-taking + bidding |
|---|---|---|---|
| 1. Complete game in screenshots | 5 — title, 3-lane table, both hands, life bars, win + loss all render clearly | 3 — draft/ban is modal, hard to read in one still | 3 — bidding UI is hard to show at a glance |
| 2. Fun + depth | 5 — every turn: which card, which bridge; affinity, tricks, announced intent to counter | 4 — one draft decision per round, thinner | 4 — bluff/bid is one decision per hand |
| 3. Feel / polish | 4 — card lift/select, lane glow, confetti win flourish, WebAudio blips | 3 — little motion inherent to drafting | 3 — little motion inherent to trick-taking |
| 4. Look / originality | 5 — 3 original lantern bridges, colour AND shape, original names | 3 — looks like a known card game at thumbnail size | 3 — looks like a known card game at thumbnail size |
| 5. Structure | 5 — cards / random / rules / keeper / render / input / shots, one job each | 4 — draft + ban logic in fewer, muddier files | 4 — bid logic + AI in fewer, muddier files |
| **TOTAL** | **24** | **17** | **17** |

**Winner: Concept A — Lantern Lanes (24/25).** Built fully.

## Relays (one generic public design question each, no private details)
- Groq gpt-oss-20b — 200: picked A; "strategic depth from lane affinity and dual win conditions"; risk: complexity may overwhelm new players.
- Bluesminds ising-calibration-1.5-31b — 200: picked A; "spatial strategy… decide where to play cards to maximize affinity bonuses"; risk: one lane dominating makes others irrelevant.
- 100milionseek deepseek-v4.1-flash-free — 200: picked A; "lanes, life totals, and card placement read instantly in a static screenshot"; risk: three lanes can look cluttered.
- Xkiro — DEGRADED: deepseek-v4.1-flash in maintenance until 2026-12-01; grok-4.5 + gemini-4-carbon need a paid plan (403).
- Requesty — DEGRADED: 402, organisation balance too low.
- Coarena — DEGRADED: 402, haiku-5-5 not on free tier; free-tier model id not resolved in the time available.
- Xingchi — DEGRADED: 400, chat completions disabled on this endpoint (Responses API only).
- 3 working relays, unanimous for A. Their shared risks (complexity / clutter / one-lane dominance) were answered in the build: 3 lanes only, big lane totals, affinity shown on every card, per-lane damage cap 5 so no lane snowballs the duel.

## Skills used
- muse-juara (brief restated, 3 concepts compared, self-critique, genuine revision step).
- makefun_competitions (kit + RULES.txt read, bundle-route entry, anchor + LICENSE + vendor unchanged, no push/submit/bundle by this builder).
- game-design (core verb = place a card on a bridge; moment-to-moment placement, session = a duel, comeback via Lantern's Mercy; intransitive affinity — every bridge is another's counter; scope cut to one duel, no meta).

## Rules as built
- Both sides 20 life. Energy 3, +1/turn, max 8. Hand of 5, 24-card deck (12 defs × 2).
- Lanes: Moon ☾ violet, Sun ☀ gold, Tide ≈ teal. Spirits 1–6 power, cost 1–3; affinity +2 (+3 Mercy while trailing).
- Tricks: Lantern Flare +3 in a lane, Douse −3 foe power in a lane, Mend heal 5. All cost 2.
- Round: play cards, Keeper plays, each lane compares — stronger side deals the difference (max 5) as damage; boards clear; next round.
- Keeper announces its focus bridge at the start of your turn; heals at ≤8 life; douses a lane where you lead by ≥4.

## Playtest proof (chrome-headless-shell + CDP, real clicks)
- WIN reached (aggressive autopilot, real rules): seeds 1, 3, 7, 11, 21, 42 → phase `won`, rounds 4–6, keeper life 0. Zero page errors, zero console errors.
- LOSS reached (passive play): same six seeds → phase `lost`, rounds 4–5, player life 0.
- Real-click playtest: Start → select card 1 → click Moon bridge → "You played Moonmoth (4) on MOON ★+2", energy 3→2 → End Turn → round 2, 16 vs 16.
- Shot states (?shot=title|play|win|loss) are built by playing real cards through `playCard` / `keeperTurn` / `resolveRound` — never by faking the screen.
- Screenshots re-taken after the revision edit; all four viewed by the builder.

## Genuine revision step (write → run → EDIT → re-run twice)
- First full run: shots taken, `main.ts` twice → byte-identical. Weakness found: duels ended too fast — WIN round 4, LOSS round 3; one unopposed 7-power card dealt 7 damage.
- EDIT: per-lane damage cap 5 (`LANE_DAMAGE_CAP` in cards.js, applied in rules.js `resolveRound`); Keeper plays 2 cards from round 2, not round 3 (keeper.js); title overlay text now says "difference (max 5)".
- Re-ran: screenshots re-taken (WIN round 5, LOSS round 4, play state closer at 15 vs 12), playtest still passes on all 6 seeds, zero errors, `main.ts` twice → byte-identical.
- Dossier sha256 (after revision): `3c29c5501b451905ce019cc3adebfc96d028d61cd37c35f3317e144c2653b39a` (392,747 bytes; two `main.ts` runs byte-identical).

## Self-critique — 3 biggest weaknesses
1. **Play shot shows the Keeper's side empty.** It is mid-player-turn, so the Keeper has not played yet this round — honest, but the judge sees no foe cards on the table. Not fixed: a post-Keeper pre-resolve state never occurs in real play, and faking it would stage a screen the game cannot show.
2. **Keeper AI is simple.** Cheapest-spirit-first with a fixed pattern; a strong player will read it in 2–3 duels. Not fixed: intent announcement + counterplay is the scored behaviour, and deeper AI was out of scope for this window.
3. **No persistent meta (no score across duels).** Each duel is standalone; no streak or unlock. Not fixed: the brief scores one complete duel, and a meta layer would have diluted the screenshot-visible completeness.
