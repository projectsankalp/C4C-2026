import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const TOKEN_KEY = 'karighar_token';
const USER_KEY  = 'karighar_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading]  = useState(true); // prevents flash of unauthenticated UI

  // Rehydrate session from localStorage on app start
  useEffect(() => {
    const storedUser  = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  /**
   * Called after a successful API signup/login response.
   * Persists the real Supabase session token + profile.
   */
  const login = (userData, accessToken) => {
    const normalizedUser = {
      id:             userData.id,
      email:          userData.email,
      name:           userData.full_name || userData.name,
      role:           userData.role,
      avatar:         userData.profile_pic_url || null,
      phone_number:   userData.phone_number   || null,
      village:        userData.village        || null,
      district:       userData.district       || null,
      state:          userData.state          || null,
    };

    setUser(normalizedUser);
    setIsLoggedIn(true);
    localStorage.setItem(USER_KEY,  JSON.stringify(normalizedUser));
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
    return normalizedUser;
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, isSeller: user?.role === 'seller' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
