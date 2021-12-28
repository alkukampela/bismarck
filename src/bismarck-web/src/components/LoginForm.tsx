import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const target = event.target as typeof event.target & {
      token: { value: string };
    };

    const token = target.token.value;
    navigate('/login', { state: { token } });
  };

  return (
    <>
      <h1>Syötä kirjautumistunniste</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="token">
            Kirjautumistunniste:
            <input
              type="text"
              name="token"
              id="token"
              className="name"
              defaultValue=""
              pattern="[A-Za-z0-9]{5}"
              required
            />
          </label>
          <input type="submit" value="Kirjaudu" />
        </form>
      </div>
    </>
  );
};
