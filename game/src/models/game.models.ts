import { GameObjects } from 'phaser';

export interface SnakeSegment {
  body: GameObjects.Rectangle;
  x: number;
  y: number;
}

export interface Food {
  body: GameObjects.Rectangle;
  x: number;
  y: number;
}

export interface Player {
  id: string;
  display_name: string;
  auth_type: 'guest' | 'google';
  created_at: string;
  last_seen_at: string;
}

export interface TopScore {
  display_name: string;
  auth_type: 'guest' | 'google';
  high_score: number;
  last_achieved_at: string;
}
