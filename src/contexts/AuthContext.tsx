import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authApi, LoginCredentials, SignupData } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Failed to get current user:', err);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      const response = await authApi.login(credentials);
      localStorage.setItem('accessToken', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login');
      throw err;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setError(null);
      const response = await authApi.signup(data);
      localStorage.setItem('accessToken', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to signup');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to logout');
      throw err;
    }
  };

  const googleSignIn = async (idToken: string) => {
    try {
      setError(null);
      const response = await authApi.googleSignIn(idToken);
      localStorage.setItem('accessToken', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign in with Google');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 