// src/lib/solanaApi.ts

export interface SolanaApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface WalletBalance {
  pubkey: string;
  balance: number;
  token: string;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address?: string;
  mint?: string;
  decimals: number;
}

export interface WalletToken extends TokenInfo {
  balance: number;
  usd_value: number;
}

export interface TokenPrice {
  token: string;
  price: number;
  currency: string;
}

export interface TransactionHistoryItem {
  signature: string;
  status: 'Success' | 'Failed' | 'Pending';
  confirmation_status: 'Processed' | 'Confirmed' | 'Finalized';
  block_time: number;
  slot: number;
  fee: number;
  amount: number;
  token_symbol: string;
  transaction_type: 'Transfer' | 'TokenTransfer' | 'Swap' | 'Unknown';
  error: string | null;
}

export interface TransactionHistory {
  pubkey: string;
  transactions: TransactionHistoryItem[];
  total_count: number;
  has_more: boolean;
  next_before: string | null;
}

export interface PendingTransactions {
  pubkey: string;
  pending_transactions: TransactionHistoryItem[];
  count: number;
}

export interface TokenSearchResult {
  tokens: TokenInfo[];
  count: number;
}

export interface WalletTokens {
  pubkey: string;
  tokens: WalletToken[];
  total_tokens: number;
}

export interface PrepareTransactionResult {
  unsigned_transaction: string;
  from: string;
  to: string;
  amount: number;
  required_signers: string[];
  recent_blockhash: string;
}

export interface SwapQuoteInfo {
  expected_output: number;
  price_impact: number;
  route_steps: number;
}

export interface PrepareSwapResult {
  unsigned_transaction: string;
  quote_info: SwapQuoteInfo;
  required_signers: string[];
  recent_blockhash: string;
}

export interface SubmitTransactionResult {
  signature: string;
  status: string;
}

export class SolanaApiError extends Error {
  constructor(
    message: string,
    public response?: SolanaApiResponse<unknown>
  ) {
    super(message);
    this.name = 'SolanaApiError';
  }
}

import { getSolanaApiUrl } from './config';

export class SolanaApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getSolanaApiUrl();
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: Record<string, unknown>
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new SolanaApiError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: SolanaApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new SolanaApiError(result.error || 'Unknown API error', result);
      }

      return result.data!;
    } catch (error) {
      if (error instanceof SolanaApiError) throw error;
      throw new SolanaApiError('Network error or invalid response');
    }
  }

  async healthCheck(): Promise<string> {
    return this.request<string>('/api/v1/health', 'GET');
  }

  async getBalance(pubkey: string): Promise<WalletBalance> {
    return this.request<WalletBalance>('/api/v1/balance', 'POST', { pubkey });
  }

  async getWalletTokens(pubkey: string): Promise<WalletTokens> {
    return this.request<WalletTokens>('/api/v1/wallet/tokens', 'POST', { pubkey });
  }

  async getTokenPrice(token: string): Promise<TokenPrice> {
    return this.request<TokenPrice>('/api/v1/price', 'POST', { token });
  }

  async searchTokens(query: string): Promise<TokenSearchResult> {
    return this.request<TokenSearchResult>('/api/v1/tokens/search', 'POST', { query });
  }

  async getTransactionHistory(
    pubkey: string,
    limit: number = 20,
    before?: string
  ): Promise<TransactionHistory> {
    const body: Record<string, unknown> = { pubkey, limit };
    if (before) body.before = before;
    
    return this.request<TransactionHistory>('/api/v1/transactions/history', 'POST', body);
  }

  async getPendingTransactions(pubkey: string): Promise<PendingTransactions> {
    return this.request<PendingTransactions>('/api/v1/transactions/pending', 'POST', { pubkey });
  }

  async prepareTransfer(
    payer_pubkey: string,
    to_address: string,
    amount: number
  ): Promise<PrepareTransactionResult> {
    return this.request<PrepareTransactionResult>('/api/v1/transaction/prepare', 'POST', {
      payer_pubkey,
      to_address,
      amount
    });
  }

  async prepareSwap(
    payer_pubkey: string,
    from_token: string,
    to_token: string,
    amount: number
  ): Promise<PrepareSwapResult> {
    return this.request<PrepareSwapResult>('/api/v1/swap/prepare', 'POST', {
      payer_pubkey,
      from_token,
      to_token,
      amount
    });
  }

  async submitTransaction(signed_transaction: string): Promise<SubmitTransactionResult> {
    return this.request<SubmitTransactionResult>('/api/v1/transaction/submit', 'POST', {
      signed_transaction
    });
  }
}
