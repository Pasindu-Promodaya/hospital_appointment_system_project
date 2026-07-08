import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('authUser');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  //  Clean state sync handler accepting the formatted user object from Login.jsx
  const login = (userPayload) => {
    localStorage.setItem('authUser', JSON.stringify(userPayload));
    setUser(userPayload);
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout, loading, setLoading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}