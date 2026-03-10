import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        dedupingInterval: 1000,
        focusThrottleInterval: 5000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </SWRConfig>
  </StrictMode>
);
