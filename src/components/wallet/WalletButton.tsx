'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';
import { FiCreditCard } from 'react-icons/fi';

const WalletButton: React.FC = () => {
  const wallet = useWallet();
  const { isAuthenticated, isAuthenticating, authenticate } = useAuth();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletSelect = useCallback(async (walletName: string) => {
    try {
      setShowWalletModal(false);
      
      const selectedWallet = wallet.wallets.find(w => w.adapter.name === walletName);
      if (!selectedWallet) {
        console.error('Wallet not found:', walletName);
        return;
      }

      wallet.select(selectedWallet.adapter.name);
      await wallet.connect();
      
      // Authenticate after connection
      setTimeout(async () => {
        await authenticate();
      }, 500);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [wallet, authenticate]);

  // Show address when authenticated
  if (isAuthenticated && wallet.publicKey) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
        <FiCreditCard className="h-4 w-4" />
        <span className="text-sm">{wallet.publicKey.toBase58().slice(0,4)}...{wallet.publicKey.toBase58().slice(-4)}</span>
      </div>
    );
  }

  // Show signing state
  if (isAuthenticating) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg">
        <FiCreditCard className="h-4 w-4" />
        Signing...
      </button>
    );
  }

  // Show connect button
  return (
    <>
      <button
        onClick={() => setShowWalletModal(true)}
        disabled={wallet.connecting}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
      >
        <FiCreditCard className="h-4 w-4" />
        {wallet.connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {/* Wallet modal - same as before */}
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
              <h3 className="text-lg font-semibold text-foreground">Connect Wallet</h3>
              <button onClick={() => setShowWalletModal(false)}>✕</button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Phantom', icon: '👻' },
                { name: 'Solflare', icon: '🔥' },
              ].map((walletInfo) => {
                const walletAdapter = wallet.wallets.find(w => w.adapter.name === walletInfo.name);
                const isInstalled = walletAdapter?.readyState === 'Installed';
                
                return (
                  <button
                    key={walletInfo.name}
                    onClick={() => handleWalletSelect(walletInfo.name)}
                    disabled={!isInstalled}
                    className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50"
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
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default WalletButton;
