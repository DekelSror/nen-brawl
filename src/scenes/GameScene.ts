import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { HUD } from '../hud/HUD'
import { HERO_CONFIG } from '../data/characters/hero'
import { GRUNT_CONFIG } from '../data/characters/grunt'
import { LEVEL1_CONFIG } from '../data/levels/level1'
import { Direction } from '../types'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private enemies: Enemy[] = []
  private hud!: HUD
  private gameOver = false

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    this.gameOver = false
    this.enemies = []

    this.buildLevel()
    this.createTextures()
    this.spawnFighters()
    this.hud = new HUD(this, HERO_CONFIG.displayName, GRUNT_CONFIG.displayName)
    this.setupCamera()
  }

  private buildLevel(): void {
    const { width, groundTop, groundBottom } = LEVEL1_CONFIG
    const screenH = 540

    this.add.rectangle(width / 2, groundTop / 2, width, groundTop, 0x0f1b2d)

    const gH = groundBottom - groundTop
    this.add.rectangle(width / 2, groundTop + gH / 2, width, gH, 0x2d5a27)
    this.add.rectangle(width / 2, groundBottom + 4, width, 8, 0x1a3a14)
    this.add.rectangle(width / 2, groundBottom + (screenH - groundBottom) / 2, width, screenH - groundBottom, 0x0e1a08)

    const grid = this.add.graphics()
    grid.lineStyle(1, 0x3a7030, 0.25)
    for (let gx = 0; gx <= width; gx += 100) {
      grid.lineBetween(gx, groundTop, gx, groundBottom)
    }

    this.cameras.main.setBounds(0, 0, width, screenH)
  }

  private createTextures(): void {
    if (!this.textures.exists(HERO_CONFIG.textureKey)) {
      const g = this.make.graphics({ x: 0, y: 0 })
      const { width: w, height: h } = HERO_CONFIG
      g.fillStyle(0x224488).fillRect(0, 0, w, h)
      g.fillStyle(0x4488ff).fillRect(3, 3, w - 6, h - 6)
      g.fillStyle(0x99ccff).fillRect(7, 3, w - 14, 18)
      g.generateTexture(HERO_CONFIG.textureKey, w, h)
      g.destroy()
    }

    if (!this.textures.exists(GRUNT_CONFIG.textureKey)) {
      const g = this.make.graphics({ x: 0, y: 0 })
      const { width: w, height: h } = GRUNT_CONFIG
      g.fillStyle(0x661111).fillRect(0, 0, w, h)
      g.fillStyle(0xcc3333).fillRect(3, 3, w - 6, h - 6)
      g.fillStyle(0xff8888).fillRect(7, 3, w - 14, 18)
      g.generateTexture(GRUNT_CONFIG.textureKey, w, h)
      g.destroy()
    }
  }

  private spawnFighters(): void {
    const { groundBottom } = LEVEL1_CONFIG
    this.player = new Player(this, 300, groundBottom - 5, HERO_CONFIG)

    const grunt = new Enemy(this, 700, groundBottom - 15, GRUNT_CONFIG)
    grunt.facing = Direction.LEFT
    this.enemies.push(grunt)
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(this.player.followTarget, false, 0.08, 0)
    this.cameras.main.setDeadzone(240, 540)
  }

  update(_time: number, delta: number): void {
    if (this.gameOver) return

    this.player.handleInput()
    this.player.update(delta, LEVEL1_CONFIG.width, LEVEL1_CONFIG.groundTop, LEVEL1_CONFIG.groundBottom)

    for (const enemy of this.enemies) {
      enemy.updateAI(this.player, delta)
      enemy.update(delta, LEVEL1_CONFIG.width, LEVEL1_CONFIG.groundTop, LEVEL1_CONFIG.groundBottom)
      this.player.checkHit(enemy)
      enemy.checkHit(this.player)
    }

    const firstEnemy = this.enemies[0]
    this.hud.update(
      this.player.hp, this.player.maxHp,
      firstEnemy !== undefined ? firstEnemy.hp : 0,
      firstEnemy !== undefined ? firstEnemy.maxHp : 1,
    )

    if (!this.player.isAlive) {
      this.showEndScreen('YOU DIED', '#ff4444')
    } else if (this.enemies.length > 0 && this.enemies.every(e => !e.isAlive)) {
      this.showEndScreen('VICTORY!', '#44ff88')
    }
  }

  private showEndScreen(message: string, color: string): void {
    this.gameOver = true
    const cx = this.cameras.main.width / 2

    this.add.rectangle(cx, 270, 420, 110, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(400)
    this.add.text(cx, 248, message, { fontSize: '48px', color, fontStyle: 'bold' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(401)
    this.add.text(cx, 300, 'Press ENTER to play again', { fontSize: '17px', color: '#aaaaaa' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(401)

    this.input.keyboard!
      .addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      .once('down', () => { this.scene.restart() })
  }
}
