import { useInput } from '../hooks/useInput';
import { RegisterPlayer } from '../../../types/register-player';
import * as React from 'react';
import { createGame } from '../services/api-service';
import { Redirect } from 'react-router-dom';

export const Create = () => {
  const [gameId, setGameId] = React.useState<string>('');

  const { value: email1, bind: bindEmail1 } = useInput('');
  const { value: email2, bind: bindEmail2 } = useInput('');
  const { value: email3, bind: bindEmail3 } = useInput('');
  const { value: playerName1, bind: bindPlayerName1 } = useInput('');
  const { value: playerName2, bind: bindPlayerName2 } = useInput('');
  const { value: playerName3, bind: bindPlayerName3 } = useInput('');

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const registerPlayers: RegisterPlayer[] = [
      { email: email1, player: { name: playerName1 } },
      { email: email2, player: { name: playerName2 } },
      { email: email3, player: { name: playerName3 } },
    ];

    createGame({ players: registerPlayers }).then((response) => {
      setGameId(response.id);
    });
  };

  return (
    <div>
      <h1>Alusta peli</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <fieldset>
            <label>
              Email:
              <input type="email" {...bindEmail1} required />
            </label>
            <label>
              Player Name:
              <input type="text" {...bindPlayerName1} required />
            </label>
          </fieldset>
        </div>
        <div>
          <fieldset>
            <label>
              Email:
              <input type="email" {...bindEmail2} required />
            </label>
            <label>
              Player Name:
              <input type="text" {...bindPlayerName2} required />
            </label>
          </fieldset>
        </div>
        <div>
          <fieldset>
            <label>
              Email:
              <input type="email" {...bindEmail3} required />
            </label>
            <label>
              Player Name:
              <input type="text" {...bindPlayerName3} required />
            </label>
          </fieldset>
        </div>
        <input type="submit" value="Submit" />
      </form>
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
