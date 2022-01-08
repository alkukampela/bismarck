import { ExtraCardDisplay } from './ExtraCardDisplay';
import { PlayersCard } from './PlayersCard';
import { GameContext } from '../GameContext';
import { Card as CardType } from '../../../types/card';
import { PlayersHand } from '../../../types/players-hand';
import { TrickStatus } from '../../../types/trick-response';
import { removeCard } from '../services/api-service';
import * as React from 'react';

export const PlayersCards = ({
  hand,
  trickStatus,
}: {
  hand: PlayersHand;
  trickStatus: TrickStatus;
}) => {
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
        {!!cards.length ? (
          cards.map((card: CardType, index: number) => (
            <PlayersCard
              card={card}
              key={index}
              trickStatus={trickStatus}
              isInRemovalStage={!!numberOfExtraCards}
              isSelectedForRemoval={cardsToBeRemoved.includes(card)}
              onPlay={playCard}
              onRemovalToggle={toggleCardToBeRemoved}
            />
          ))
        ) : (
          <div className="card" style={{ visibility: 'hidden' }} />
        )}
      </div>
      <button
        type="button"
        onClick={removeCards}
        disabled={cardsToBeRemoved.length !== numberOfExtraCards}
        style={{ display: !!numberOfExtraCards ? 'block' : 'none' }}
      >
        Poista
      </button>
    </>
  );
};
