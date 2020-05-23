import { GameScoreBoard } from '../../../types/game-score-board';
import { HandStatute } from '../../../types/hand-statute';
import { PlayersHand } from '../../../types/players-hand';
import { TrickCards } from '../../../types/trick-cards';

export const emptyScores: GameScoreBoard = {
  trickScores: [],
  totalScore: [],
};

export const emptyHand: PlayersHand = {
  cards: [],
  extraCards: 0,
};

export const emptyTrick: TrickCards = {
  cards: [],
};

export const emptyStatue: HandStatute = {
  eldestHand: { name: '' },
  handType: {
    isChoice: false,
  },
  playerOrder: [],
  playersInGame: 0,
};
