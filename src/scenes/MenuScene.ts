import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create(): void {
    const { width, height } = this.scale

    this.add.text(width / 2, height / 2 - 80, 'NEN BRAWL', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const startText = this.add.text(width / 2, height / 2 + 20, 'PRESS ENTER TO START', {
      fontSize: '22px',
      color: '#aaaaaa',
    }).setOrigin(0.5)

    this.tweens.add({ targets: startText, alpha: 0, duration: 600, yoyo: true, repeat: -1 })

    const controls = [
      'Arrow Keys / WASD — Move',
      'Space or ↑ — Jump',
      'Z — Attack    X — Block (hold)',
    ]
    controls.forEach((line, i) => {
      this.add.text(width / 2, height / 2 + 80 + i * 22, line, {
        fontSize: '15px',
        color: '#666666',
      }).setOrigin(0.5)
    })

    this.input.keyboard!
      .addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      .on('down', () => { this.scene.start('GameScene') })
  }
}
