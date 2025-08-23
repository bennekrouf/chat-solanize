// src/hooks/useAuth.ts - Fixed to match backend API guidelines

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { getGatewayUrl, API_ENDPOINTS } from '@/lib/config';

type AuthState = 'disconnected' | 'connected' | 'authenticating' | 'authenticated' | 'error';

export const useAuth = () => {
  const wallet = useWallet();
  const [authState, setAuthState] = useState<AuthState>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Clear auth state when wallet disconnects
  useEffect(() => {
    console.log('Wallet connection state changed:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toBase58(),
      authState,
      connecting: wallet.connecting
    });
    
    if (!wallet.connected) {
      setAuthState('disconnected');
      setError(null);
      localStorage.removeItem('auth_token');
    } else if (wallet.connected && authState === 'disconnected') {
      setAuthState('connected');
    }
  }, [wallet.connected, authState]);

  const authenticateOnce = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signMessage || authState === 'authenticating') return;

    setAuthState('authenticating');
    setError(null);

    try {
      const walletAddress = wallet.publicKey.toBase58();
      const gatewayUrl = getGatewayUrl();
      
      // Get challenge using the correct endpoint
      const challengeResponse = await fetch(`${gatewayUrl}${API_ENDPOINTS.AUTH.CHALLENGE(walletAddress)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!challengeResponse.ok) {
        const errorData = await challengeResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get challenge');
      }
      
      const { challenge } = await challengeResponse.json();
      
      // Sign challenge
      const messageBytes = new TextEncoder().encode(challenge);
      const signature = await wallet.signMessage(messageBytes);
      
      // Verify signature using the correct endpoint
      const verifyResponse = await fetch(`${gatewayUrl}${API_ENDPOINTS.AUTH.VERIFY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          signature: bs58.encode(signature),
          challenge: challenge,
        }),
      });
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      const { jwt } = await verifyResponse.json();
      
      // Store token and mark as authenticated
      localStorage.setItem('auth_token', jwt);
      setAuthState('authenticated');
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMsg);
      setAuthState('error');
    }
  }, [authState, wallet]);

  // Auto-authenticate when wallet connects for the first time
  useEffect(() => {
    if (wallet.connected && wallet.publicKey && authState === 'connected') {
      console.log("Calling authenticateOnce");
      authenticateOnce();
    }
  }, [wallet.connected, wallet.publicKey, authState, authenticateOnce]);

  // Manual retry function
  const retry = useCallback(() => {
    if (wallet.connected && wallet.publicKey) {
      setAuthState('connected'); // This will trigger auto-auth
    }
  }, [wallet.connected, wallet.publicKey]);

  // API call helper that properly handles authentication and routing
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    const gatewayUrl = getGatewayUrl();
    
    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    // Add Authorization header for protected endpoints
    // According to the API guidelines, most endpoints require JWT except auth endpoints
    const isAuthEndpoint = endpoint.startsWith('/api/v1/auth/');
    // const isGetRequest = (options.method || 'GET') === 'GET';
    
    if (token && !isAuthEndpoint) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make sure we don't double-prefix the URL
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${gatewayUrl}${endpoint}`;

    console.log('API Call:', {
      url: fullUrl,
      method: options.method || 'GET',
      hasAuth: !!headers['Authorization'],
      endpoint
    });

    const response = await fetch(fullUrl, { 
      ...options, 
      headers 
    });
    
    // Handle 401 responses by clearing auth and redirecting to reconnect
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      if (wallet.connected) {
        setAuthState('connected');
      } else {
        setAuthState('disconnected');
      }
    }
    
    return response;
  }, [wallet.connected]);

  // Refresh JWT token
  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
      });

      if (response.ok) {
        const { jwt } = await response.json();
        localStorage.setItem('auth_token', jwt);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    return false;
  }, [apiCall]);

  return {
    // Wallet state
    ...wallet,
    
    // Unified auth state
    isAuthenticated: authState === 'authenticated',
    isAuthenticating: authState === 'authenticating',
    needsAuth: authState === 'connected',
    hasError: authState === 'error',
    
    // Error handling
    error,
    retry,
    
    // Token management
    refreshToken,
    
    // API helper
    apiCall,
    
    // Internal state for debugging
    authState,
  };
};
