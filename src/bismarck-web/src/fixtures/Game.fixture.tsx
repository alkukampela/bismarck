import { Game } from '../components/Game';
import { GameContext, GameContextInterface } from '../GameContext';
import { ApiContext } from '../ApiContext';
import { MemoryRouter } from 'react-router-dom';
import { ApiService } from '../services/api-service';
import { GameType } from '../../../types/game-type';
import { SuitEnum } from '../../../types/suit';

const PLAYER_0 = { name: 'Alfons' };
const PLAYER_1 = { name: 'Bill' };
const PLAYER_2 = { name: 'Cedric' };

const api: Partial<ApiService> = {
  fetchTrick: async () => ({
    cards: [
      { card: { suit: '♥️', rank: 'A' }, player: PLAYER_0 },
      { card: { suit: '♣️', rank: 'K' }, player: PLAYER_1 },
      { player: PLAYER_2 },
    ],
    trickStatus: 'UNFINISHED',
    trickNumber: 10,
    taker: PLAYER_0,
  }),
  fetchTableCards: async () => ({
    cards: [],
    areCardsOnTheTable: false,
  }),
  fetchPlayersHand: async () => {
    return {
      cards: [],
      extraCards: 0,
    };
  },
  fetchTrickTakers: async () => [
    { player: PLAYER_0, score: 7 },
    { player: PLAYER_1, score: 3 },
    { player: PLAYER_2, score: 1 },
  ],
  fetchScores: async () => ({
    trickScores: [
      {
        gameType: GameType.TRUMP,
        isChoice: false,
        scores: [
          { player: PLAYER_0, totalPoints: -3 },
          { player: PLAYER_1, totalPoints: 2 },
          { player: PLAYER_2, totalPoints: 1 },
        ],
      },
      {
        gameType: GameType.TRUMP,
        isChoice: false,
        scores: [
          { player: PLAYER_0, totalPoints: -2 },
          { player: PLAYER_1, totalPoints: 1 },
          { player: PLAYER_2, totalPoints: 1 },
        ],
      },
      {
        gameType: GameType.TRUMP,
        isChoice: false,
        scores: [
          { player: PLAYER_0, totalPoints: -3 },
          { player: PLAYER_1, totalPoints: -1 },
          { player: PLAYER_2, totalPoints: 4 },
        ],
      },
      {
        gameType: GameType.TRUMP,
        isChoice: false,
        scores: [
          { player: PLAYER_0, totalPoints: -2 },
          { player: PLAYER_1, totalPoints: -2 },
          { player: PLAYER_2, totalPoints: 4 },
        ],
      },
    ],
    isFinished: false,
  }),
  fetchStatute: async () => ({
    gameType: {
      value: GameType.TRUMP,
      trumpSuit: SuitEnum.CLUB,
    },
    isChoice: false,
    playerOrder: [PLAYER_0, PLAYER_1, PLAYER_2],
    eldestHand: PLAYER_0,
    tricksInHand: 12,
  }),
};

const gameContextValue: GameContextInterface = {
  gameId: 'fixture-game',
  player: 'Player 1',
  token: 'token',
};

export default function GameHandScoresFixture(): JSX.Element {
  return (
    <MemoryRouter>
      <ApiContext.Provider value={{ api: api as ApiService }}>
        <GameContext.Provider value={gameContextValue}>
          <Game />
        </GameContext.Provider>
      </ApiContext.Provider>
    </MemoryRouter>
  );
}
