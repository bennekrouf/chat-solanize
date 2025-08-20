// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const API_BASE_URL = 'http://127.0.0.1:5000';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
  authenticate: () => Promise<boolean>;
  logout: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallet = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && wallet.connected) {
      setIsAuthenticated(true);
    }
  }, [wallet.connected]);

  // Reset auth when wallet disconnects
  useEffect(() => {
    if (!wallet.connected) {
      setIsAuthenticated(false);
      setError(null);
      localStorage.removeItem('auth_token');
    }
  }, [wallet.connected]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!wallet.publicKey || !wallet.signMessage || isAuthenticating) {
      return false;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const walletAddress = wallet.publicKey.toBase58();
      
      // Get challenge
      const challengeResponse = await fetch(`${API_BASE_URL}/api/v1/auth/challenge/${walletAddress}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!challengeResponse.ok) throw new Error('Failed to get challenge');
      const { challenge } = await challengeResponse.json();
      
      // Sign challenge
      const messageBytes = new TextEncoder().encode(challenge);
      const signature = await wallet.signMessage(messageBytes);
      
      // Verify signature
      const verifyResponse = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          signature: bs58.encode(signature),
          challenge: challenge,
        }),
      });
      
      if (!verifyResponse.ok) throw new Error('Authentication failed');
      const { jwt } = await verifyResponse.json();
      
      localStorage.setItem('auth_token', jwt);
      setIsAuthenticated(true);
      return true;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMsg);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [wallet.publicKey, wallet.signMessage, isAuthenticating]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
    }
    
    return response;
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAuthenticating,
      error,
      authenticate,
      logout,
      apiCall,
    }}>
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
