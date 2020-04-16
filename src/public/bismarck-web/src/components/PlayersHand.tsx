import * as React from 'react';
import Card from './Card';

export default class PlayersHand extends React.Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="playersCards">
        {this.props.cards.map((card: any, index: number) => (
          <Card card={card} key={index} />
        ))}
      </div>
    );
  }
}
