import React from 'react';
import { render } from 'react-dom';
import App from './App';
import store from './app-lib/store';
import { Provider } from 'react-redux';
import { worker } from './api/server';
import './main.css';

// Wrap app rendering so we can wait for the mock API to initialize
async function start() {
  // Start our mock API server
  await worker.start({ onUnhandledRequest: 'bypass' });

  render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

start();
