// src/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ErrorBoundary from './ErrorBoundary';

const MainLayout = () => {
  return (
    <>
      <Header />
      <ErrorBoundary>
    </ErrorBoundary>
    </>
  );
};

export default MainLayout;
