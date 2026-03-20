import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import PinField from 'react-pin-field';

export const LoginForm = (): React.ReactElement => {
  const [submitDisabled, setSubmitDisabled] = React.useState(true);
  const [loginId, setLoginId] = React.useState('');
  const navigate = useNavigate();
  const loginIdFieldRef = React.useRef<HTMLInputElement[] | null>(null);

  const handleChange = (value: string) => {
    setLoginId(value);
    setSubmitDisabled(true);
  };

  const handleComplete = (value: string) => {
    setLoginId(value);
    setSubmitDisabled(false);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    navigate('/login', { state: { loginId } });
  };

  return (
    <div className="login-form-container">
      <h2>Peliin liittyminen</h2>
      <p>Syötä sähköpostissa saamasi kirjautumiskoodi:</p>
      <form onSubmit={handleSubmit} className="loginForm">
        <PinField
          className="login-id-field"
          length={5}
          name="loginIdField"
          id="loginIdField"
          onChange={handleChange}
          onComplete={handleComplete}
          ref={loginIdFieldRef}
          format={(input) => input.toUpperCase()}
        />
        <input type="submit" value="Pelaamaan ⇒" disabled={submitDisabled} />
      </form>
    </div>
  );
};
