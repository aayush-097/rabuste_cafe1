import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('rabuste_token');
    const storedUser = localStorage.getItem('rabuste_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('rabuste_token');
        localStorage.removeItem('rabuste_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem('rabuste_token', nextToken);
    localStorage.setItem('rabuste_user', JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rabuste_token');
    localStorage.removeItem('rabuste_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


