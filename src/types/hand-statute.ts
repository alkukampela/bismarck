export interface HandStatute {
  handType: HandType;
  playerOrder: string[];
}

export interface HandType {
  isChoice: boolean;
  gameType?: {
    value: string;
    trumpSuit?: string;
  };
}
