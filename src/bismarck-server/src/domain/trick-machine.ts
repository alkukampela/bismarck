import { getRank, getSuit } from './card-mapper';
import { Trick } from '../types/trick';
import { Card } from '../../../types/card';
import { Player } from '../../../types/player';
import { SuitEnum } from '../../../types/suit';
import { TrickCard } from '../../../types/trick-card';
import { TrickResponse } from '../../../types/trick-response';
import pino from 'pino';
import { ErrorTypes } from '../types/error-types';
import { GameError } from '../utils/game-error';
import { HandStatuteData } from '../types/game-state';

const logger = pino();

const initTrickCards = (
  trickLead: Player,
  defaultOrder: Player[],
  firstCard: Card
): TrickCard[] => {
  const startingIndex = defaultOrder.findIndex(
    (player) => player.name === trickLead.name
  );

  return [
    ...defaultOrder.slice(startingIndex),
    ...defaultOrder.slice(0, startingIndex),
  ]
    .map((player) => {
      return { player };
    })
    .map((trickCard) => {
      return {
        ...trickCard,
        ...(trickCard.player.name === trickLead.name && { card: firstCard }),
      };
    });
};

export const initTrick = (
  firstCard: Card,
  trickLead: Player,
  statue: HandStatuteData,
  trickNumber: number
): Trick => {
  return {
    trickCards: initTrickCards(trickLead, statue.playerOrder, firstCard),
    trumpSuit: statue.gameType?.trumpSuit || getSuit(firstCard),
    trickSuit: getSuit(firstCard),
    trickNumber,
  };
};

export const playCard = (trick: Trick, player: Player, card: Card): Trick => {
  const trickCards = trick.trickCards.map((trickCard) => {
    return {
      ...trickCard,
      ...(trickCard.player.name === player.name && { card }),
    };
  });

  return {
    ...trick,
    trickCards,
  };
};

const playerWithTopRankedCardBySuit = (
  trick: Trick,
  suit: SuitEnum
): Player | undefined => {
  const playersCard = trick.trickCards
    .filter((pc): pc is { player: Player; card: Card } => !!pc.card)
    .filter((pc) => getSuit(pc.card) === suit)
    .sort((a, b) => getRank(b.card) - getRank(a.card))[0];
  if (playersCard) {
    return playersCard.player;
  }
};

export const getTaker = (trick: Trick): Player => {
  const taker =
    playerWithTopRankedCardBySuit(trick, trick.trumpSuit) ||
    playerWithTopRankedCardBySuit(trick, trick.trickSuit);

  if (!taker) {
    // This should never happen as there should always
    // be a card of the trick suit
    logger.error('No taker found for this trick');
    throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
  }
  return taker;
};

export const isTrickReady = (trick: Trick): boolean => {
  return !trick.trickCards.filter((pc) => !pc.card).length;
};

export const hasPlayerTurn = (trick: Trick, player: Player): boolean => {
  const playersCards = trick.trickCards.find((pc) => !pc.card);
  return !!playersCards && playersCards.player.name === player.name;
};

export const emptyTrickResponse = (playerOrder: Player[]): TrickResponse => {
  return {
    trickStatus: 'HAND_NOT_STARTED',
    cards: playerOrder.map((player) => {
      return { player };
    }),
  };
};

export const trickResponseDuringCardRemoval = (): TrickResponse => {
  return {
    ...emptyTrickResponse([]),
    trickNumber: 0,
  };
};

export const convertToTrickResponse = (trick: Trick): TrickResponse => {
  return {
    trickStatus: isTrickReady(trick) ? 'FINISHED' : 'UNFINISHED',
    cards: trick.trickCards,
    taker: isTrickReady(trick) ? getTaker(trick) : undefined,
    trickNumber: trick.trickNumber,
  };
};
