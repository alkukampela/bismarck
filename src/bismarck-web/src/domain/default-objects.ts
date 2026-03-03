import { GameScoreBoard } from '../../../types/game-score-board';
import { HandStatute } from '../../../types/hand-statute';
import { PlayersHand } from '../../../types/players-hand';
import { TableCardsResponse } from '../../../types/table-cards-respons';
import { TrickResponse, TrickStatus } from '../../../types/trick-response';

export const emptyScores: GameScoreBoard = {
  trickScores: [],
  isFinished: false,
};

export const emptyHand: PlayersHand = {
  cards: [],
  extraCards: 0,
};

export const emptyTrickResponse: TrickResponse = {
  trickStatus: TrickStatus.HAND_NOT_STARTED,
  cards: [],
};

export const emptyStatue: HandStatute = {
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
