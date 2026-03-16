# Test Plan: removePlayersCard (Pure Unit Tests)

## Function Overview

**Function:** `removePlayersCard`
**Location:** [hand-service.ts](hand-service.ts#L143-L187)
**Purpose:** Remove an extra card from the eldest hand player's cards at the start of a hand.

### Function Signature

```typescript
export const removePlayersCard = (
  player: Player,
  card: Card,
  gameState: GameState | undefined,
  deck: CardContainer[]
): ServiceResult<Card>
```

### Function Logic

1. Check `gameState` exists → throw `GAME_NOT_FOUND`
2. Check player is eldest hand → throw `MUST_BE_ELDEST_HAND`
3. Check game type is chosen → throw `GAME_TYPE_NOT_CHOSEN`
4. Check deck is not empty → throw `UNEXPECTED_ERROR`
5. Check player has the card → throw `CARD_NOT_FOUND`
6. Check player has too many cards → throw `NO_MORE_CARDS_TO_REMOVE`
7. Remove card from deck and return

### Dependencies to Mock

- `getPlayersIndex` (internal helper, tested indirectly)
- `isEldestHand` (internal helper, tested indirectly)
- `hasPlayerCard` from `deck-operations`
- `hasTooManyCards` from `deck-operations`
- `removeCard` from `deck-operations`

## Test Cases

### 1. Error Cases - Validation

#### Test 1.1: Throws GAME_NOT_FOUND when gameState is undefined

- **Setup:** `gameState = undefined`
- **Expected:** Throws `GameError(ErrorTypes.GAME_NOT_FOUND)`
- **Rationale:** Cannot remove cards without a game

#### Test 1.2: Throws MUST_BE_ELDEST_HAND when player is not eldest hand

- **Setup:**
  - Valid gameState with eldest hand = "Alice"
  - Player = "Bob" (not eldest hand)
- **Expected:** Throws `GameError(ErrorTypes.MUST_BE_ELDEST_HAND)`
- **Rationale:** Only eldest hand can remove extra cards

#### Test 1.3: Throws GAME_TYPE_NOT_CHOSEN when gameType is null

- **Setup:**
  - Player is eldest hand
  - `gameState.handStatute.gameType = null`
- **Expected:** Throws `GameError(ErrorTypes.GAME_TYPE_NOT_CHOSEN)`
- **Rationale:** Cannot remove cards before game type is chosen

#### Test 1.4: Throws UNEXPECTED_ERROR when deck is empty

- **Setup:**
  - Player is eldest hand
  - Game type is chosen
  - `deck = []`
- **Expected:** Throws `GameError(ErrorTypes.UNEXPECTED_ERROR)`
- **Rationale:** Deck should never be empty at this stage

#### Test 1.5: Throws CARD_NOT_FOUND when player doesn't have the card

- **Setup:**
  - Player is eldest hand
  - Game type is chosen
  - Mock `hasPlayerCard` returns `false`
- **Expected:** Throws `GameError(ErrorTypes.CARD_NOT_FOUND)`
- **Rationale:** Cannot remove card player doesn't have

#### Test 1.6: Throws NO_MORE_CARDS_TO_REMOVE when player has normal card count

- **Setup:**
  - Player is eldest hand
  - Mock `hasPlayerCard` returns `true`
  - Mock `hasTooManyCards` returns `false`
- **Expected:** Throws `GameError(ErrorTypes.NO_MORE_CARDS_TO_REMOVE)`
- **Rationale:** Cannot remove cards once at normal count

### 2. Happy Path - Successful Card Removal

#### Test 2.1: Successfully removes card when all validations pass

- **Setup:**
  - Player is eldest hand (index 0)
  - Game type is chosen
  - Mock `hasPlayerCard(0, 4, card, deck)` returns `true`
  - Mock `hasTooManyCards(0, 4, deck)` returns `true`
  - Mock `removeCard(card, deck)` returns updated deck
- **Expected:**
  - Calls `hasPlayerCard` with correct parameters
  - Calls `hasTooManyCards` with correct parameters
  - Calls `removeCard` with card and deck
  - Returns `{ updates: { deck: updatedDeck }, retval: card }`

#### Test 2.2: Works with different player counts (3 players)

- **Setup:**
  - 3-player game
  - Eldest hand at index 0
  - All validations pass
- **Expected:**
  - Calls `hasPlayerCard(0, 3, card, deck)`
  - Calls `hasTooManyCards(0, 3, deck)`
  - Returns updated deck and card

#### Test 2.3: Correctly calculates player index from playerOrder

- **Setup:**
  - playerOrder = [Bob, Alice, Charlie, Dave]
  - Eldest hand = Bob (index 0)
  - Player = Bob
- **Expected:**
  - Uses playerIndex = 0 in dependency calls
  - Successfully removes card

### 3. Boundary Cases

#### Test 3.1: Works with trump game type

- **Setup:**
  - `gameState.handStatute.gameType = { value: GameType.TRUMP, trumpSuit: SuitEnum.HEART }`
  - All other validations pass
- **Expected:** Successfully removes card

#### Test 3.2: Works with no-trump game type

- **Setup:**
  - `gameState.handStatute.gameType = { value: GameType.NO_TRUMP, trumpSuit: null }`
  - All other validations pass
- **Expected:** Successfully removes card
