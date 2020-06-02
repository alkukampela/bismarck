import { GameType } from './game-type';
import { Player } from './player';

export interface TrickScore {
  gameType: GameType;
  isChoice: boolean;
  scores: {
    player: Player;
    totalPoints: number;
  }[];
}
