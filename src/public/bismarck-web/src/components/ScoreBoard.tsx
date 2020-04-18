import * as React from 'react';
import { PlayerScore } from '../../../../types/player-score';

export default class ScoreBoard extends React.Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="scoreboard">
        <h1>Tilanne</h1>
        {this.props.totalScore.map((value: PlayerScore, index: number) => (
          <div key={index}>
            {value.player}: {value.score}
          </div>
        ))}
      </div>
    );
  }
}
