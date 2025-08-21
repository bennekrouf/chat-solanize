'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';

import { 
  FiCreditCard,
} from 'react-icons/fi';

const WalletButton: React.FC = () => {
  // Use only the unified useAuth hook
  const { 
    connect, 
    connected, 
    publicKey, 
    wallets, 
    select, 
    wallet, 
    connecting,
    isAuthenticated,
    isAuthenticating,
    needsAuth,
    hasError,
    retry
  } = useAuth();

  // All hooks must be called at the top level
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [wallets, select, connect]);

  const handleManualConnect = useCallback(async () => {
    try {
      if (!wallet) {
        setShowWalletModal(true);
        return;
      }
      
      console.log('Manual connect attempt...');
      await connect();
      console.log('Wallet connected successfully');
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [wallet, connect]);

  // Available wallets with icons
  const supportedWallets = [
    { name: 'Phantom', icon: '👻' },
    { name: 'Solflare', icon: '🔥' },
  ];

  // Connected and authenticated - show address
  if (isAuthenticated && publicKey) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
        <FiCreditCard className="h-4 w-4" />
        <span className="text-sm">{publicKey.toBase58().slice(0,4)}...{publicKey.toBase58().slice(-4)}</span>
      </div>
    );
  }

  // Connected but authenticating
  if (isAuthenticating) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg">
        <FiCreditCard className="h-4 w-4" />
        Signing...
      </button>
    );
  }

  // Connected but auth failed
  if (hasError) {
    return (
      <button onClick={retry} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
        <FiCreditCard className="h-4 w-4" />
        Retry Auth
      </button>
    );
  }

  // If wallet is selected but not connected, show connect button
  if (wallet && !connected && !connecting) {
    return (
      <button
        onClick={handleManualConnect}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <FiCreditCard className="h-4 w-4" />
        Connect {wallet.adapter.name}
      </button>
    );
  }

  return (
    <>
    {mounted &&
      <button
        onClick={() => setShowWalletModal(true)}
        disabled={connecting}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
      >
        <FiCreditCard className="h-4 w-4" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    }
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
                const walletAdapter = wallets.find(w => w.adapter.name === walletInfo.name);
                const isInstalled = walletAdapter?.readyState === 'Installed';
                
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
