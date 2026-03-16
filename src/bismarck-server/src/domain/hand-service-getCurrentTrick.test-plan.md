# Test Plan: getCurrentTrick (Pure Unit Tests)

## Function Overview

**Function:** `getCurrentTrick`
**Location:** [hand-service.ts](hand-service.ts#L263-L278)
**Purpose:** Retrieve the current trick state, or a default trick if none exists.

### Function Signature

```typescript
export const getCurrentTrick = (
  trick: Trick | undefined,
  gameState: GameState | undefined
): ServiceResult<TrickResponse>
```

### Function Logic

1. Check `gameState` exists → throw `GAME_NOT_FOUND`
2. If trick exists → convert to TrickResponse
3. If trick is undefined → build default trick from gameState
4. Return TrickResponse with no updates

### Dependencies to Mock

- `convertToTrickResponse` from `trick-machine`
- `buildDefaultTrick` (internal helper that calls `emptyTrickResponse`)
- `emptyTrickResponse` from `trick-machine`

## Test Cases

### 1. Error Cases

#### Test 1.1: Throws GAME_NOT_FOUND when gameState is undefined

- **Setup:**
  - `gameState = undefined`
  - Any trick value
- **Expected:** Throws `GameError(ErrorTypes.GAME_NOT_FOUND)`
- **Rationale:** Cannot get trick without game context

### 2. Happy Path - Trick Exists

#### Test 2.1: Returns converted trick when trick is defined

- **Setup:**
  - Valid gameState
  - Valid trick object
  - Mock `convertToTrickResponse` to return specific TrickResponse
- **Expected:**
  - Calls `convertToTrickResponse(trick)` with exact trick object
  - Does not call `emptyTrickResponse`
  - Returns `{ updates: {}, retval: mockedTrickResponse }`

#### Test 2.2: Passes through complete trick data

- **Setup:**
  - Trick with multiple cards
  - Mock `convertToTrickResponse`
- **Expected:**
  - Verifies exact trick object passed to converter
  - Returns `{ updates: {}, retval: mockedTrickResponse }`

#### Test 2.3: Works with trick in progress (partial cards)

- **Setup:**
  - Trick with 2 out of 4 cards played
- **Expected:**
  - Converts and returns `{ updates: {}, retval: trickResponse }`

#### Test 2.4: Works with completed trick (all cards)

- **Setup:**
  - Trick with all 4 cards played
- **Expected:**
  - Converts and returns `{ updates: {}, retval: trickResponse }`

### 3. Happy Path - No Trick (Default)

#### Test 3.1: Returns default trick when trick is undefined

- **Setup:**
  - Valid gameState with playerOrder
  - `trick = undefined`
  - Mock `emptyTrickResponse` to return default response
- **Expected:**
  - Does not call `convertToTrickResponse`
  - Calls `emptyTrickResponse(gameState.handStatute.playerOrder)`
  - Returns `{ updates: {}, retval: mockedEmptyResponse }`

#### Test 3.2: Passes correct playerOrder to emptyTrickResponse

- **Setup:**
  - gameState with specific playerOrder = [Alice, Bob, Charlie, Dave]
  - `trick = undefined`
- **Expected:**
  - Calls `emptyTrickResponse` with exact playerOrder array
  - Returns `{ updates: {}, retval: defaultTrickResponse }`

#### Test 3.3: Works at start of hand (no tricks yet)

- **Setup:**
  - New hand, no tricks started
  - `trick = undefined`
- **Expected:**
  - Returns `{ updates: {}, retval: defaultTrickResponse }`

### 4. State Verification

#### Test 4.1: Does not modify input trick object

- **Setup:** Valid trick
- **Expected:**
  - Input trick remains unchanged
  - Only returns converted response

#### Test 4.2: Does not modify gameState

- **Setup:** Valid inputs
- **Expected:**
  - gameState object unchanged
  - No mutations

### 5. Edge Cases

#### Test 5.1: Works with 3-player game

- **Setup:**
  - gameState with 3 players
  - `trick = undefined`
- **Expected:**
  - Returns `{ updates: {}, retval: defaultTrickResponse }` for 3 players

#### Test 5.2: Works with 4-player game

- **Setup:**
  - gameState with 4 players
  - `trick = undefined`
- **Expected:**
  - Returns `{ updates: {}, retval: defaultTrickResponse }` for 4 players

#### Test 5.3: Handles empty playerOrder edge case

- **Setup:**
  - gameState with empty playerOrder (edge case)
- **Expected:**
  - Passes empty array to `emptyTrickResponse`
  - Returns `{ updates: {}, retval: defaultTrickResponse }`
