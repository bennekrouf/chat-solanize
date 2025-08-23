// src/lib/config.ts - Fixed to match backend API guidelines

interface SiteConfig {
  site: {
    name: string;
    domain: string;
    description: string;
    locale: string;
  };
  api: {
    gateway_url: string; // Single gateway URL for all API calls
  };
  solana: {
    explorer_url: string;
  };
  logging: {
    level: string;
    format: string;
    output: string;
  };
  transactions: {
    default_slippage: number;
    max_slippage: number;
    default_priority_fee: number;
    refresh_interval: number;
  };
}

// Default configuration - CRITICAL: Always use gateway URL
const defaultConfig: SiteConfig = {
  site: {
    name: "Solanize",
    domain: "solanize.com", 
    description: "AI-powered Solana wallet interface",
    locale: "en"
  },
  api: {
    // IMPORTANT: All API calls must go through the gateway on port 5000
    gateway_url: process.env.NEXT_PUBLIC_GATEWAY_URL || "http://127.0.0.1:5000"
  },
  solana: {
    explorer_url: process.env.NEXT_PUBLIC_SOLANA_EXPLORER || "https://solscan.io"
  },
  logging: {
    level: "trace",
    format: "json", 
    output: "console"
  },
  transactions: {
    default_slippage: 1.0,
    max_slippage: 5.0,
    default_priority_fee: 0.000005,
    refresh_interval: 10000
  }
};

// Configuration instance
let config: SiteConfig = defaultConfig;

export const getConfig = (): SiteConfig => config;

export const updateConfig = (newConfig: Partial<SiteConfig>): void => {
  config = { ...config, ...newConfig } as SiteConfig;
};

// Specific getters for commonly used values
export const getGatewayUrl = (): string => config.api.gateway_url;
export const getExplorerUrl = (): string => config.solana.explorer_url;
export const getRefreshInterval = (): number => config.transactions.refresh_interval;

// Validation
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.api.gateway_url) {
    errors.push("Missing Gateway API URL - all requests must go through the gateway");
  }

  // Validate that we're not accidentally using microservice URLs
  if (config.api.gateway_url.includes(':8080') || 
      config.api.gateway_url.includes(':8001') ||
      config.api.gateway_url.includes('solana-service') ||
      config.api.gateway_url.includes('chat-service')) {
    errors.push("Invalid API URL: Must use gateway URL (port 5000), not microservice URLs");
  }

  if (config.transactions.default_slippage < 0 || config.transactions.default_slippage > config.transactions.max_slippage) {
    errors.push("Invalid slippage configuration");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Available API endpoints according to backend guidelines
export const API_ENDPOINTS = {
  // Authentication (No JWT Required)
  AUTH: {
    CHALLENGE: (wallet_address: string) => `/api/v1/auth/challenge/${wallet_address}`,
    VERIFY: '/api/v1/auth/verify',
    REFRESH: '/api/v1/auth/refresh'
  },
  
  // Chat (JWT Required)
  CHAT: {
    SESSIONS: '/api/v1/chat/sessions',
    SESSION_MESSAGES: (id: string) => `/api/v1/chat/sessions/${id}/messages`,
    DELETE_SESSION: (id: string) => `/api/v1/chat/sessions/${id}`,
    HEALTH: '/api/v1/chat/health',
    MODELS: '/api/v1/chat/models'
  },
  
  // Transactions (JWT Required for some)
  TRANSACTIONS: {
    CREATE: '/api/v1/transactions/create',
    CONFIRM: '/api/v1/transactions/confirm',
    USER_HISTORY: '/api/v1/transactions/history', // GET - user's payment history
    WALLET_HISTORY: '/api/v1/transactions/history', // POST - any wallet's history
    WALLET_TOKENS: '/api/v1/transactions/wallet/tokens',
    PRICE: '/api/v1/transactions/price',
    TOKEN_SEARCH: '/api/v1/transactions/tokens/search',
    BALANCE: (wallet: string) => `/api/v1/transactions/balance/${wallet}`,
    HEALTH: '/api/v1/transactions/health'
  }
} as const;

// Initialize configuration
if (typeof window !== 'undefined') {
  const validation = validateConfig();
  if (!validation.isValid) {
    console.warn('Configuration validation failed:', validation.errors);
  }
  
  console.info('Solanize configuration loaded:', {
    gatewayUrl: config.api.gateway_url,
    environment: process.env.NODE_ENV
  });
}
