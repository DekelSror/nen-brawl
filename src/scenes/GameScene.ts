import Phaser from 'phaser'

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    const { width, height } = this.scale

    this.add
      .text(width / 2, height / 2, 'GAME — coming in Phase 1', {
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.input.keyboard
      ?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
      .on('down', () => {
        this.scene.start('MenuScene')
      })
  }
}
