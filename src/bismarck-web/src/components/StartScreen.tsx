import * as React from 'react';
import { LoginForm } from './LoginForm';
import { GameTitle } from './GameTitle';

export const StartScreen = (): React.ReactElement => {
  return (
    <div className="start-screen-container">
      <GameTitle />
      <LoginForm />
    </div>
  );
};
