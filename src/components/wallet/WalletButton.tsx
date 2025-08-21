'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { FiCreditCard } from 'react-icons/fi';

const WalletButton: React.FC = () => {
  const { 
    connect, 
    connected, 
    publicKey, 
    wallets, 
    select, 
    connecting,
    isAuthenticated,
    isAuthenticating,
    hasError,
    retry
  } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletSelect = useCallback(async (walletName: string) => {
    setShowModal(false);
    
    try {
      const selectedWallet = wallets.find(w => w.adapter.name === walletName);
      if (!selectedWallet) return;
      
      select(selectedWallet.adapter.name);
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }, [wallets, select, connect]);

  // Don't render anything until mounted
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
        <div className="h-4 w-4" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    );
  }

  // Already authenticated - show address
  if (isAuthenticated && publicKey) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
        <FiCreditCard className="h-4 w-4" />
        <span className="text-sm">
          {publicKey.toBase58().slice(0,4)}...{publicKey.toBase58().slice(-4)}
        </span>
      </div>
    );
  }

  // Authenticating
  if (isAuthenticating) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg">
        <FiCreditCard className="h-4 w-4" />
        Signing...
      </button>
    );
  }

  // Error state
  if (hasError) {
    return (
      <button 
        onClick={retry} 
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        <FiCreditCard className="h-4 w-4" />
        Retry Auth
      </button>
    );
  }

  // Connected but need to authenticate
  if (connected && !isAuthenticated) {
    return (
      <button
        onClick={connect}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
      >
        <FiCreditCard className="h-4 w-4" />
        Authenticate
      </button>
    );
  }

  // Default state - show connect button
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={connecting}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
      >
        <FiCreditCard className="h-4 w-4" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {/* Wallet Selection Modal */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-background border border-border rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Connect Wallet
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-secondary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Phantom', icon: '👻' },
                { name: 'Solflare', icon: '🔥' },
              ].map((walletInfo) => {
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
