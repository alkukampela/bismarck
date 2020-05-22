import { Card } from '../../../types/card';
import { GameScoreBoard } from '../../../types/game-score-board';
import { HandStatute } from '../../../types/hand-statute';
import { PlayerScore } from '../../../types/player-score';
import { PlayersHand } from '../../../types/players-hand';

const baseUrl = `${process.env.REACT_APP_API_URL}/api/games`;

const performGet = async <T>(
  resourcePath: string,
  fallbackValue: T
): Promise<T> => {
  const resp = await fetch(`${baseUrl}/${resourcePath}`, {
    mode: 'cors',
  });
  return resp.ok ? ((await resp.json()) as T) : fallbackValue;
};

const performPost = async <T>(
  resourcePath: string,
  payload: T
): Promise<boolean> => {
  const resp = await fetch(`${baseUrl}/${resourcePath}`, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return resp.ok;
};

const performDelete = async (resourcePath: string): Promise<boolean> => {
  const resp = await fetch(`${baseUrl}/${resourcePath}`, {
    method: 'DELETE',
    mode: 'cors',
  });
  return resp.ok;
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

export const startTrick = async (
  player: string,
  gameId: string,
  card: Card
): Promise<boolean> => {
  return performPost(`${gameId}/hand/trick?player=${player}`, card);
};

export const addToTrick = async (
  player: string,
  gameId: string,
  card: Card
): Promise<boolean> => {
  return performPost(`${gameId}/hand/trick/cards?player=${player}`, card);
};

export const removeCard = async (
  player: string,
  gameId: string,
  card: Card
): Promise<boolean> => {
  return performDelete(
    `${gameId}/hand/cards?player=${player}&rank=${card.rank}&suit=${card.suit}`
  );
};
