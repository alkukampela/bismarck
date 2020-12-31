import { tricksInHand } from './card-manager';
import { Game } from '../types/game';
import { GameType } from '../types/game-type';
import { GameTypeChoice } from '../types/game-type-choice';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import { Suit } from '../types/suit';

type GameTypeWithTrumpSuit = {
  value: GameType;
  trumpSuit?: Suit;
};

const determineGameType = (
  handNumber: number,
  playerCount: number,
  trumpSuit: Suit
): GameTypeWithTrumpSuit | undefined => {
  if (isChoiceTurn(handNumber, playerCount)) {
    return;
  }

  const gameType = predefinedGameType(handNumber, playerCount);

  return {
    value: gameType,
    ...(gameType === GameType.TRUMP && { trumpSuit }),
  };
};

const isChoiceTurn = (handNumber: number, playerCount: number): boolean => {
  return handNumber >= playerCount * 3;
};

const predefinedGameType = (
  handNumber: number,
  playerCount: number
): GameType => {
  switch (Math.trunc(handNumber / playerCount)) {
    case 0:
      return GameType.TRUMP;
    case 1:
      return GameType.NO_TRUMP;
    case 2:
      return GameType.MISERE;
  }
  throw Error('Unexpected error while determining game type');
};

const switchTurns = (playerOrder: Player[], times: number): Player[] => {
  if (times > 0) {
    return switchTurns([...playerOrder.slice(1), playerOrder[0]], times - 1);
  }

  return playerOrder;
};

export const getHandStatute = (game: Game, trumpSuit: Suit): HandStatute => {
  const playersInGame = game.players.length;
  const handType = {
    isChoice: isChoiceTurn(game.handNumber, playersInGame),
    gameType: determineGameType(game.handNumber, playersInGame, trumpSuit),
  };

  const playerOrder = switchTurns(game.players, game.handNumber);

  return {
    eldestHand: playerOrder[0],
    handType,
    playerOrder,
    playersInGame,
    tricksInHand: tricksInHand(playersInGame),
  };
};

export const getStatuteAfterChoice = (
  handStatute: HandStatute,
  gameTypeChoice: GameTypeChoice
): HandStatute => {
  const handType = {
    isChoice: true,
    gameType: {
      value: gameTypeChoice.gameType,
      ...(gameTypeChoice.gameType === GameType.TRUMP && {
        trumpSuit: gameTypeChoice.trumpSuit,
      }),
    },
  };

  return { ...handStatute, handType };
};
