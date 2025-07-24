// src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <BrowserRouter>
      <>
        <AppRouter />
        <ToastContainer position="top-center" />
      </>
    </BrowserRouter>
  );
};

export default App;
