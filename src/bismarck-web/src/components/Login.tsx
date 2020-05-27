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
    fetchToken(identifier, { gameId: '', token: '' });

  React.useEffect(() => {
    console.log(props.match.params.identifier);
    getTokenResponse(props.match.params.identifier).then((tokenResponse) => {
      if (!!tokenResponse.gameId) {
        setGameId(tokenResponse.gameId);
      }
      // TODO: add token to react context
    });
  }, []);

  return (
    <div>
      <h1>{props.match.params.identifier}</h1>
      {!!gameId && (
        <Redirect
          push
          to={{
            pathname: '/',
            search: `game=${gameId}`,
          }}
        />
      )}
    </div>
  );
};
