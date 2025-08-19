'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';

import { 
  FiCreditCard,
} from 'react-icons/fi';

const WalletButton: React.FC = () => {
  const { 
    connect, 
    connecting, 
    connected, 
    publicKey,
    select,
    wallets,
    wallet
  } = useWallet();

  const { 
    isAuthenticated, 
    loading: authLoading, 
    authenticate 
  } = useAuth();
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Replace the handleWalletSelect function:
const handleWalletSelect = useCallback(async (walletName: string) => {
  try {
    console.log('Selecting wallet:', walletName);
    setShowWalletModal(false);
    
    // Find and select the wallet adapter
    const selectedWallet = wallets.find(w => w.adapter.name === walletName);
    if (!selectedWallet) {
      console.error('Wallet not found:', walletName);
      return;
    }

    select(selectedWallet.adapter.name);
    await connect();
    console.log('Wallet connected successfully');
    
    // Don't auto-authenticate - user will click authenticate button
    
  } catch (error) {
    console.error('Failed to connect wallet:', error);
  }
}, [wallets, select, connect]); // Remove authenticate from dependencies

  // Manual connect function
  const handleManualConnect = useCallback(async () => {
    try {
      if (!wallet) {
        setShowWalletModal(true);
        return;
      }
      
      console.log('Manual connect attempt...');
      await connect();
      console.log('Wallet connected, starting authentication...');
      await authenticate();
      console.log('Authentication completed');
      
    } catch (error) {
      console.error('Failed to connect and authenticate:', error);
    }
  }, [wallet, connect, authenticate]);

  // Available wallets with icons
  const supportedWallets = [
    { name: 'Phantom', icon: '👻' },
    { name: 'Solflare', icon: '🔥' },
  ];

  // If wallet is selected but not connected or authenticated, show connect button
  if (wallet && !connected && !connecting) {
    return (
      <button
        onClick={handleManualConnect}
        disabled={authLoading}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
      >
        <FiCreditCard className="h-4 w-4" />
        {authLoading ? 'Authenticating...' : `Connect ${wallet.adapter.name}`}
      </button>
    );
  }

  // If connected but not authenticated, show authenticate button
  if (connected && publicKey && !isAuthenticated) {
    return (
      <button
        onClick={() => authenticate()}
        disabled={authLoading}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium disabled:opacity-50"
      >
        <FiCreditCard className="h-4 w-4" />
        {authLoading ? 'Authenticating...' : 'Authenticate'}
      </button>
    );
  }

  if (connected && publicKey && !isAuthenticated) {
  return (
    <button
      onClick={authenticate}
      disabled={authLoading}
      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium disabled:opacity-50"
    >
      <FiCreditCard className="h-4 w-4" />
      {authLoading ? 'Signing...' : 'Sign to Authenticate'}
    </button>
  );
}

  return (
    <>
      <button
        onClick={() => setShowWalletModal(true)}
        disabled={connecting || authLoading}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
      >
        <FiCreditCard className="h-4 w-4" />
        {connecting ? 'Connecting...' : authLoading ? 'Authenticating...' : 'Connect Wallet'}
      </button>

      {/* Wallet Selection Modal */}
      {showWalletModal && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={() => setShowWalletModal(false)}
        >
          <div 
            className="bg-background border border-border rounded-lg max-w-md w-full p-6 mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Connect Wallet
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="p-1 rounded hover:bg-secondary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {supportedWallets.map((walletInfo) => {
                const wallet = wallets.find(w => w.adapter.name === walletInfo.name);
                const isInstalled = wallet?.readyState === 'Installed';
                
                return (
                  <button
                    key={walletInfo.name}
                    onClick={() => handleWalletSelect(walletInfo.name)}
                    disabled={!isInstalled}
                    className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl">{walletInfo.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{walletInfo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {isInstalled ? 'Detected' : 'Not installed'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Don't have a wallet? Download Phantom or Solflare to get started.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default WalletButton;
