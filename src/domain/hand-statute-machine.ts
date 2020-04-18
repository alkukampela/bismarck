import { Player } from './player';
import { GameType } from '../types/game-type';
import { HandStatute, HandType } from '../types/hand-statute';
import { Suit } from '../types/suit';

export class HandStatuteMachine {
  public getHandStatute(
    defaultPlayerOrder: Player[],
    handNumber: number,
    trumpSuit: Suit
  ): HandStatute {
    return this.calculateStatute(handNumber, defaultPlayerOrder, trumpSuit);
  }

  public getChoiceHandStatute(
    defaultPlayerOrder: Player[],
    handNumber: number,
    chosenGameType: GameType,
    trumpSuit?: Suit
  ): HandStatute {
    return this.calculateStatute(
      handNumber,
      defaultPlayerOrder,
      trumpSuit,
      chosenGameType
    );
  }

  private calculateStatute(
    handNumber: number,
    defaultPlayerOrder: Player[],
    trumpSuit: Suit,
    chosenGameType?: GameType
  ): HandStatute {
    const handType = {
      isChoice: this.isChoiceTurn(handNumber, defaultPlayerOrder.length),
      gameType: this.determineGameType(
        handNumber,
        defaultPlayerOrder.length,
        trumpSuit,
        chosenGameType
      ),
    };

    const playerOrder = this.switchTurns(
      defaultPlayerOrder,
      handNumber
    ).map((player) => player.getName());

    return {
      handType,
      playerOrder,
    };
  }

  private determineGameType(
    handNumber: number,
    playerCount: number,
    trumpSuit: Suit,
    chosenGameType?: GameType
  ): {
    value: GameType;
    trumpSuit?: Suit;
  } {
    if (this.isChoiceTurn(handNumber, playerCount) && !chosenGameType) {
      return;
    }

    const gameType =
      chosenGameType || this.predefinedGameType(handNumber, playerCount);

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
