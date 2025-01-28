import { GameObjects, Scene } from 'phaser';
import { SnakeSegment } from '../models/game.models';

export class SnakeSprite {
  private segments: SnakeSegment[] = [];
  private gridSize: number;
  private scene: Scene;
  private borderPadding: number;

  constructor(scene: Scene, gridSize: number = 20, borderPadding: number = 4) {
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
        startY + this.gridSize / 2
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
      tail.y + this.gridSize / 2
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

  private createSnakeSegment(x: number, y: number): GameObjects.Rectangle {
    // Create base rectangle with gold color
    const segment = this.scene.add.rectangle(
      x,
      y,
      this.gridSize - 2,
      this.gridSize - 2,
      0xffd700
    );

    // Create gold-red effect
    const isHead = this.segments.length === 0;
    segment.setFillStyle(isHead ? 0xff0000 : 0xffd700);
    segment.setAlpha(0.9);

    return segment;
  }

  destroy(): void {
    this.segments.forEach(segment => segment.body?.destroy());
    this.segments = [];
  }
}
