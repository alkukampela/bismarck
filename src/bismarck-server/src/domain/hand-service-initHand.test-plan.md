# Test Plan: initHand (Pure Unit Tests)

## Function Overview

**Function:** `initHand`
**Location:** [hand-service.ts](hand-service.ts#L439-L477)
**Purpose:** Initialize a new hand after the previous hand completes, incrementing hand number and setting up new deck and statute.

### Function Signature

```typescript
export const initHand = (
  gameState: GameState | undefined,
  currentDeck: CardContainer[]
): ServiceResult<HandStatuteResponse>
```

### Function Logic

1. Check current hand is finished → throw `CURRENT_HAND_NOT_FINISHED`
2. Check gameState exists → throw `GAME_NOT_FOUND`
3. Check game hasn't ended → throw `GAME_ENDED`
4. Create new deck and increment hand number
5. Build hand statute with new hand number
6. Create initial trick points for all players
7. Return updates with new state, trickPoints, deck, and clearTrick flag

### Dependencies to Mock

- `noCardsLeft` from `deck-operations`
- `initDeck` from `deck-operations`
- `getTrumpSuit` from `deck-operations`
- `buildHandStatute` from `hand-statute-machine`
- `toHandStatute` from `hand-statute-machine`
- `emptyTrickResponse` from `trick-machine`

## Test Cases

### 1. Error Cases - Hand State Validation

#### Test 1.1: Throws CURRENT_HAND_NOT_FINISHED when deck has cards

- **Setup:**
  - Mock `noCardsLeft(currentDeck)` returns `false`
  - Any gameState
- **Expected:** Throws `GameError(ErrorTypes.CURRENT_HAND_NOT_FINISHED)`
- **Rationale:** Cannot start new hand until current one completes

#### Test 1.2: Throws GAME_NOT_FOUND when gameState is undefined

- **Setup:**
  - Mock `noCardsLeft` returns `true`
  - `gameState = undefined`
- **Expected:** Throws `GameError(ErrorTypes.GAME_NOT_FOUND)`
- **Rationale:** Need game to initialize hand

#### Test 1.3: Throws GAME_ENDED when handNumber reaches limit (4 players)

- **Setup:**
  - 4 players
  - `gameState.handNumber = 16` (4 \* 4)
  - Mock `noCardsLeft` returns `true`
- **Expected:** Throws `GameError(ErrorTypes.GAME_ENDED)`
- **Rationale:** Game has maximum of players.length \* 4 hands

#### Test 1.4: Throws GAME_ENDED when handNumber exceeds limit

- **Setup:**
  - 4 players
  - `gameState.handNumber = 17`
- **Expected:** Throws `GameError(ErrorTypes.GAME_ENDED)`

#### Test 1.5: Allows initialization when handNumber is just below limit

- **Setup:**
  - 4 players
  - `gameState.handNumber = 15` (one hand left)
  - All other validations pass
- **Expected:** Does not throw GAME_ENDED

### 2. Happy Path - New Hand Initialization (4 players)

#### Test 2.1: Successfully initializes new hand

- **Setup:**
  - 4 players
  - `gameState.handNumber = 5`
  - Mock `noCardsLeft` returns `true`
  - Mock `initDeck` returns new deck
  - Mock `getTrumpSuit(newDeck)` returns trump card
  - Mock `buildHandStatute` returns statute
  - Mock `toHandStatute` returns statute response
  - Mock `emptyTrickResponse` returns trick response
- **Expected:**
  - Calls `initDeck()`
  - Calls `getTrumpSuit(newDeck)`
  - Calls `buildHandStatute({ ...gameState, handNumber: 6 }, trumpCard)`
  - Calls `toHandStatute(statute)`
  - Calls `emptyTrickResponse(updatedGameState.players)`
  - Returns `{ updates: { state: updatedGameState, trickPoints, deck: newDeck, clearTrick: true }, retval: statuteResponse, broadcastValue: trickResponse }`

#### Test 2.2: Increments handNumber correctly

- **Setup:**
  - `gameState.handNumber = 8`
  - All validations pass
- **Expected:**
  - Calls `buildHandStatute` with handNumber = 9
  - `updates.state.handNumber = 9`

#### Test 2.3: Creates new deck

- **Setup:** Valid initialization
- **Expected:**
  - Calls `initDeck()`
  - `updates.deck` equals returned deck from `initDeck`

#### Test 2.4: Gets trump suit from new deck

- **Setup:**
  - Mock `initDeck` returns specific deck
  - Mock `getTrumpSuit` returns specific card
- **Expected:**
  - Calls `getTrumpSuit` with exact new deck
  - Passes trump card to `buildHandStatute`

#### Test 2.5: Builds statute with incremented handNumber

- **Setup:**
  - Original gameState
  - Mock dependencies
- **Expected:**
  - Calls `buildHandStatute({ ...gameState, handNumber: original + 1 }, trumpCard)`
  - Uses incremented value

#### Test 2.6: Creates trickPoints for all players with zero scores

- **Setup:**
  - Mock `buildHandStatute` returns statute with playerOrder = [Alice, Bob, Charlie, Dave]
- **Expected:**
  - `updates.trickPoints = [{ player: Alice, score: 0 }, { player: Bob, score: 0 }, { player: Charlie, score: 0 }, { player: Dave, score: 0 }]`

#### Test 2.7: Sets clearTrick flag to true

- **Setup:** Valid initialization
- **Expected:**
  - `updates.clearTrick = true`
- **Rationale:** Signal to clear any existing trick

#### Test 2.8: Returns statute response as retval

- **Setup:**
  - Mock `toHandStatute` returns specific response
- **Expected:**
  - `retval` equals that response

#### Test 2.9: Returns empty trick response as broadcastValue

- **Setup:**
  - Mock `emptyTrickResponse` returns specific response
- **Expected:**
  - `broadcastValue` equals that response

#### Test 2.10: Passes updatedGameState.players to emptyTrickResponse

- **Setup:**
  - `gameState.players = [Alice, Bob, Charlie, Dave]`
- **Expected:**
  - Calls `emptyTrickResponse([Alice, Bob, Charlie, Dave])`
  - Uses players from gameState, not from statute

### 3. Different Player Counts

#### Test 3.1: Works with 3 players (max 12 hands)

- **Setup:**
  - 3 players
  - `gameState.handNumber = 10`
- **Expected:**
  - Allows initialization (10 < 12)
  - Creates trickPoints for 3 players

#### Test 3.2: Throws GAME_ENDED at correct limit for 3 players

- **Setup:**
  - 3 players
  - `gameState.handNumber = 12`
- **Expected:** Throws `GAME_ENDED`

#### Test 3.3: Works with 5 players (max 20 hands)

- **Setup:**
  - 5 players
  - `gameState.handNumber = 19`
- **Expected:** Allows initialization

### 4. State Update Verification

#### Test 4.1: Updates state with new handNumber and statute

- **Setup:**
  - Original gameState with handNumber = 3
  - Mock `buildHandStatute` returns new statute
- **Expected:**
  - `updates.state.handNumber = 4`
  - `updates.state.handStatute` equals new statute
  - Other gameState properties preserved

#### Test 4.2: Preserves existing trickScores in gameState

- **Setup:**
  - `gameState.trickScores = [score1, score2, score3]`
- **Expected:**
  - `updates.state.trickScores` equals original array
  - Scores not modified

#### Test 4.3: Preserves players list

- **Setup:**
  - `gameState.players = [Alice, Bob, Charlie]`
- **Expected:**
  - `updates.state.players` equals original array

### 5. First Hand Initialization

#### Test 5.1: Works when initializing hand 1 to hand 2

- **Setup:**
  - `gameState.handNumber = 1`
  - Mock `noCardsLeft` returns `true`
- **Expected:**
  - Increments to handNumber = 2
  - Initializes correctly

### 6. Edge Cases

#### Test 6.1: Works when currentDeck is empty array

- **Setup:**
  - `currentDeck = []`
  - Mock `noCardsLeft([])` returns `true`
- **Expected:** Proceeds with initialization

#### Test 6.2: Works when currentDeck has all cards played

- **Setup:**
  - currentDeck with 52 cards, all `isPlayed: true`
  - Mock `noCardsLeft` returns `true`
- **Expected:** Proceeds with initialization

#### Test 6.3: Statute playerOrder determines trickPoints order

- **Setup:**
  - Mock `buildHandStatute` returns statute with playerOrder = [Bob, Alice, Dave, Charlie]
- **Expected:**
  - `trickPoints` array follows that exact order

### 7. Integration Points

#### Test 7.1: Passes correct gameState snapshot to buildHandStatute

- **Setup:**
  - Original gameState with handNumber = 5
  - Other properties: players, trickScores, etc.
- **Expected:**
  - Calls `buildHandStatute` with spread gameState but handNumber = 6
  - All other properties unchanged in passed object

#### Test 7.2: Uses statute from buildHandStatute in updated state

- **Setup:**
  - Mock `buildHandStatute` returns specific statute object
- **Expected:**
  - `updates.state.handStatute` is exact same object reference

### 8. Boundary Conditions

#### Test 8.1: Last possible hand (4 players, hand 15 → 16)

- **Setup:**
  - 4 players
  - `gameState.handNumber = 15`
- **Expected:**
  - Allows initialization to hand 16
  - Next call would throw GAME_ENDED

#### Test 8.2: First hand of game (hand 0 → 1, if applicable)

- **Setup:**
  - `gameState.handNumber = 0`
- **Expected:** Increments to 1

Note: Verify if handNumber starts at 0 or 1 in actual game rules
