import 'phaser';
import { gameClient } from '../services/supabase/client';
import { TopScore } from '../models/game.models';

export class MainMenuScene extends Phaser.Scene {
  private title: Phaser.GameObjects.Text | null = null;
  private playButton: Phaser.GameObjects.Text | null = null;
  private authButton: Phaser.GameObjects.Text | null = null;
  private topScores: TopScore[] = [];
  private leaderboardText: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Add title
    this.title = this.add
      .text(width / 2, height / 5, 'SNAKE GAME', {
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Add play button
    this.playButton = this.add
      .text(width / 2, height / 2 - 30, 'Play as Guest', {
        fontSize: '32px',
        color: '#00ff00',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.playButton?.setColor('#88ff88'))
      .on('pointerout', () => this.playButton?.setColor('#00ff00'))
      .on('pointerdown', () => this.startGuestGame());

    // Add auth button
    this.authButton = this.add
      .text(width / 2, height / 2 + 30, 'Sign in with Google', {
        fontSize: '32px',
        color: '#4285f4',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.authButton?.setColor('#88bbff'))
      .on('pointerout', () => this.authButton?.setColor('#4285f4'))
      .on('pointerdown', () => this.handleAuth());

    // Add leaderboard title
    this.add
      .text(width / 2, height / 2 + 90, 'TOP SCORES', {
        fontSize: '24px',
        color: '#ffff00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Load and display top scores
    this.loadTopScores();
  }

  private async startGuestGame() {
    // Create a guest player if not already created
    if (!gameClient.getCurrentPlayer()) {
      const player = await gameClient.createGuestPlayer();
      if (!player) {
        console.error('Failed to create guest player');
        return;
      }
    }
    this.scene.start('MainScene');
  }

  private handleAuth() {
    // TODO: Implement Google authentication
    console.log('Google auth clicked');
  }

  private async loadTopScores() {
    const scores = await gameClient.getTopScores();
    this.topScores = scores;

    // Clear existing leaderboard texts
    this.leaderboardText.forEach(text => text.destroy());
    this.leaderboardText = [];

    // Display top scores
    const startY = this.cameras.main.height / 2 + 130;
    const spacing = 30;

    scores.slice(0, 5).forEach((score, index) => {
      const text = this.add.text(
        this.cameras.main.width / 2,
        startY + index * spacing,
        `${index + 1}. ${score.display_name}: ${score.high_score}`,
        {
          fontSize: '20px',
          color: index === 0 ? '#ffd700' : '#ffffff',
        }
      );
      text.setOrigin(0.5);
      this.leaderboardText.push(text);
    });
  }
}
