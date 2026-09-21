import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authStorage, api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authStorage.getUser());
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authStorage.getToken();
      if (storedToken) {
        try {
          const res = await api.auth.me();
          if (res.success && res.user) {
            setUser(res.user);
            authStorage.setUser(res.user);
          } else {
            authStorage.clearAll();
            setUser(null);
            setToken(null);
          }
        } catch {
          // Token expired or invalid
          authStorage.clearAll();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    authStorage.setToken(newToken);
    authStorage.setUser(newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    authStorage.clearAll();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    authStorage.setUser(updatedUser);
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.auth.me();
      if (res.success && res.user) {
        setUser(res.user);
        authStorage.setUser(res.user);
      }
    } catch {
      logout();
    }
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user && user.role === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
