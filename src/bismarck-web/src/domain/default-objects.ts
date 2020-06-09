import { GameScoreBoard } from '../../../types/game-score-board';
import { HandStatute } from '../../../types/hand-statute';
import { PlayersHand } from '../../../types/players-hand';
import { TrickResponse } from '../../../types/trick-response';

export const emptyScores: GameScoreBoard = {
  trickScores: [],
};

export const emptyHand: PlayersHand = {
  cards: [],
  extraCards: 0,
};

export const emptyTrickResponse: TrickResponse = {
  cards: [],
};

export const emptyStatue: HandStatute = {
  eldestHand: { name: '' },
  handType: {
    isChoice: false,
  },
  playerOrder: [],
  playersInGame: 0,
  tricks: 0,
};
