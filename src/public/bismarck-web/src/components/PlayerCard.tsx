import * as React from 'react';
import Card from './Card';

export default class PlayerCard extends React.Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div>
        <Card card={this.props.playerCard.card} />
        <h1>{this.props.playerCard.player}</h1>
      </div>
    );
  }
}
