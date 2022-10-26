import React from 'react';
import { render } from 'react-dom';
import AppContainer from './AppContainer';
import store from './app/store';
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
        <AppContainer />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

start();
