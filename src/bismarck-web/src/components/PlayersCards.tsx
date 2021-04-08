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

  React.useEffect(() => {
    setExtraCardsAmount(hand.extraCards);
  }, [hand]);

  function handleExtraCardRemoval() {
    setExtraCardsAmount(extraCardsAmount - 1);
  }

  return (
    <div>
      <ExtraCardDisplay amount={extraCardsAmount} />
      <div className="players-cards">
        {hand.cards.map((card: CardType, index: number) => (
          <PlayersCard
            card={card}
            key={index}
            trickStatus={trickStatus}
            inRemovalStage={extraCardsAmount > 0}
            onCardRemoval={handleExtraCardRemoval}
          />
        ))}
      </div>
    </div>
  );
};
