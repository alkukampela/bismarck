import { GameType } from '../../../types/game-type';
import { Player } from '../../../types/player';
import { SuitEnum } from '../../../types/suit';
import { TrickScore } from '../../../types/trick-score';

export interface GameState {
  players: Player[];
  handNumber: number;
  handStatute: HandStatuteData;
  trickScores: TrickScore[];
}

export interface HandStatuteData {
  gameType: GameTypeData | null;
  isChoice: boolean;
  playerOrder: Player[];
  eldestHand: Player;
  tricksInHand: number;
}

export type GameTypeData =
  | { value: GameType.TRUMP; trumpSuit: SuitEnum }
  | { value: Exclude<GameType, GameType.TRUMP>; trumpSuit: null };
