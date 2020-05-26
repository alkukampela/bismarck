import { GamePlayer } from './game-player';
import { Trick } from './trick';
import { Card } from '../types/card';
import { Game } from '../types/game';
import { HandStatute } from '../types/hand-statute';
import { PlayerScore } from '../types/player-score';
import Redis from 'ioredis';

export type CardContainer = {
  card: Card;
  isPlayed: boolean;
};

export class StorageService {
  private static _instance: StorageService;

  private _redis: Redis.Redis;

  private constructor() {
    this._redis = new Redis(process.env.REDIS_URL);
  }

  public static getInstance() {
    return this._instance || (this._instance = new this());
  }

  public storeGame(game: Game, identifier: string): void {
    this.store(this.getGamesKey(identifier), game);
  }

  public async fetchGame(identifier: string): Promise<Game> {
    const result = await this.fetch(this.getGamesKey(identifier));
    return JSON.parse(result);
  }

  public storeCards(cards: CardContainer[], identifier: string): void {
    this.store(this.getCardsKey(identifier), cards);
  }

  public async fetchCards(identifier: string): Promise<CardContainer[]> {
    const result = await this.fetch(this.getCardsKey(identifier));
    return JSON.parse(result);
  }

  public storeScores(scores: PlayerScore[], identifier: string): void {
    this.store(this.getScoresKey(identifier), scores);
  }

  public async fetchScores(identifier: string): Promise<PlayerScore[]> {
    const result = await this.fetch(this.getScoresKey(identifier));
    return JSON.parse(result);
  }

  public storeHandStatute(statute: HandStatute, identifier: string): void {
    this.store(this.getHandStatuteKey(identifier), statute);
  }

  public async fetchHandStatute(identifier: string): Promise<HandStatute> {
    const result = await this.fetch(this.getHandStatuteKey(identifier));
    return JSON.parse(result);
  }

  public storeTrick(identifier: string, trick: Trick): void {
    this.store(this.getTrickKey(identifier), trick);
  }

  public async fetchTrick(identifier: string): Promise<Trick> {
    const result = await this.fetch(this.getTrickKey(identifier));
    return JSON.parse(result);
  }

  public clearTrick(identifier: string) {
    this.del(this.getTrickKey(identifier));
  }

  public storeTrickScores(trickScores: PlayerScore[][], identifier: string) {
    this.store(this.getTrickScoresKey(identifier), trickScores);
  }

  public async fetchTrickScores(identifier: string): Promise<PlayerScore[][]> {
    const result = await this.fetch(this.getTrickScoresKey(identifier));
    return JSON.parse(result);
  }

  public storeGamePlayer(gamePlayer: GamePlayer, identifier: string) {
    this.store(this.getGamePlayerKey(identifier), gamePlayer);
  }

  public async fetchGamePlayer(identifier: string): Promise<GamePlayer> {
    const result = await this.fetch(this.getGamePlayerKey(identifier));
    return JSON.parse(result);
  }

  private store(
    key: string,
    subject:
      | CardContainer[]
      | PlayerScore[]
      | HandStatute
      | Trick
      | Game
      | PlayerScore[][]
      | GamePlayer
  ): void {
    // TODO: expire keys, 24 hours?
    this._redis.set(key, JSON.stringify(subject));
  }

  private async fetch(key: string): Promise<string> {
    return this._redis.get(key);
  }

  private del(key: string) {
    this._redis.del(key);
  }

  private getGamesKey(identifier: string): string {
    return 'game:' + identifier;
  }

  private getScoresKey(identifier: string) {
    return 'scores:' + identifier;
  }

  private getCardsKey(identifier: string) {
    return 'cards:' + identifier;
  }

  private getHandStatuteKey(identifier: string): string {
    return 'statute:' + identifier;
  }

  private getTrickKey(identifier: string): string {
    return 'trick:' + identifier;
  }

  private getTrickScoresKey(identifier: string): string {
    return 'trickscores:' + identifier;
  }

  private getGamePlayerKey(identifier: string): string {
    return 'gameplayer:' + identifier;
  }
}
