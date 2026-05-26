import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

// Shell Layout Components
import Navbar from './components/Navbar/Navbar';
import CartDrawer from './components/Navbar/CartDrawer';
import Footer from './components/Footer/Footer';
import KariGharBot from './components/KariGharBot/KariGharBot';
import VoiceNav from './components/VoiceNav/VoiceNav';
import AppRoutes from './routes/AppRoutes';

const AppContent = () => {
  const location = useLocation();
  const isSellerPage = location.pathname.startsWith('/seller');
  const showFooter = location.pathname !== '/artisans' && !isSellerPage;

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isSellerPage && <Navbar />}
      
      {/* Dynamic Sliding Shopping Cart drawer */}
      {!isSellerPage && <CartDrawer />}
      
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      
      {showFooter && <Footer />}

      {/* Global floating companion helper bot */}
      {!isSellerPage && <KariGharBot />}

      {/* Global voice navigation */}
      {!isSellerPage && <VoiceNav />}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              
              {/* Global micro-interactive Toast alerts */}
              <Toaster 
                position="bottom-left"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--cream-card)',
                    color: 'var(--warm-charcoal)',
                    border: '1px solid var(--cream-border)',
                    fontFamily: 'var(--font-sans)',
                    borderRadius: 'var(--border-radius-md)',
                    boxShadow: 'var(--shadow-premium)'
                  },
                  success: {
                    iconTheme: {
                      primary: 'var(--primary-terracotta)',
                      secondary: 'var(--white-pure)',
                    },
                  }
                }}
              />
              
              <AppContent />

            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
