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

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const playerIndex = Number(event.target.dataset.idx);
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      email: event.target.value,
    };
    setPlayers(updatedPlayers);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const playerIndex = Number(event.target.dataset.idx);
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      player: { name: event.target.value },
    };
    setPlayers(updatedPlayers);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const registerPlayers: RegisterPlayer[] = players.map((input) => {
      return {
        email: input.email.trim(),
        player: { name: input.player.name.trim() },
      };
    });

    createGame({ players: registerPlayers }).then((response) => {
      setGameId(response.id);
    });
  };

  return (
    <div>
      <h1>Alusta peli</h1>

      <div className="tabbed-area">
        <input
          id="three-players"
          name="tab-group"
          type="radio"
          onClick={removePlayer}
          defaultChecked
        />
        <input
          id="four-players"
          name="tab-group"
          type="radio"
          onClick={addPlayer}
        />

        <div className="tabs">
          <label
            className="tab"
            id="three-players-tab"
            htmlFor="three-players"
            onClick={removePlayer}
          >
            3 pelaajaa
          </label>
          <label
            className="tab"
            id="four-players-tab"
            htmlFor="four-players"
            onClick={addPlayer}
          >
            4 pelaajaa
          </label>
        </div>
        <div className="panel">
          <h2>Syötä pelaajien tiedot</h2>

          <form onSubmit={handleSubmit} className="create-form">
            {players.map((_val, idx) => {
              const nameId = `name-${idx}`;
              const emailId = `email-${idx}`;
              return (
                <fieldset key={`player-${idx}`}>
                  <legend>{`${idx + 1}. pelaaja`}</legend>
                  <label htmlFor={nameId}>
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
                  <label htmlFor={emailId}>
                    Sähköposti:
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
        </div>
      </div>

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
