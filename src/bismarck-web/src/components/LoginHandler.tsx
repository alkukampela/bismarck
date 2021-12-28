import { TokenResponse } from '../../../types/token-response';
import { fetchToken } from '../services/api-service';
import * as React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

interface TokenState {
  token: string;
}

export const LoginHandler: React.FunctionComponent = () => {
  const [gameId, setGameId] = React.useState<string>('');

  const getTokenResponse = async (identifier: string): Promise<TokenResponse> =>
    fetchToken(identifier, { gameId: '', player: { name: '' }, token: '' });

  const location = useLocation();

  React.useEffect(() => {
    const state = location.state as TokenState;
    const identifier = state.token || '';

    if (!identifier) {
      return;
    }

    getTokenResponse(identifier).then((tokenResponse) => {
      if (!!tokenResponse.gameId) {
        sessionStorage.setItem(
          `token_${tokenResponse.gameId}`,
          tokenResponse.token
        );
        sessionStorage.setItem(
          `player_${tokenResponse.gameId}`,
          tokenResponse.player.name
        );
        setGameId(tokenResponse.gameId);
      }
    });
  }, []);

  return (
    <>
      {!!gameId && (
        <Navigate
          to={{
            pathname: '/',
            search: `game=${gameId}`,
          }}
          replace={true}
        />
      )}
      <h1>Virheellinen tunniste</h1>
    </>
  );
};
