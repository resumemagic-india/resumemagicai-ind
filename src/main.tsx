
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Improve DOM ready check to ensure proper initialization
const mountApp = () => {
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error('Root element not found')
    throw new Error('Root element not found')
  }

  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Handle both DOMContentLoaded and direct execution cases
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
