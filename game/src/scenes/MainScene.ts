import 'phaser';
import { gameClient } from '../services/supabase/client';

interface SnakeSegment {
  body: Phaser.GameObjects.Rectangle;
  x: number;
  y: number;
}

interface Food {
  body: Phaser.GameObjects.Rectangle;
  x: number;
  y: number;
}

export class MainScene extends Phaser.Scene {
  private snake: SnakeSegment[] = [];
  private gridSize = 20; // Size of each grid cell
  private direction = { x: 1, y: 0 }; // Start moving right
  private moveTimer = 0;
  private moveInterval = 150; // Move every 150ms
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameWidth = 800; // Default width
  private gameHeight = 600; // Default height
  private borders: Phaser.GameObjects.Rectangle[] = [];
  private food: Food | null = null;
  private score = 0;
  private scoreText: Phaser.GameObjects.Text | null = null;
  private borderPadding = 4; // Border thickness
  private isPaused = false;
  private pauseText: Phaser.GameObjects.Text | null = null;
  private escKey: Phaser.Input.Keyboard.Key | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private bestScoreText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'MainScene' });
    // Initialize cursors in constructor to avoid null issues
    this.cursors = {} as Phaser.Types.Input.Keyboard.CursorKeys;
  }

  create() {
    // Get game dimensions from camera or use defaults
    const camera = this.cameras.main;
    if (camera) {
      this.gameWidth = camera.width;
      this.gameHeight = camera.height;
    }

    // Create borders
    const borderThickness = this.borderPadding;
    const borderColor = 0xff0000;

    // Top border
    this.borders.push(
      this.add.rectangle(
        this.gameWidth / 2,
        borderThickness / 2,
        this.gameWidth,
        borderThickness,
        borderColor
      )
    );

    // Bottom border
    this.borders.push(
      this.add.rectangle(
        this.gameWidth / 2,
        this.gameHeight - borderThickness / 2,
        this.gameWidth,
        borderThickness,
        borderColor
      )
    );

    // Left border
    this.borders.push(
      this.add.rectangle(
        borderThickness / 2,
        this.gameHeight / 2,
        borderThickness,
        this.gameHeight,
        borderColor
      )
    );

    // Right border
    this.borders.push(
      this.add.rectangle(
        this.gameWidth - borderThickness / 2,
        this.gameHeight / 2,
        borderThickness,
        this.gameHeight,
        borderColor
      )
    );

    // Add score text
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
    });

    // Add best score text
    this.bestScoreText = this.add.text(10, 70, 'Best: 0', {
      fontSize: '24px',
      color: '#ffd700',
    });

    // Setup pause text (hidden by default)
    this.pauseText = this.add
      .text(
        this.gameWidth / 2,
        this.gameHeight / 2,
        'PAUSED\nPress ESC or SPACE to resume\nPress M for Main Menu',
        {
          fontSize: '32px',
          color: '#ffffff',
          align: 'center',
        }
      )
      .setOrigin(0.5)
      .setVisible(false);

    // Setup keyboard controls
    if (this.input) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.escKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC
      );
      this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );

      // Add M key for returning to main menu
      this.input.keyboard.on('keydown-M', () => {
        if (this.isPaused) {
          this.scene.start('MainMenuScene');
        }
      });
    }

    // Add player name display if available
    const player = gameClient.getCurrentPlayer();
    if (player) {
      this.add.text(10, 40, `Player: ${player.display_name}`, {
        fontSize: '24px',
        color: '#ffffff',
      });
    }

    // Load and display best score
    this.loadBestScore();

    this.initializeGame();
  }

  private initializeGame() {
    this.score = 0;
    if (this.scoreText) {
      this.scoreText.setText('Score: 0');
    }
    this.isPaused = false;
    if (this.pauseText) {
      this.pauseText.setVisible(false);
    }
    this.initializeSnake();
    this.spawnFood();
  }

  private initializeSnake() {
    // Clear existing snake segments if any
    this.snake.forEach(segment => segment.body?.destroy());
    this.snake = [];

    // Initialize snake at the center
    const startX =
      Math.floor(this.gameWidth / (2 * this.gridSize)) * this.gridSize +
      this.borderPadding;
    const startY =
      Math.floor(this.gameHeight / (2 * this.gridSize)) * this.gridSize +
      this.borderPadding;

    // Create initial snake segments
    for (let i = 0; i < 3; i++) {
      const segment = this.add.rectangle(
        startX - i * this.gridSize + this.gridSize / 2, // Center the rectangle in the grid cell
        startY + this.gridSize / 2,
        this.gridSize - 2,
        this.gridSize - 2,
        0x00ff00
      );
      this.snake.push({
        body: segment,
        x: startX - i * this.gridSize,
        y: startY,
      });
    }

    // Reset direction to move right
    this.direction = { x: 1, y: 0 };
    this.moveTimer = 0;
  }

  private spawnFood() {
    // Remove existing food if any
    if (this.food?.body) {
      this.food.body.destroy();
    }

    // Find a position not occupied by the snake
    let gridX, gridY;
    do {
      // Calculate grid positions
      gridX = Math.floor(
        Math.random() *
          ((this.gameWidth - 2 * this.borderPadding) / this.gridSize)
      );
      gridY = Math.floor(
        Math.random() *
          ((this.gameHeight - 2 * this.borderPadding) / this.gridSize)
      );
    } while (
      this.isPositionOccupied(
        gridX * this.gridSize + this.borderPadding,
        gridY * this.gridSize + this.borderPadding
      )
    );

    // Convert to world positions
    const foodX = gridX * this.gridSize + this.borderPadding;
    const foodY = gridY * this.gridSize + this.borderPadding;

    // Create food - position at top-left like snake segments
    const foodBody = this.add.rectangle(
      foodX + this.gridSize / 2, // Center the rectangle in the grid cell
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

  private isPositionOccupied(x: number, y: number): boolean {
    return this.snake.some(segment => segment.x === x && segment.y === y);
  }

  update(time: number, delta: number) {
    // Handle pause toggle
    if (
      Phaser.Input.Keyboard.JustDown(this.escKey!) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey!)
    ) {
      this.togglePause();
      return;
    }

    if (this.isPaused) {
      return;
    }

    // Handle input
    if (this.cursors.left?.isDown && this.direction.x !== 1) {
      this.direction = { x: -1, y: 0 };
    } else if (this.cursors.right?.isDown && this.direction.x !== -1) {
      this.direction = { x: 1, y: 0 };
    } else if (this.cursors.up?.isDown && this.direction.y !== 1) {
      this.direction = { x: 0, y: -1 };
    } else if (this.cursors.down?.isDown && this.direction.y !== -1) {
      this.direction = { x: 0, y: 1 };
    }

    // Move snake at fixed intervals
    this.moveTimer += delta;
    if (this.moveTimer >= this.moveInterval) {
      this.moveTimer = 0;
      this.moveSnake();
    }
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    if (this.pauseText) {
      this.pauseText.setVisible(this.isPaused);
    }
  }

  private moveSnake() {
    // Calculate new head position
    const head = this.snake[0];
    const newX = head.x + this.direction.x * this.gridSize;
    const newY = head.y + this.direction.y * this.gridSize;

    // Check wall collision
    if (
      newX < this.borderPadding ||
      newX >= this.gameWidth - this.borderPadding ||
      newY < this.borderPadding ||
      newY >= this.gameHeight - this.borderPadding
    ) {
      this.gameOver();
      return;
    }

    // Check self collision
    if (this.isPositionOccupied(newX, newY)) {
      this.gameOver();
      return;
    }

    // Check food collision - using grid-based positions
    const hasEatenFood =
      this.food && newX === this.food.x && newY === this.food.y;

    // Move body - always move the body first
    for (let i = this.snake.length - 1; i > 0; i--) {
      const segment = this.snake[i];
      const ahead = this.snake[i - 1];
      segment.x = ahead.x;
      segment.y = ahead.y;
      segment.body.setPosition(
        segment.x + this.gridSize / 2,
        segment.y + this.gridSize / 2
      );
    }

    // Move head
    head.x = newX;
    head.y = newY;
    head.body.setPosition(
      head.x + this.gridSize / 2,
      head.y + this.gridSize / 2
    );

    // Handle food eating after movement
    if (hasEatenFood) {
      const tail = this.snake[this.snake.length - 1];
      const newSegment = this.add.rectangle(
        tail.x + this.gridSize / 2,
        tail.y + this.gridSize / 2,
        this.gridSize - 2,
        this.gridSize - 2,
        0x00ff00
      );
      this.snake.push({
        body: newSegment,
        x: tail.x,
        y: tail.y,
      });

      // Update score
      this.score += 10;
      if (this.scoreText) {
        this.scoreText.setText(`Score: ${this.score}`);
      }

      // Spawn new food
      this.spawnFood();
    }
  }

  private async loadBestScore() {
    const bestScore = await gameClient.getBestScore();
    if (this.bestScoreText) {
      this.bestScoreText.setText(`Best: ${bestScore}`);
    }
  }

  private async gameOver() {
    // Submit score to backend
    const submitted = await gameClient.submitScore(this.score);
    if (!submitted) {
      console.error('Failed to submit score');
    }

    // Update best score display before transitioning
    if (this.bestScoreText) {
      this.bestScoreText.setText(`Best: ${gameClient.getBestScoreSync()}`);
    }

    // Start game over scene with final score
    this.scene.start('GameOverScene', { score: this.score });
  }
}
