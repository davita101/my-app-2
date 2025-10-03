import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './test-lib/reportWebVitals';
import Router from './app/router';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function

// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
