import { Card } from '../../../types/card';
import { GameScoreBoard } from '../../../types/game-score-board';
import { GameTypeChoice } from '../../../types/game-type-choice';
import { HandStatute } from '../../../types/hand-statute';
import { PlayerScore } from '../../../types/player-score';
import { PlayersHand } from '../../../types/players-hand';
import { TokenResponse } from '../../../types/token-response';
import { CreateGameResponse } from '../../../types/create-game-response';

const baseUrl = `${process.env.REACT_APP_API_URL}/api`;

interface HeaderValue {
  key: string;
  value: string;
}

const createAuthHeader = (token: string): HeaderValue => {
  return {
    key: 'Authorization',
    value: `Bearer ${token}`,
  };
};

const performGet = async <T>(
  resourcePath: string,
  fallbackValue: T,
  authHeader?: HeaderValue
): Promise<T> => {
  const headers = new Headers();
  if (!!authHeader) {
    headers.set(authHeader.key, authHeader.value);
  }

  const resp = await fetch(`${baseUrl}/${resourcePath}`, {
    mode: 'cors',
    headers,
  });
  return resp.ok ? ((await resp.json()) as T) : fallbackValue;
};

const performPost = async <T>(
  resourcePath: string,
  payload: T,
  authHeader?: HeaderValue
): Promise<Response> => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (!!authHeader) {
    headers.set(authHeader.key, authHeader.value);
  }

  return fetch(`${baseUrl}/${resourcePath}`, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(payload),
    headers,
  });
};

const postAndForget = async <T>(
  resourcePath: string,
  payload: T,
  authHeader?: HeaderValue
): Promise<boolean> => {
  const resp = await performPost(resourcePath, payload, authHeader);
  return resp.ok;
};

const performDelete = async (
  resourcePath: string,
  authHeader: HeaderValue
): Promise<boolean> => {
  const headers = new Headers();
  headers.set(authHeader.key, authHeader.value);
  const resp = await fetch(`${baseUrl}/${resourcePath}`, {
    method: 'DELETE',
    mode: 'cors',
    headers,
  });
  return resp.ok;
};

export const fetchTableCards = async (gameId: string): Promise<Card[]> =>
  performGet<Card[]>(`games/${gameId}/hand/tablecards`, []);

export const fetchPlayersHand = async (
  authToken: string,
  gameId: string,
  fallbackValue: PlayersHand
): Promise<PlayersHand> =>
  performGet<PlayersHand>(
    `games/${gameId}/hand/cards`,
    fallbackValue,
    createAuthHeader(authToken)
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
  authToken: string,
  gameId: string,
  card: Card
): Promise<boolean> =>
  postAndForget(
    `games/${gameId}/hand/trick`,
    card,
    createAuthHeader(authToken)
  );

export const addToTrick = async (
  authToken: string,
  gameId: string,
  card: Card
): Promise<boolean> =>
  postAndForget(
    `games/${gameId}/hand/trick/cards`,
    card,
    createAuthHeader(authToken)
  );

export const removeCard = async (
  authToken: string,
  gameId: string,
  card: Card
): Promise<boolean> =>
  performDelete(
    `games/${gameId}/hand/cards?rank=${card.rank}&suit=${card.suit}`,
    createAuthHeader(authToken)
  );

export const initHand = (authToken: string, gameId: string): Promise<boolean> =>
  postAndForget(`games/${gameId}/hand/`, {}, createAuthHeader(authToken));

export const postChoice = (
  authToken: string,
  gameId: string,
  gameTypeChoice: GameTypeChoice
): Promise<boolean> =>
  postAndForget(
    `games/${gameId}/hand/statute`,
    gameTypeChoice,
    createAuthHeader(authToken)
  );

export const createGame = async (players: any): Promise<CreateGameResponse> => {
  const createdGame = await performPost('games', players);
  return ((await createdGame.json()) as CreateGameResponse) || Promise.reject;
};

export const fetchToken = async (loginId: string): Promise<TokenResponse> => {
  const response = await performPost('fetch-token', { loginId });
  return ((await response.json()) as TokenResponse) || Promise.reject;
};
