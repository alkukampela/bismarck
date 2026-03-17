import { default as ReconnectingWebSocket } from 'reconnecting-websocket';

export class SocketFactory {
  private static _instance: ReconnectingWebSocket;

  private static initSocket(gameId: string) {
    const buildWsUrl = (host: string, protocol: string | null) => {
      const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${host}`;
    };

    const wsUrlFromHttpUrl = (url: string): string => {
      const urlObj = new URL(url);
      return buildWsUrl(urlObj.host || '', urlObj.protocol);
    };

    const isLocal = (wsUrl: string) => {
      return wsUrl.includes('localhost') || wsUrl.includes('127.0.0.1');
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const wsUrl = wsUrlFromHttpUrl(API_URL);
    const wsPath = isLocal(API_URL) ? '' : '/api';

    return new ReconnectingWebSocket(`${wsUrl}${wsPath}?gameId=${gameId}`, [], {
      maxRetries: 20,
      reconnectionDelayGrowFactor: 1.6,
    });
  }

  public static getSocket(gameId: string): ReconnectingWebSocket {
    if (!this._instance) {
      this._instance = this.initSocket(gameId);
    }
    return this._instance;
  }

  public static reset(): void {
    if (this._instance) {
      this._instance.close();
      // @ts-expect-error - force reset of the instance
      this._instance = undefined;
    }
  }
}
