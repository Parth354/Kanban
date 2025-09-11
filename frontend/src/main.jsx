import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import NotificationContainer from './components/ui/NotificationContainer'; // We need to create this!

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <NotificationContainer /> {/* Add this component to render notifications globally */}
  </React.StrictMode>
);