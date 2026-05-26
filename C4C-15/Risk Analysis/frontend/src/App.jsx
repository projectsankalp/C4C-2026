import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RiskForm from './pages/RiskForm';
import Results from './pages/Results';
import Recommendations from './pages/Recommendations';
import History from './pages/History';
import Auth from './pages/Auth';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col font-sans">
        
        {/* Navigation bar shared across all pages */}
        <Navbar />

        {/* Page Content area */}
        <main className="flex-1 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/assess" element={<RiskForm />} />
            <Route path="/results" element={<Results />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/history" element={<History />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="py-6 border-t border-slate-200/50 dark:border-slate-850/80 text-center text-xs text-slate-450 mt-auto bg-slate-100/50 dark:bg-slate-900/30">
          <p>© {new Date().getFullYear()} HealAI Risk Predictor. All rights reserved. Clinical diagnostics screening engine.</p>
        </footer>

      </div>
    </Router>
  );
}

export default App;
