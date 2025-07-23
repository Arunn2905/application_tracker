import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for testing
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@jobtracker.com',
    password: 'password123',
    name: 'Demo User',
    isVerified: true,
  },
  {
    id: '2',
    email: 'john@example.com',
    password: 'password123',
    name: 'John Smith',
    isVerified: true,
  },
  {
    id: '3',
    email: 'test@test.com',
    password: 'test123',
    name: 'Test User',
    isVerified: true,
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, password });
      
      // Find user in mock data
      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!mockUser) {
        console.log('User not found in mock data');
        throw new Error('Invalid email or password');
      }

      console.log('Mock user found:', mockUser);

      // Simulate API response
      const token = `mock-jwt-token-${Date.now()}`;
      const userData = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        isVerified: mockUser.isVerified,
      };

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(userData);
      
      toast.success('Successfully logged in!');
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === email);
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Add new user to mock data (in real app, this would be sent to server)
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        email,
        password,
        name,
        isVerified: true,
      };
      
      MOCK_USERS.push(newUser);
      
      toast.success('Registration successful! You can now log in with your credentials.');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Successfully logged out!');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};