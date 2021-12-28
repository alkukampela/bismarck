import Instuctions from '../static/instructions.mdx';
import * as React from 'react';

export const GameInstructions = () => {
  const [showModal, setShowModal] = React.useState<boolean>(false);

  const closeModal = () => {
    setShowModal(false);
  };

  const displayModal = () => {
    setShowModal(true);
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
          <div className="instructions">
            <Instuctions/>
            </div>
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
