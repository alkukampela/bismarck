import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactPinField, PinField } from 'react-pin-field';

export const LoginForm = () => {
  const [submitDisabled, setSubmitDisabled] = React.useState<boolean>(true);

  const navigate = useNavigate();
  const loginIdFieldRef = React.useRef<PinField | null>(null);

  const handleChange = () => {
    setSubmitDisabled(true);
  };

  const handleComplete = () => {
    setSubmitDisabled(false);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    let loginId = '';
    loginIdFieldRef.current?.inputs.forEach((singleCharInput) => {
      loginId += singleCharInput.value;
    });

    navigate('/login', { state: { loginId } });
  };

  return (
    <div className="login-form-container">
      <h2>Peliin liittyminen</h2>
      <p>Syötä sähköpostissa saamasi kirjautumiskoodi:</p>
      <form onSubmit={handleSubmit} className="loginForm">
        <ReactPinField
          className="login-id-field"
          length={5}
          name="loginIdField"
          id="loginIdField"
          onChange={handleChange}
          onComplete={handleComplete}
          ref={loginIdFieldRef}
          format={(input) => input.toUpperCase()}
        />
        <input
          type="submit"
          value="Pelaamaan"
          disabled={submitDisabled}
        />
      </form>
    </div>
  );
};
