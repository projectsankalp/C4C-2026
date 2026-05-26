import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Pages
import Home from '../pages/Home/Home';
import Categories from '../pages/Categories/Categories';
import Product from '../pages/Product/Product';
import Help from '../pages/Help/Help';
import Login from '../pages/Login/Login';
import Signup from '../pages/Signup/Signup';
import Seller from '../pages/Seller/Seller';
import Profile from '../pages/Profile/Profile';
import Artisans from '../pages/Artisans/Artisans';

// Helper component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Categories />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/help" element={<Help />} />
        <Route path="/support" element={<Help />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/seller/*" element={<Seller />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/artisans" element={<Artisans />} />
        
        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
