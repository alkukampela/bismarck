import { CreateGame } from './CreateGame';
import { GameContainer } from './GameContainer';
import { LoginHandler } from './LoginHandler';
import { Instructions } from './Instructions';
import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/create" element={<CreateGame />} />
        <Route path="/login" element={<LoginHandler />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/" element={<GameContainer />} />
      </Routes>
    </BrowserRouter>
  );
};
