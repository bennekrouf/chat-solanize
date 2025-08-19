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

  // Clear auth when wallet disconnects
  useEffect(() => {
    if (!connected || !publicKey) {
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

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && publicKey) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        token,
        user: {
          wallet_address: publicKey.toBase58(),
          id: 'current_user', // Will be replaced with actual user ID from backend
        },
      }));
    }
  }, [publicKey]);

  // Get challenge from backend
  const getChallenge = async (walletAddress: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/challenge/${walletAddress}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get challenge: ${response.statusText}`);
    }

    const data = await response.json();
    return data.challenge || data.message; // Adjust based on your backend response
  };

  // Verify signature with backend
  const verifySignature = async (
    walletAddress: string,
    signature: Uint8Array,
    challenge: string
  ): Promise<{ jwt: string; user: { id: string; wallet_address: string } }> => {
    // Convert signature to Base58 as expected by backend
    const signatureBase58 = bs58.encode(signature);
    
    console.log('Sending verification request:');
    console.log('Wallet:', walletAddress);
    console.log('Challenge:', challenge);
    console.log('Signature (Base58):', signatureBase58);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        signature: signatureBase58,
        challenge: challenge, // Use 'challenge' not 'message'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    return response.json();
  };

  // Main authentication function
  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected');
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const walletAddress = publicKey.toBase58();
      
      // Step 1: Get challenge from backend
      const challenge = await getChallenge(walletAddress);
      
      // Step 2: Sign the challenge
      const messageBytes = new TextEncoder().encode(challenge);
      const signature = await signMessage(messageBytes);
      
      // Step 3: Verify signature with backend
      const { jwt, user } = await verifySignature(walletAddress, signature, challenge);
      
      // Step 4: Store token and update state
      localStorage.setItem('auth_token', jwt);
      setAuthState({
        isAuthenticated: true,
        token: jwt,
        user: {
          wallet_address: walletAddress,
          id: user.id || 'current_user',
          ...user,
        },
        loading: false,
        error: null,
      });

      return { success: true, token: jwt };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [publicKey, signMessage]);

  // Logout function
  const logout = useCallback(() => {
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
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error('Authentication required');
    }

    return response;
  }, [authState.token, logout]);

  return {
    ...authState,
    authenticate,
    logout,
    apiCall,
  };
};
