import { parse } from 'url';
import { default as ReconnectingWebSocket } from 'reconnecting-websocket';

export class SocketFactory {
  // TODO use map with gameId as key
  private static _instance: ReconnectingWebSocket;

  private static initSocket(gameId: string) {
    const buildWsUrl = (host: string, protocol?: string) => {
      const wsProtocol = protocol === 'http:' ? 'ws:' : 'wss:';
      return `${wsProtocol}//${host}`;
    };

    const wsUrlFromHttpUrl = (url: string): string => {
      const parsed = parse(url);
      return buildWsUrl(parsed.host || '', parsed.protocol);
    };

    const wsUrlFromLocation = (url: Location): string => {
      return buildWsUrl(url.host, url.protocol);
    };

    const API_URL = process.env.REACT_APP_API_URL;

    const wsUrl = !!API_URL
      ? wsUrlFromHttpUrl(API_URL)
      : wsUrlFromLocation(window.location);

    return new ReconnectingWebSocket(`${wsUrl}?gameId=${gameId}`);
  }

  public static getSocket(gameId: string): ReconnectingWebSocket {
    if (!this._instance) {
      this._instance = this.initSocket(gameId);
    }
    return this._instance;
  }
}
