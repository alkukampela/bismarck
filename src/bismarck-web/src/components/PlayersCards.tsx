import { ExtraCardDisplay } from './ExtraCardDisplay';
import { PlayersCard } from './PlayersCard';
import { GameContext } from '../GameContext';
import { Card as CardType } from '../../../types/card';
import { PlayersHand } from '../../../types/players-hand';
import { removeCard } from '../services/api-service';
import * as React from 'react';
import { TrickStatus } from '../../../types/trick-response';

const isRedSuit = (card: CardType): boolean => {
  return ['♦️', '♥️'].includes(card.suit);
};

const shouldSeparateSuits = (
  currentCard: CardType,
  nextCard: CardType | undefined
): boolean => {
  if (!nextCard || currentCard.suit === nextCard.suit) {
    return false;
  }
  return isRedSuit(currentCard) === isRedSuit(nextCard);
};

export const PlayersCards = ({
  hand,
  trickStatus,
  isMyTurn,
}: {
  hand: PlayersHand;
  trickStatus: TrickStatus;
  isMyTurn: boolean;
}): React.ReactElement => {
  const game = React.useContext(GameContext);

  const [numberOfExtraCards, setNumberOfExtraCards] = React.useState<number>(0);
  const [cards, setCards] = React.useState<CardType[]>([]);
  const [cardsToBeRemoved, setCardsToBeRemoved] = React.useState<CardType[]>(
    []
  );

  React.useEffect(() => {
    setNumberOfExtraCards(hand.extraCards);
    setCards(hand.cards);
  }, [hand]);

  const playCard = (cardToBePlayed: CardType) => {
    setCards(cards.filter((cardInHand) => cardInHand !== cardToBePlayed));
  };

  const toggleCardToBeRemoved = (card: CardType) => {
    if (cardsToBeRemoved.includes(card)) {
      setCardsToBeRemoved(
        cardsToBeRemoved.filter((selectedCard) => selectedCard !== card)
      );
    } else if (cardsToBeRemoved.length < hand.extraCards) {
      setCardsToBeRemoved(cardsToBeRemoved.concat(card));
    }
  };

  const removeCards = async () => {
    const removed: CardType[] = [];
    for (const card of cardsToBeRemoved) {
      if (await removeCard(game.token, game.gameId, card)) {
        removed.push(card);
      }
    }

    setCards(cards.filter((card) => !removed.includes(card)));
    setCardsToBeRemoved(
      cardsToBeRemoved.filter((card) => !removed.includes(card))
    );
    setNumberOfExtraCards(numberOfExtraCards - removed.length);
  };

  return (
    <>
      <ExtraCardDisplay amount={numberOfExtraCards} />
      <div className="players-cards">
        {cards.length ? (
          cards.map((card: CardType, index: number) => (
            <div
              key={index}
              style={{
                marginRight: shouldSeparateSuits(card, cards[index + 1])
                  ? '1.0rem'
                  : undefined,
              }}
            >
              <PlayersCard
                card={card}
                trickStatus={trickStatus}
                isInRemovalStage={!!numberOfExtraCards}
                isSelectedForRemoval={cardsToBeRemoved.includes(card)}
                isMyTurn={isMyTurn}
                onPlay={playCard}
                onRemovalToggle={toggleCardToBeRemoved}
              />
            </div>
          ))
        ) : (
          <div className="card" style={{ visibility: 'hidden' }} />
        )}
      </div>
      <button
        type="button"
        onClick={removeCards}
        disabled={cardsToBeRemoved.length !== numberOfExtraCards}
        style={{ display: numberOfExtraCards ? 'block' : 'none' }}
      >
        Poista
      </button>
    </>
  );
};
