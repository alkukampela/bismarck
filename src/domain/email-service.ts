import { RegisterPlayer } from '../types/register-player';

export const sendGameLink = (
  registerPlayer: RegisterPlayer,
  loginId: string
) => {
  console.log(registerPlayer.email);
  console.log(`http://localhost:1234/login/${loginId}`);
};
