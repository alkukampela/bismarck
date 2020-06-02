import { Create } from './Create';
import { Game } from './Game';
import { Help } from './Help';
import { Login } from './Login';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

export const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/create">
          <Create />
        </Route>
        <Route exact path="/login/:identifier" component={Login} />
        <Route path="/help">
          <Help />
        </Route>
        <Route path="/">
          <Game />
        </Route>
      </Switch>
    </Router>
  );
};
