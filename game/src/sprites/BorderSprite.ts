import { GameObjects, Scene } from 'phaser';

export class BorderSprite {
  private borders: GameObjects.Rectangle[] = [];
  private scene: Scene;
  private borderPadding: number;

  constructor(scene: Scene, borderPadding: number = 4) {
    this.scene = scene;
    this.borderPadding = borderPadding;
  }

  create(gameWidth: number, gameHeight: number): void {
    // Clear existing borders if any
    this.destroy();

    const borderThickness = this.borderPadding;
    const borderColor = 0xff0000;

    // Top border
    this.borders.push(
      this.scene.add.rectangle(
        gameWidth / 2,
        borderThickness / 2,
        gameWidth,
        borderThickness,
        borderColor
      )
    );

    // Bottom border
    this.borders.push(
      this.scene.add.rectangle(
        gameWidth / 2,
        gameHeight - borderThickness / 2,
        gameWidth,
        borderThickness,
        borderColor
      )
    );

    // Left border
    this.borders.push(
      this.scene.add.rectangle(
        borderThickness / 2,
        gameHeight / 2,
        borderThickness,
        gameHeight,
        borderColor
      )
    );

    // Right border
    this.borders.push(
      this.scene.add.rectangle(
        gameWidth - borderThickness / 2,
        gameHeight / 2,
        borderThickness,
        gameHeight,
        borderColor
      )
    );
  }

  destroy(): void {
    this.borders.forEach(border => border.destroy());
    this.borders = [];
  }
}
