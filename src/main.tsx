import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

function mountApp() {
  const container = document.getElementById('root');
  if (!container) {
    console.warn('[SokaPredictions] #root container not yet ready, waiting for DOMContentLoaded');
    return false;
  }
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  return true;
}

if (!mountApp()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mountApp();
    });
  } else {
    // Retry once in next event loop tick
    setTimeout(mountApp, 50);
  }
}

