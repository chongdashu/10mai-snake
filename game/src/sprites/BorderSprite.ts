import { GameObjects, Scene } from 'phaser';

export class BorderSprite {
  private borders: GameObjects.Container[] = [];
  private scene: Scene;
  private borderPadding: number;

  constructor(scene: Scene, borderPadding: number = 8) {
    this.scene = scene;
    this.borderPadding = borderPadding;
  }

  create(gameWidth: number, gameHeight: number): void {
    // Clear existing borders if any
    this.destroy();

    const borderThickness = this.borderPadding;
    const borderColor = 0xff0000; // Base red color
    const patternSpacing = 40; // Space between pattern elements

    // Create containers for each border
    const topBorder = this.scene.add.container(
      gameWidth / 2,
      borderThickness / 2
    );
    const bottomBorder = this.scene.add.container(
      gameWidth / 2,
      gameHeight - borderThickness / 2
    );
    const leftBorder = this.scene.add.container(
      borderThickness / 2,
      gameHeight / 2
    );
    const rightBorder = this.scene.add.container(
      gameWidth - borderThickness / 2,
      gameHeight / 2
    );

    // Base rectangles for borders
    const createBaseRect = (width: number, height: number) => {
      const rect = this.scene.add.rectangle(0, 0, width, height, borderColor);
      rect.setStrokeStyle(2, 0xffd700); // Gold outline
      return rect;
    };

    // Add base rectangles to containers
    topBorder.add(createBaseRect(gameWidth, borderThickness));
    bottomBorder.add(createBaseRect(gameWidth, borderThickness));
    leftBorder.add(createBaseRect(borderThickness, gameHeight));
    rightBorder.add(createBaseRect(borderThickness, gameHeight));

    // Create decorative pattern
    const addPatternToHorizontalBorder = (
      container: GameObjects.Container,
      width: number
    ) => {
      const numPatterns = Math.floor(width / patternSpacing) - 1;
      for (let i = 0; i < numPatterns; i++) {
        const x = -width / 2 + patternSpacing * (i + 1);
        const pattern = this.createPatternElement();
        pattern.setPosition(x, 0);
        container.add(pattern);
      }
    };

    const addPatternToVerticalBorder = (
      container: GameObjects.Container,
      height: number
    ) => {
      const numPatterns = Math.floor(height / patternSpacing) - 1;
      for (let i = 0; i < numPatterns; i++) {
        const y = -height / 2 + patternSpacing * (i + 1);
        const pattern = this.createPatternElement();
        pattern.setPosition(0, y);
        pattern.setRotation(Math.PI / 2); // Rotate 90 degrees
        container.add(pattern);
      }
    };

    // Add patterns to borders
    addPatternToHorizontalBorder(topBorder, gameWidth);
    addPatternToHorizontalBorder(bottomBorder, gameWidth);
    addPatternToVerticalBorder(leftBorder, gameHeight);
    addPatternToVerticalBorder(rightBorder, gameHeight);

    // Add corner decorations
    this.addCornerDecoration(0, 0); // Top-left
    this.addCornerDecoration(gameWidth, 0); // Top-right
    this.addCornerDecoration(0, gameHeight); // Bottom-left
    this.addCornerDecoration(gameWidth, gameHeight); // Bottom-right

    // Store borders for cleanup
    this.borders = [topBorder, bottomBorder, leftBorder, rightBorder];

    // Add subtle animation to patterns
    this.borders.forEach(border => {
      this.scene.tweens.add({
        targets: border.getAll(),
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private createPatternElement(): GameObjects.Graphics {
    const pattern = this.scene.add.graphics();

    // Draw stylized cloud pattern (祥云)
    pattern.lineStyle(2, 0xffd700);
    pattern.beginPath();
    pattern.arc(-8, 0, 4, 0, Math.PI, true);
    pattern.arc(0, 0, 4, 0, Math.PI, true);
    pattern.arc(8, 0, 4, 0, Math.PI, true);
    pattern.strokePath();

    return pattern;
  }

  private addCornerDecoration(x: number, y: number): void {
    const corner = this.scene.add.container(x, y);

    // Create lantern shape
    const lantern = this.scene.add.graphics();

    // Main lantern body
    lantern.fillStyle(0xff0000);
    lantern.lineStyle(2, 0xffd700);

    // Draw octagonal shape
    const size = this.borderPadding * 2;
    lantern.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const px = Math.cos(angle) * size;
      const py = Math.sin(angle) * size;
      if (i === 0) {
        lantern.moveTo(px, py);
      } else {
        lantern.lineTo(px, py);
      }
    }
    lantern.closePath();
    lantern.fillPath();
    lantern.strokePath();

    // Add tassel
    lantern.lineStyle(2, 0xffd700);
    lantern.beginPath();
    lantern.moveTo(0, size);
    lantern.lineTo(-size / 2, size * 1.5);
    lantern.moveTo(0, size);
    lantern.lineTo(size / 2, size * 1.5);
    lantern.strokePath();

    corner.add(lantern);
    this.borders.push(corner);

    // Add glow effect
    const glow = this.scene.add.graphics();
    glow.fillStyle(0xffd700, 0.3);
    glow.fillCircle(0, 0, size);
    corner.add(glow);

    // Position corner decoration
    if (x === 0 && y === 0) {
      // Top-left
      corner.setPosition(this.borderPadding * 2, this.borderPadding * 2);
    } else if (x !== 0 && y === 0) {
      // Top-right
      corner.setPosition(x - this.borderPadding * 2, this.borderPadding * 2);
    } else if (x === 0 && y !== 0) {
      // Bottom-left
      corner.setPosition(this.borderPadding * 2, y - this.borderPadding * 2);
    } else {
      // Bottom-right
      corner.setPosition(
        x - this.borderPadding * 2,
        y - this.borderPadding * 2
      );
    }
  }

  destroy(): void {
    this.borders.forEach(border => border.destroy());
    this.borders = [];
  }
}
