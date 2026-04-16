import Phaser from 'phaser'
import { Fighter } from './Fighter'
import { FighterState, Direction, type CharacterConfig } from '../types'

export class Player extends Fighter {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private readonly attackKey: Phaser.Input.Keyboard.Key
  private readonly blockKey: Phaser.Input.Keyboard.Key
  private readonly jumpKey: Phaser.Input.Keyboard.Key
  private readonly wKey: Phaser.Input.Keyboard.Key
  private readonly aKey: Phaser.Input.Keyboard.Key
  private readonly sKey: Phaser.Input.Keyboard.Key
  private readonly dKey: Phaser.Input.Keyboard.Key

  constructor(scene: Phaser.Scene, x: number, depthY: number, config: CharacterConfig) {
    super(scene, x, depthY, config)
    const kb = scene.input.keyboard!
    this.cursors = kb.createCursorKeys()
    this.attackKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.blockKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.X)
    this.jumpKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.wKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.aKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.sKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.dKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  }

  handleInput(): void {
    if (!this.isAlive || this.state === FighterState.HURT || this.state === FighterState.DEAD) return

    // Block (ground only, not during attack)
    if (this.blockKey.isDown && this.isOnGround && this.state !== FighterState.ATTACK) {
      this.startBlock()
      this.vx = 0
      this.vy = 0
      return
    }
    if (this.state === FighterState.BLOCK && !this.blockKey.isDown) {
      this.stopBlock()
    }

    // Jump
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.jump()
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.startAttack()
    }

    // Movement: blocked during ground attacks and blocking
    const canMove = this.state !== FighterState.BLOCK
      && !(this.state === FighterState.ATTACK && this.isOnGround)

    if (!canMove) return

    const left = this.cursors.left.isDown || this.aKey.isDown
    const right = this.cursors.right.isDown || this.dKey.isDown
    const up = this.wKey.isDown
    const down = this.cursors.down.isDown || this.sKey.isDown

    this.vx = left ? -this.config.speed.x : right ? this.config.speed.x : 0
    this.vy = up ? -this.config.speed.y : down ? this.config.speed.y : 0

    if (this.vx < 0) this.facing = Direction.LEFT
    else if (this.vx > 0) this.facing = Direction.RIGHT

    if (this.isOnGround && this.state !== FighterState.ATTACK) {
      this.state = (this.vx !== 0 || this.vy !== 0) ? FighterState.WALK : FighterState.IDLE
    }
  }
}
