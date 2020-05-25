import { Create } from './Create';
import { Game } from './Game';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

export const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/create">
          <Create />
        </Route>
        <Route path="/">
          <Game />
        </Route>
      </Switch>
    </Router>
  );
};
