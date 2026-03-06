import { GameScoreBoard } from '../../../types/game-score-board';
import { HandStatuteResponse } from '../../../types/hand-statute-response';
import { PlayersHand } from '../../../types/players-hand';
import { TableCardsResponse } from '../../../types/table-cards-respons';
import { TrickResponse } from '../../../types/trick-response';

export const emptyScores: GameScoreBoard = {
  trickScores: [],
  isFinished: false,
};

export const emptyHand: PlayersHand = {
  cards: [],
  extraCards: 0,
};

export const emptyTrickResponse = (): TrickResponse => ({
  trickStatus: 'HAND_NOT_STARTED',
  cards: [],
});

export const emptyStatue: HandStatuteResponse = {
  eldestHand: { name: '' },
  gameType: undefined,
  isChoice: false,
  playerOrder: [],
  tricksInHand: 0,
};

export const emptyTableCardsResponse = (): TableCardsResponse => ({
  areCardsOnTheTable: false,
  cards: [],
});
