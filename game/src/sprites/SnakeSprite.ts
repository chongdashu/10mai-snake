import { GameObjects, Scene } from 'phaser';
import { SnakeSegment } from '../models/game.models';

export class SnakeSprite {
  private segments: SnakeSegment[] = [];
  private gridSize: number;
  private scene: Scene;
  private borderPadding: number;

  constructor(scene: Scene, gridSize: number = 40, borderPadding: number = 8) {
    this.scene = scene;
    this.gridSize = gridSize;
    this.borderPadding = borderPadding;
  }

  initialize(gameWidth: number, gameHeight: number): void {
    // Clear existing snake segments if any
    this.segments.forEach(segment => segment.body?.destroy());
    this.segments = [];

    // Initialize snake at the center
    const startX =
      Math.floor(gameWidth / (2 * this.gridSize)) * this.gridSize +
      this.borderPadding;
    const startY =
      Math.floor(gameHeight / (2 * this.gridSize)) * this.gridSize +
      this.borderPadding;

    // Create initial snake segments
    for (let i = 0; i < 3; i++) {
      const segment = this.createSnakeSegment(
        startX - i * this.gridSize + this.gridSize / 2,
        startY + this.gridSize / 2,
        i === 0 // isHead
      );
      this.segments.push({
        body: segment,
        x: startX - i * this.gridSize,
        y: startY,
      });
    }
  }

  getSegments(): SnakeSegment[] {
    return this.segments;
  }

  moveSnake(newX: number, newY: number): void {
    // Move body
    for (let i = this.segments.length - 1; i > 0; i--) {
      const segment = this.segments[i];
      const ahead = this.segments[i - 1];
      segment.x = ahead.x;
      segment.y = ahead.y;
      segment.body.setPosition(
        segment.x + this.gridSize / 2,
        segment.y + this.gridSize / 2
      );
    }

    // Move head
    const head = this.segments[0];
    head.x = newX;
    head.y = newY;
    head.body.setPosition(
      head.x + this.gridSize / 2,
      head.y + this.gridSize / 2
    );
  }

  grow(): void {
    const tail = this.segments[this.segments.length - 1];
    const newSegment = this.createSnakeSegment(
      tail.x + this.gridSize / 2,
      tail.y + this.gridSize / 2,
      false
    );
    this.segments.push({
      body: newSegment,
      x: tail.x,
      y: tail.y,
    });
  }

  isPositionOccupied(x: number, y: number): boolean {
    return this.segments.some(segment => segment.x === x && segment.y === y);
  }

  private createSnakeSegment(
    x: number,
    y: number,
    isHead: boolean
  ): GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Base shape with gradient effect
    const baseSize = this.gridSize - 4;
    const base = this.scene.add.graphics();

    if (isHead) {
      // Dragon head with more detail
      const head = this.scene.add.graphics();

      // Main head shape (rounded rectangle)
      head.fillStyle(0xff0000, 1);
      head.fillRoundedRect(-baseSize / 2, -baseSize / 2, baseSize, baseSize, 8);

      // Gold details
      head.lineStyle(2, 0xffd700);

      // Stylized dragon eyes
      const eyeSize = baseSize * 0.15;
      head.fillStyle(0xffd700);
      head.fillCircle(-baseSize / 4, -baseSize / 6, eyeSize);
      head.fillCircle(baseSize / 4, -baseSize / 6, eyeSize);

      // Dragon whiskers
      head.lineStyle(2, 0xffd700);
      // Left whiskers
      head.beginPath();
      head.moveTo(-baseSize / 2, 0);
      head.lineTo(-baseSize / 2 - 8, -baseSize / 4);
      head.moveTo(-baseSize / 2, 0);
      head.lineTo(-baseSize / 2 - 8, baseSize / 4);
      // Right whiskers
      head.moveTo(baseSize / 2, 0);
      head.lineTo(baseSize / 2 + 8, -baseSize / 4);
      head.moveTo(baseSize / 2, 0);
      head.lineTo(baseSize / 2 + 8, baseSize / 4);
      head.strokePath();

      container.add(head);
    } else {
      // Body segment with scale pattern
      const body = this.scene.add.graphics();

      // Main body shape
      body.fillStyle(0xffd700, 1);
      body.fillRoundedRect(-baseSize / 2, -baseSize / 2, baseSize, baseSize, 4);

      // Scale pattern
      body.lineStyle(2, 0xff0000);
      const scaleSize = baseSize / 4;

      // Draw scales in a grid pattern
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          body.beginPath();
          body.arc(
            i * scaleSize,
            j * scaleSize,
            scaleSize / 2,
            0,
            Math.PI,
            true
          );
          body.strokePath();
        }
      }

      container.add(body);
    }

    // Add glow effect
    const glow = this.scene.add.graphics();
    glow.fillStyle(0xffd700, 0.3);
    glow.fillCircle(0, 0, baseSize / 2 + 2);
    container.add(glow);

    // Subtle pulsing animation for the glow
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return container;
  }

  destroy(): void {
    this.segments.forEach(segment => segment.body?.destroy());
    this.segments = [];
  }
}
