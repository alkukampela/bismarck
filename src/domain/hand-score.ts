import { StorageService } from '../persistence/storage-service';
import { GameType } from '../types/game-type';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';

export class HandScore {
  private _storageService: StorageService;

  constructor() {
    this._storageService = StorageService.getInstance();
  }

  public setUp(players: Player[], gameId: string): void {
    this._storageService.storeScores(
      gameId,
      players.map((player) => {
        return { player, score: 0 } as PlayerScore;
      })
    );
  }

  public takeTrick(player: Player, gameId: string): void {
    this._storageService.fetchScores(gameId).then((scores) => {
      scores
        .filter((score) => player.name === score.player.name)
        .forEach((x) => x.score++);
      this._storageService.storeScores(gameId, scores);
    });
  }

  public async getTricks(gameId: string): Promise<PlayerScore[]> {
    return this._storageService.fetchScores(gameId);
  }

  public async getScores(
    gameType: GameType,
    gameId: string
  ): Promise<PlayerScore[]> {
    return this._storageService.fetchScores(gameId).then((scores) =>
      scores.map((playerScore) => {
        return {
          player: playerScore.player,
          score: this.countHandScore(playerScore, scores, gameType),
        };
      })
    );
  }

  countHandScore(
    playerScore: PlayerScore,
    scores: PlayerScore[],
    gameType: GameType
  ): number {
    return this.isEldestHand(playerScore.player, scores)
      ? this.countScoreForEldestHand(playerScore.score, gameType)
      : this.countScoreForNonEldestHand(playerScore.score, gameType);
  }

  private isEldestHand(player: Player, scores: PlayerScore[]): boolean {
    return player === scores[0].player;
  }

  private countScoreForEldestHand(tricks: number, gameType: GameType): number {
    return gameType !== GameType.MISERE ? tricks - 6 : tricks * -1;
  }

  private countScoreForNonEldestHand(
    tricks: number,
    gameType: GameType
  ): number {
    return gameType !== GameType.MISERE ? tricks - 2 : 4 - tricks;
  }
}
