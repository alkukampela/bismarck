import { CreateGame } from './CreateGame';
import { GameContainer } from './GameContainer';
import { GameInstructions } from './GameInstructions';
import { LoginHandler } from './LoginHandler';
import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/create" element={<CreateGame />}/>
        <Route path="/login/:identifier" element={<LoginHandler />}/>
        <Route path="/" element={<GameContainer />} />
      </Routes>
      <GameInstructions />
    </BrowserRouter>
  );
};
