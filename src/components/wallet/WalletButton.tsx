'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { createPortal } from 'react-dom';

// Import correct Feather icons - no FiWallet exists
import { 
  FiCreditCard,  // Use this for wallet icon
  FiLogOut, 
  FiCopy, 
  FiCheck 
} from 'react-icons/fi';

const WalletButton: React.FC = () => {
  const { 
    connect, 
    disconnect, 
    connecting, 
    connected, 
    publicKey,
    select,
    wallets 
  } = useWallet();
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle wallet selection and connection
  const handleWalletSelect = useCallback(async (walletName: string) => {
    const selectedWallet = wallets.find(w => w.adapter.name === walletName);
    if (selectedWallet) {
      select(selectedWallet.adapter.name);
      setShowWalletModal(false);
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  }, [wallets, select, connect]);

  // Copy wallet address
  const copyAddress = useCallback(async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [publicKey]);

  // Format wallet address for display
  const formatAddress = (address: PublicKey) => {
    const base58 = address.toBase58();
    return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
  };

  // Available wallets with icons
  const supportedWallets = [
    { name: 'Phantom', icon: '👻' },
    { name: 'Solflare', icon: '🔥' },
  ];

  if (connected && publicKey) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FiCreditCard className="h-4 w-4" />
          <span className="hidden sm:inline font-mono text-sm">
            {formatAddress(publicKey)}
          </span>
          <span className="sm:hidden">Connected</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground">Connected Wallet</p>
              <p className="text-xs text-muted-foreground font-mono">
                {publicKey.toBase58()}
              </p>
            </div>
            
            <button
              onClick={copyAddress}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors"
            >
              {copied ? (
                <>
                  <FiCheck className="h-4 w-4 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="h-4 w-4" />
                  <span>Copy Address</span>
                </>
              )}
            </button>

            <button
              onClick={disconnect}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowWalletModal(true)}
        disabled={connecting}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
      >
        <FiCreditCard className="h-4 w-4" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
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
