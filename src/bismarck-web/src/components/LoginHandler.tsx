import { TokenResponse } from '../../../types/token-response';
import { fetchToken } from '../services/api-service';
import * as React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

interface LoginIdState {
  loginId: string;
}

export const LoginHandler: React.FunctionComponent = () => {
  const [gameId, setGameId] = React.useState<string>('');

  const getTokenResponse = async (identifier: string): Promise<TokenResponse> =>
    fetchToken(identifier);

  const location = useLocation();

  React.useEffect(() => {
    const state = location.state as LoginIdState;
    const loginId = state.loginId || '';

    if (!loginId) {
      return;
    }

    getTokenResponse(loginId).then((tokenResponse) => {
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
      <div className="delayedError">
        <h1>Virheellinen tunniste</h1>
      </div>
    </>
  );
};
