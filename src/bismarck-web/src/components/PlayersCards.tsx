import { ExtraCardDisplay } from './ExtraCardDisplay';
import { PlayersCard } from './PlayersCard';
import { Card as CardType } from '../../../types/card';
import { PlayersHand } from '../../../types/players-hand';
import * as React from 'react';

export const PlayersCards = ({ hand }: { hand: PlayersHand }) => {
  const [extraCards, setExtraCards] = React.useState<number>(0);

  React.useEffect(() => {
    setExtraCards(hand.extraCards);
  }, [hand]);

  function handleExtraCardRemoval() {
    setExtraCards(extraCards - 1);
  }

  return (
    <div>
      <ExtraCardDisplay amount={extraCards} />
      <div className="players-cards">
        {hand.cards.map((card: CardType, index: number) => (
          <PlayersCard
            card={card}
            key={index}
            inRemovalStage={extraCards > 0}
            onCardRemoval={handleExtraCardRemoval}
          />
        ))}
      </div>
    </div>
  );
};
