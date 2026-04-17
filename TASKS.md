# Nen Brawl — Task Board

Format: `- [x]` done · `- [~]` in progress · `- [ ]` todo

Tasks are grouped by phase. Each task maps to one branch + PR.
Branch naming: `phase-N/short-description` or `task/short-description`.

---

## Phase 0 — Scaffold ✅

- [x] **Vite + Phaser 3 + TypeScript scaffold** `phase-0/scaffold` PR #1
  - Strict TS config, Husky pre-commit, GitHub Actions CI
  - `vite-plugin-singlefile` → single inlined `dist/index.html`
  - BootScene → MenuScene → GameScene skeleton

---

## Phase 1 — Local Playable Prototype 🔄

- [~] **Core entity system + prototype gameplay** `phase-1/prototype` PR #3
  - Fighter base class (2.5D physics, state machine, combat phases)
  - Player (keyboard input), Enemy (AI), HUD (HP bars)
  - Placeholder rectangle graphics, 1 level, win/lose screen

- [ ] **Find standardized sprite sheet source** `task/sprite-research`
  - Research OpenGameArt, itch.io, LPC (Liberated Pixel Cup) for fighter sprite sheets
  - Requirements: transparent background, consistent frame grid (uniform w×h),
    covers: idle, walk, jump, attack, block, hurt, dead animations
  - Ideally: multiple color variants or recolorable, CC0 or CC-BY license
  - Deliverable: recommended source + sheet spec (frame size, row/animation layout)
  - Note: current candidate (`/home/dekel/Downloads/assets/player/player-spritemap-v9-greenpants.png`)
    is 368×200, variable-width frames (non-uniform grid) — usable but needs
    manual frame registration via Phaser texture API. 4 color variants available.
    Decide: use these or find uniform-grid sheets.

- [ ] **Integrate real sprites** `phase-1/sprites`
  - Depends on sprite source decision above
  - Copy assets to `src/assets/` (Vite inlines via import)
  - Load in `BootScene.preload()` as image (or spritesheet if uniform grid)
  - Register named frames via `textures.get(key).add(frameName, 0, x, y, w, h)`
  - Add `AnimConfig` to `CharacterConfig` (frame names per state)
  - Fighter: `bodyImage: Image` → `bodySprite: Sprite`, add `playAnim()`, trigger on state change
  - Remove `createTextures()` placeholder from `GameScene`
  - Scale sprites ×1.5 on the sprite object; keep hitbox dimensions in config unchanged

---

## Phase 2 — Hosted Single Player ⬜

- [ ] **Cloudflare Pages setup + custom domain** `phase-2/hosting`
  - Create Cloudflare Pages project, connect to `DekelSror/nen-brawl` repo
  - Configure build: `npm run build`, publish dir: `dist`
  - Point `dekelsror.com/game` DNS to Cloudflare Pages
  - HTTPS automatic via Cloudflare

- [ ] **CI deploy to Cloudflare Pages** `phase-2/ci-deploy`
  - Add `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` to GitHub repo secrets
  - Add deploy step to `.github/workflows/ci.yml` on merge to `main`
  - Verify live URL after first deploy

---

## Phase 3 — Full Content ⬜

- [ ] **Effect / ability system** `phase-3/effect-system`
  - Generalized `EffectSystem`: named effect registry, typed handlers
  - Fallback handler for unknown effect keys (log + no-op, never crash)
  - Apply to existing attacks first, then extend to spells/traits

- [ ] **Characters × 5** `phase-3/characters`
  - 4 additional playable characters, each as one file in `src/data/characters/`
  - Distinct stats, attack hitboxes, and animations

- [ ] **Enemy types × 10** `phase-3/enemies`
  - 9 additional enemy types beyond Grunt
  - Varying speed, HP, attack patterns, AI aggression

- [ ] **Levels × 3** `phase-3/levels`
  - 2 additional levels (level2, level3)
  - Each: background, ground config, enemy spawn layout

- [ ] **Character select screen** `phase-3/char-select`
  - New scene between Menu and Game
  - Shows character portraits, stats preview, keyboard navigation

- [ ] **Game modes** `phase-3/game-modes`
  - Story/arcade: progress through levels with increasing difficulty
  - Survival: endless waves, score tracking

---

## Phase 4 — Multiplayer (Future) ⬜

- [ ] **Backend setup** `phase-4/backend`
  - Server provider decision (same as Cloudflare or separate — Railway, Fly.io, etc.)
  - Basic HTTP API skeleton

- [ ] **PvP matchmaking** `phase-4/matchmaking`
  - WebSocket server for real-time match
  - Lobby / queue UI

- [ ] **ELO rating system** `phase-4/elo`
  - Per-player ELO stored server-side
  - Post-match rating update, leaderboard endpoint
