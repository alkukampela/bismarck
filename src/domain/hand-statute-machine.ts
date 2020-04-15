import { Player } from './player';
import { CardEntity } from './card-entity';
import { Suit } from './suit';
import { GameType } from './game-type';
import { HandStatute, HandType } from '../types/hand-statute';

export class HandStatuteMachine {
  public getHandStatute(
    defaultPlayerOrder: Player[],
    handNumber: number,
    openCard: CardEntity
  ): HandStatute {
    const handType = this.getHandType(
      handNumber,
      defaultPlayerOrder.length,
      openCard
    );

    const playerOrder = this.switchTurns(
      defaultPlayerOrder,
      handNumber
    ).map((player) => player.getName());

    return {
      handType,
      playerOrder,
    };
  }

  private getHandType(
    handNumber: number,
    playerCount: number,
    openCard: CardEntity
  ): HandType {
    if (handNumber >= playerCount * 3) {
      return {
        isChoice: true,
      };
    }

    return {
      isChoice: false,
      gameType: this.getGameType(handNumber, playerCount, openCard.getSuit()),
    };
  }

  private getGameType(
    handNumber: number,
    playerCount: number,
    suit: Suit
  ): {
    value: string;
    trumpSuit?: string;
  } {
    const gameType = GameType[GameType[Math.trunc(handNumber / playerCount)]];

    if (gameType === GameType.TRUMP) {
      return {
        value: GameType[gameType],
        trumpSuit: Suit[suit],
      };
    }

    return {
      value: GameType[gameType],
    };
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
