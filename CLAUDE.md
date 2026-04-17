# Nen Brawl — Project Map

Browser-based 2D brawler in the style of Little Fighter 2 / Golden Axe.
Frictionless: click a link → title screen, no install or login required.

**Repo**: `DekelSror/nen-brawl` (SSH: `git@github.com:DekelSror/nen-brawl.git`)
**Live target**: `www.dekelsror.com/game` (Phase 2+, Cloudflare Pages)

---

## Tech Stack

| Concern | Choice |
|---|---|
| Language | TypeScript — strict, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters` |
| Game framework | Phaser 3 (Arcade physics API available but manual physics used for 2.5D) |
| Build | Vite + `vite-plugin-singlefile` → single inlined `dist/index.html` |
| Hosting (Phase 2+) | Cloudflare Pages, custom domain |
| CI | GitHub Actions — typecheck + build on every push |
| Pre-commit | Husky → `tsc --noEmit` blocks bad commits |

---

## Commands

```bash
npm run dev        # Vite dev server at http://localhost:5173 (live reload)
npm run build      # tsc check + Vite build → dist/index.html (single file, drag to browser)
npm run typecheck  # tsc --noEmit only (strict, no-any)
npm run preview    # Preview the built dist/
```

The built `dist/index.html` has all JS/CSS/assets inlined — open directly from filesystem, no server needed.

---

## Architecture

### Entity System (component pattern over Phaser)

Fighters are plain TypeScript classes, **not** Phaser GameObjects. They hold Phaser visual members (`Sprite`, `Ellipse`, `Rectangle`) and update them manually each frame. This gives full control over the 2.5D positioning logic.

```
Fighter (base)
├── Player   (adds keyboard input handling)
└── Enemy    (adds AI decision loop)
```

**Fighter state machine**: `IDLE → WALK → JUMP → ATTACK → BLOCK → HURT → DEAD`

All state transitions are internal. External code only calls `jump()`, `startAttack()`, `startBlock()`, `stopBlock()`, `takeDamage()`.

### 2.5D Movement

Three position axes, all manual (no Phaser physics body):

| Axis | Property | Meaning |
|---|---|---|
| Horizontal | `this.x` | Left/right screen position |
| Depth | `this.depthY` | Position on ground plane (Y 340–480) |
| Height | `this.jumpHeight` | Pixels above ground plane (0 = on ground) |

**Screen Y** = `depthY - jumpHeight`. Gravity is applied to `jumpVelocity` manually.

**Depth sorting**: `sprite.setDepth(depthY)` — fighters closer to camera (higher Y) render on top.

### Combat

- Each `AttackDef` has `startupMs / activeMs / recoveryMs` and a hitbox rect relative to the fighter's foot position and facing direction.
- `Fighter.checkHit(target)` called each frame — uses `Phaser.Geom.Rectangle.Overlaps`.
- Per-swing hit deduplication via `Set<Fighter>` cleared on each `startAttack()`.
- Block reduces damage by `blockDamageReduction` (0–1 fraction).

### Effect / Ability System

Not yet implemented — planned as `EffectSystem` in Phase 3. Design intent: generalized registry of named effects with typed handlers and a fallback for unknown keys (no crash on unknown effects).

---

## Directory Structure

```
src/
  types/
    index.ts          # All shared types: FighterState, Direction, CharacterConfig, AttackDef, LevelConfig
  data/
    characters/
      hero.ts         # HERO_CONFIG — player character definition
      grunt.ts        # GRUNT_CONFIG — basic enemy definition
    levels/
      level1.ts       # LEVEL1_CONFIG — level dimensions and ground plane
  entities/
    Fighter.ts        # Base class: physics, state machine, combat, visuals
    Player.ts         # Extends Fighter — keyboard input
    Enemy.ts          # Extends Fighter — AI (track + attack)
  hud/
    HUD.ts            # HP bars and name labels (scroll-fixed)
  scenes/
    BootScene.ts      # Preload assets → MenuScene
    MenuScene.ts      # Title screen with controls reference
    GameScene.ts      # Main game loop: spawn, update, hit detection, end screen
  main.ts             # Phaser.Game config — scene list, physics, scale
.github/
  workflows/
    ci.yml            # typecheck + vite build on every push/PR
.husky/
  pre-commit          # npm run typecheck
```

---

## Data-Driven Design

### Adding a character

Create one file in `src/data/characters/mychar.ts` implementing `CharacterConfig`:

```typescript
export const MYCHAR_CONFIG: CharacterConfig = {
  key: 'mychar',
  displayName: 'My Char',
  maxHp: 100,
  speed: { x: 200, y: 120 },
  jumpVelocity: 500,
  blockDamageReduction: 0.7,
  textureKey: 'fighter_mychar',   // texture loaded in BootScene
  width: 40,                       // hitbox width (not visual)
  height: 70,                      // hitbox height (not visual)
  attacks: [
    {
      damage: 15,
      hitbox: { x: 24, y: -60, w: 50, h: 40 },  // relative to foot, facing right
      startupMs: 67, activeMs: 100, recoveryMs: 133,
      knockbackX: 180,
    },
  ],
}
```

Then spawn a `new Player(scene, x, y, MYCHAR_CONFIG)` or `new Enemy(...)`.

### Adding a level

Create `src/data/levels/levelN.ts` implementing `LevelConfig`. Build the level visuals in `GameScene.buildLevel()`.

---

## Git / PR Conventions

- **All work on feature branches** — never commit directly to `main`.
- **Branch naming**: `phase-N/short-description` or `task/short-description`.
- **Every branch targets `main`** directly — no stacked/chained branches.
- **PRs**: opened by Claude, merged by the user. Claude never merges.
- **PR description** always includes the originating task.

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 0 | ✅ merged | Scaffold: Vite, Phaser 3, strict TS, Husky, GitHub Actions |
| 1 | 🔄 PR open | Local playable prototype: 1 char, 1 enemy, 1 level, HUD |
| 2 | ⬜ todo | Cloudflare Pages hosting, custom domain, CI deploy |
| 3 | ⬜ todo | Full content: 5 characters, 10 enemy types, 3 levels, effect system |
| 4 | ⬜ future | Multiplayer, PvP matchmaking, ELO |

---

## Key Design Decisions

- **Manual physics over Arcade physics**: Phaser's Arcade physics is 2D (X/Y). LF2-style depth movement requires a third axis; easiest to manage manually.
- **No full ECS**: A component pattern on top of Phaser GameObjects is sufficient for this scale. Full ECS (bitecs etc.) adds complexity without benefit at 5–10 entity types.
- **Single-file HTML build**: `vite-plugin-singlefile` inlines all JS/CSS/assets into one HTML. Enables frictionless "drag and drop to play" distribution.
- **Strict TypeScript**: `noImplicitAny` + `noUnusedLocals` enforced at pre-commit and CI. No `any` escape hatches.
- **Data-driven characters**: All character stats, hitboxes, and attack data live in `src/data/characters/`. No hardcoded values in game logic.
