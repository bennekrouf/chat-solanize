// src/hooks/useWalletData.ts - Fixed to match backend API guidelines

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { SolanaApi, type WalletToken, type TransactionHistoryItem, type TokenPrice, SolanaApiError } from '@/lib/solanaApi';

interface WalletDataState {
  balances: WalletToken[];
  transactions: TransactionHistoryItem[];
  userPaymentHistory: TransactionHistoryItem[]; // New: user's payment history
  prices: TokenPrice[];
  loading: {
    balances: boolean;
    transactions: boolean;
    userHistory: boolean;
    prices: boolean;
  };
  error: string | null;
  hasMoreTransactions: boolean;
  currentOffset: number;
}

export const useWalletData = () => {
  const { isAuthenticated, publicKey, apiCall } = useAuth();
  const solanaApi = useMemo(() => new SolanaApi(apiCall), [apiCall]);
  
  const [state, setState] = useState<WalletDataState>({
    balances: [],
    transactions: [],
    userPaymentHistory: [],
    prices: [],
    loading: {
      balances: false,
      transactions: false,
      userHistory: false,
      prices: false,
    },
    error: null,
    hasMoreTransactions: false,
    currentOffset: 0,
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

  // Load transaction history for any wallet (public endpoint)
  const loadTransactions = useCallback(async (walletAddress?: string, refresh = false, loadMore = false) => {
    if (!walletAddress && !publicKey) {
      setState(prev => ({ ...prev, transactions: [], hasMoreTransactions: false }));
      return;
    }

    const targetWallet = walletAddress || publicKey!.toBase58();

    if (state.transactions.length > 0 && !refresh && !loadMore) return;

    setLoading('transactions', true);
    setError(null);

    try {
      const offset = loadMore ? state.currentOffset : 0;
      const historyData = await solanaApi.getTransactionHistory(
        targetWallet,
        20,
        offset
      );

      setState(prev => ({
        ...prev,
        transactions: loadMore 
          ? [...prev.transactions, ...historyData.transactions]
          : historyData.transactions,
        hasMoreTransactions: historyData.has_more,
        currentOffset: offset + historyData.transactions.length,
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
  }, [publicKey, solanaApi, state.transactions.length, state.currentOffset, setLoading, setError]);

  // Load user's payment history (authenticated endpoint)
  const loadUserPaymentHistory = useCallback(async (refresh = false) => {
    if (!isAuthenticated) {
      setState(prev => ({ ...prev, userPaymentHistory: [] }));
      return;
    }

    if (state.userPaymentHistory.length > 0 && !refresh) return;

    setLoading('userHistory', true);

    try {
      const historyData = await solanaApi.getUserPaymentHistory();
      setState(prev => ({
        ...prev,
        userPaymentHistory: historyData.transactions
      }));
    } catch (error) {
      console.error('Failed to load user payment history:', error);
      // Don't set error for this since it's optional
    } finally {
      setLoading('userHistory', false);
    }
  }, [isAuthenticated, solanaApi, state.userPaymentHistory.length, setLoading]);

  // Load token prices for held tokens
  const loadTokenPrices = useCallback(async () => {
    if (state.balances.length === 0) return;

    setLoading('prices', true);

    try {
      const tokenSymbols = state.balances.map(token => token.symbol);
      const prices = await solanaApi.getTokenPrice(tokenSymbols);
      
      setState(prev => ({
        ...prev,
        prices
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

    // Load balances first, then others in parallel
    await loadBalances(refresh);
    
    await Promise.all([
      loadTransactions(undefined, refresh),
      loadUserPaymentHistory(refresh),
    ]);
  }, [isAuthenticated, publicKey, loadBalances, loadTransactions, loadUserPaymentHistory]);

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

  const pendingTransactions = useMemo(() => {
    return state.transactions.filter(tx => tx.status === 'Pending');
  }, [state.transactions]);

  return {
    // State
    balances: state.balances,
    transactions: state.transactions,
    userPaymentHistory: state.userPaymentHistory,
    pendingTransactions,
    prices: state.prices,
    loading: state.loading,
    error: state.error,
    hasMoreTransactions: state.hasMoreTransactions,

    // Computed
    totalPortfolioValue,
    isLoading,
    recentTransactions,
    hasPendingTransactions: pendingTransactions.length > 0,

    // Actions
    loadWalletData,
    loadBalances,
    loadTransactions,
    loadUserPaymentHistory,
    loadMoreTransactions: () => loadTransactions(undefined, false, true),
    searchTokens,
    refresh: () => loadWalletData(true),
    clearError: () => setError(null),

    // Utils
    getTokenPrice: (symbol: string) => {
      const priceData = state.prices.find(p => p.token === symbol);
      return priceData?.price || 0;
    },
    getTokenBalance: (symbol: string) => state.balances.find(t => t.symbol === symbol)?.balance || 0,
  };
};
