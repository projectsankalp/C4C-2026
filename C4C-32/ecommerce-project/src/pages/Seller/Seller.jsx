import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Karigar pages
import Welcome from './Welcome';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import SellerLogin from './Login';
import Dashboard from './Dashboard';

const Seller = () => {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/onboarding-1" element={<OnboardingStep1 />} />
      <Route path="/onboarding-2" element={<OnboardingStep2 />} />
      <Route path="/onboarding-3" element={<OnboardingStep3 />} />
      <Route path="/login" element={<SellerLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default Seller;
