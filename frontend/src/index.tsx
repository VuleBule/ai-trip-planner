import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { reportWebVitals, preconnectDomains } from './utils/performance';

// Preconnect to API domain for faster requests
preconnectDomains(['http://localhost:8000']);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Monitor web vitals
reportWebVitals((metric) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  // In production, send to analytics service
  // Example: sendToAnalytics(metric);
});
