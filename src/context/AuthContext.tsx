import React, { createContext, useContext, useState, ReactNode } from 'react';
import { currentUser } from '../data/mockData';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        if (username && password) {
          setUser(currentUser);
          setLoading(false);
          resolve(true);
        } else {
          setLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  const register = async (
    name: string, 
    username: string, 
    email: string, 
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        if (name && username && email && password) {
          setUser({
            ...currentUser,
            name,
            username
          });
          setLoading(false);
          resolve(true);
        } else {
          setLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};