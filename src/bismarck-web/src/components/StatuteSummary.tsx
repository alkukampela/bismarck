import { GameType } from '../../../types/game-type';
import { HandStatuteResponse } from '../../../types/hand-statute-response';
import { SuitEnum } from '../../../types/suit';
import { TrickResponse } from '../../../types/trick-response';

export const StatuteSummary = ({
  statute,
  trick,
  isMyTurn,
}: {
  statute: HandStatuteResponse;
  trick: TrickResponse;
  isMyTurn: boolean;
}) => {
  const gameTypeName = (type: GameType): string => {
    switch (type) {
      case GameType.TRUMP:
        return 'valtti';
      case GameType.NO_TRUMP:
        return 'grandi';
      case GameType.MISERE:
        return 'misääri';
      default:
        return '';
    }
  };

  const trumpSuitName = (trumpSuit: SuitEnum): string => {
    switch (trumpSuit) {
      case SuitEnum.DIAMOND:
        return 'ruutu';
      case SuitEnum.CLUB:
        return 'risti';
      case SuitEnum.HEART:
        return 'hertta';
      case SuitEnum.SPADE:
        return 'pata';
      default:
        return '';
    }
  };

  const nextPlayer = (trick: TrickResponse): string => {
    const nextInTurn = trick.cards.find((trickCard) => !trickCard.card);
    return nextInTurn ? nextInTurn.player.name : trick.taker?.name || '-';
  };

  return (
    <div className="statute">
      <h2>Käsi</h2>
      <div>Etuhenkilö: {statute.eldestHand.name}</div>
      <div>
        Pelimuoto:&nbsp;
        {statute.isChoice && 'valinta/'}
        {statute.gameType && gameTypeName(statute.gameType.value)}
      </div>
      {typeof statute.gameType?.trumpSuit !== 'undefined' && (
        <div>Valttimaa: {trumpSuitName(statute.gameType.trumpSuit)}</div>
      )}
      <div className={isMyTurn ? 'my-turn' : ''}>
        Vuorossa: {nextPlayer(trick)}
      </div>
    </div>
  );
};
