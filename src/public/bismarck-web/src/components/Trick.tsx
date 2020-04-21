import * as React from 'react';
import { TrickCard } from './TrickCard';

export default class Trick extends React.Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="trick">
        {this.props.trick.cards.map((playerCard: any, index: number) => (
          <TrickCard trickCard={playerCard} key={index} />
        ))}
      </div>
    );
  }
}
