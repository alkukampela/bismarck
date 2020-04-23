import { GameType } from '../types/game-type';
import { HandStatute, HandType } from '../types/hand-statute';
import { Player } from '../types/player';
import { Suit } from '../types/suit';

export class HandStatuteMachine {
  public getHandStatute(
    defaultPlayerOrder: Player[],
    handNumber: number,
    trumpSuit: Suit
  ): HandStatute {
    const handType = {
      isChoice: this.isChoiceTurn(handNumber, defaultPlayerOrder.length),
      gameType: this.determineGameType(
        handNumber,
        defaultPlayerOrder.length,
        trumpSuit
      ),
    };

    const playerOrder = this.switchTurns(defaultPlayerOrder, handNumber);

    return {
      handType,
      playerOrder,
    };
  }

  public chooseGameType(
    handStatute: HandStatute,
    chosenGameType: GameType,
    trumpSuit?: Suit
  ): HandStatute {
    const handType = {
      isChoice: true,
      gameType: {
        value: chosenGameType,
        ...(chosenGameType === GameType.TRUMP && { trumpSuit }),
      },
    };

    return { ...handStatute, handType };
  }

  private determineGameType(
    handNumber: number,
    playerCount: number,
    trumpSuit: Suit
  ): {
    value: GameType;
    trumpSuit?: Suit;
  } {
    if (this.isChoiceTurn(handNumber, playerCount)) {
      return;
    }

    const gameType = this.predefinedGameType(handNumber, playerCount);

    return {
      value: gameType,
      ...(gameType === GameType.TRUMP && { trumpSuit }),
    };
  }

  private isChoiceTurn(handNumber: number, playerCount: number): boolean {
    return handNumber >= playerCount * 3;
  }

  private predefinedGameType(handNumber: number, playerCount: number) {
    switch (Math.trunc(handNumber / playerCount)) {
      case 0:
        return GameType.TRUMP;
      case 1:
        return GameType.NO_TRUMP;
      case 2:
        return GameType.MISERE;
    }
  }

  private switchTurns(playerOrder: Player[], times: number): Player[] {
    if (times > 0) {
      return this.switchTurns(
        [...playerOrder.slice(1), playerOrder[0]],
        times - 1
      );
    }

    return playerOrder;
  }
}
