import 'phaser';

export class GameOverScene extends Phaser.Scene {
  private score: number;

  constructor() {
    super({ key: 'GameOverScene' });
    this.score = 0;
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Game Over text
    this.add
      .text(width / 2, height / 3, 'GAME OVER', {
        fontSize: '64px',
        color: '#ff0000',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Score text
    this.add
      .text(width / 2, height / 2, `Score: ${this.score}`, {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Play Again button
    this.add
      .text(width / 2, height / 2 + 60, 'Play Again', {
        fontSize: '32px',
        color: '#00ff00',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function (this: Phaser.GameObjects.Text) {
        this.setColor('#88ff88');
      })
      .on('pointerout', function (this: Phaser.GameObjects.Text) {
        this.setColor('#00ff00');
      })
      .on('pointerdown', () => this.scene.start('MainScene'));

    // Main Menu button
    this.add
      .text(width / 2, height / 2 + 120, 'Main Menu', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function (this: Phaser.GameObjects.Text) {
        this.setColor('#888888');
      })
      .on('pointerout', function (this: Phaser.GameObjects.Text) {
        this.setColor('#ffffff');
      })
      .on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
