import { default as ReconnectingWebSocket } from 'reconnecting-websocket';

export class SocketFactory {
  private static _instance: ReconnectingWebSocket;

  private static initSocket(gameId: string) {
    const buildLocalWsUrl = (url: string, gameId: string) => {
      const urlObj = new URL(url);
      const wsProtocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${urlObj.host}?gameId=${gameId}`;
    };

    const buildCloudflareWsUrl = (loc: Location, gameId: string) => {
      const wsProtocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${loc.host}/api?gameId=${gameId}`;
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const wsFullUrl = API_URL
      ? buildLocalWsUrl(API_URL, gameId)
      : buildCloudflareWsUrl(window.location, gameId);

    return new ReconnectingWebSocket(wsFullUrl, [], {
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
