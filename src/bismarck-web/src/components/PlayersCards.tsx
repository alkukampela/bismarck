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
  const [numberOfExtraCards, setNumberOfExtraCards] = React.useState<number>(0);
  const [cards, setCards] = React.useState<CardType[]>([]);

  React.useEffect(() => {
    setNumberOfExtraCards(hand.extraCards);
    setCards(hand.cards);
  }, [hand]);

  function playCard(cardToBeRemoved: CardType) {
    if (numberOfExtraCards > 0) {
      setNumberOfExtraCards(numberOfExtraCards - 1);
    }

    setCards(cards.filter((cardInHand) => cardInHand !== cardToBeRemoved));
  }

  return (
    <div>
      <ExtraCardDisplay amount={numberOfExtraCards} />
      <div className="players-cards">
        {cards.map((card: CardType, index: number) => (
          <PlayersCard
            card={card}
            key={index}
            trickStatus={trickStatus}
            inRemovalStage={!!numberOfExtraCards}
            onPlay={playCard}
          />
        ))}
      </div>
    </div>
  );
};
