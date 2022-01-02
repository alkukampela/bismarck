import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const HelpButton = () => {
  const navigate = useNavigate();

  return (
    <div
      id="help-button"
      role="button"
      aria-label="Show instructions"
      title="Show instructions"
      onClick={() => navigate('/instructions')}
    >
      <div className="icon"></div>
    </div>
  );
};
