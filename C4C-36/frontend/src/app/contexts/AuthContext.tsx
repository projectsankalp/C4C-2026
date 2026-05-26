import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userType: 'artisan' | 'validator' | null;
  login: (type: 'artisan' | 'validator', token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userType, setUserType] = useState<'artisan' | 'validator' | null>(
    (localStorage.getItem('userType') as any) || null
  );

  const login = (type: 'artisan' | 'validator', token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
    setIsLoggedIn(true);
    setUserType(type);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setIsLoggedIn(false);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
