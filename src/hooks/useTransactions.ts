// src/hooks/useTransactions.ts

import { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { SolanaApi, SolanaApiError, type PrepareTransactionResult, type PrepareSwapResult } from '@/lib/solanaApi';
import { useAuth } from './useAuth';
import { useWalletData } from './useWalletData';

export interface TransactionState {
  preparing: boolean;
  signing: boolean;
  submitting: boolean;
  error: string | null;
}

export interface PendingTransaction {
  id: string;
  type: 'transfer' | 'swap';
  from: string;
  to: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount?: string;
  price?: string;
  fees?: string;
  slippage?: string;
  preparedData: PrepareTransactionResult | PrepareSwapResult;
  timestamp: number;
}

export const useTransactions = () => {
  const { signTransaction } = useWallet();
  const { isAuthenticated, publicKey } = useAuth();
  const { refresh: refreshWalletData } = useWalletData();
  const solanaApi = useMemo(() => new SolanaApi(), []);
  
  const [state, setState] = useState<TransactionState>({
    preparing: false,
    signing: false,
    submitting: false,
    error: null,
  });

  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);

  const setLoading = useCallback((key: keyof TransactionState, value: boolean) => {
    setState(prev => ({
      ...prev,
      [key]: value,
      error: value ? null : prev.error, // Clear error when starting new operation
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Prepare SOL transfer
  const prepareTransfer = useCallback(async (
    toAddress: string,
    amount: number
  ): Promise<PendingTransaction | null> => {
    if (!isAuthenticated || !publicKey) {
      setError('Wallet not connected');
      return null;
    }

    setLoading('preparing', true);

    try {
      const preparedData = await solanaApi.prepareTransfer(
        publicKey.toBase58(),
        toAddress,
        amount
      );

      const pendingTx: PendingTransaction = {
        id: `transfer_${Date.now()}`,
        type: 'transfer',
        from: preparedData.from,
        to: preparedData.to,
        fromToken: 'SOL',
        toToken: 'SOL',
        fromAmount: amount.toString(),
        toAmount: amount.toString(),
        fees: '~0.000005 SOL',
        preparedData,
        timestamp: Date.now(),
      };

      setPendingTransactions(prev => [...prev, pendingTx]);
      return pendingTx;
    } catch (error) {
      const errorMsg = error instanceof SolanaApiError 
        ? error.message 
        : 'Failed to prepare transfer';
      setError(errorMsg);
      return null;
    } finally {
      setLoading('preparing', false);
    }
  }, [isAuthenticated, publicKey, solanaApi, setLoading, setError]);

  // Prepare token swap
  const prepareSwap = useCallback(async (
    fromToken: string,
    toToken: string,
    amount: number
  ): Promise<PendingTransaction | null> => {
    if (!isAuthenticated || !publicKey) {
      setError('Wallet not connected');
      return null;
    }

    setLoading('preparing', true);

    try {
      const preparedData = await solanaApi.prepareSwap(
        publicKey.toBase58(),
        fromToken,
        toToken,
        amount
      );

      const pendingTx: PendingTransaction = {
        id: `swap_${Date.now()}`,
        type: 'swap',
        from: publicKey.toBase58(),
        to: publicKey.toBase58(),
        fromToken,
        toToken,
        fromAmount: amount.toString(),
        toAmount: preparedData.quote_info.expected_output.toString(),
        price: `1 ${fromToken} = ${(preparedData.quote_info.expected_output / amount).toFixed(4)} ${toToken}`,
        fees: '~0.000005 SOL',
        slippage: `${preparedData.quote_info.price_impact.toFixed(2)}%`,
        preparedData,
        timestamp: Date.now(),
      };

      setPendingTransactions(prev => [...prev, pendingTx]);
      return pendingTx;
    } catch (error) {
      const errorMsg = error instanceof SolanaApiError 
        ? error.message 
        : 'Failed to prepare swap';
      setError(errorMsg);
      return null;
    } finally {
      setLoading('preparing', false);
    }
  }, [isAuthenticated, publicKey, solanaApi, setLoading, setError]);

  // Sign and submit transaction
  const executeTransaction = useCallback(async (pendingTx: PendingTransaction): Promise<boolean> => {
    if (!signTransaction) {
      setError('Wallet does not support signing');
      return false;
    }

    setLoading('signing', true);

    try {
      // Decode the unsigned transaction
      const transaction = Transaction.from(
        Buffer.from(pendingTx.preparedData.unsigned_transaction, 'base64')
      );

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      
      setLoading('signing', false);
      setLoading('submitting', true);

      // Submit to network
      const result = await solanaApi.submitTransaction(
        Buffer.from(signedTransaction.serialize()).toString('base64')
      );

      console.log('Transaction submitted:', result.signature);

      // Remove from pending and refresh wallet data
      setPendingTransactions(prev => prev.filter(tx => tx.id !== pendingTx.id));
      
      // Refresh wallet data to show updated balances
      setTimeout(() => refreshWalletData(), 2000);

      return true;
    } catch (error) {
      const errorMsg = error instanceof SolanaApiError 
        ? error.message 
        : error instanceof Error 
        ? error.message 
        : 'Transaction failed';
      setError(errorMsg);
      return false;
    } finally {
      setLoading('signing', false);
      setLoading('submitting', false);
    }
  }, [signTransaction, solanaApi, refreshWalletData, setLoading, setError]);

  // Cancel pending transaction
  const cancelTransaction = useCallback((txId: string) => {
    setPendingTransactions(prev => prev.filter(tx => tx.id !== txId));
  }, []);

  // Clear all pending transactions
  const clearPendingTransactions = useCallback(() => {
    setPendingTransactions([]);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    state,
    pendingTransactions,
    
    // Computed
    isLoading: Object.values(state).some(v => typeof v === 'boolean' && v),
    hasError: !!state.error,
    hasPendingTransactions: pendingTransactions.length > 0,

    // Actions
    prepareTransfer,
    prepareSwap,
    executeTransaction,
    cancelTransaction,
    clearPendingTransactions,
    clearError,

    // Utils
    getPendingTransaction: (id: string) => pendingTransactions.find(tx => tx.id === id),
  };
};
