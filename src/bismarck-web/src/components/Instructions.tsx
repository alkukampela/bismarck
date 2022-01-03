import InstuctionsContent from '../static/instructions.mdx';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const Instructions = () => {
  const navigate = useNavigate();

  return (
    <>
      <span
        className="close-instructions"
        onClick={() => navigate(-1)}
        aria-label="Sulje ohjeet"
        title="Sulje ohjeet"
      >
        &times;
      </span>
      <div className="instructions-container">
        <div className="instructions">
          <InstuctionsContent />
        </div>
      </div>
    </>
  );
};
