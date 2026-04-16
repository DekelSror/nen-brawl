import type { CharacterConfig } from '../../types'

export const HERO_CONFIG: CharacterConfig = {
  key: 'hero',
  displayName: 'Hero',
  maxHp: 100,
  speed: { x: 220, y: 130 },
  jumpVelocity: 520,
  blockDamageReduction: 0.8,
  textureKey: 'fighter_hero',
  width: 40,
  height: 72,
  attacks: [
    {
      damage: 15,
      hitbox: { x: 24, y: -60, w: 50, h: 40 },
      startupMs: 67,
      activeMs: 100,
      recoveryMs: 133,
      knockbackX: 180,
    },
  ],
}
