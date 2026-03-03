export const DECK_SIZE = 52;
export const TABLE_CARDS = 4;

type Range<
  N extends number,
  Result extends number[] = []
> = Result['length'] extends N
  ? Result[number]
  : Range<N, [...Result, Result['length']]>;

export type CardsOfDeck = Range<typeof DECK_SIZE>;
