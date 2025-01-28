import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { Player, TopScore } from '../../models/game.models';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class GameClient {
  private supabase;
  private currentPlayer: Player | null = null;
  private bestScore: number = 0;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async createGuestPlayer(): Promise<Player | null> {
    try {
      // Generate a fun guest name
      const adjectives = [
        'Happy',
        'Lucky',
        'Speedy',
        'Clever',
        'Brave',
        'Swift',
      ];
      const nouns = ['Snake', 'Player', 'Gamer', 'Ninja', 'Master', 'Hero'];
      const randomName = `${
        adjectives[Math.floor(Math.random() * adjectives.length)]
      }${nouns[Math.floor(Math.random() * nouns.length)]}${nanoid(4)}`;

      const { data, error } = await this.supabase
        .from('players')
        .insert({
          display_name: randomName,
          auth_type: 'guest',
        })
        .select()
        .single();

      if (error) throw error;

      this.currentPlayer = data;
      return data;
    } catch (error) {
      console.error('Error creating guest player:', error);
      return null;
    }
  }

  async getBestScore(): Promise<number> {
    try {
      if (!this.currentPlayer) return 0;

      const { data, error } = await this.supabase
        .from('scores')
        .select('*')
        .eq('player_id', this.currentPlayer.id)
        .order('score', { ascending: false })
        .limit(1);

      if (error) throw error;

      // If no scores found, return 0
      if (!data || data.length === 0) {
        return 0;
      }

      this.bestScore = data[0].score;
      return this.bestScore;
    } catch (error) {
      console.error('Error getting best score:', error);
      return 0;
    }
  }

  async submitScore(score: number): Promise<boolean> {
    try {
      if (!this.currentPlayer) return false;

      const { error } = await this.supabase.from('scores').insert({
        player_id: this.currentPlayer.id,
        score: score,
      });

      if (error) throw error;

      // Update best score if current score is higher
      if (score > this.bestScore) {
        this.bestScore = score;
      }

      // Refresh the top scores view
      await this.supabase.rpc('refresh_materialized_view', {
        view_name: 'top_scores',
      });

      return true;
    } catch (error) {
      console.error('Error submitting score:', error);
      return false;
    }
  }

  async getTopScores(): Promise<TopScore[]> {
    try {
      const { data, error } = await this.supabase
        .from('top_scores')
        .select('*')
        .order('high_score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching top scores:', error);
      return [];
    }
  }

  getCurrentPlayer(): Player | null {
    return this.currentPlayer;
  }

  getBestScoreSync(): number {
    return this.bestScore;
  }
}

// Export a singleton instance
export const gameClient = new GameClient();
