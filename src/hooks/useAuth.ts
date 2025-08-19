'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    wallet_address: string;
    id: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const { publicKey, signMessage, connected } = useWallet();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error: null,
  });
  
  // Add authentication guard
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Clear auth when wallet disconnects
  useEffect(() => {
    if (!connected || !publicKey) {
      console.log('Wallet disconnected, clearing auth');
      setAuthState({
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false,
        error: null,
      });
      localStorage.removeItem('auth_token');
    }
  }, [connected, publicKey]);

  // Check for existing token on mount and wallet connection
  useEffect(() => {
    const checkExistingAuth = () => {
      const token = localStorage.getItem('auth_token');
      console.log('Checking existing auth:', { token: !!token, publicKey: !!publicKey, connected });
      
      if (token && publicKey && connected) {
        console.log('Found existing token, setting authenticated state');
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          token,
          user: {
            wallet_address: publicKey.toBase58(),
            id: 'current_user',
          },
        }));
      }
    };

    checkExistingAuth();
  }, [publicKey, connected]);

  // Get challenge from backend
  const getChallenge = async (walletAddress: string): Promise<string> => {
    console.log('Getting challenge for wallet:', walletAddress);
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/challenge/${walletAddress}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Challenge request failed:', errorText);
      throw new Error(`Failed to get challenge: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Challenge response:', data);
    return data.challenge || data.message;
  };

  // Verify signature with backend
  const verifySignature = async (
    walletAddress: string,
    signature: Uint8Array,
    challenge: string
  ): Promise<{ jwt: string; user: { id: string; wallet_address: string } }> => {
    const signatureBase58 = bs58.encode(signature);
    
    console.log('Verifying signature:', {
      wallet: walletAddress,
      challenge,
      signature: signatureBase58
    });
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        signature: signatureBase58,
        challenge: challenge,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Verification failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Verification successful:', result);
    return result;
  };

  // Main authentication function
  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      const error = 'Wallet not connected';
      console.error(error);
      setAuthState(prev => ({ ...prev, error }));
      throw new Error(error);
    }

    // Prevent concurrent authentication attempts
    if (isAuthenticating) {
      console.log('Authentication already in progress, skipping...');
      return;
    }

    console.log('Starting authentication process...');
    setIsAuthenticating(true);
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const walletAddress = publicKey.toBase58();
      console.log('Wallet address:', walletAddress);
      
      // Step 1: Get challenge from backend
      console.log('Step 1: Getting challenge...');
      const challenge = await getChallenge(walletAddress);
      console.log('Received challenge:', challenge);
      
      // Step 2: Sign the challenge
      console.log('Step 2: Signing challenge...');
      const messageBytes = new TextEncoder().encode(challenge);
      const signature = await signMessage(messageBytes);
      console.log('Message signed successfully');
      
      // Step 3: Verify signature with backend
      console.log('Step 3: Verifying signature...');
      const { jwt, user } = await verifySignature(walletAddress, signature, challenge);
      console.log('Authentication successful!');
      
      // Step 4: Store token and update state
      localStorage.setItem('auth_token', jwt);
      setAuthState({
        isAuthenticated: true,
        token: jwt,
        user: {
         ...user,
          wallet_address: walletAddress,
          id: user.id || 'current_user',
        },
        loading: false,
        error: null,
      });

      return { success: true, token: jwt };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('Authentication error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
        token: null,
        user: null,
      }));
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage, isAuthenticating]);

  // Logout function
  const logout = useCallback(() => {
    console.log('Logging out...');
    localStorage.removeItem('auth_token');
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      loading: false,
      error: null,
    });
  }, []);

  // API helper with auth token
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = authState.token || localStorage.getItem('auth_token');
    
    console.log('Making API call:', {
      endpoint,
      hasToken: !!token,
      method: options.method || 'GET'
    });
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log('API response:', {
      endpoint,
      status: response.status,
      ok: response.ok
    });

    if (response.status === 401) {
      console.log('API call returned 401, logging out');
      logout();
      throw new Error('Authentication required');
    }

    return response;
  }, [authState.token, logout]);

  // Test backend connection
  const testConnection = useCallback(async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/health`);
      console.log('Backend health check:', {
        status: response.status,
        ok: response.ok
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }, []);

  return {
    ...authState,
    authenticate,
    logout,
    apiCall,
    testConnection,
  };
};
