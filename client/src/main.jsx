import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import store from './store/store.js';
import { fetchMe } from './store/slices/authSlice';
import './index.css';

function AppInit() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppInit />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
