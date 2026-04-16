export enum FighterState {
  IDLE = 'idle',
  WALK = 'walk',
  JUMP = 'jump',
  ATTACK = 'attack',
  BLOCK = 'block',
  HURT = 'hurt',
  DEAD = 'dead',
}

export enum Direction {
  LEFT = -1,
  RIGHT = 1,
}

export interface AttackDef {
  readonly damage: number
  readonly hitbox: Readonly<{ x: number; y: number; w: number; h: number }>
  readonly startupMs: number
  readonly activeMs: number
  readonly recoveryMs: number
  readonly knockbackX: number
}

export interface CharacterConfig {
  readonly key: string
  readonly displayName: string
  readonly maxHp: number
  readonly speed: Readonly<{ x: number; y: number }>
  readonly jumpVelocity: number
  readonly blockDamageReduction: number
  readonly textureKey: string
  readonly width: number
  readonly height: number
  readonly attacks: readonly AttackDef[]
}

export interface LevelConfig {
  readonly key: string
  readonly width: number
  readonly groundTop: number
  readonly groundBottom: number
}
