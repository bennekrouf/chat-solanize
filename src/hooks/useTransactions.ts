// src/hooks/useTransactions.ts - Simplified for chat-only architecture

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { ChatApi, type PreparedTransaction } from '@/lib/chatApi';
import { useAuth } from './useAuth';
import { useWalletData } from './useWalletData';

export interface TransactionSigningState {
  signing: boolean;
  error: string | null;
}

export interface PendingTransactionUI {
  id: string;
  preparedTransaction: PreparedTransaction;
  timestamp: number;
}

export const useTransactions = () => {
  const { signTransaction } = useWallet();
  const { isAuthenticated, apiCall } = useAuth();
  const { refresh: refreshWalletData } = useWalletData();
  const chatApi = new ChatApi(apiCall);
  
  const [state, setState] = useState<TransactionSigningState>({
    signing: false,
    error: null,
  });

  const [pendingTransactions, setPendingTransactions] = useState<PendingTransactionUI[]>([]);

  const setLoading = useCallback((value: boolean) => {
    setState(prev => ({
      ...prev,
      signing: value,
      error: value ? null : prev.error, // Clear error when starting new operation
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Add a transaction to the pending list (called when AI provides a prepared transaction)
  const addPendingTransaction = useCallback((preparedTransaction: PreparedTransaction) => {
    const pendingTx: PendingTransactionUI = {
      id: `tx_${Date.now()}`,
      preparedTransaction,
      timestamp: Date.now(),
    };

    setPendingTransactions(prev => [...prev, pendingTx]);
    return pendingTx;
  }, []);

  // Sign a transaction and send it back to the chat
  const signAndSendTransaction = useCallback(async (
    sessionId: string,
    pendingTx: PendingTransactionUI
  ): Promise<boolean> => {
    if (!signTransaction) {
      setError('Wallet does not support signing');
      return false;
    }

    if (!isAuthenticated) {
      setError('Not authenticated');
      return false;
    }

    setLoading(true);

    try {
      // Decode the unsigned transaction
      const transaction = Transaction.from(
        Buffer.from(pendingTx.preparedTransaction.unsigned_transaction, 'base64')
      );

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send the signed transaction back to the chat
      const signedTxString = Buffer.from(signedTransaction.serialize()).toString('base64');
      
      await chatApi.sendSignedTransaction(
        sessionId,
        pendingTx.preparedTransaction.transaction_id || pendingTx.id,
        signedTxString,
        'Transaction signed and ready for submission'
      );

      // Remove from pending
      setPendingTransactions(prev => prev.filter(tx => tx.id !== pendingTx.id));
      
      // Refresh wallet data after a short delay to show updated balances
      setTimeout(() => refreshWalletData(), 3000);

      return true;
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Transaction signing failed';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [signTransaction, isAuthenticated, chatApi, refreshWalletData, setLoading, setError]);

  // Cancel a pending transaction
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
    isLoading: state.signing,
    hasError: !!state.error,
    hasPendingTransactions: pendingTransactions.length > 0,

    // Actions
    addPendingTransaction,
    signAndSendTransaction,
    cancelTransaction,
    clearPendingTransactions,
    clearError,

    // Utils
    getPendingTransaction: (id: string) => pendingTransactions.find(tx => tx.id === id),
  };
};
