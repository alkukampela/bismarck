import * as React from 'react';

export default class Card extends React.Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

  private getCardClass = (suit: string) => {
    return `card ${['♦️', '♥️'].includes(suit) ? 'red-card' : 'black-card'}`;
  };

  render() {
    return (
      <div className={this.getCardClass(this.props.card.suit)}>
        <div className="suit">{this.props.card.suit}</div>
        <div className="rank">{this.props.card.rank}</div>
      </div>
    );
  }
}
