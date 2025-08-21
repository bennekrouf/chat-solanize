// src/hooks/useWalletData.ts

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { SolanaApi, type WalletToken, type TransactionHistoryItem, type TokenPrice, SolanaApiError } from '@/lib/solanaApi';

interface WalletDataState {
  balances: WalletToken[];
  transactions: TransactionHistoryItem[];
  pendingTransactions: TransactionHistoryItem[];
  prices: Record<string, TokenPrice>;
  loading: {
    balances: boolean;
    transactions: boolean;
    pending: boolean;
    prices: boolean;
  };
  error: string | null;
  hasMoreTransactions: boolean;
  nextTransactionBefore: string | null;
}

export const useWalletData = () => {
  const { isAuthenticated, publicKey } = useAuth();
  const solanaApi = useMemo(() => new SolanaApi(), []);
  
  const [state, setState] = useState<WalletDataState>({
    balances: [],
    transactions: [],
    pendingTransactions: [],
    prices: {},
    loading: {
      balances: false,
      transactions: false,
      pending: false,
      prices: false,
    },
    error: null,
    hasMoreTransactions: false,
    nextTransactionBefore: null,
  });

  const setLoading = useCallback((key: keyof WalletDataState['loading'], value: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Load wallet token balances
  const loadBalances = useCallback(async (refresh = false) => {
    if (!isAuthenticated || !publicKey) {
      setState(prev => ({ ...prev, balances: [] }));
      return;
    }

    // Don't reload if we already have data and not refreshing
    if (state.balances.length > 0 && !refresh) return;

    setLoading('balances', true);
    setError(null);

    try {
      const walletData = await solanaApi.getWalletTokens(publicKey.toBase58());
      setState(prev => ({
        ...prev,
        balances: walletData.tokens
      }));
    } catch (error) {
      const errorMsg = error instanceof SolanaApiError 
        ? error.message 
        : 'Failed to load wallet balances';
      setError(errorMsg);
      console.error('Failed to load balances:', error);
    } finally {
      setLoading('balances', false);
    }
  }, [isAuthenticated, publicKey, solanaApi, state.balances.length, setLoading, setError]);

  // Load transaction history
  const loadTransactions = useCallback(async (refresh = false, loadMore = false) => {
    if (!isAuthenticated || !publicKey) {
      setState(prev => ({ ...prev, transactions: [], hasMoreTransactions: false }));
      return;
    }

    // Don't reload if we already have data and not refreshing/loading more
    if (state.transactions.length > 0 && !refresh && !loadMore) return;

    setLoading('transactions', true);
    setError(null);

    try {
      const before = loadMore ? state.nextTransactionBefore : undefined;
      const historyData = await solanaApi.getTransactionHistory(
        publicKey.toBase58(),
        20,
        before || undefined
      );

      setState(prev => ({
        ...prev,
        transactions: loadMore 
          ? [...prev.transactions, ...historyData.transactions]
          : historyData.transactions,
        hasMoreTransactions: historyData.has_more,
        nextTransactionBefore: historyData.next_before,
      }));
    } catch (error) {
      const errorMsg = error instanceof SolanaApiError 
        ? error.message 
        : 'Failed to load transaction history';
      setError(errorMsg);
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading('transactions', false);
    }
  }, [isAuthenticated, publicKey, solanaApi, state.transactions.length, state.nextTransactionBefore, setLoading, setError]);

  // Load pending transactions
  const loadPendingTransactions = useCallback(async () => {
    if (!isAuthenticated || !publicKey) {
      setState(prev => ({ ...prev, pendingTransactions: [] }));
      return;
    }

    setLoading('pending', true);

    try {
      const pendingData = await solanaApi.getPendingTransactions(publicKey.toBase58());
      setState(prev => ({
        ...prev,
        pendingTransactions: pendingData.pending_transactions
      }));
    } catch (error) {
      // Pending transactions failure shouldn't block other functionality
      console.error('Failed to load pending transactions:', error);
    } finally {
      setLoading('pending', false);
    }
  }, [isAuthenticated, publicKey, solanaApi, setLoading]);

  // Load token prices for held tokens
  const loadTokenPrices = useCallback(async () => {
    if (state.balances.length === 0) return;

    setLoading('prices', true);

    try {
      const pricePromises = state.balances.map(async (token) => {
        try {
          const price = await solanaApi.getTokenPrice(token.symbol);
          return { [token.symbol]: price };
        } catch (error) {
          console.warn(`Failed to load price for ${token.symbol}:`, error);
          return null;
        }
      });

      const priceResults = await Promise.all(pricePromises);
      const prices = priceResults.reduce((acc, result) => {
        return result ? { ...acc, ...result } : acc;
      }, {});

      setState(prev => ({
        ...prev,
        prices: { ...prev.prices, ...prices }
      }));
    } catch (error) {
      console.error('Failed to load token prices:', error);
    } finally {
      setLoading('prices', false);
    }
  }, [state.balances, solanaApi, setLoading]);

  // Search tokens
  const searchTokens = useCallback(async (query: string) => {
    if (!query.trim()) return [];

    try {
      const results = await solanaApi.searchTokens(query.trim());
      return results.tokens;
    } catch (error) {
      console.error('Token search failed:', error);
      return [];
    }
  }, [solanaApi]);

  // Load all wallet data
  const loadWalletData = useCallback(async (refresh = false) => {
    if (!isAuthenticated || !publicKey) return;

    // Load balances first, then transactions and pending in parallel
    await loadBalances(refresh);
    
    // Load transactions and pending in parallel
    await Promise.all([
      loadTransactions(refresh),
      loadPendingTransactions(),
    ]);
  }, [isAuthenticated, publicKey, loadBalances, loadTransactions, loadPendingTransactions]);

  // Auto-load data when wallet connects
  useEffect(() => {
    if (isAuthenticated && publicKey) {
      loadWalletData();
    }
  }, [isAuthenticated, publicKey, loadWalletData]);

  // Load prices when balances change
  useEffect(() => {
    if (state.balances.length > 0) {
      loadTokenPrices();
    }
  }, [state.balances.length, loadTokenPrices]);

  // Auto-refresh pending transactions periodically
  useEffect(() => {
    if (!isAuthenticated || state.pendingTransactions.length === 0) return;

    const interval = setInterval(() => {
      loadPendingTransactions();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, state.pendingTransactions.length, loadPendingTransactions]);

  // Computed values
  const totalPortfolioValue = useMemo(() => {
    return state.balances.reduce((total, token) => total + token.usd_value, 0);
  }, [state.balances]);

  const isLoading = useMemo(() => {
    return Object.values(state.loading).some(Boolean);
  }, [state.loading]);

  const recentTransactions = useMemo(() => {
    return state.transactions.slice(0, 5);
  }, [state.transactions]);

  return {
    // State
    balances: state.balances,
    transactions: state.transactions,
    pendingTransactions: state.pendingTransactions,
    prices: state.prices,
    loading: state.loading,
    error: state.error,
    hasMoreTransactions: state.hasMoreTransactions,

    // Computed
    totalPortfolioValue,
    isLoading,
    recentTransactions,
    hasPendingTransactions: state.pendingTransactions.length > 0,

    // Actions
    loadWalletData,
    loadBalances,
    loadTransactions,
    loadPendingTransactions,
    loadMoreTransactions: () => loadTransactions(false, true),
    searchTokens,
    refresh: () => loadWalletData(true),
    clearError: () => setError(null),

    // Utils
    getTokenPrice: (symbol: string) => state.prices[symbol]?.price || 0,
    getTokenBalance: (symbol: string) => state.balances.find(t => t.symbol === symbol)?.balance || 0,
  };
};
