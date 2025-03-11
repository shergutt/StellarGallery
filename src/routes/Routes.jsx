// src/routes/AppRoutes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Gallery from '../pages/Gallery';
import Login from '../pages/Login';
import MainLayout from '../layout/MainLayout';

const AppRoutes = () => {
  return (
    <Router>
        <MainLayout />
      <Routes>
        <Route >
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
