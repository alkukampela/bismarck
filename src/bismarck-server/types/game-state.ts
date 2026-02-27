import { GameType } from '../../types/game-type';
import { Player } from '../../types/player';
import { SuitEnum } from '../../types/suit';
import { TrickScore } from '../../types/trick-score';

export interface GameState {
  players: Player[];
  handNumber: number;
  handStatute: HandStatute;
  trickScores: TrickScore[];
}

export type FullGameType =
  | { value: GameType.TRUMP; trumpSuit: SuitEnum }
  | { value: Exclude<GameType, GameType.TRUMP>; trumpSuit?: undefined };

export interface HandStatute {
  gameType: FullGameType | undefined;
  isChoice: boolean;
  playerOrder: Player[];
  eldestHand: Player;
  tricksInHand: number;
}
