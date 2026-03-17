import { getCurrentTrick } from './hand-service';
import { ErrorTypes } from '../types/error-types';
import { GameError } from '../utils/game-error';
import { TrickResponse } from '../../../types/trick-response';
import { SuitEnum } from '../../../types/suit';
import * as trickMachine from './trick-machine';
import { Card } from '../../../types/card';
import { Trick } from '../types/trick';

jest.mock('./trick-machine', () => ({
  convertToTrickResponse: jest.fn(),
  emptyTrickResponse: jest.fn(),
}));

const PLAYER_0 = { name: 'Alice' };
const PLAYER_1 = { name: 'Bob' };
const PLAYER_2 = { name: 'Charlie' };
const PLAYER_3 = { name: 'Dave' };

const CARD_0: Card = { rank: '3', suit: '♦️' };
const CARD_1: Card = { rank: '4', suit: '♦️' };
const CARD_2: Card = { rank: '5', suit: '♦️' };
const CARD_3: Card = { rank: '6', suit: '♦️' };

const GAME_STATE = {
  players: [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
  handNumber: 1,
  handStatute: {
    gameType: null,
    isChoice: false,
    playerOrder: [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
    eldestHand: PLAYER_0,
    tricksInHand: 8,
  },
  trickScores: [],
};

const trickResponse: TrickResponse = {
  trickStatus: 'UNFINISHED',
  cards: [
    { player: PLAYER_0, card: CARD_0 },
    { player: PLAYER_1, card: CARD_1 },
  ],
};

describe('getCurrentTrick', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws GAME_NOT_FOUND when gameState is undefined', () => {
    expect(() => getCurrentTrick(undefined, undefined)).toThrow(
      new GameError(ErrorTypes.GAME_NOT_FOUND)
    );
  });

  it('returns converted trick when trick is defined', () => {
    const trick: Trick = {
      trickSuit: SuitEnum.CLUB,
      trumpSuit: SuitEnum.CLUB,
      trickCards: [
        { player: PLAYER_0, card: CARD_0 },
        { player: PLAYER_1, card: CARD_1 },
      ],
      trickNumber: 0,
    };
    const gameState = GAME_STATE;
    const mockResponse = trickResponse;
    (trickMachine.convertToTrickResponse as jest.Mock).mockReturnValue(
      mockResponse
    );

    const result = getCurrentTrick(trick, gameState);
    expect(trickMachine.convertToTrickResponse).toHaveBeenCalledWith(trick);
    expect(trickMachine.emptyTrickResponse).not.toHaveBeenCalled();
    expect(result).toEqual({ updates: {}, retval: mockResponse });
  });

  it('works with trick in progress (partial cards)', () => {
    const trick: Trick = {
      trickSuit: SuitEnum.CLUB,
      trumpSuit: SuitEnum.CLUB,
      trickCards: [
        { player: PLAYER_0, card: CARD_0 },
        { player: PLAYER_1, card: CARD_1 },
        { player: PLAYER_2 },
      ],
      trickNumber: 0,
    };
    const gameState = GAME_STATE;
    const mockResponse = trickResponse;
    (trickMachine.convertToTrickResponse as jest.Mock).mockReturnValue(
      mockResponse
    );

    const result = getCurrentTrick(trick, gameState);
    expect(result).toEqual({ updates: {}, retval: mockResponse });
  });

  it('works with completed trick (all cards)', () => {
    const trick: Trick = {
      trickSuit: SuitEnum.CLUB,
      trumpSuit: SuitEnum.CLUB,
      trickCards: [
        { player: PLAYER_0, card: CARD_0 },
        { player: PLAYER_1, card: CARD_1 },
        { player: PLAYER_2, card: CARD_2 },
        { player: PLAYER_3, card: CARD_3 },
      ],
      trickNumber: 0,
    };

    const gameState = GAME_STATE;
    const mockResponse = trickResponse;
    (trickMachine.convertToTrickResponse as jest.Mock).mockReturnValue(
      mockResponse
    );

    const result = getCurrentTrick(trick, gameState);
    expect(result).toEqual({ updates: {}, retval: mockResponse });
  });

  it('returns default trick when trick is undefined', () => {
    const gameState = GAME_STATE;
    const mockResponse = trickResponse;
    (trickMachine.emptyTrickResponse as jest.Mock).mockReturnValue(
      mockResponse
    );

    const result = getCurrentTrick(undefined, gameState);
    expect(trickMachine.convertToTrickResponse).not.toHaveBeenCalled();
    expect(trickMachine.emptyTrickResponse).toHaveBeenCalledWith(
      gameState.handStatute.playerOrder
    );
    expect(result).toEqual({ updates: {}, retval: mockResponse });
  });

  it('passes correct playerOrder to emptyTrickResponse', () => {
    const gameState = GAME_STATE;
    const mockResponse = trickResponse;
    (trickMachine.emptyTrickResponse as jest.Mock).mockReturnValue(
      mockResponse
    );

    const result = getCurrentTrick(undefined, gameState);
    expect(trickMachine.emptyTrickResponse).toHaveBeenCalledWith(
      gameState.handStatute.playerOrder
    );
    expect(result).toEqual({ updates: {}, retval: mockResponse });
  });

  it('does not modify input objects', () => {
    const trick: Trick = {
      trickSuit: SuitEnum.CLUB,
      trumpSuit: SuitEnum.CLUB,
      trickCards: [
        { player: PLAYER_0, card: { rank: '3', suit: '♦️' } },
        { player: PLAYER_1 },
      ],
      trickNumber: 0,
    };
    const trickCopy = JSON.parse(JSON.stringify(trick));
    const gameState = GAME_STATE;
    const gameStateCopy = JSON.parse(JSON.stringify(gameState));
    const mockResponse = trickResponse;
    (trickMachine.convertToTrickResponse as jest.Mock).mockReturnValue(
      mockResponse
    );

    getCurrentTrick(trick, gameState);
    expect(trick).toEqual(trickCopy);
    expect(gameState).toEqual(gameStateCopy);
  });
});
