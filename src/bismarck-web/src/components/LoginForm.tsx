import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const target = event.target as typeof event.target & {
      loginId: { value: string };
    };

    const loginId = target.loginId.value;
    navigate('/login', { state: { loginId } });
  };

  return (
    <>
      <h1>Syötä kirjautumistunniste</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="loginId">
            Kirjautumistunniste:
            <input
              type="text"
              name="loginId"
              id="loginId"
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
