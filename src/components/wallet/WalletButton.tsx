'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useAuth } from '@/contexts/AuthContext';
import { FiCreditCard, FiChevronDown, FiLogOut, FiCopy, FiCheck } from 'react-icons/fi';

// Human-readable label for each auth stage
const STAGE_LABEL: Record<string, string> = {
  challenging: 'Preparing...',
  signing:     'Sign in wallet ↗',
  verifying:   'Verifying...',
};

const WalletButton: React.FC = () => {
  const wallet = useWallet();
  const { isAuthenticated, isAuthenticating, authStage, error, authenticate, logout } = useAuth();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleWalletSelect = useCallback((walletName: string) => {
    setShowWalletModal(false);
    setConnectError(null);
    try {
      const selected = wallet.wallets.find(w => w.adapter.name === walletName);
      if (!selected) return;
      // select() is enough — autoConnect:true in WalletProvider handles connect()
      wallet.select(selected.adapter.name);
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  }, [wallet]);

  const handleCopy = useCallback(() => {
    if (!wallet.publicKey) return;
    navigator.clipboard.writeText(wallet.publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [wallet.publicKey]);

  // ── Authenticated state ───────────────────────────────────────────────────
  if (isAuthenticated && wallet.publicKey) {
    const address = wallet.publicKey.toBase58();
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(v => !v)}
          className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
        >
          {wallet.adapter.icon && (
            <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="h-4 w-4 rounded-sm" />
          )}
          <span>{address.slice(0, 4)}...{address.slice(-4)}</span>
          <FiChevronDown className={`h-3 w-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-1 w-52 bg-background border border-border rounded-lg shadow-lg z-50 py-1 text-sm">
            <div className="px-3 py-2 text-xs text-muted-foreground font-mono break-all border-b border-border mb-1">
              {address.slice(0, 8)}...{address.slice(-8)}
            </div>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors"
            >
              {copied ? <FiCheck className="h-4 w-4 text-green-500" /> : <FiCopy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy address'}
            </button>
            <button
              onClick={() => { setShowDropdown(false); logout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors text-red-500"
            >
              <FiLogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Auth in progress ──────────────────────────────────────────────────────
  if (isAuthenticating) {
    const label = STAGE_LABEL[authStage] ?? 'Signing...';
    const isPulse = authStage === 'signing'; // wallet popup is open — draw attention
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white
          ${isPulse ? 'bg-orange-500 animate-pulse' : 'bg-yellow-500 opacity-80'}`}
      >
        <FiCreditCard className="h-4 w-4" />
        {label}
      </button>
    );
  }

  // ── Wallet connecting (autoConnect in progress) ───────────────────────────
  if (wallet.connecting) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium opacity-60">
        <FiCreditCard className="h-4 w-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  // ── Not connected ─────────────────────────────────────────────────────────
  const displayError = connectError || error;

  // Split wallets: installed first, then loadable/not-detected
  const installedWallets = wallet.wallets.filter(
    w => w.readyState === WalletReadyState.Installed
  );
  const otherWallets = wallet.wallets.filter(
    w => w.readyState !== WalletReadyState.Installed
  );

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={() => { setConnectError(null); setShowWalletModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
        >
          <FiCreditCard className="h-4 w-4" />
          Connect Wallet
        </button>
        {displayError && (
          <p className="text-xs text-red-500 max-w-[220px] text-right">{displayError}</p>
        )}
      </div>

      {showWalletModal && mounted && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="bg-background border border-border rounded-lg max-w-sm w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >✕</button>
            </div>

            <div className="space-y-2">
              {/* Installed wallets first */}
              {installedWallets.map(w => (
                <button
                  key={w.adapter.name}
                  onClick={() => handleWalletSelect(w.adapter.name)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  {w.adapter.icon
                    ? <img src={w.adapter.icon} alt={w.adapter.name} className="h-8 w-8 rounded-md" />
                    : <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-xs">?</div>
                  }
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{w.adapter.name}</p>
                    <p className="text-xs text-green-500">Detected</p>
                  </div>
                </button>
              ))}

              {/* Other wallets (not installed) */}
              {otherWallets.length > 0 && (
                <>
                  {installedWallets.length > 0 && (
                    <p className="text-xs text-muted-foreground pt-2 pb-1">Other wallets</p>
                  )}
                  {otherWallets.map(w => (
                    <a
                      key={w.adapter.name}
                      href={w.adapter.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors opacity-60"
                    >
                      {w.adapter.icon
                        ? <img src={w.adapter.icon} alt={w.adapter.name} className="h-8 w-8 rounded-md" />
                        : <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-xs">?</div>
                      }
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">{w.adapter.name}</p>
                        <p className="text-xs text-muted-foreground">Install →</p>
                      </div>
                    </a>
                  ))}
                </>
              )}

              {wallet.wallets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No Solana wallets detected.<br />
                  <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Install Phantom
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default WalletButton;
