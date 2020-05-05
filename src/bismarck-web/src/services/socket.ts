import { parse } from 'url';

const initSocket = () => {
  const hups = (host: string, protocol?: string) => {
    const wsProtocol = protocol === 'http:' ? 'ws:' : 'wss:';
    return `${wsProtocol}//${host}`;
  };

  const wsUrlFromHttpUrl = (url: string): string => {
    const parsed = parse(url);
    console.log(parsed);
    return hups(parsed.host || '', parsed.protocol);
  };

  const wsUrlFromLocation = (url: Location): string => {
    return hups(url.host, url.protocol);
  };

  const API_URL = process.env.REACT_APP_API_URL;

  const wsUrl = !!API_URL
    ? wsUrlFromHttpUrl(API_URL)
    : wsUrlFromLocation(window.location);

  return new WebSocket(`${wsUrl}?gameId=451`);
};

export const socket = initSocket();
