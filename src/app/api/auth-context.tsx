"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiProftviewClient } from './client';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  verifyAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('proftview_token');
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  const verifyAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('proftview_token');
    if (!storedToken) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }

    try {
      await apiProftviewClient.verify(storedToken);
      setToken(storedToken);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Token verification failed", error);
      logout();
      setIsLoading(false);
      return false;
    }
  }, [logout]);

  useEffect(() => {
    // Calling an async function that sets state is better done via IIFE to avoid some lint warnings
    void (async () => {
      await verifyAuth();
    })();
  }, [verifyAuth]);

  const login = (newToken: string) => {
    localStorage.setItem('proftview_token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, isLoading, login, logout, verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
