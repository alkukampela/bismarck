import * as React from 'react';

export default class Trick extends React.Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>{this.props.trick.hei}</h1>
        <ul>
          {this.props.trick.cards.map((item: any) => (
            <li>
              {item.card.suit} {item.card.rank}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
