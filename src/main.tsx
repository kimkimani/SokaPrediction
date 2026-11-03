import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Defensive shim for third-party browser extensions attempting window.fetch assignment
try {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (!descriptor || (!descriptor.writable && !descriptor.set)) {
    const origFetch = window.fetch.bind(window);
    let patchedFetch = origFetch;
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get: () => patchedFetch,
      set: (fn) => {
        patchedFetch = fn;
      },
    });
  }
} catch {
  // Ignore if browser security locks window.fetch
}

// Suppress unhandled extension errors from propagating to application boundaries
window.addEventListener('error', (event) => {
  if (
    (event.filename && event.filename.includes('chrome-extension://')) ||
    (event.message && event.message.includes('Cannot set property fetch of #<Window>'))
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    typeof event.reason.message === 'string' &&
    event.reason.message.includes('Cannot set property fetch of #<Window>')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

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

