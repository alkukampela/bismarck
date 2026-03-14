import * as React from 'react';
import { ApiService, defaultApiService } from './services/api-service';

interface ApiContextInterface {
  api: ApiService;
}

const context = React.createContext<ApiContextInterface>({
  api: defaultApiService,
});

export const ApiContext = context;

export const ApiContextProvider = context.Provider;
