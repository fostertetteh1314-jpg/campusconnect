import { createContext, useContext, useEffect, useState } from 'react';
import api, { refreshAccess, setAccessToken } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    refreshAccess().then(({ token, ...profile }) => setUser(profile)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, ...profile } = response.data;
    setAccessToken(token); setUser(profile); return profile;
  };

  const register = async (data) => {
    const response = await api.post('/auth/register', data);
    const { token, ...profile } = response.data;
    setAccessToken(token); setUser(profile); return profile;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } finally { setAccessToken(null); setUser(null); }
  };

  const updateUser = (data) => setUser(data);

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
