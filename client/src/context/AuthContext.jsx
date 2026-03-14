import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { t } from '../utils/translations';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [token, setToken] = useState(null);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRestaurant = localStorage.getItem('restaurant');

    if (storedToken && storedUser && storedRestaurant) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRestaurant(JSON.parse(storedRestaurant));
    }
    setLoading(false);
  }, []);

  const login = async (restaurantId, pin, role) => {
    try {
      const response = await api.post('/auth/login', {
        restaurant_id: restaurantId,
        pin,
        role,
      });

      const { token: newToken, user: newUser, restaurant: newRestaurant } = response.data;

      setToken(newToken);
      setUser(newUser);
      setRestaurant(newRestaurant);

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('restaurant', JSON.stringify(newRestaurant));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRestaurant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('restaurant');
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ta' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const value = {
    user,
    restaurant,
    token,
    language,
    login,
    logout,
    toggleLanguage,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

