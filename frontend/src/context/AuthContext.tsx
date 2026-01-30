import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUserProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          setToken(storedToken);
          // Attempt to get user profile to validate token
          const response = await authAPI.getProfile();
          // Map the role to isAdmin and isSeller properties while preserving the original role
          const mappedUser = {
            ...response.data,
            role: response.data.role,
            isAdmin: response.data.role === 'admin',
            isSeller: response.data.role === 'seller',
            sellerType: response.data.sellerType
          };
          setUser(mappedUser as unknown as User);
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = response;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Map the role to isAdmin and isSeller properties while preserving the original role
    const mappedUser = {
      ...userData,
      role: userData.role,
      isAdmin: userData.role === 'admin',
      isSeller: userData.role === 'seller',
      sellerType: userData.sellerType
    };
    setUser(mappedUser as unknown as User);
  };

  const register = async (name: string, email: string, password: string, role: string = 'buyer') => {
    const response = await authAPI.register({ name, email, password, role });
    const { token: newToken, user: userData } = response;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Map the role to isAdmin and isSeller properties while preserving the original role
    const mappedUser = {
      ...userData,
      role: userData.role,
      isAdmin: userData.role === 'admin',
      isSeller: userData.role === 'seller',
      sellerType: userData.sellerType
    };
    setUser(mappedUser as unknown as User);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.getProfile();
      // Map the role to isAdmin and isSeller properties while preserving the original role
      const mappedUser = {
        ...response.data,
        role: response.data.role,
        isAdmin: response.data.role === 'admin',
        isSeller: response.data.role === 'seller',
        sellerType: response.data.sellerType
      };
      setUser(mappedUser as unknown as User);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const updateUserProfile = async (profileData: any) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      // Refresh user data after update
      const updatedUserData = await authAPI.getProfile();
      const mappedUser = {
        ...updatedUserData.data,
        role: updatedUserData.data.role,
        isAdmin: updatedUserData.data.role === 'admin',
        isSeller: updatedUserData.data.role === 'seller',
        sellerType: updatedUserData.data.sellerType
      };
      setUser(mappedUser as unknown as User);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshToken,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};