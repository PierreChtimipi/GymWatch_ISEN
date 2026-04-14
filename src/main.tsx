import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GymProvider>
        <App />
      </GymProvider>
    </AuthProvider>
  </StrictMode>,
);
