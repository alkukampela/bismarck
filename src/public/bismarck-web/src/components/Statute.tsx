import * as React from 'react';

import { HandStatute } from '../../../../types/hand-statute';

interface Statute {
  statute: HandStatute;
}

export const StatuteSummary: React.FunctionComponent<Statute> = ({
  statute,
}) => {
  return (
    <div className="statute">
      <h1>Käsi</h1>
      {statute.handType.gameType.value}
      {statute.handType.gameType.trumpSuit}
    </div>
  );
};
