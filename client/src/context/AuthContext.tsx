import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

// Use VITE_AWS_API_URL for Vite projects
const API_URL = import.meta.env.VITE_AWS_API_URL 

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Try to get user data from localStorage on initial load
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('user');
  });

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Save user data to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Remove user data from localStorage
    localStorage.removeItem('user');
  };

  const fetchUserProfile = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        logout();
        return;
      }

      const userData = JSON.parse(savedUser);
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      if (response.data) {
        const updatedUser = {
          ...userData,
          ...response.data
        };
        setUser(updatedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If token is invalid, log out the user
      logout();
    }
  };

  // Check token validity on mount and when user changes
  useEffect(() => {
    const validateToken = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // Verify token by making a request to a protected endpoint
          await axios.get(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${userData.token}`
            }
          });
          // If request succeeds, update user state
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // If token is invalid, clear everything
          console.error('Invalid token:', error);
          logout();
        }
      }
    };

    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}; 