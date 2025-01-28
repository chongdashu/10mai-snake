import { GameObjects, Scene } from 'phaser';
import { Food } from '../models/game.models';

export class FoodSprite {
  private food: Food | null = null;
  private gridSize: number;
  private scene: Scene;
  private borderPadding: number;

  constructor(scene: Scene, gridSize: number = 40, borderPadding: number = 8) {
    this.scene = scene;
    this.gridSize = gridSize;
    this.borderPadding = borderPadding;
  }

  spawn(
    gameWidth: number,
    gameHeight: number,
    isOccupied: (x: number, y: number) => boolean
  ): void {
    // Remove existing food if any
    if (this.food?.body) {
      const container = this.food.body.getData('container');
      if (container) {
        container.destroy();
      }
    }

    // Find a position not occupied by the snake
    let gridX, gridY;
    do {
      gridX = Math.floor(
        Math.random() * ((gameWidth - 2 * this.borderPadding) / this.gridSize)
      );
      gridY = Math.floor(
        Math.random() * ((gameHeight - 2 * this.borderPadding) / this.gridSize)
      );
    } while (
      isOccupied(
        gridX * this.gridSize + this.borderPadding,
        gridY * this.gridSize + this.borderPadding
      )
    );

    // Convert to world positions
    const foodX = gridX * this.gridSize + this.borderPadding;
    const foodY = gridY * this.gridSize + this.borderPadding;

    // Create container for food elements
    const container = this.scene.add.container(
      foodX + this.gridSize / 2,
      foodY + this.gridSize / 2
    );

    // Create red envelope (hongbao) base
    const foodBody = this.scene.add.rectangle(
      0,
      0,
      this.gridSize - 4,
      this.gridSize - 4,
      0xff0000 // Bright red for hongbao
    );

    // Add decorative border
    const border = this.scene.add.rectangle(
      0,
      0,
      this.gridSize - 8,
      this.gridSize - 8,
      0xffd700 // Gold color
    );
    border.setStrokeStyle(2, 0xffd700);

    // Add center pattern (simulating traditional Chinese pattern)
    const centerSize = this.gridSize * 0.4;
    const centerPattern = this.scene.add.graphics();
    centerPattern.lineStyle(2, 0xffd700);

    // Draw stylized "福" (fortune) character using lines
    centerPattern.moveTo(-centerSize / 3, -centerSize / 3);
    centerPattern.lineTo(centerSize / 3, -centerSize / 3);
    centerPattern.lineTo(0, centerSize / 3);
    centerPattern.moveTo(-centerSize / 3, 0);
    centerPattern.lineTo(centerSize / 3, 0);

    // Add glow effect
    const glow = this.scene.add.rectangle(
      0,
      0,
      this.gridSize,
      this.gridSize,
      0xffd700
    );
    glow.setAlpha(0.2);

    // Add elements to container in order (back to front)
    container.add([glow, foodBody, border, centerPattern]);

    // Create pulsing animation
    this.scene.tweens.add({
      targets: container,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Store reference to food body and container
    foodBody.setData('container', container);
    this.food = {
      body: foodBody,
      x: foodX,
      y: foodY,
    };
  }

  getFood(): Food | null {
    return this.food;
  }

  destroy(): void {
    if (this.food?.body) {
      const container = this.food.body.getData('container');
      if (container) {
        container.destroy();
      }
      this.food = null;
    }
  }
}
