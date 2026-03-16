import { getTableCards } from './hand-service';
import { CardContainer } from '../types/card-container';
import { getTableCardsIfVisible } from './deck-operations';

jest.mock('./deck-operations', () => ({
  getTableCardsIfVisible: jest.fn(),
}));

describe('getTableCards', () => {
  const mockedTableCardsResponse = {
    cards: [{ rank: 'A', suit: '♠️' }],
    areCardsOnTheTable: true,
  };

  beforeEach(() => {
    (getTableCardsIfVisible as jest.Mock).mockReset();
    (getTableCardsIfVisible as jest.Mock).mockReturnValue(
      mockedTableCardsResponse
    );
  });

  it('calls getTableCardsIfVisible and returns its value', () => {
    const deck: CardContainer[] = [
      { card: { rank: 'A', suit: '♠️' }, isPlayed: false },
      { card: { rank: 'K', suit: '♥️' }, isPlayed: false },
    ];
    const result = getTableCards(deck);
    expect(getTableCardsIfVisible).toHaveBeenCalledWith(deck);
    expect(result).toEqual({
      updates: {},
      retval: mockedTableCardsResponse,
    });
  });
});
