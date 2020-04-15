import { Player } from './player';
import { CardEntity } from './card-entity';
import { HandStatuteMachine } from './hand-statute-machine';

const PLAYER_1 = new Player('ake');
const PLAYER_2 = new Player('make');
const PLAYER_3 = new Player('pera');
const PLAYER_4 = new Player('mä');

const PLAYERS = [PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4];

const ACE_OF_SPADES = new CardEntity(51);

const handRuleMachine = new HandStatuteMachine();

test('Ensure hand rules are correct for last trump hand', () => {
  const actual = handRuleMachine.getHandStatute(PLAYERS, 3, ACE_OF_SPADES);

  expect(actual.handType.isChoice).toBe(false);
  expect(actual.handType.gameType.value).toBe('TRUMP');
  expect(actual.handType.gameType.trumpSuit).toBe('SPADE');
  expect(actual.playerOrder[0]).toBe(PLAYER_4.getName());
});

test('Ensure hand rules are correct for second misere hand', () => {
  const actual = handRuleMachine.getHandStatute(PLAYERS, 8, ACE_OF_SPADES);

  expect(actual.handType.isChoice).toBe(false);
  expect(actual.handType.gameType.value).toBe('MISERE');
  expect(actual.handType.gameType.trumpSuit).toBeUndefined();
  expect(actual.playerOrder[0]).toBe(PLAYER_1.getName());
});

test('Ensure hand rules are correct for third choice', () => {
  const actual = handRuleMachine.getHandStatute(PLAYERS, 14, ACE_OF_SPADES);

  expect(actual.handType.isChoice).toBe(true);
  expect(actual.handType.gameType).toBeUndefined();
  expect(actual.playerOrder[0]).toBe(PLAYER_3.getName());
});
