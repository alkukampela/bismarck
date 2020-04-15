import * as React from 'react';

export default class PlayerCard extends React.Component<any, {}> {
  constructor(props: any) {
    super(props);
    console.log(this.props);
  }

  render() {
    return (
      <div>
        <div className="card">
          <div className="suit">{this.props.playerCard.card.suit}</div>
          <div className="rank">{this.props.playerCard.card.rank}</div>
        </div>
        <h1>{this.props.playerCard.player}</h1>
      </div>
    );
  }
}
