import * as React from 'react';

export const ExtraCardDisplay = ({ amount }: { amount: number }) => {
  return (
    <div style={{ display: amount > 0 ? 'block' : 'none' }}>
      <h2>
        Poista {amount} {amount === 1 ? 'kortti' : 'korttia'}
      </h2>
    </div>
  );
};
