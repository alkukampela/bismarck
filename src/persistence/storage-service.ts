import { Card } from '../types/card';
import { HandStatute } from '../types/hand-statute';
import { PlayerScore } from '../types/player-score';
import Redis from 'ioredis';
import { Trick } from '../types/trick';
import { Game } from '../types/game';

export type CardContainer = {
  card: Card;
  isPlayed: boolean;
};

export class StorageService {
  private static _instance: StorageService;

  private redis: Redis.Redis;

  private constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  public static getInstance() {
    return this._instance || (this._instance = new this());
  }

  public storeGame(identifier: string, game: Game): void {
    this.store(this.getGamesKey(identifier), game);
  }

  public async fetchGame(identifier: string): Promise<Game> {
    const result = await this.fetch(this.getGamesKey(identifier));
    return JSON.parse(result);
  }

  public storeCards(identifier: string, cards: CardContainer[]): void {
    this.store(this.getCardsKey(identifier), cards);
  }

  public async fetchCards(identifier: string): Promise<CardContainer[]> {
    const result = await this.fetch(this.getCardsKey(identifier));
    return JSON.parse(result);
  }

  public storeScores(identifier: string, scores: PlayerScore[]): void {
    this.store(this.getScoresKey(identifier), scores);
  }

  public async fetchScores(identifier: string): Promise<PlayerScore[]> {
    const result = await this.fetch(this.getScoresKey(identifier));
    return JSON.parse(result);
  }

  public storeHandStatute(identifier: string, statute: HandStatute): void {
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

  private store(
    key: string,
    subject: CardContainer[] | PlayerScore[] | HandStatute | Trick | Game
  ): void {
    this.redis.set(key, JSON.stringify(subject));
  }

  private async fetch(key: string): Promise<string> {
    return this.redis.get(key);
  }

  private getGamesKey(identifier: string): string {
    return 'game:' + identifier;
  }

  private getScoresKey(identifier: string) {
    return 'cards:' + identifier;
  }

  private getCardsKey(identifier: string) {
    return 'scores:' + identifier;
  }

  private getHandStatuteKey(identifier: string): string {
    return 'statute:' + identifier;
  }

  private getTrickKey(identifier: string): string {
    return 'trick:' + identifier;
  }
}
