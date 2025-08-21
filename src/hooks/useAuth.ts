import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const API_BASE_URL = 'http://127.0.0.1:5000';

type AuthState = 'disconnected' | 'connected' | 'authenticating' | 'authenticated' | 'error';

export const useAuth = () => {
  const wallet = useWallet();
  const [authState, setAuthState] = useState<AuthState>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Clear auth state when wallet disconnects
  // In useAuth.ts, add logging to the useEffect that monitors wallet.connected
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
      authenticateOnce();
    }
  }, [wallet.connected, wallet.publicKey, authState, authenticateOnce]);


  // Manual retry function
  const retry = useCallback(() => {
    if (wallet.connected && wallet.publicKey) {
      setAuthState('connected'); // This will trigger auto-auth
    }
  }, [wallet.connected, wallet.publicKey]);

  // API call helper
const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  // Only add Authorization header if we have a token AND it's not a GET request
  // or if the method explicitly requires auth
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  // Only add Authorization header when we have a token and it's needed
  if (token && (options.method !== 'GET' || endpoint.includes('/sessions'))) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
    ...options, 
    headers 
  });
  
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    if (wallet.connected) {
      setAuthState('connected');
    }
  }
  
  return response;
}, [wallet.connected]);

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
    
    // API helper
    apiCall,
    
    // Internal state for debugging
    authState,
  };
};
