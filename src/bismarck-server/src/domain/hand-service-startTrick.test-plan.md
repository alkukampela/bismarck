# Test Plan: startTrick (Pure Unit Tests)

## Function Overview

**Function:** `startTrick`
**Location:** [hand-service.ts](hand-service.ts#L280-L346)
**Purpose:** Start a new trick by having the trick lead player play the first card.

### Function Signature

```typescript
export const startTrick = (
  player: Player,
  card: Card,
  gameState: GameState | undefined,
  previousTrick: Trick | undefined,
  deck: CardContainer[]
): ServiceResult<TrickResponse>
```

### Function Logic

1. Check `gameState` exists → throw `GAME_NOT_FOUND`
2. Check game type is chosen → throw `GAME_TYPE_NOT_CHOSEN`
3. Check previous trick is ready (if exists) → throw `TRICK_ALREADY_STARTED`
4. Determine trick lead (taker of previous trick or eldest hand)
5. Check player is trick lead → throw `NOT_TRICK_LEAD`
6. Check deck not empty → throw `UNEXPECTED_ERROR`
7. Check player has card → throw `CARD_NOT_FOUND`
8. Check player doesn't have too many cards → throw `CARDS_MUST_BE_REMOVED`
9. Remove card from deck, init trick, return response

### Dependencies to Mock

- `getLeadPlayerForTrick` (internal helper that uses `getTaker`)
- `getTaker` from `trick-machine`
- `isTrickReady` from `trick-machine`
- `getPlayersIndex` (internal helper)
- `hasPlayerCard` from `deck-operations`
- `hasTooManyCards` from `deck-operations`
- `removeCard` from `deck-operations`
- `roundNumber` from `deck-operations`
- `initTrick` from `trick-machine`
- `convertToTrickResponse` from `trick-machine`

## Test Cases

### 1. Error Cases - Game State Validation

#### Test 1.1: Throws GAME_NOT_FOUND when gameState is undefined

- **Setup:** `gameState = undefined`
- **Expected:** Throws `GameError(ErrorTypes.GAME_NOT_FOUND)`
- **Rationale:** Cannot start trick without game

#### Test 1.2: Throws GAME_TYPE_NOT_CHOSEN when gameType is null

- **Setup:**
  - Valid gameState
  - `gameState.handStatute.gameType = null`
- **Expected:** Throws `GameError(ErrorTypes.GAME_TYPE_NOT_CHOSEN)`
- **Rationale:** Cannot start playing before game type chosen

### 2. Error Cases - Trick State Validation

#### Test 2.1: Throws TRICK_ALREADY_STARTED when previous trick not ready

- **Setup:**
  - Valid gameState with game type
  - `previousTrick` exists
  - Mock `isTrickReady(previousTrick)` returns `false`
- **Expected:** Throws `GameError(ErrorTypes.TRICK_ALREADY_STARTED)`
- **Rationale:** Must complete current trick before starting new one

#### Test 2.2: Allows starting when previousTrick is undefined (first trick)

- **Setup:**
  - Valid gameState
  - `previousTrick = undefined`
- **Expected:** Does not throw TRICK_ALREADY_STARTED error

#### Test 2.3: Allows starting when previousTrick is ready

- **Setup:**
  - `previousTrick` exists
  - Mock `isTrickReady(previousTrick)` returns `true`
- **Expected:** Does not throw TRICK_ALREADY_STARTED error

### 3. Error Cases - Player Validation

#### Test 3.1: Throws NOT_TRICK_LEAD when player is not the lead (first trick)

- **Setup:**
  - `previousTrick = undefined`
  - Eldest hand = "Alice"
  - Player = "Bob"
- **Expected:** Throws `GameError(ErrorTypes.NOT_TRICK_LEAD)`
- **Rationale:** First trick must be led by eldest hand

#### Test 3.2: Throws NOT_TRICK_LEAD when player is not taker of previous trick

- **Setup:**
  - `previousTrick` exists and ready
  - Mock `getTaker(previousTrick)` returns "Alice"
  - Player = "Bob"
- **Expected:** Throws `GameError(ErrorTypes.NOT_TRICK_LEAD)`
- **Rationale:** Winner of previous trick leads next

### 4. Error Cases - Deck and Card Validation

#### Test 4.1: Throws UNEXPECTED_ERROR when deck is empty

- **Setup:**
  - Player is trick lead
  - `deck = []`
- **Expected:** Throws `GameError(ErrorTypes.UNEXPECTED_ERROR)`
- **Rationale:** Deck should have cards at this point

#### Test 4.2: Throws CARD_NOT_FOUND when player doesn't have the card

- **Setup:**
  - Player is trick lead
  - Valid deck
  - Mock `hasPlayerCard` returns `false`
- **Expected:** Throws `GameError(ErrorTypes.CARD_NOT_FOUND)`
- **Rationale:** Cannot play card player doesn't have

#### Test 4.3: Throws CARDS_MUST_BE_REMOVED when player has too many cards

- **Setup:**
  - Player is trick lead
  - Mock `hasPlayerCard` returns `true`
  - Mock `hasTooManyCards` returns `true`
- **Expected:** Throws `GameError(ErrorTypes.CARDS_MUST_BE_REMOVED)`
- **Rationale:** Must remove extra cards before starting to play

### 5. Happy Path - First Trick (Eldest Hand)

#### Test 5.1: Successfully starts first trick as eldest hand

- **Setup:**
  - `previousTrick = undefined`
  - Player is eldest hand
  - Game type chosen
  - Mock `hasPlayerCard` returns `true`
  - Mock `hasTooManyCards` returns `false`
  - Mock `removeCard` returns updated deck
  - Mock `roundNumber` returns 1
  - Mock `initTrick` returns new trick
  - Mock `convertToTrickResponse` returns response
- **Expected:**
  - Calls `hasPlayerCard(playerIndex, playersCount, card, deck)`
  - Calls `hasTooManyCards(playerIndex, playersCount, deck)`
  - Calls `removeCard(card, deck)`
  - Calls `roundNumber(playerIndex, playersCount, deck)`
  - Calls `initTrick(card, player, gameState.handStatute, trickNumber)`
  - Calls `convertToTrickResponse(trick)`
  - Returns `{ updates: { trick, deck: updatedDeck }, retval: trickResponse, broadcastValue: trickResponse }`

#### Test 5.2: Uses eldest hand when previousTrick is undefined

- **Setup:**
  - Eldest hand = "Alice"
  - `previousTrick = undefined`
- **Expected:**
  - Allows "Alice" to start trick
  - Rejects other players

### 6. Happy Path - Subsequent Tricks (Previous Winner)

#### Test 6.1: Successfully starts trick as winner of previous trick

- **Setup:**
  - `previousTrick` exists
  - Mock `isTrickReady(previousTrick)` returns `true`
  - Mock `getTaker(previousTrick)` returns "Bob"
  - Player = "Bob"
  - All validations pass
- **Expected:**
  - Allows "Bob" to start trick
  - Initializes trick with correct parameters

#### Test 6.2: Correctly determines lead from getTaker

- **Setup:**
  - Previous trick won by specific player
  - Mock `getTaker` returns that player
- **Expected:**
  - Uses result of `getTaker` to determine lead
  - Validates player against that result

### 7. Deck and Trick Initialization

#### Test 7.1: Removes card from deck before starting trick

- **Setup:**
  - Valid scenario
  - Specific deck and card
  - Mock `removeCard`
- **Expected:**
  - Calls `removeCard(card, deck)` with exact parameters
  - Uses returned deck in updates

#### Test 7.2: Calculates correct trick number

- **Setup:**
  - Player index = 2
  - Players count = 4
  - Mock `roundNumber(2, 4, deck)` returns 5
- **Expected:**
  - Passes correct parameters to `roundNumber`
  - Uses returned value for trick initialization

#### Test 7.3: Initializes trick with correct parameters

- **Setup:**
  - Specific card, player, gameState.handStatute, trickNumber
- **Expected:**
  - Calls `initTrick(card, player, gameState.handStatute, trickNumber)`
  - Uses all correct values

#### Test 7.4: Returns trick in updates

- **Setup:** Valid scenario
- **Expected:**
  - `updates.trick` equals value returned by `initTrick`

#### Test 7.5: Returns same response as retval and broadcastValue

- **Setup:** Valid scenario
- **Expected:**
  - `retval` equals `broadcastValue`
  - Both equal result of `convertToTrickResponse`

### 8. Player Index Calculation

#### Test 8.1: Correctly calculates player index from playerOrder

- **Setup:**
  - playerOrder = [Bob, Alice, Charlie, Dave]
  - Player = Charlie (index 2)
- **Expected:**
  - Uses index 2 in `hasPlayerCard` and `hasTooManyCards` calls

#### Test 8.2: Works with different player positions

- **Setup:** Players at various indices
- **Expected:** Correctly identifies each player's index

### 9. Different Game Types

#### Test 9.1: Works with TRUMP game type

- **Setup:**
  - `gameType = { value: GameType.TRUMP, trumpSuit: SuitEnum.HEART }`
- **Expected:** Successfully starts trick

#### Test 9.2: Works with NO_TRUMP game type

- **Setup:**
  - `gameType = { value: GameType.NO_TRUMP, trumpSuit: null }`
- **Expected:** Successfully starts trick
