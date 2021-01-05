import { RegisterPlayer } from '../../../types/register-player';
import { createGame } from '../services/api-service';
import * as React from 'react';
import { Redirect } from 'react-router-dom';

export const Create = () => {
  const MIN_PLAYERS = 3;
  const MAX_PLAYERS = 4;

  const emptyPlayer = { player: { name: '' }, email: '' };

  const [gameId, setGameId] = React.useState<string>('');

  const [players, setPlayers] = React.useState<RegisterPlayer[]>(
    Array(MIN_PLAYERS).fill({ ...emptyPlayer })
  );

  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, { ...emptyPlayer }]);
    }
  };

  const removePlayer = () => {
    if (players.length > MIN_PLAYERS) {
      setPlayers(players.slice(0, -1));
    }
  };

  const handleEmailChange = (e: any) => {
    const updatedPlayers = [...players];
    updatedPlayers[e.target.dataset.idx] = {
      ...updatedPlayers[e.target.dataset.idx],
      email: e.target.value,
    };
    setPlayers(updatedPlayers);
  };

  const handleNameChange = (e: any) => {
    const updatedPlayers = [...players];
    updatedPlayers[e.target.dataset.idx] = {
      ...updatedPlayers[e.target.dataset.idx],
      player: { name: e.target.value },
    };
    setPlayers(updatedPlayers);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const registerPlayers: RegisterPlayer[] = players;

    createGame({ players: registerPlayers }).then((response) => {
      setGameId(response.id);
    });
  };

  return (
    <div>
      <h1>Alusta peli</h1>
      <p>{`Syötä pelaajien (${MIN_PLAYERS}-${MAX_PLAYERS} kpl) tiedot`}</p>

      <form onSubmit={handleSubmit} className="create-form">
        <div className="plus_minus_buttons">
          <input
            type="button"
            value="Lisää"
            onClick={addPlayer}
            disabled={players.length >= MAX_PLAYERS}
          />
          <input
            type="button"
            value="Poista"
            onClick={removePlayer}
            disabled={players.length <= MIN_PLAYERS}
          />
        </div>
        {players.map((_val, idx) => {
          const nameId = `name-${idx}`;
          const emailId = `email-${idx}`;
          return (
            <fieldset key={`player-${idx}`}>
              <legend>{`${idx + 1}. pelaaja`}</legend>
              <label>
                Nimi:
                <input
                  type="text"
                  name={nameId}
                  data-idx={idx}
                  id={nameId}
                  className="name"
                  value={players[idx].player.name}
                  onChange={handleNameChange}
                  required
                />
              </label>
              <label>
                Sähköpostiosoite:
                <input
                  type="email"
                  name={emailId}
                  data-idx={idx}
                  id={emailId}
                  className="email"
                  value={players[idx].email}
                  onChange={handleEmailChange}
                  required
                />
              </label>
            </fieldset>
          );
        })}
        <input type="submit" value="Lähetä" />
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
