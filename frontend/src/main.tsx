import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Set body margin to 0 with !important
const BodyStyler = () => {
  useEffect(() => {
    document.body.style.setProperty('margin', '0', 'important');
  }, []);
  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BodyStyler />
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
