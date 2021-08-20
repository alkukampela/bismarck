import instructions from '../static/instructions.md';
import * as React from 'react';

export const Instructions = () => {
  const [showModal, setShowMaodal] = React.useState<boolean>(false);

  const printInstructions = () => {
    return { __html: instructions };
  };

  const closeModal = () => {
    setShowMaodal(false);
  };

  const displayModal = () => {
    setShowMaodal(true);
  };

  return (
    <>
      <div
        id="instructions-modal"
        className="modal"
        style={{ display: showModal ? 'block' : 'none' }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <span className="close-modal" onClick={closeModal}>
              &times;
            </span>
          </div>
          <div
            dangerouslySetInnerHTML={printInstructions()}
            className="instructions"
          />
        </div>
      </div>

      <div
        id="help-button"
        role="button"
        aria-label="Show instructions"
        title="Show instructions"
        onClick={displayModal}
      >
        <div className="icon"></div>
      </div>
    </>
  );
};
