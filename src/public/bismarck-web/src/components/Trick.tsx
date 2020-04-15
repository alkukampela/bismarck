import * as React from 'react';
import PlayerCard from './PlayerCard';

export default class Trick extends React.Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="trick">
        {this.props.trick.cards.map((playerCard: any, index: number) => (
          <PlayerCard playerCard={playerCard} key={index} />
        ))}
      </div>
    );
  }
}
