import * as React from 'react';
import { LoginForm } from './LoginForm';
import { GameTitle } from './GameTitle';

export const StartScreen = () => {
  return (
    <>
      <GameTitle />
      <LoginForm />
    </>
  );
};
