import { tricksInHand } from './deck-operations';
import { Game } from '../../../types/game';
import { GameType } from '../../../types/game-type';
import { Player } from '../../../types/player';
import { SuitEnum } from '../../../types/suit';
import pino from 'pino';
import { ErrorTypes } from '../types/error-types';
import { GameError } from '../utils/game-error';
import { GameTypeData, HandStatuteData } from '../types/game-state';
import { HandStatuteResponse } from '../../../types/hand-statute-response';

const logger = pino();

const determineNonChoiceGameType = (
  handNumber: number,
  playerCount: number,
  trumpSuit: SuitEnum | null
): GameTypeData | null => {
  if (isChoiceTurn(handNumber, playerCount)) {
    return null;
  }

  let gameType: GameType;
  switch (Math.trunc(handNumber / playerCount)) {
    case 0:
      gameType = GameType.TRUMP;
      break;
    case 1:
      gameType = GameType.NO_TRUMP;
      break;
    case 2:
      gameType = GameType.MISERE;
      break;
    default:
      logger.error('Invalid hand number for non-choice game type');
      throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
  }

  if (gameType !== GameType.TRUMP) {
    return { value: gameType, trumpSuit: null };
  }

  if (!trumpSuit) {
    logger.error('Trump suit must be provided for trump game type');
    throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
  }

  return {
    value: gameType,
    trumpSuit,
  };
};

const isChoiceTurn = (handNumber: number, playerCount: number): boolean => {
  return handNumber >= playerCount * 3;
};

const switchTurns = (playerOrder: Player[], times: number): Player[] => {
  if (times > 0) {
    return switchTurns([...playerOrder.slice(1), playerOrder[0]], times - 1);
  }

  return playerOrder;
};

export const initialStatute = (game: Game): HandStatuteData => {
  const playersInGame = game.players.length;
  const playerOrder = switchTurns(game.players, game.handNumber);

  return {
    eldestHand: playerOrder[0],
    isChoice: isChoiceTurn(game.handNumber, playersInGame),
    gameType: null,
    playerOrder,
    tricksInHand: tricksInHand(playersInGame),
  };
};

export const buildHandStatute = (
  game: Game,
  trumpSuit: SuitEnum | null
): HandStatuteData => {
  const handStatute = initialStatute(game);

  const gameType = determineNonChoiceGameType(
    game.handNumber,
    handStatute.playerOrder.length,
    trumpSuit
  );
  handStatute.gameType = gameType;
  return handStatute;
};

export const getStatuteAfterChoice = (
  statute: HandStatuteData,
  gameTypeChoice: GameTypeData
): HandStatuteData => {
  return {
    ...statute,
    gameType: gameTypeChoice,
  };
};

export const toHandStatute = (
  statute: HandStatuteData
): HandStatuteResponse => {
  return {
    isChoice: statute.isChoice,
    playerOrder: statute.playerOrder,
    eldestHand: statute.eldestHand,
    tricksInHand: statute.tricksInHand,
    gameType: statute.gameType
      ? statute.gameType.value === GameType.TRUMP
        ? statute.gameType
        : { value: statute.gameType.value }
      : undefined,
  };
};
