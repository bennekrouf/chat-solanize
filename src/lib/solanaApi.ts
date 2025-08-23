// src/lib/solanaApi.ts - Simplified for chat-only architecture

export interface SolanaApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface WalletBalance {
  wallet_address: string;
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
  wallet_address: string;
  transactions: TransactionHistoryItem[];
  total_count: number;
  has_more: boolean;
  next_before: string | null;
}

export interface TokenSearchResult {
  tokens: TokenInfo[];
  count: number;
}

export interface WalletTokens {
  wallet_address: string;
  tokens: WalletToken[];
  total_tokens: number;
}

export class SolanaApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: SolanaApiResponse<unknown>
  ) {
    super(message);
    this.name = 'SolanaApiError';
  }
}

export class SolanaApi {
  constructor(private apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>) {}

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await this.apiCall(endpoint, options);

      if (!response.ok) {
        throw new SolanaApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      const result: SolanaApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new SolanaApiError(result.error || 'Unknown API error', 0, result);
      }

      return result.data!;
    } catch (error) {
      if (error instanceof SolanaApiError) throw error;
      throw new SolanaApiError('Network error or invalid response');
    }
  }

  // Read-only data endpoints - these are still useful for the UI
  async healthCheck(): Promise<string> {
    return this.request<string>('/api/v1/transactions/health', 'GET');
  }

  async getBalance(wallet_address: string): Promise<WalletBalance> {
    return this.request<WalletBalance>(`/api/v1/transactions/balance/${wallet_address}`, 'GET');
  }

  async getWalletTokens(wallet_address: string): Promise<WalletTokens> {
    return this.request<WalletTokens>('/api/v1/transactions/wallet/tokens', 'POST', { 
      wallet_address 
    });
  }

  async getTokenPrice(tokens: string[]): Promise<TokenPrice[]> {
    return this.request<TokenPrice[]>('/api/v1/transactions/price', 'POST', { tokens });
  }

  async searchTokens(query: string): Promise<TokenSearchResult> {
    return this.request<TokenSearchResult>('/api/v1/transactions/tokens/search', 'POST', { query });
  }

  async getTransactionHistory(
    wallet_address: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<TransactionHistory> {
    return this.request<TransactionHistory>('/api/v1/transactions/history', 'POST', {
      wallet_address,
      limit,
      offset
    });
  }

  async getUserPaymentHistory(): Promise<TransactionHistory> {
    return this.request<TransactionHistory>('/api/v1/transactions/history', 'GET');
  }

  // Transaction operations are now handled through chat
  // These methods are removed since backend handles them:
  // - createTransaction
  // - confirmTransaction 
  // - prepareTransfer
  // - prepareSwap
  // - submitTransaction
}
