import { Scene } from 'phaser';
import { Food } from '../models/game.models';

export class FoodSprite {
  private food: Food | null = null;
  private gridSize: number;
  private scene: Scene;
  private borderPadding: number;
  private readonly COLORS = {
    RED: 0xff3b30, // Brighter red color matching reference
    GOLD: 0xffd700, // Gold for decorations
    DARK_RED: 0xcc2e26, // Darker red for depth
  };

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

    // Create base red packet with more rectangular proportions
    const baseWidth = this.gridSize - 4;
    const baseHeight = (this.gridSize - 4) * 1.2; // Make it slightly taller
    const foodBody = this.scene.add.rectangle(
      0,
      0,
      baseWidth,
      baseHeight,
      this.COLORS.RED
    );

    // Add subtle depth effect at the bottom
    const depthLine = this.scene.add.rectangle(
      0,
      baseHeight / 2 - 2,
      baseWidth,
      4,
      this.COLORS.DARK_RED
    );

    // Add gold circle at the top
    const circleRadius = baseWidth * 0.12;
    const circle = this.scene.add.circle(
      0,
      -baseHeight / 2 + circleRadius,
      circleRadius,
      this.COLORS.GOLD
    );

    // Create graphics for decorative elements
    const graphics = this.scene.add.graphics();

    // Draw centered diamond
    const diamondSize = baseWidth * 0.4;
    graphics.lineStyle(2, this.COLORS.GOLD);
    graphics.beginPath();
    graphics.moveTo(0, -diamondSize / 2); // Top
    graphics.lineTo(diamondSize / 2, 0); // Right
    graphics.lineTo(0, diamondSize / 2); // Bottom
    graphics.lineTo(-diamondSize / 2, 0); // Left
    graphics.closePath();
    graphics.strokePath();

    // Add corner rays
    const rayLength = baseWidth * 0.15;
    [-1, 1].forEach(x => {
      [-1, 1].forEach(y => {
        const cornerX = (baseWidth / 2 - rayLength / 2) * x;
        const cornerY = (baseHeight / 2 - rayLength / 2) * y;

        // Draw two small lines in each corner
        graphics.lineStyle(1, this.COLORS.GOLD);
        graphics.beginPath();
        // Horizontal ray
        graphics.moveTo(cornerX - (rayLength / 2) * x, cornerY);
        graphics.lineTo(cornerX, cornerY);
        // Vertical ray
        graphics.moveTo(cornerX, cornerY - (rayLength / 2) * y);
        graphics.lineTo(cornerX, cornerY);
        graphics.strokePath();
      });
    });

    // Add subtle glow
    const glow = this.scene.add.rectangle(
      0,
      0,
      baseWidth + 4,
      baseHeight + 4,
      this.COLORS.GOLD
    );
    glow.setAlpha(0.1);

    // Add all elements to container in correct order
    container.add([glow, foodBody, depthLine, circle, graphics]);

    // Create subtle floating animation
    this.scene.tweens.add({
      targets: container,
      y: container.y + 2,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Create subtle pulsing glow animation
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.2,
      duration: 1500,
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
