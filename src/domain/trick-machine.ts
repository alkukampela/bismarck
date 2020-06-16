import { getRank, getSuit } from './card-mapper';
import { Trick } from '../persistence/trick';
import { Card } from '../types/card';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import { Suit } from '../types/suit';
import { TrickCard } from '../types/trick-card';

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
  handStatute: HandStatute,
  trickNumber: number
): Trick => {
  return {
    trickCards: initTrickCards(trickLead, handStatute.playerOrder, firstCard),
    trumpSuit: handStatute.handType.gameType.trumpSuit || getSuit(firstCard),
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
  suit: Suit
): Player | undefined => {
  const playersCard = trick.trickCards
    .filter((pc) => !!pc.card)
    .filter((pc) => getSuit(pc.card) === suit)
    .sort((a, b) => getRank(b.card) - getRank(a.card))[0];
  if (!!playersCard) {
    return playersCard.player;
  }
};

export const getTaker = (trick: Trick): Player => {
  return (
    playerWithTopRankedCardBySuit(trick, trick.trumpSuit) ||
    playerWithTopRankedCardBySuit(trick, trick.trickSuit)
  );
};

export const isTrickReady = (trick: Trick): boolean => {
  return !trick.trickCards.filter((pc) => !pc.card).length;
};

export const hasPlayerTurn = (trick: Trick, player: Player): boolean => {
  const playersCards = trick.trickCards.find((pc) => !pc.card);
  return !!playersCards && playersCards.player.name === player.name;
};
