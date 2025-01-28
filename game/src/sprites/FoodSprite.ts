import { GameObjects, Scene } from 'phaser';
import { Food } from '../models/game.models';

export class FoodSprite {
  private food: Food | null = null;
  private gridSize: number;
  private scene: Scene;
  private borderPadding: number;

  constructor(scene: Scene, gridSize: number = 20, borderPadding: number = 4) {
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
      this.food.body.destroy();
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

    // Create food
    const foodBody = this.scene.add.rectangle(
      foodX + this.gridSize / 2,
      foodY + this.gridSize / 2,
      this.gridSize - 2,
      this.gridSize - 2,
      0xff0000
    );

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
      this.food.body.destroy();
      this.food = null;
    }
  }
}
