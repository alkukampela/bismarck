import { ExtraCardDisplay } from './ExtraCardDisplay';
import { PlayersCard } from './PlayersCard';
import { Card as CardType } from '../../../types/card';
import { PlayersHand } from '../../../types/players-hand';
import { TrickStatus } from '../../../types/trick-response';
import * as React from 'react';

export const PlayersCards = ({
  hand,
  trickStatus,
}: {
  hand: PlayersHand;
  trickStatus: TrickStatus;
}) => {
  const [extraCardsAmount, setExtraCardsAmount] = React.useState<number>(0);
  const [cards, setCards] = React.useState<CardType[]>([]);

  React.useEffect(() => {
    setExtraCardsAmount(hand.extraCards);
    setCards(hand.cards);
  }, [hand]);

  function playCard(cardToBeRemoved: CardType) {
    if (extraCardsAmount > 0) {
      setExtraCardsAmount(extraCardsAmount - 1);
    }

    setCards(cards.filter((cardInHand) => cardInHand !== cardToBeRemoved));
  }

  return (
    <div>
      <ExtraCardDisplay amount={extraCardsAmount} />
      <div className="players-cards">
        {cards.map((card: CardType, index: number) => (
          <PlayersCard
            card={card}
            key={index}
            trickStatus={trickStatus}
            inRemovalStage={extraCardsAmount > 0}
            onPlay={playCard}
          />
        ))}
      </div>
    </div>
  );
};
