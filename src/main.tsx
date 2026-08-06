import React from 'react';
import ReactDOM from 'react-dom/client';
import { flushSync } from 'react-dom';
import App from './App';
import './index.css';

if (typeof window !== 'undefined') {
  (window as any).flushSync = flushSync;
}

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  flushSync(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
}
