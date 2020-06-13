import { Game } from '../types/game';
import { GameType } from '../types/game-type';
import { GameTypeChoice } from '../types/game-type-choice';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import { Suit } from '../types/suit';

export class HandStatuteMachine {
  public getHandStatute(
    game: Game,
    trumpSuit: Suit,
    tricks: number
  ): HandStatute {
    const handType = {
      isChoice: this.isChoiceTurn(game.handNumber, game.players.length),
      gameType: this.determineGameType(
        game.handNumber,
        game.players.length,
        trumpSuit
      ),
    };

    const playerOrder = this.switchTurns(game.players, game.handNumber);

    return {
      eldestHand: playerOrder[0],
      handType,
      playerOrder,
      playersInGame: playerOrder.length,
      tricks,
    };
  }

  public chooseGameType(
    handStatute: HandStatute,
    gameTypeChoice: GameTypeChoice
  ): HandStatute {
    const handType = {
      isChoice: true,
      gameType: {
        value: gameTypeChoice.gameType,
        ...(gameTypeChoice.gameType === GameType.TRUMP && {
          trumpSuit: gameTypeChoice.trumpSuit,
        }),
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
