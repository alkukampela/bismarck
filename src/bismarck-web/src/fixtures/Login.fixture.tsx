import { MemoryRouter } from 'react-router-dom';
import { StartScreen } from '../components/StartScreen';

const defaultExport = {
  component: (
    <MemoryRouter>
      <StartScreen />
    </MemoryRouter>
  ),
};

export default defaultExport;
