import { PlayerScore } from '../../../types/player-score';
import { CardContainer } from './card-container';
import { GameState } from './game-state';
import { Trick } from './trick';

export type StateUpdates = {
  state?: GameState;
  deck?: CardContainer[];
  trickPoints?: PlayerScore[];
} & (
  | { clearTrick: true; trick?: never }
  | { trick: Trick; clearTrick?: never }
  | { trick?: never; clearTrick?: never }
);
