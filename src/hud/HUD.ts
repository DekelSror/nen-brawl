import Phaser from 'phaser'

interface HPBarOpts {
  x: number
  y: number
  width: number
  name: string
  color: number
  leftAligned: boolean
}

class HPBar {
  private readonly fill: Phaser.GameObjects.Rectangle
  private readonly maxWidth: number

  constructor(scene: Phaser.Scene, opts: HPBarOpts) {
    this.maxWidth = opts.width
    const barX = opts.leftAligned ? opts.x : opts.x - opts.width
    const depth = 300

    scene.add.rectangle(barX, opts.y, opts.width, 14, 0x111111)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(depth)

    this.fill = scene.add.rectangle(barX, opts.y, opts.width, 14, opts.color)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(depth + 1)

    scene.add.text(
      opts.leftAligned ? barX : barX + opts.width,
      opts.y - 20,
      opts.name,
      { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' },
    ).setOrigin(opts.leftAligned ? 0 : 1, 0).setScrollFactor(0).setDepth(depth + 2)
  }

  update(hp: number, maxHp: number): void {
    this.fill.width = this.maxWidth * Math.max(0, hp / maxHp)
  }
}

export class HUD {
  private readonly playerBar: HPBar
  private readonly enemyBar: HPBar

  constructor(scene: Phaser.Scene, playerName: string, enemyName: string) {
    this.playerBar = new HPBar(scene, {
      x: 16, y: 16, width: 220,
      name: playerName, color: 0x33cc55, leftAligned: true,
    })
    this.enemyBar = new HPBar(scene, {
      x: 944, y: 16, width: 220,
      name: enemyName, color: 0xcc3333, leftAligned: false,
    })
  }

  update(playerHp: number, playerMaxHp: number, enemyHp: number, enemyMaxHp: number): void {
    this.playerBar.update(playerHp, playerMaxHp)
    this.enemyBar.update(enemyHp, enemyMaxHp)
  }
}
