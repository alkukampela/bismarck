import { useNavigate } from 'react-router-dom';

export const HelpButton = () => {
  const navigate = useNavigate();

  return (
    <div
      id="help-button"
      role="button"
      aria-label="Näytä ohjeet"
      title="Näytä ohjeet"
      onClick={() => navigate('/instructions')}
    >
      <div className="icon"></div>
    </div>
  );
};
