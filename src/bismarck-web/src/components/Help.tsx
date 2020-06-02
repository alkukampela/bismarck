import instructions from '../static/instructions.md';

import * as React from 'react';

export const Help = () => {
  console.log(instructions);

  const printInstructions = () => {
    return { __html: instructions };
  };

  return <div dangerouslySetInnerHTML={printInstructions()} />;
};
