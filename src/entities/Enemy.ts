import { Fighter } from './Fighter'
import { FighterState, Direction, type CharacterConfig } from '../types'

const ATTACK_RANGE_X = 90
const ATTACK_RANGE_Y = 60

export class Enemy extends Fighter {
  private decisionTimer = 0
  private decisionCooldown: number

  constructor(scene: Phaser.Scene, x: number, depthY: number, config: CharacterConfig) {
    super(scene, x, depthY, config)
    this.decisionCooldown = 600 + Math.random() * 400
  }

  updateAI(target: Fighter, delta: number): void {
    if (!this.isAlive || !target.isAlive) return
    if (this.state === FighterState.HURT || this.state === FighterState.ATTACK) return

    this.trackTarget(target)

    this.decisionTimer += delta
    if (this.decisionTimer < this.decisionCooldown) return
    this.decisionTimer = 0
    this.decisionCooldown = 400 + Math.random() * 700

    const dx = Math.abs(this.x - target.x)
    const dy = Math.abs(this.depthY - target.depthY)

    if (dx < ATTACK_RANGE_X && dy < ATTACK_RANGE_Y) {
      this.startAttack()
    } else if (this.isOnGround && Math.random() < 0.08) {
      this.jump()
    }
  }

  private trackTarget(target: Fighter): void {
    if (this.state === FighterState.ATTACK || this.state === FighterState.BLOCK) {
      this.vx = 0
      this.vy = 0
      return
    }

    const dx = target.x - this.x
    const dy = target.depthY - this.depthY

    this.vx = Math.abs(dx) > 20 ? Math.sign(dx) * this.config.speed.x : 0
    this.vy = Math.abs(dy) > 15 ? Math.sign(dy) * this.config.speed.y * 0.6 : 0
    this.facing = dx >= 0 ? Direction.RIGHT : Direction.LEFT

    if (this.isOnGround) {
      this.state = (this.vx !== 0 || this.vy !== 0) ? FighterState.WALK : FighterState.IDLE
    }
  }
}
