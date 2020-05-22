import { Card } from '../../../types/card';
import { PlayersHand } from '../../../types/players-hand';
import { PlayerScore } from '../../../types/player-score';
import { GameScoreBoard } from '../../../types/game-score-board';
import { HandStatute } from '../../../types/hand-statute';

const performGet = async <T>(
  resourcePath: string,
  fallbackValue: T
): Promise<T> => {
  const baseUrl = `${process.env.REACT_APP_API_URL}/api/games`;
  const resp = await fetch(`${baseUrl}/${resourcePath}`, {
    mode: 'cors',
  });
  return resp.ok ? ((await resp.json()) as T) : fallbackValue;
};

export const fetchTableCards = async (gameId: string): Promise<Card[]> => {
  return performGet<Card[]>(`${gameId}/hand/tablecards`, []);
};

export const fetchHand = async (
  gameId: string,
  player: string,
  fallbackValue: PlayersHand
): Promise<PlayersHand> => {
  return performGet<PlayersHand>(
    `${gameId}/hand/cards?player=${player}`,
    fallbackValue
  );
};

export const fetchTrickTakers = async (
  gameId: string
): Promise<PlayerScore[]> => {
  return performGet<PlayerScore[]>(`${gameId}/hand/trick-count`, []);
};

export const fetchScores = async (
  gameId: string,
  fallbackValue: GameScoreBoard
): Promise<GameScoreBoard> => {
  return performGet<GameScoreBoard>(`${gameId}/score`, fallbackValue);
};

export const fetchStatute = async (
  gameId: string,
  fallbackValue: HandStatute
): Promise<HandStatute> => {
  return performGet<HandStatute>(`${gameId}/hand/statute`, fallbackValue);
};
