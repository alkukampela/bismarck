import { Card } from '../../../types/card';
import { GameScoreBoard } from '../../../types/game-score-board';
import { GameTypeChoice } from '../../../types/game-type-choice';
import { HandStatute } from '../../../types/hand-statute';
import { PlayerScore } from '../../../types/player-score';
import { PlayersHand } from '../../../types/players-hand';
import { TokenResponse } from '../../../types/token-response';

const baseUrl = `${process.env.REACT_APP_API_URL}/api`;

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
  // TODO better error handling
  return resp.ok;
};

const performDelete = async (resourcePath: string): Promise<boolean> => {
  const resp = await fetch(`${baseUrl}/${resourcePath}`, {
    method: 'DELETE',
    mode: 'cors',
  });
  return resp.ok;
};

export const fetchTableCards = async (gameId: string): Promise<Card[]> =>
  performGet<Card[]>(`games/${gameId}/hand/tablecards`, []);

export const fetchHand = async (
  gameId: string,
  player: string,
  fallbackValue: PlayersHand
): Promise<PlayersHand> =>
  performGet<PlayersHand>(
    `games/${gameId}/hand/cards?player=${player}`,
    fallbackValue
  );

export const fetchTrickTakers = async (
  gameId: string
): Promise<PlayerScore[]> =>
  performGet<PlayerScore[]>(`games/${gameId}/hand/trick-count`, []);

export const fetchScores = async (
  gameId: string,
  fallbackValue: GameScoreBoard
): Promise<GameScoreBoard> =>
  performGet<GameScoreBoard>(`games/${gameId}/score`, fallbackValue);

export const fetchStatute = async (
  gameId: string,
  fallbackValue: HandStatute
): Promise<HandStatute> =>
  performGet<HandStatute>(`games/${gameId}/hand/statute`, fallbackValue);

export const startTrick = async (
  player: string,
  gameId: string,
  card: Card
): Promise<boolean> =>
  performPost(`games/${gameId}/hand/trick?player=${player}`, card);

export const addToTrick = async (
  player: string,
  gameId: string,
  card: Card
): Promise<boolean> =>
  performPost(`games/${gameId}/hand/trick/cards?player=${player}`, card);

export const removeCard = async (
  player: string,
  gameId: string,
  card: Card
): Promise<boolean> =>
  performDelete(
    `games/${gameId}/hand/cards?player=${player}&rank=${card.rank}&suit=${card.suit}`
  );

export const initHand = (gameId: string): Promise<boolean> =>
  performPost(`${gameId}/hand/`, {});

export const postChoice = (
  player: string,
  gameId: string,
  gameTypeChoice: GameTypeChoice
): Promise<boolean> =>
  performPost(`games/${gameId}/hand/statute?player=${player}`, gameTypeChoice);

export const createGame = (players: any): Promise<boolean> =>
  performPost('', players);

export const fetchToken = async (
  identifier: string,
  fallbackValue: TokenResponse
): Promise<TokenResponse> =>
  performGet<TokenResponse>(`tokens/${identifier}`, fallbackValue);
