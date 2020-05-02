const initSocket = () => {
  const WS_URL = process.env.REACT_APP_WS_URL || 'UNDEFINED';
  return new WebSocket(WS_URL);
};

export const socket = initSocket();
