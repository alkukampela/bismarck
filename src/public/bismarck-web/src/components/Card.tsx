import * as React from 'react';

export default class Card extends React.Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="card">
        <div className="suit">{this.props.card.suit}</div>
        <div className="rank">{this.props.card.rank}</div>
      </div>
    );
  }
}
