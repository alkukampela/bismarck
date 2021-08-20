import { CreateGame } from './CreateGame';
import { GameContainer } from './GameContainer';
import { Instructions } from './Instructions';
import { Login } from './Login';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

export const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/create">
          <CreateGame />
        </Route>
        <Route exact path="/login/:identifier" component={Login} />
        <Route path="/">
          <GameContainer />
        </Route>
      </Switch>
      <Instructions />
    </Router>
  );
};
