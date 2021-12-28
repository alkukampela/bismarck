import { TokenResponse } from '../../../types/token-response';
import { fetchToken } from '../services/api-service';
import * as React from 'react';
import { useParams, Navigate } from 'react-router-dom';

export const LoginHandler: React.FunctionComponent = () => {
  const [gameId, setGameId] = React.useState<string>('');
  const { identifier } = useParams()

  const getTokenResponse = async (identifier: string): Promise<TokenResponse> =>
    fetchToken(identifier, { gameId: '', player: { name: '' }, token: '' });

  React.useEffect(() => {
    if (!identifier) {
      return
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
        />
      )}
      <h1>Virheellinen tunniste</h1>
    </>
  );
};
