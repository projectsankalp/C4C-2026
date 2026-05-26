import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('niramaya_token');
    const savedUser = localStorage.getItem('niramaya_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const { token, user } = res.data;
    localStorage.setItem('niramaya_token', token);
    localStorage.setItem('niramaya_user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    // Redirect based on role
    if (user.role === 'asha') navigate('/asha');
    else if (user.role === 'doctor') navigate('/doctor/dashboard');
    else navigate('/hospital');
  };

  const logout = () => {
    localStorage.removeItem('niramaya_token');
    localStorage.removeItem('niramaya_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
