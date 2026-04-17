import type { CharacterConfig } from '../../types'

export const GRUNT_CONFIG: CharacterConfig = {
  key: 'grunt',
  displayName: 'Grunt',
  maxHp: 80,
  speed: { x: 140, y: 90 },
  jumpVelocity: 420,
  blockDamageReduction: 0.5,
  textureKey: 'fighter_grunt',
  width: 44,
  height: 72,
  attacks: [
    {
      damage: 12,
      hitbox: { x: 22, y: -60, w: 46, h: 40 },
      startupMs: 100,
      activeMs: 83,
      recoveryMs: 167,
      knockbackX: 140,
    },
  ],
}
