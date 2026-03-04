import { GameType } from '../../../types/game-type';
import { Player } from '../../../types/player';
import { SuitEnum } from '../../../types/suit';
import { TrickScore } from '../../../types/trick-score';

export interface GameState {
  players: Player[];
  handNumber: number;
  handStatute: Statute;
  trickScores: TrickScore[];
}

export interface Statute {
  gameType: PersistableGameType | null;
  isChoice: boolean;
  playerOrder: Player[];
  eldestHand: Player;
  tricksInHand: number;
}

export type PersistableGameType =
  | { value: GameType.TRUMP; trumpSuit: SuitEnum }
  | { value: Exclude<GameType, GameType.TRUMP>; trumpSuit: null };
