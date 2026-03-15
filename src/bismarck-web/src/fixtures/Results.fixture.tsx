import { Results } from '../components/Results';
import { ApiContext } from '../ApiContext';
import { GameScoreBoard } from '../../../types/game-score-board';
import { GameType } from '../../../types/game-type';
import { ApiService } from '../services/api-service';

const PLAYER_0 = { name: 'Alfons' };
const PLAYER_1 = { name: 'Bill' };
const PLAYER_2 = { name: 'Cedric' };

type MockApiServiceOptions = {
  scores?: GameScoreBoard;
};

function createMockApiService(
  options: MockApiServiceOptions = {}
): Partial<ApiService> {
  return {
    fetchScores: () => Promise.resolve(options.scores ?? mockScores),
  };
}

const mockScores: GameScoreBoard = {
  trickScores: [
    {
      gameType: GameType.TRUMP,
      isChoice: true,
      scores: [
        { player: PLAYER_0, totalPoints: 4 },
        { player: PLAYER_1, totalPoints: -2 },
        { player: PLAYER_2, totalPoints: -2 },
      ],
    },
    {
      gameType: GameType.NO_TRUMP,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: -1 },
        { player: PLAYER_1, totalPoints: 1 },
        { player: PLAYER_2, totalPoints: 0 },
      ],
    },
    {
      gameType: GameType.MISERE,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: 0 },
        { player: PLAYER_1, totalPoints: -3 },
        { player: PLAYER_2, totalPoints: 3 },
      ],
    },
    {
      gameType: GameType.TRUMP,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: 2 },
        { player: PLAYER_1, totalPoints: 0 },
        { player: PLAYER_2, totalPoints: -2 },
      ],
    },
    {
      gameType: GameType.NO_TRUMP,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: -2 },
        { player: PLAYER_1, totalPoints: 1 },
        { player: PLAYER_2, totalPoints: 1 },
      ],
    },
    {
      gameType: GameType.MISERE,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: 1 },
        { player: PLAYER_1, totalPoints: 1 },
        { player: PLAYER_2, totalPoints: -2 },
      ],
    },
    {
      gameType: GameType.TRUMP,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: -1 },
        { player: PLAYER_1, totalPoints: 1 },
        { player: PLAYER_2, totalPoints: 0 },
      ],
    },
    {
      gameType: GameType.NO_TRUMP,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: 0 },
        { player: PLAYER_1, totalPoints: 2 },
        { player: PLAYER_2, totalPoints: -2 },
      ],
    },
    {
      gameType: GameType.MISERE,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: 3 },
        { player: PLAYER_1, totalPoints: -1 },
        { player: PLAYER_2, totalPoints: -2 },
      ],
    },
    {
      gameType: GameType.TRUMP,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: -2 },
        { player: PLAYER_1, totalPoints: 0 },
        { player: PLAYER_2, totalPoints: 2 },
      ],
    },
    {
      gameType: GameType.NO_TRUMP,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: 1 },
        { player: PLAYER_1, totalPoints: -1 },
        { player: PLAYER_2, totalPoints: 0 },
      ],
    },
    {
      gameType: GameType.MISERE,
      isChoice: false,
      scores: [
        { player: PLAYER_0, totalPoints: 0 },
        { player: PLAYER_1, totalPoints: 2 },
        { player: PLAYER_2, totalPoints: -2 },
      ],
    },
  ],
  isFinished: true,
};

const defaultExport = {
  component: (
    <ApiContext.Provider value={{ api: createMockApiService() as ApiService }}>
      <Results />
    </ApiContext.Provider>
  ),
};

export default defaultExport;
