import { TrickResponse } from '../../../types/trick-response';
import { StateUpdates } from './state-updates';

export type ServiceResult<T> = {
  updates: StateUpdates;

  retval: T;

  broadcastValue?: TrickResponse;
};
