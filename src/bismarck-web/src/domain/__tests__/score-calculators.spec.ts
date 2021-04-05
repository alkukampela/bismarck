import { GameType } from '../../../../types/game-type';
import { Player } from '../../../../types/player';
import { TrickScore } from '../../../../types/trick-score';
import {
  calculateFinalResults,
  calculatePointsForFinishedHand,
} from '../score-calculators';

const PLAYER_1: Player = { name: 'A' };
const PLAYER_2: Player = { name: 'B' };
const PLAYER_3: Player = { name: 'C' };
const PLAYER_4: Player = { name: 'D' };

const positionForPlayer = (
  scores: {
    player: string;
    points: number;
    position: string;
  }[],
  player: Player
): string => {
  return scores.filter((x) => x.player === player.name)[0].position;
};

const createInput = (scores: any): TrickScore[] => {
  return [
    {
      gameType: GameType.MISERE,
      isChoice: false,
      scores,
    },
  ];
};

test('Ensure correct positions with 3 player draw', () => {
  const input = createInput([
    {
      player: PLAYER_1,
      totalPoints: 0,
    },
    {
      player: PLAYER_2,
      totalPoints: 0,
    },
    {
      player: PLAYER_3,
      totalPoints: 0,
    },
  ]);

  const actual = calculateFinalResults(input);

  expect(positionForPlayer(actual, PLAYER_1)).toBe('I');
  expect(positionForPlayer(actual, PLAYER_2)).toBe('I');
  expect(positionForPlayer(actual, PLAYER_3)).toBe('I');
});

test('Ensure correct positions in 3 player game with two winners', () => {
  const input = createInput([
    {
      player: PLAYER_1,
      totalPoints: -2,
    },
    {
      player: PLAYER_2,
      totalPoints: 1,
    },
    {
      player: PLAYER_3,
      totalPoints: 1,
    },
  ]);

  const actual = calculateFinalResults(input);

  expect(positionForPlayer(actual, PLAYER_1)).toBe('III');
  expect(positionForPlayer(actual, PLAYER_2)).toBe('I');
  expect(positionForPlayer(actual, PLAYER_3)).toBe('I');
});

test('Ensure correct positions in 3 player game with two losers', () => {
  const input = createInput([
    {
      player: PLAYER_1,
      totalPoints: -1,
    },
    {
      player: PLAYER_2,
      totalPoints: 1,
    },
    {
      player: PLAYER_3,
      totalPoints: -1,
    },
  ]);

  const actual = calculateFinalResults(input);

  expect(positionForPlayer(actual, PLAYER_1)).toBe('II');
  expect(positionForPlayer(actual, PLAYER_2)).toBe('I');
  expect(positionForPlayer(actual, PLAYER_3)).toBe('II');
});

test('Ensure correct positions in 3 player game with all different scores', () => {
  const input = createInput([
    {
      player: PLAYER_1,
      totalPoints: 1,
    },
    {
      player: PLAYER_2,
      totalPoints: -1,
    },
    {
      player: PLAYER_3,
      totalPoints: 0,
    },
  ]);

  const actual = calculateFinalResults(input);

  expect(positionForPlayer(actual, PLAYER_1)).toBe('I');
  expect(positionForPlayer(actual, PLAYER_2)).toBe('III');
  expect(positionForPlayer(actual, PLAYER_3)).toBe('II');
});

test('Ensure correct positions in 4 player game with two winners and two losers', () => {
  const input = createInput([
    {
      player: PLAYER_1,
      totalPoints: 2,
    },
    {
      player: PLAYER_2,
      totalPoints: 2,
    },
    {
      player: PLAYER_3,
      totalPoints: -2,
    },
    {
      player: PLAYER_4,
      totalPoints: -2,
    },
  ]);

  const actual = calculateFinalResults(input);

  expect(positionForPlayer(actual, PLAYER_1)).toBe('I');
  expect(positionForPlayer(actual, PLAYER_2)).toBe('I');
  expect(positionForPlayer(actual, PLAYER_3)).toBe('III');
  expect(positionForPlayer(actual, PLAYER_4)).toBe('III');
});

test('Ensure correct positions in 4 player game with all different scores', () => {
  const input = createInput([
    {
      player: PLAYER_1,
      totalPoints: 2,
    },
    {
      player: PLAYER_2,
      totalPoints: 1,
    },
    {
      player: PLAYER_3,
      totalPoints: -2,
    },
    {
      player: PLAYER_4,
      totalPoints: -1,
    },
  ]);

  const actual = calculateFinalResults(input);

  expect(positionForPlayer(actual, PLAYER_1)).toBe('I');
  expect(positionForPlayer(actual, PLAYER_2)).toBe('II');
  expect(positionForPlayer(actual, PLAYER_3)).toBe('IV');
  expect(positionForPlayer(actual, PLAYER_4)).toBe('III');
});

test('Ensure no positions without scores', () => {
  const input = createInput([]);

  const actual = calculateFinalResults(input);

  expect(actual).toBeEmpty;
});

test('Ensure correct hand points for first hand', () => {
  const input = createInput([
    {
      player: PLAYER_1,
      totalPoints: 2,
    },
    {
      player: PLAYER_2,
      totalPoints: 1,
    },
    {
      player: PLAYER_3,
      totalPoints: -3,
    },
  ]);

  const actual = calculatePointsForFinishedHand(input);

  expect(actual.find((x) => x.player === PLAYER_1)?.score).toBe(2);
  expect(actual.find((x) => x.player === PLAYER_2)?.score).toBe(1);
  expect(actual.find((x) => x.player === PLAYER_3)?.score).toBe(-3);
});

test('Ensure correct hand points for successive hand', () => {
  const input = [
    ...createInput([
      {
        player: PLAYER_1,
        totalPoints: 2,
      },
      {
        player: PLAYER_2,
        totalPoints: 1,
      },
      {
        player: PLAYER_3,
        totalPoints: -3,
      },
    ]),
    ...createInput([
      {
        player: PLAYER_2,
        totalPoints: 3,
      },
      {
        player: PLAYER_3,
        totalPoints: -3,
      },
      {
        player: PLAYER_1,
        totalPoints: 0,
      },
    ]),
  ];

  const actual = calculatePointsForFinishedHand(input);

  expect(actual.find((x) => x.player === PLAYER_1)?.score).toBe(-2);
  expect(actual.find((x) => x.player === PLAYER_2)?.score).toBe(2);
  expect(actual.find((x) => x.player === PLAYER_3)?.score).toBe(0);
});

test('Ess successive hand', () => {
  const input = [
    {
      isChoice: false,
      gameType: GameType.TRUMP,
      scores: [
        {
          player: {
            name: 'Markku',
          },
          totalPoints: -1,
        },
        {
          player: {
            name: 'Vihtori',
          },
          totalPoints: 4,
        },
        {
          player: {
            name: 'Severi',
          },
          totalPoints: -3,
        },
      ],
    },
    {
      isChoice: false,
      gameType: GameType.TRUMP,
      scores: [
        {
          player: {
            name: 'Markku',
          },
          totalPoints: 4,
        },
        {
          player: {
            name: 'Vihtori',
          },
          totalPoints: 3,
        },
        {
          player: {
            name: 'Severi',
          },
          totalPoints: -7,
        },
      ],
    },
  ];

  const actual = calculatePointsForFinishedHand(input);

  expect(actual.find((x) => x.player.name === 'Markku')?.score).toBe(5);
  expect(actual.find((x) => x.player.name === 'Vihtori')?.score).toBe(-1);
  expect(actual.find((x) => x.player.name === 'Severi')?.score).toBe(-4);
});
