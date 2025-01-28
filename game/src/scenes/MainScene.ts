import 'phaser';
import { gameClient } from '../services/supabase/client';
import { SnakeSprite } from '../sprites/SnakeSprite';
import { FoodSprite } from '../sprites/FoodSprite';
import { BorderSprite } from '../sprites/BorderSprite';
import { Food } from '../models/game.models';

export class MainScene extends Phaser.Scene {
  private snake: SnakeSprite;
  private gridSize = 40; // Size of each grid cell (doubled for higher resolution)
  private direction = { x: 1, y: 0 }; // Start moving right
  private moveTimer = 0;
  private moveInterval = 150; // Move every 150ms
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameWidth = 800; // Default width
  private gameHeight = 600; // Default height
  private borders: BorderSprite;
  private food: FoodSprite;
  private score = 0;
  private scoreText: Phaser.GameObjects.Text | null = null;
  private borderPadding = 8; // Border thickness (doubled for higher resolution)
  private isPaused = false;
  private pauseText: Phaser.GameObjects.Text | null = null;
  private escKey: Phaser.Input.Keyboard.Key | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private bestScoreText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'MainScene' });
    // Initialize cursors in constructor to avoid null issues
    this.cursors = {} as Phaser.Types.Input.Keyboard.CursorKeys;

    // Initialize game objects
    this.snake = new SnakeSprite(this, this.gridSize, this.borderPadding);
    this.food = new FoodSprite(this, this.gridSize, this.borderPadding);
    this.borders = new BorderSprite(this, this.borderPadding);
  }

  create() {
    // Get game dimensions from camera or use defaults
    if (this.cameras?.main) {
      this.gameWidth = this.cameras.main.width;
      this.gameHeight = this.cameras.main.height;
    }

    // Create borders
    this.borders.create(this.gameWidth, this.gameHeight);

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
    if (this.input?.keyboard) {
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
    this.snake.initialize(this.gameWidth, this.gameHeight);
    this.spawnFood();
  }

  private spawnFood() {
    this.food.spawn(this.gameWidth, this.gameHeight, (x: number, y: number) =>
      this.snake.isPositionOccupied(x, y)
    );
  }

  update(time: number, delta: number) {
    // Handle pause toggle
    if (
      (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) ||
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey))
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
    const segments = this.snake.getSegments();
    const head = segments[0];
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
    if (this.snake.isPositionOccupied(newX, newY)) {
      this.gameOver();
      return;
    }

    // Check food collision
    const foodObj = this.food.getFood();
    const hasEatenFood = foodObj && newX === foodObj.x && newY === foodObj.y;

    // Move snake
    this.snake.moveSnake(newX, newY);

    // Handle food eating
    if (hasEatenFood) {
      this.snake.grow();

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
