import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// Bootstrap CSS is imported in index.html via CDN

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
