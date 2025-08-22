// src/lib/config.ts

interface SiteConfig {
  site: {
    name: string;
    domain: string;
    description: string;
    locale: string;
  };
  api: {
    solana_gateway_url: string;
    chat_api_url: string;
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

// Default configuration
const defaultConfig: SiteConfig = {
  site: {
    name: "Solanize",
    domain: "solanize.com", 
    description: "AI-powered Solana wallet interface",
    locale: "en"
  },
  api: {
    chat_api_url: process.env.NEXT_PUBLIC_CHAT_API_URL || "http://127.0.0.1:5000"
  },
  solana: {
    // network: (process.env.NEXT_PUBLIC_SOLANA_NETWORK as unknown) || "devnet",
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
export const getChatApiUrl = (): string => config.api.chat_api_url;
// export const getSolanaNetwork = (): string => config.solana.network;
export const getExplorerUrl = (): string => config.solana.explorer_url;
export const getRefreshInterval = (): number => config.transactions.refresh_interval;

// Validation
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.api.solana_gateway_url) {
    errors.push("Missing Solana Gateway API URL");
  }

  if (!config.api.chat_api_url) {
    errors.push("Missing Chat API URL");
  }

  // if (!['devnet', 'testnet', 'mainnet-beta'].includes(config.solana.network)) {
  //   errors.push("Invalid Solana network specified");
  // }

  if (config.transactions.default_slippage < 0 || config.transactions.default_slippage > config.transactions.max_slippage) {
    errors.push("Invalid slippage configuration");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Initialize configuration
if (typeof window !== 'undefined') {
  const validation = validateConfig();
  if (!validation.isValid) {
    console.warn('Configuration validation failed:', validation.errors);
  }
  
  console.info('Solanize configuration loaded:', {
    // solanaNetwork: config.solana.network,
    apiEndpoints: {
      solana: config.api.solana_gateway_url,
      chat: config.api.chat_api_url
    }
  });
}
