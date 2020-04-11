import shuffle from 'fisher-yates';

export class DeckGenerator {
  public shuffledDeck() {
    const deck = [...this.sequenceGenerator(0, 52)];
    return shuffle(deck);
  }

  private *sequenceGenerator(minVal: number, maxVal: number) {
    let currVal = minVal;
    while (currVal < maxVal) {
      yield currVal++;
    }
  }
}
