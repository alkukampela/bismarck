import { tricksInHand } from './deck-operations';
import { Game } from '../../../types/game';
import { GameType } from '../../../types/game-type';
import { FullGameType, HandStatute } from '../../../types/hand-statute';
import { Player } from '../../../types/player';
import { SuitEnum } from '../../../types/suit';
import pino from 'pino';
import { ErrorTypes } from '../types/error-types';
import { GameError } from '../utils/game-error';

const logger = pino();

const determineNonChoiceGameType = (
  handNumber: number,
  playerCount: number,
  trumpSuit: SuitEnum | null
): FullGameType | undefined => {
  if (isChoiceTurn(handNumber, playerCount)) {
    return;
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
    return { value: gameType };
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

export const initialHandStatute = (game: Game): HandStatute => {
  const playersInGame = game.players.length;
  const playerOrder = switchTurns(game.players, game.handNumber);

  return {
    eldestHand: playerOrder[0],
    isChoice: isChoiceTurn(game.handNumber, playersInGame),
    gameType: undefined,
    playerOrder,
    tricksInHand: tricksInHand(playersInGame),
  };
};

export const buildHandStatute = (
  game: Game,
  trumpSuit: SuitEnum | null
): HandStatute => {
  const handStatute = initialHandStatute(game);

  const gameType = determineNonChoiceGameType(
    game.handNumber,
    handStatute.playerOrder.length,
    trumpSuit
  );
  handStatute.gameType = gameType;
  return handStatute;
};

export const getStatuteAfterChoice = (
  handStatute: HandStatute,
  gameTypeChoice: FullGameType
): HandStatute => {
  return {
    ...handStatute,
    gameType: gameTypeChoice,
  };
};
