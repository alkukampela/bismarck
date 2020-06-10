import { TokenResponse } from '../../../types/token-response';
import { fetchToken } from '../services/api-service';
import * as React from 'react';
import { Redirect } from 'react-router-dom';

interface Identifier {
  match: {
    params: {
      identifier: string;
    };
  };
}

export const Login: React.SFC<Identifier> = (props) => {
  const [gameId, setGameId] = React.useState<string>('');

  const getTokenResponse = async (identifier: string): Promise<TokenResponse> =>
    fetchToken(identifier, { gameId: '', player: { name: '' }, token: '' });

  React.useEffect(() => {
    getTokenResponse(props.match.params.identifier).then((tokenResponse) => {
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
    <div>
      {!!gameId && (
        <Redirect
          push
          to={{
            pathname: '/',
            search: `game=${gameId}`,
          }}
        />
      )}
      <h1>Virheellinen tunniste</h1>
    </div>
  );
};
