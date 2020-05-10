import { GameType } from '../../../types/game-type';
import { HandStatute } from '../../../types/hand-statute';
import { Suit } from '../../../types/suit';
import * as React from 'react';
import { GameContext } from '../GameContext';

export const StatuteSummary = () => {
  const game = React.useContext(GameContext);

  const [statute, setStatute] = React.useState<HandStatute>({
    eldestHand: { name: '' },
    handType: {
      isChoice: false,
    },
    playerOrder: [],
  });

  React.useEffect(() => {
    const fetchStatute = async (): Promise<HandStatute> => {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/statute`,
        {
          mode: 'cors',
        }
      );
      return (await resp.json()) as HandStatute;
    };

    fetchStatute().then((fetchedStatute) => {
      setStatute(fetchedStatute);
    });
  }, []);

  const gameTypeName = (type: GameType): string => {
    switch (type) {
      case GameType.TRUMP:
        return 'Valtti';
      case GameType.NO_TRUMP:
        return 'Grandi';
      case GameType.MISERE:
        return 'Misääri';
      default:
        return '';
    }
  };

  const trumpSuitName = (trumpSuit: Suit): string => {
    switch (trumpSuit) {
      case Suit.DIAMOND:
        return 'Ruutu';
      case Suit.CLUB:
        return 'Risti';
      case Suit.HEART:
        return 'Hertta';
      case Suit.SPADE:
        return 'Pata';
      default:
        return '';
    }
  };

  return (
    <div className="statute">
      <h2>Käden pelimuoto</h2>
      <div>Etumies: {statute.eldestHand.name}</div>
      {statute.handType.gameType && (
        <div>Pelityyppi: {gameTypeName(statute.handType.gameType.value)}</div>
      )}
      {typeof statute.handType.gameType?.trumpSuit !== 'undefined' && (
        <div>Valtti: {trumpSuitName(statute.handType.gameType.trumpSuit)}</div>
      )}
    </div>
  );
};
