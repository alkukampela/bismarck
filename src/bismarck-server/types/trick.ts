import { SuitEnum } from '../../types/suit';
import { TrickCard } from '../../types/trick-card';

export interface Trick {
  trickSuit: SuitEnum;

  trumpSuit: SuitEnum;

  trickCards: TrickCard[];

  trickNumber: number;
}
