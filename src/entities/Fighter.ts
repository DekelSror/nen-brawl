import Phaser from 'phaser'
import { FighterState, Direction, type CharacterConfig, type AttackDef } from '../types'

const GRAVITY = 1400
const HURT_DURATION = 380

export class Fighter {
  protected readonly scene: Phaser.Scene
  readonly config: CharacterConfig

  x: number
  depthY: number
  jumpHeight = 0
  jumpVelocity = 0
  vx = 0
  vy = 0

  state: FighterState = FighterState.IDLE
  facing: Direction = Direction.RIGHT

  hp: number
  readonly maxHp: number

  private attackTimer = 0
  private attackPhase: 'startup' | 'active' | 'recovery' | null = null
  private currentAttack: AttackDef | null = null
  private hitTargets = new Set<Fighter>()
  private hurtTimer = 0
  private attackCooldown = 0

  private readonly bodyImage: Phaser.GameObjects.Image
  private readonly shadow: Phaser.GameObjects.Ellipse
  private readonly hitboxDebug: Phaser.GameObjects.Rectangle

  constructor(scene: Phaser.Scene, x: number, depthY: number, config: CharacterConfig) {
    this.scene = scene
    this.x = x
    this.depthY = depthY
    this.config = config
    this.hp = config.maxHp
    this.maxHp = config.maxHp

    this.shadow = scene.add.ellipse(x, depthY, config.width * 1.4, 12, 0x000000, 0.3)
    this.shadow.setDepth(1)

    this.bodyImage = scene.add.image(x, depthY, config.textureKey)
    this.bodyImage.setOrigin(0.5, 1)

    this.hitboxDebug = scene.add.rectangle(0, 0, 10, 10, 0xff2222, 0.4)
    this.hitboxDebug.setVisible(false).setDepth(200)
  }

  get isOnGround(): boolean {
    return this.jumpHeight <= 0
  }

  get isAlive(): boolean {
    return this.state !== FighterState.DEAD
  }

  get screenY(): number {
    return this.depthY - this.jumpHeight
  }

  get followTarget(): Phaser.GameObjects.Image {
    return this.bodyImage
  }

  jump(): void {
    if (!this.isOnGround || this.state === FighterState.DEAD || this.state === FighterState.HURT) return
    this.jumpVelocity = this.config.jumpVelocity
    this.jumpHeight = 1
    this.state = FighterState.JUMP
  }

  startAttack(): void {
    if (this.state === FighterState.DEAD || this.state === FighterState.HURT) return
    if (this.state === FighterState.ATTACK || this.attackCooldown > 0) return
    const atk = this.config.attacks[0]
    if (atk === undefined) return
    this.state = FighterState.ATTACK
    this.currentAttack = atk
    this.attackTimer = 0
    this.attackPhase = 'startup'
    this.hitTargets.clear()
    if (this.isOnGround) { this.vx = 0; this.vy = 0 }
  }

  startBlock(): void {
    if (!this.isOnGround) return
    if (this.state === FighterState.DEAD || this.state === FighterState.HURT || this.state === FighterState.ATTACK) return
    this.state = FighterState.BLOCK
  }

  stopBlock(): void {
    if (this.state === FighterState.BLOCK) this.state = FighterState.IDLE
  }

  takeDamage(amount: number, knockbackX: number, attacker: Fighter): void {
    if (!this.isAlive) return
    const actual = this.state === FighterState.BLOCK
      ? amount * (1 - this.config.blockDamageReduction)
      : amount
    this.hp = Math.max(0, this.hp - actual)
    if (this.hp <= 0) {
      this.state = FighterState.DEAD
      this.vx = 0
      return
    }
    const dir = attacker.x < this.x ? 1 : -1
    this.vx = knockbackX * dir
    this.hurtTimer = HURT_DURATION
    this.state = FighterState.HURT
  }

  getHitbox(): Phaser.Geom.Rectangle | null {
    if (this.attackPhase !== 'active' || this.currentAttack === null) return null
    const atk = this.currentAttack
    const ox = this.facing === Direction.RIGHT ? atk.hitbox.x : -(atk.hitbox.x + atk.hitbox.w)
    return new Phaser.Geom.Rectangle(
      this.x + ox,
      this.screenY + atk.hitbox.y,
      atk.hitbox.w,
      atk.hitbox.h,
    )
  }

  getHurtbox(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.x - this.config.width / 2,
      this.screenY - this.config.height,
      this.config.width,
      this.config.height,
    )
  }

  checkHit(target: Fighter): void {
    if (!this.isAlive || !target.isAlive || this.hitTargets.has(target)) return
    const hb = this.getHitbox()
    if (hb === null) return
    if (Phaser.Geom.Rectangle.Overlaps(hb, target.getHurtbox())) {
      this.hitTargets.add(target)
      const atk = this.currentAttack!
      target.takeDamage(atk.damage, atk.knockbackX, this)
    }
  }

  update(delta: number, levelWidth: number, groundTop: number, groundBottom: number): void {
    if (this.state === FighterState.DEAD) {
      this.bodyImage.setAlpha(0.35)
      this.hitboxDebug.setVisible(false)
      return
    }

    const dt = delta / 1000

    // Jump physics
    if (this.jumpHeight > 0 || this.jumpVelocity > 0) {
      this.jumpVelocity -= GRAVITY * dt
      this.jumpHeight += this.jumpVelocity * dt
      if (this.jumpHeight <= 0) {
        this.jumpHeight = 0
        this.jumpVelocity = 0
        if (this.state === FighterState.JUMP) this.state = FighterState.IDLE
      }
    }

    // Hurt
    if (this.state === FighterState.HURT) {
      this.hurtTimer -= delta
      this.vx *= Math.pow(0.88, delta / 16.67)
      if (this.hurtTimer <= 0) {
        this.hurtTimer = 0
        this.vx = 0
        this.state = FighterState.IDLE
      }
    }

    // Attack phases
    if (this.state === FighterState.ATTACK && this.currentAttack !== null) {
      this.attackTimer += delta
      const atk = this.currentAttack
      if (this.attackPhase === 'startup' && this.attackTimer >= atk.startupMs) {
        this.attackPhase = 'active'
        this.attackTimer -= atk.startupMs
      } else if (this.attackPhase === 'active' && this.attackTimer >= atk.activeMs) {
        this.attackPhase = 'recovery'
        this.attackTimer -= atk.activeMs
        this.hitboxDebug.setVisible(false)
      } else if (this.attackPhase === 'recovery' && this.attackTimer >= atk.recoveryMs) {
        this.attackPhase = null
        this.currentAttack = null
        this.attackCooldown = 80
        this.state = this.isOnGround ? FighterState.IDLE : FighterState.JUMP
      }

      if (this.attackPhase === 'active') {
        const hb = this.getHitbox()
        if (hb !== null) {
          this.hitboxDebug.setPosition(hb.centerX, hb.centerY).setSize(hb.width, hb.height)
          this.hitboxDebug.setVisible(true)
        }
      }
    } else {
      this.hitboxDebug.setVisible(false)
    }

    if (this.attackCooldown > 0) this.attackCooldown -= delta

    // Move + clamp
    this.x += this.vx * dt
    this.depthY += this.vy * dt
    this.x = Phaser.Math.Clamp(this.x, this.config.width / 2, levelWidth - this.config.width / 2)
    this.depthY = Phaser.Math.Clamp(this.depthY, groundTop, groundBottom)

    // Sync visuals
    this.bodyImage.setPosition(this.x, this.screenY)
    this.bodyImage.setDepth(this.depthY)
    this.bodyImage.setFlipX(this.facing === Direction.LEFT)

    const shadowScale = Math.max(0.3, 1 - this.jumpHeight / 280)
    this.shadow.setPosition(this.x, this.depthY).setDepth(this.depthY - 0.1)
    this.shadow.setScale(shadowScale, 0.6 * shadowScale)

    const alpha = this.state === FighterState.BLOCK ? 0.6
      : this.state === FighterState.HURT ? 0.5
      : 1
    this.bodyImage.setAlpha(alpha)
  }

  destroy(): void {
    this.bodyImage.destroy()
    this.shadow.destroy()
    this.hitboxDebug.destroy()
  }
}
