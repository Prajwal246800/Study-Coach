import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StudyProvider } from './context/StudyContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <StudyProvider>
      <App />
    </StudyProvider>
  </React.StrictMode>
);