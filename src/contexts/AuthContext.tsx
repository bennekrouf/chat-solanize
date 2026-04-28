'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const API_BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://127.0.0.1:5000';

export type AuthStage = 'idle' | 'challenging' | 'signing' | 'verifying';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authStage: AuthStage;
  error: string | null;
  authenticate: () => Promise<boolean>;
  logout: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Treat as expired 60s early so we re-auth before the server rejects it
    return payload.exp * 1000 > Date.now() + 60_000;
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallet = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStage, setAuthStage] = useState<AuthStage>('idle');
  const [error, setError] = useState<string | null>(null);
  // Prevents authenticate() firing twice on the same connect event
  const authAttempted = useRef(false);

  // Restore session on mount — only if token is still valid
  useEffect(() => {
    if (!wallet.connected) return;
    const token = localStorage.getItem('auth_token');
    if (token && isTokenValid(token)) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [wallet.connected]);

  // Clear auth immediately when wallet disconnects
  useEffect(() => {
    if (!wallet.connected) {
      setIsAuthenticated(false);
      setError(null);
      setAuthStage('idle');
      localStorage.removeItem('auth_token');
      authAttempted.current = false;
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

      // Step 1: get challenge
      setAuthStage('challenging');
      const challengeResponse = await fetch(
        `${API_BASE_URL}/api/v1/auth/challenge/${walletAddress}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      if (!challengeResponse.ok) throw new Error('Failed to get challenge from server');
      const { challenge } = await challengeResponse.json();

      // Step 2: sign challenge with wallet (opens wallet popup)
      setAuthStage('signing');
      const messageBytes = new TextEncoder().encode(challenge);
      const signature = await wallet.signMessage(messageBytes);

      // Step 3: verify signature and get JWT
      setAuthStage('verifying');
      const verifyResponse = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          signature: bs58.encode(signature),
          challenge,
        }),
      });
      if (!verifyResponse.ok) throw new Error('Signature verification failed');
      const { jwt } = await verifyResponse.json();

      localStorage.setItem('auth_token', jwt);
      setIsAuthenticated(true);
      return true;

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      authAttempted.current = false; // allow retry
      return false;
    } finally {
      setIsAuthenticating(false);
      setAuthStage('idle');
    }
  }, [wallet.publicKey, wallet.signMessage, isAuthenticating]);

  // Auto-trigger auth as soon as wallet connects — runs here so it works
  // regardless of which component is currently rendered on screen.
  useEffect(() => {
    if (wallet.connected && !isAuthenticated && !isAuthenticating && !authAttempted.current) {
      authAttempted.current = true;
      authenticate();
    }
  }, [wallet.connected, isAuthenticated, isAuthenticating, authenticate]);

  const logout = useCallback(() => {
    wallet.disconnect();
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setError(null);
    setAuthStage('idle');
  }, [wallet]);

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    // Proactively drop expired token before the request
    const token = localStorage.getItem('auth_token');
    if (token && !isTokenValid(token)) {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
    }

    const freshToken = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(freshToken && { Authorization: `Bearer ${freshToken}` }),
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
    <AuthContext.Provider value={{ isAuthenticated, isAuthenticating, authStage, error, authenticate, logout, apiCall }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
