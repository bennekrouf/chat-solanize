This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: content
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded

## Additional Info

# Directory Structure
```
config/
  site.yaml
messages/
  en.json
  fr.json
src/
  app/
    [locale]/
      layout.tsx
      page.tsx
    api/
      contact/
        route.ts
    globals.css
    layout.tsx
    page.tsx
    providers.tsx
  components/
    chat/
      ChatInterface.tsx
    layout/
      Footer.tsx
      LayoutTemplate.tsx
      Navbar.tsx
    ui/
      Motion.tsx
    wallet/
      WalletButton.tsx
      WalletProvider.tsx
    ErrorBoundary.tsx
  hooks/
    useAuth.ts
    useChat.ts
    useTransactions.ts
    useWalletData.ts
  lib/
    chatApi.ts
    config.ts
    solanaApi.ts
  types/
    bs58.d.ts
    globals.d.ts
.gitignore
eslint.config.mjs
i18n.ts
next.config.ts
package.json
postcss.config.mjs
README.md
site.yml
tailwind.config.ts
tsconfig.json
```

# Files

## File: config/site.yaml
````yaml
# Site Configuration
site:
  name: "MyApp"
  domain: "myapp.com"
  description: "Your app description"
  locale: "en"
  
# Add your configuration here
api:
  # example_service_url: "https://api.example.com"
  
# Logging preferences (following your Rust preference)
logging:
  level: "trace"
  format: "json"
  output: "console"
````

## File: messages/en.json
````json
{
  "metadata": {
    "site_title": "Solanize",
    "site_description": "Your app description"
  },
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error"
  }
}
````

## File: messages/fr.json
````json
{
  "metadata": {
    "site_title": "MonApp",
    "site_description": "Description de votre app"
  },
  "navigation": {
    "home": "Accueil",
    "about": "À propos",
    "contact": "Contact"
  },
  "common": {
    "loading": "Chargement...",
    "error": "Erreur"
  }
}
````

## File: src/app/[locale]/layout.tsx
````typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "../providers";
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { locales } from '../../../i18n';
import { notFound } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: {
      template: '%s | My App',
      default: t('site_title'),
    },
    description: t('site_description'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  let messages;
  try {
    if (locale === 'fr') {
      messages = (await import('../../../messages/fr.json')).default;
    } else {
      messages = (await import('../../../messages/en.json')).default;
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    messages = (await import('../../../messages/en.json')).default;
  }

  return (
  <NextIntlClientProvider locale={locale} messages={messages}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </div>
    </ThemeProvider>
  </NextIntlClientProvider>
);
}
````

## File: src/app/[locale]/page.tsx
````typescript
import ChatInterface from '@/components/chat/ChatInterface';

export default function HomePage() {
  return (
    <div className="h-screen overflow-hidden">
      <ChatInterface />
    </div>
  );
}
````

## File: src/app/api/contact/route.ts
````typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Add your contact form handling logic here
    // Examples:
    // - Send email via SendGrid, Resend, etc.
    // - Save to database
    // - Integrate with CRM
    
    console.log('Contact form submission:', body);
    
    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
````

## File: src/app/globals.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Design System CSS Variables */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;
 
    --primary: 25 100% 50%; /* #FF6B00 - Change this for your brand */
    --primary-foreground: 0 0% 100%;
 
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
 
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
 
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
 
    --primary: 25 100% 50%; /* Keep primary consistent */
    --primary-foreground: 222.2 47.4% 11.2%;
 
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
 
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
 
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Typography for blog/content */
.prose {
  max-width: 65ch;
  color: hsl(var(--foreground));
}

.prose a {
  color: hsl(var(--primary));
  text-decoration: underline;
  font-weight: 500;
}

.prose strong {
  color: hsl(var(--foreground));
  font-weight: 600;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: hsl(var(--foreground));
  font-weight: 600;
  margin-top: 2em;
  margin-bottom: 1em;
}

.prose code {
  color: hsl(var(--foreground));
  font-weight: 600;
  background-color: hsl(var(--muted));
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
}

.prose pre {
  color: hsl(var(--foreground));
  background-color: hsl(var(--muted));
  border-radius: 0.5rem;
  padding: 1em;
  overflow-x: auto;
}

.prose blockquote {
  color: hsl(var(--muted-foreground));
  border-left-color: hsl(var(--border));
}

.prose hr {
  border-color: hsl(var(--border));
}

/* Text Selection Control */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow text selection for form elements and content */
input,
textarea,
select,
button,
[contenteditable="true"],
[contenteditable=""],
.prose,
.prose *,
.selectable,
.selectable *,
pre,
code,
pre *,
code * {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Code Syntax Highlighting */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6a8494;
}

.token.punctuation {
  color: #a39e9b;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #f92672;
}

.token.boolean,
.token.number {
  color: #ae81ff;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #a6e22e;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string,
.token.variable {
  color: #f8f8f2;
}

.token.atrule,
.token.attr-value,
.token.function,
.token.class-name {
  color: #e6db74;
}

.token.keyword {
  color: #66d9ef;
}

.token.regex,
.token.important {
  color: #fd971f;
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

/* Responsive Design */
@media (max-width: 768px) {
  .prose {
    font-size: 0.95rem;
  }
  
  .prose h1 {
    font-size: 1.875em;
  }
  
  .prose h2 {
    font-size: 1.375em;
  }
  
  .prose h3 {
    font-size: 1.125em;
  }
  
  .prose h4 {
    font-size: 1em;
  }
}
````

## File: src/app/layout.tsx
````typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My App",
  description: "Built with the complete app scaffold",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
````

## File: src/app/page.tsx
````typescript
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootRedirectPage() {
  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';
    const userLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : 'en';
    redirect(`/${userLocale}`);
  } catch (error) {
    console.error('Root redirect error:', error);
    redirect('/en');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
````

## File: src/app/providers.tsx
````typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';
import { WalletContextProvider } from '@/components/wallet/WalletProvider';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <WalletContextProvider>
        {children}
      </WalletContextProvider>
    </NextThemesProvider>
  );
}
````

## File: src/components/chat/ChatInterface.tsx
````typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMenu, FiX, FiMessageCircle, FiPlus, FiTrash2, FiMoon, FiSun, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import WalletButton from '@/components/wallet/WalletButton';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useWalletData } from '@/hooks/useWalletData';
import { useTransactions } from '@/hooks/useTransactions';
import ErrorBoundary from '@/components/ErrorBoundary';

// Transaction Card Components
interface ProposedTransactionCardProps {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  price: string;
  fees: string;
  slippage: string;
  onSign: () => void;
  onCancel: () => void;
}

const ProposedTransactionCard: React.FC<ProposedTransactionCardProps> = ({
  fromToken, toToken, fromAmount, toAmount, price, fees, slippage, onSign, onCancel
}) => (
  <div className="mt-3 p-4 bg-background border border-border rounded-lg">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-semibold text-foreground">Proposed Swap</h4>
      <span className="text-xs text-muted-foreground">Review transaction</span>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">From</span>
        <span className="text-sm font-medium">{fromAmount} {fromToken}</span>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full h-px bg-border"></div>
        <span className="px-2 text-xs text-muted-foreground">↓</span>
        <div className="w-full h-px bg-border"></div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">To</span>
        <span className="text-sm font-medium">{toAmount} {toToken}</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Price</div>
          <div className="text-xs font-medium">{price}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Fees</div>
          <div className="text-xs font-medium">{fees}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Slippage</div>
          <div className="text-xs font-medium">{slippage}</div>
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSign}
          className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Sign
        </button>
      </div>
    </div>
  </div>
);

// interface ExecutedTransactionCardProps {
//   status: 'success' | 'failed';
//   txHash: string;
//   fromToken: string;
//   toToken: string;
//   fromAmount: string;
//   toAmount?: string;
//   timestamp: string;
// }

// const ExecutedTransactionCard: React.FC<ExecutedTransactionCardProps> = ({
//   status, txHash, fromToken, toToken, fromAmount, toAmount, timestamp
// }) => (
//   <div className={`mt-3 p-4 rounded-lg border ${
//     status === 'success' 
//       ? 'bg-green-500/5 border-green-500/20' 
//       : 'bg-red-500/5 border-red-500/20'
//   }`}>
//     <div className="flex items-center justify-between mb-3">
//       <div className="flex items-center gap-2">
//         <span className={`text-lg ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
//           {status === 'success' ? '✓' : '✗'}
//         </span>
//         <h4 className="text-sm font-semibold text-foreground">
//           Transaction {status === 'success' ? 'Completed' : 'Failed'}
//         </h4>
//       </div>
//       <span className="text-xs text-muted-foreground">{timestamp}</span>
//     </div>
//
//     <div className="space-y-2">
//       <div className="text-sm">
//         <span className="text-muted-foreground">Swapped: </span>
//         <span className="font-medium">{fromAmount} {fromToken}</span>
//         {toAmount && (
//           <>
//             <span className="text-muted-foreground"> → </span>
//             <span className="font-medium">{toAmount} {toToken}</span>
//           </>
//         )}
//       </div>
//
//       <button
//         onClick={() => window.open(`https://solscan.io/tx/${txHash}`, '_blank')}
//         className="w-full mt-2 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
//       >
//         <span>View on Solscan</span>
//         <span className="text-xs">↗</span>
//       </button>
//     </div>
//   </div>
// );

// Wallet Status Bar Component
const WalletStatusBar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { 
    balances, 
    pendingTransactions, 
    recentTransactions, 
    loading, 
    // getTokenPrice 
  } = useWalletData();
  
  // Transform wallet data to display format
  const displayBalances = balances.slice(0, 3).map(token => ({
    symbol: token.symbol,
    amount: token.balance.toFixed(token.symbol === 'SOL' ? 3 : 2),
    usd: `$${token.usd_value.toFixed(2)}`,
    change: '0.0%', // Price change calculation could be added later
    icon: token.symbol === 'SOL' ? '◎' : token.symbol === 'USDC' ? '$' : '💎'
  }));

  const pendingCount = pendingTransactions.length;
  const recentTxDisplay = recentTransactions.slice(0, 3).map(tx => ({
    id: tx.signature,
    type: tx.transaction_type.toLowerCase(),
    status: tx.status === 'Success' ? 'success' : 'failed',
    timestamp: new Date(tx.block_time * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }));

  if (!isAuthenticated) {
    return (
      <div className="h-20 border-t border-border bg-card/50 backdrop-blur-sm flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Connect wallet to view balances and transactions</p>
      </div>
    );
  }

  return (
    <div className="h-20 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Wallet Balances */}
        <div className="flex items-center gap-4">
          {loading.balances ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-lg">
              <div className="animate-spin w-4 h-4 border-b-2 border-primary rounded-full"></div>
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : displayBalances.length > 0 ? (
            displayBalances.map((balance) => (
              <div key={balance.symbol} className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-lg">
                <span className="text-base font-medium">{balance.icon}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{balance.amount} {balance.symbol}</span>
                  <span className="text-xs text-muted-foreground">{balance.usd}</span>
                </div>
                <span className={`text-xs ${balance.change.startsWith('+') ? 'text-green-500' : balance.change.startsWith('-') ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {balance.change}
                </span>
              </div>
            ))
          ) : null}
        </div>

        {/* Center: Pending Transactions */}
        <div className="flex items-center gap-4">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-600 dark:text-yellow-400">
                {pendingCount} pending
              </span>
            </div>
          )}
        </div>

        {/* Right: Recent Transactions */}
        <div className="flex items-center gap-2">
          {recentTxDisplay.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground mr-2">Recent:</span>
              {recentTxDisplay.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => window.open(`https://solscan.io/tx/${tx.id}`, '_blank')}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    tx.status === 'success' 
                      ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                      : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                  } transition-colors`}
                  title={`${tx.type} - ${tx.timestamp} - ${tx.status}`}
                >
                  {tx.status === 'success' ? '✓' : '✗'}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [currentInput, setCurrentInput] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  // const { 
    // balances, 
    // pendingTransactions, 
    // recentTransactions, 
    // loading, 
    // getTokenPrice 
  // } = useWalletData();
  const { 
    pendingTransactions: proposedTxs, 
    executeTransaction, 
    cancelTransaction,
    // state: txState 
  } = useTransactions();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    sessions,
    currentSession,
    loading: chatLoading,
    error,
    loadSessions,
    createSession,
    sendMessage,
    deleteSession,
    switchToSession,
    clearError,
    getCurrentMessages,
    getCurrentSession,
  } = useChat();

  const currentMessages = getCurrentMessages();

  // Load sessions on mount if authenticated
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, currentSession });
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated, loadSessions, currentSession]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!currentInput.trim() || chatLoading.sending) return;

    const message = currentInput.trim();
    setCurrentInput('');

    if (!isAuthenticated) {
      alert('Please connect your wallet to send messages');
      return;
    }

    if (!currentSession) {
      const newSession = await createSession();
      if (newSession) {
        await sendMessage(newSession.id, message);
      }
    } else {
      await sendMessage(currentSession, message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateNewChat = async () => {
    await createSession();
    setIsHistoryOpen(false);
  };

  const handleSwitchSession = async (sessionId: string) => {
    await switchToSession(sessionId);
    setIsHistoryOpen(false);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;
    await deleteSession(sessionId);
  };

  const currentSessionInfo = getCurrentSession();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <ChatHeader />
 
      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {error.retry && (
                <button
                  onClick={error.retry}
                  className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/90"
                >
                  Retry
                </button>
              )}
              <button
                onClick={clearError}
                className="text-destructive hover:text-destructive/80"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Three-Zone Layout Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Conversations List */}
        <div className={`${
          isHistoryOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
        
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Chat History</h2>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-secondary transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={handleCreateNewChat}
              disabled={chatLoading.creating}
              className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <FiPlus className="h-4 w-4" />
              {chatLoading.creating ? 'Creating...' : 'New Chat'}
            </button>
          </div>

          {/* Authentication Notice */}
          {!isAuthenticated && (
            <div className="mx-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Connect your wallet to save chat history and access advanced features.
              </p>
            </div>
          )}

          {/* Loading State */}
          {chatLoading.sessions && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSwitchSession(session.id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSession === session.id 
                    ? 'bg-secondary border border-border' 
                    : 'hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiMessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-all"
                  >
                    <FiTrash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center - Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center gap-4 p-4 border-b border-border bg-background/95 backdrop-blur-sm">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-secondary transition-colors"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">
                {currentSessionInfo?.title || 'Chat'}
              </h1>
            </div>
          </div>

          {/* Messages Area with bottom padding for status bar */}
          <div className="flex-1 overflow-y-auto pb-24">
            {currentMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <FiMessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Start a new conversation
                  </h3>
                  <p className="text-muted-foreground">
                    {isAuthenticated 
                      ? "Send a message to begin your chat."
                      : "Connect your wallet to start chatting."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 p-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] md:max-w-[70%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    } rounded-2xl px-4 py-3`}>
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      
                      {/* Show transaction cards for AI messages that mention transactions */}
                      {message.role === 'assistant' && proposedTxs.length > 0 && (
                        <div className="mt-3">
                          {proposedTxs.map((tx) => (
                            <ProposedTransactionCard
                              key={tx.id}
                              fromToken={tx.fromToken}
                              toToken={tx.toToken}
                              fromAmount={tx.fromAmount}
                              toAmount={tx.toAmount || 'Calculating...'}
                              price={tx.price || 'Calculating...'}
                              fees={tx.fees || 'Calculating...'}
                              slippage={tx.slippage || 'Calculating...'}
                              onSign={() => executeTransaction(tx)}
                              onCancel={() => cancelTransaction(tx.id)}
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show AI thinking indicator when sending */}
                {chatLoading.sending && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Positioned above status bar */}
          <div className="absolute bottom-20 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="p-4">
              <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={chatLoading.sending}
                    className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent max-h-32 min-h-[3rem] disabled:opacity-50"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '3rem'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!currentInput.trim() || chatLoading.sending}
                    className="absolute right-2 bottom-2 p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FiSend className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar - Always Visible */}
      <WalletStatusBar />

      {/* Overlay for mobile */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
};

// Chat Header Component
const ChatHeader: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FiMessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">Solanize</span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Wallet Connect Button */}
          <WalletButton />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

const ChatInterfaceWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary>
      <ChatInterface />
    </ErrorBoundary>
  );
};

export default ChatInterfaceWithErrorBoundary;
````

## File: src/components/layout/Footer.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const locale = useLocale();
  const t = useTranslations('footer');

  // Helper function to get localized path
  const getLocalizedPath = (path: string) => {
    if (locale === 'en') return path;
    return `/${locale}${path}`;
  };

  const footerNav: { label: string; path: string }[] = [
    // Example: { label: t('privacy'), path: "/privacy" },
    // Example: { label: t('terms'), path: "/terms" },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Column 1: Logo & Description */}
          <div className="space-y-4">
            <Link href={getLocalizedPath("/")} className="flex items-center space-x-2">
              <span className="font-bold text-xl text-foreground">Solanize</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t('description')}
            </p>
          </div>

          {/* Column 2: Quick Links */}
            {footerNav.length > 0 && (
              <div>
                <h3 className="font-medium text-foreground mb-4">{t('quick_links')}</h3>
                <ul className="space-y-2">
                  {footerNav.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={getLocalizedPath(item.path)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Column 3: Placeholder */}
          <div className="hidden lg:block">
            <h3 className="font-medium text-foreground mb-4">{t('category')}</h3>
            <ul className="space-y-2">
              {/* Add your links here */}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{t('connect')}</h3>
            <div className="flex space-x-4 mb-4">
              {/* Add your social links here */}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('email_label')} contact@myapp.com
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Solanize. {t('copyright')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
````

## File: src/components/layout/LayoutTemplate.tsx
````typescript
'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface LayoutTemplateProps {
  children: React.ReactNode;
}

const LayoutTemplate: React.FC<LayoutTemplateProps> = ({
  children
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LayoutTemplate;
````

## File: src/components/layout/Navbar.tsx
````typescript
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiMoon, FiSun, FiGlobe } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';

const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('navigation');

  // Empty navigation items - add your own
  const navItems: { label: string; path: string }[] = [
    // Example: { label: t('home'), path: "/" },
    // Example: { label: t('about'), path: "/about" },
    // Example: { label: t('contact'), path: "/contact" },
  ];

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
  ];

  useEffect(() => setMounted(true), []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleLangMenu = () => setShowLangMenu(!showLangMenu);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const isLinkActive = (path: string) => {
    const currentPath = pathname.replace(/\/$/, '');
    const normalizedPath = path.replace(/\/$/, '');
    return currentPath === `/${locale}${normalizedPath}` ||
      (path === '/' && currentPath === `/${locale}`);
  };

  const currentLang = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-2"
          >
            <span className="font-bold text-xl text-foreground">MyApp</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={`/${locale}${item.path}`}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isLinkActive(item.path) ? "text-primary" : "text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={toggleLangMenu}
              className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors flex items-center"
              aria-label={t('toggle_language')}
            >
              <FiGlobe className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                {languages.map((lang) => (
                  <Link
                    key={lang.code}
                    href={pathname.replace(/^\/[a-z]{2}/, `/${lang.code}`)}
                    className={`flex items-center px-3 py-2 text-sm hover:bg-secondary transition-colors ${
                      locale === lang.code ? 'bg-secondary text-primary' : 'text-foreground'
                    }`}
                    onClick={() => setShowLangMenu(false)}
                  >
                    <span className="mr-2 text-xs font-mono">{lang.code.toUpperCase()}</span>
                    {lang.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label={t('toggle_theme')}
          >
            {mounted && theme === 'dark' ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Mobile Language Switcher */}
          <div className="relative">
            <button
              onClick={toggleLangMenu}
              className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors flex items-center"
              aria-label={t('toggle_language')}
            >
              <FiGlobe className="h-5 w-5 mr-1" />
              <span className="text-xs font-medium">{currentLang.code.toUpperCase()}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                {languages.map((lang) => (
                  <Link
                    key={lang.code}
                    href={pathname.replace(/^\/[a-z]{2}/, `/${lang.code}`)}
                    className={`flex items-center px-3 py-2 text-sm hover:bg-secondary transition-colors ${
                      locale === lang.code ? 'bg-secondary text-primary' : 'text-foreground'
                    }`}
                    onClick={() => setShowLangMenu(false)}
                  >
                    <span className="mr-2 text-xs font-mono">{lang.code.toUpperCase()}</span>
                    {lang.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label={t('toggle_theme')}
          >
            {mounted && theme === 'dark' ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-foreground"
            aria-label={t('toggle_menu')}
          >
            {isOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={`/${locale}${item.path}`}
                className={`block px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  isLinkActive(item.path) ? "text-primary" : "text-foreground"
                }`}
                onClick={toggleMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
````

## File: src/components/ui/Motion.tsx
````typescript
'use client';

import { motion } from 'framer-motion';

// Re-export motion for client-side use
export { motion };
````

## File: src/components/wallet/WalletButton.tsx
````typescript
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';

import { 
  FiCreditCard,
} from 'react-icons/fi';

const WalletButton: React.FC = () => {
  // Use only the unified useAuth hook
  const { 
    connect, 
    connected, 
    publicKey, 
    wallets, 
    select, 
    wallet, 
    connecting,
    isAuthenticated,
    isAuthenticating,
disconnect,
    hasError,
    retry
  } = useAuth();

  // All hooks must be called at the top level
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  console.log('Wallet detection:', {
    wallets: wallets.map(w => ({
      name: w.adapter.name,
      readyState: w.readyState,
      url: w.adapter.url
    })),
    totalWallets: wallets.length
  });
}, [wallets]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('Modal state changed:', showWalletModal);
  }, [showWalletModal]);

  const handleWalletSelect = useCallback(async (walletName: string) => {
    try {
      console.log('=== WALLET SELECTION START ===');
      setShowWalletModal(false);
      
      const selectedWallet = wallets.find(w => w.adapter.name === walletName);
      if (!selectedWallet) return;
      
      console.log('Selecting wallet adapter...');
      select(selectedWallet.adapter.name);
      
      // Wait for wallet selection to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Wallet after selection:', {
        name: wallet?.adapter?.name,
        readyState: wallet?.readyState
      });
      
      // Try connecting with timeout
      console.log('Starting connection...');
      const connectPromise = connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 15s')), 15000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      console.log('Connection completed!');
      
    } catch (error) {
      console.error('Connection error:', error.message);
      // Re-enable the button/modal on error
      setShowWalletModal(true);
    }
  }, [wallets, select, connect, wallet]);

  const handleManualConnect = useCallback(async () => {
  try {
    console.log('Before connect - wallet state:', {
      wallet: wallet?.adapter.name,
      connected: wallet?.connected,
      connecting: wallet?.connecting,
      publicKey: wallet?.publicKey?.toBase58()
    });
    
    if (!wallet) {
      setShowWalletModal(true);
      return;
    }
    
    await connect();
    
    console.log('After connect - wallet state:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toBase58()
    });
    
  } catch (error) {
    console.error('Connect error details:', error);
  }
}, [wallet, connect]);

  // Available wallets with icons
  const supportedWallets = [
    { name: 'Phantom', icon: '👻' },
    { name: 'Solflare', icon: '🔥' },
  ];

  // Connected and authenticated - show address
  if (isAuthenticated && publicKey) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
        <FiCreditCard className="h-4 w-4" />
        <span className="text-sm">{publicKey.toBase58().slice(0,4)}...{publicKey.toBase58().slice(-4)}</span>
      </div>
    );
  }

  // Connected but authenticating
  if (isAuthenticating) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg">
        <FiCreditCard className="h-4 w-4" />
        Signing...
      </button>
    );
  }

  // Connected but auth failed
  if (hasError) {
    return (
      <button onClick={retry} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
        <FiCreditCard className="h-4 w-4" />
        Retry Auth
      </button>
    );
  }

  // If wallet is selected but not connected, show connect button
  if (wallet && !connected && !connecting) {
    return (
      <button
        onClick={handleManualConnect}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <FiCreditCard className="h-4 w-4" />
        Connect {wallet.adapter.name}
      </button>
    );
  }

  return (
  <div suppressHydrationWarning>
    {!mounted ? (
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
        <div className="h-4 w-4" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    ) : (
      <>
      <button
        onClick={() => {
            console.log('BUTTON CLICKED!');
            setShowWalletModal(true);
            console.log('Modal state set to true');
          }}
        disabled={false}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
      >
        <FiCreditCard className="h-4 w-4" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    
      {/* Wallet Selection Modal */}
      {showWalletModal && console.log('RENDERING MODAL')}
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
                const walletAdapter = wallets.find(w => w.adapter.name === walletInfo.name);
                const isInstalled = walletAdapter?.readyState === 'Installed';
                
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
    )}
  </div>
);
};

export default WalletButton;
````

## File: src/components/wallet/WalletProvider.tsx
````typescript
'use client';

import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: React.ReactNode;
}

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({
  children,
}) => {
  // Network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  
  // RPC endpoint - you can use your own RPC for better performance
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      // Note: Backpack can be added later if needed
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={true}
        localStorageKey="walletAdapter"
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
````

## File: src/components/ErrorBoundary.tsx
````typescript
// src/components/ErrorBoundary.tsx

'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // You could send this to your logging service here
    if (typeof window !== 'undefined') {
      console.trace('Error stack trace:', error.stack);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <span className="text-2xl text-destructive">⚠️</span>
        </div>
        
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Something went wrong
        </h1>
        
        <p className="text-muted-foreground mb-4">
          The application encountered an unexpected error. Please try reloading the page.
        </p>
        
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Error details
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
            {error.message}
            {error.stack && '\n\n' + error.stack}
          </pre>
        </details>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
````

## File: src/hooks/useAuth.ts
````typescript
import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const API_BASE_URL = 'http://127.0.0.1:5000';

type AuthState = 'disconnected' | 'connected' | 'authenticating' | 'authenticated' | 'error';

export const useAuth = () => {
  const wallet = useWallet();
  const [authState, setAuthState] = useState<AuthState>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Clear auth state when wallet disconnects
  // In useAuth.ts, add logging to the useEffect that monitors wallet.connected
useEffect(() => {
  console.log('Wallet connection state changed:', {
    connected: wallet.connected,
    publicKey: wallet.publicKey?.toBase58(),
    authState,
    connecting: wallet.connecting
  });
  
  if (!wallet.connected) {
    setAuthState('disconnected');
    setError(null);
  } else if (wallet.connected && authState === 'disconnected') {
    setAuthState('connected');
  }
}, [wallet.connected, authState]);


  const authenticateOnce = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signMessage || authState === 'authenticating') return;

    setAuthState('authenticating');
    setError(null);

    try {
      const walletAddress = wallet.publicKey.toBase58();
      
      // Get challenge
      const challengeResponse = await fetch(`${API_BASE_URL}/api/v1/auth/challenge/${walletAddress}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!challengeResponse.ok) throw new Error('Failed to get challenge');
      const { challenge } = await challengeResponse.json();
      
      // Sign challenge
      const messageBytes = new TextEncoder().encode(challenge);
      const signature = await wallet.signMessage(messageBytes);
      
      // Verify signature
      const verifyResponse = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          signature: bs58.encode(signature),
          challenge: challenge,
        }),
      });
      
      if (!verifyResponse.ok) throw new Error('Authentication failed');
      const { jwt } = await verifyResponse.json();
      
      // Store token and mark as authenticated
      localStorage.setItem('auth_token', jwt);
      setAuthState('authenticated');
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMsg);
      setAuthState('error');
    }
  }, [authState, wallet]);

  // Auto-authenticate when wallet connects for the first time
  useEffect(() => {
    if (wallet.connected && wallet.publicKey && authState === 'connected') {
      authenticateOnce();
    }
  }, [wallet.connected, wallet.publicKey, authState, authenticateOnce]);


  // Manual retry function
  const retry = useCallback(() => {
    if (wallet.connected && wallet.publicKey) {
      setAuthState('connected'); // This will trigger auto-auth
    }
  }, [wallet.connected, wallet.publicKey]);

  // API call helper
const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  // Only add Authorization header if we have a token AND it's not a GET request
  // or if the method explicitly requires auth
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  // Only add Authorization header when we have a token and it's needed
  if (token && (options.method !== 'GET' || endpoint.includes('/sessions'))) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
    ...options, 
    headers 
  });
  
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    if (wallet.connected) {
      setAuthState('connected');
    }
  }
  
  return response;
}, [wallet.connected]);

  return {
    // Wallet state
    ...wallet,
    
    // Unified auth state
    isAuthenticated: authState === 'authenticated',
    isAuthenticating: authState === 'authenticating',
    needsAuth: authState === 'connected',
    hasError: authState === 'error',
    
    // Error handling
    error,
    retry,
    
    // API helper
    apiCall,
    
    // Internal state for debugging
    authState,
  };
};
````

## File: src/hooks/useChat.ts
````typescript
import { useState, useCallback, useMemo } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
import { ChatApi, ChatApiError, type ChatSession, type ChatMessage } from '@/lib/chatApi';
import { useAuth } from './useAuth';

export interface ChatError {
  message: string;
  type: 'network' | 'auth' | 'validation' | 'unknown';
  retry?: () => void;
}

export interface UseChatState {
  sessions: ChatSession[];
  currentSession: string | null;
  messages: Record<string, ChatMessage[]>;
  optimisticMessages: Record<string, ChatMessage[]>;
  loading: {
    sessions: boolean;
    messages: boolean;
    sending: boolean;
    creating: boolean;
  };
  error: ChatError | null;
}

export const useChat = () => {
  const { apiCall, isAuthenticated } = useAuth();
  const chatApi = useMemo(() => new ChatApi(apiCall), [apiCall]);
  const [state, setState] = useState<UseChatState>({
    sessions: [],
    currentSession: null,
    messages: {},
    optimisticMessages: {},
    loading: {
      sessions: false,
      messages: false,
      sending: false,
      creating: false,
    },
    error: null,
  });

  const setLoading = useCallback((key: keyof UseChatState['loading'], value: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  }, []);

  const setError = useCallback((error: ChatError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const handleApiError = useCallback((error: unknown, operation: string, retryFn?: () => void): ChatError => {
    console.error(`Chat API error during ${operation}:`, error);
    
    if (error instanceof ChatApiError) {
      return {
        message: error.message,
        type: error.status === 401 ? 'auth' : error.status === 400 ? 'validation' : 'network',
        retry: retryFn
      };
    }
    
    return {
      message: `Failed to ${operation}. Please try again.`,
      type: 'unknown',
      retry: retryFn
    };
  }, []);

  // Load all sessions
  const loadSessions = useCallback(async () => {
    if (!isAuthenticated) {
      setState(prev => ({ ...prev, sessions: [], currentSession: null }));
      return;
    }

    setLoading('sessions', true);
    setError(null);

    try {
      const sessions = await chatApi.getSessions();
      setState(prev => ({
        ...prev,
        sessions,
        currentSession: prev.currentSession || sessions[0]?.id || null
      }));
    } catch (error) {
      const chatError = handleApiError(error, 'load sessions', loadSessions);
      setError(chatError);
    } finally {
      setLoading('sessions', false);
    }
  }, [isAuthenticated, chatApi, setLoading, setError, handleApiError]);

  // Load messages for a specific session
  const loadMessages = useCallback(async (sessionId: string) => {
    if (!isAuthenticated || !sessionId) return;

    setLoading('messages', true);
    setError(null);

    try {
      const messages = await chatApi.getMessages(sessionId);
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [sessionId]: messages
        }
      }));
    } catch (error) {
      const chatError = handleApiError(error, 'load messages', () => loadMessages(sessionId));
      setError(chatError);
    } finally {
      setLoading('messages', false);
    }
  }, [isAuthenticated, chatApi, setLoading, setError, handleApiError]);

  // Create new session
  const createSession = useCallback(async (title?: string) => {
    if (!isAuthenticated) return null;

    setLoading('creating', true);
    setError(null);

    try {
      const session = await chatApi.createSession({ title });
      setState(prev => ({
        ...prev,
        sessions: [session, ...prev.sessions],
        currentSession: session.id,
        messages: {
          ...prev.messages,
          [session.id]: []
        }
      }));
      return session;
    } catch (error) {
      const chatError = handleApiError(error, 'create session', () => createSession(title));
      setError(chatError);
      return null;
    } finally {
      setLoading('creating', false);
    }
  }, [isAuthenticated, chatApi, setLoading, setError, handleApiError]);


// Send message
const sendMessage = useCallback(async (sessionId: string, content: string) => {
  if (!sessionId || !content.trim()) return false;

  const message = content.trim();
  
  // Create optimistic user message immediately
  const optimisticUserMessage: ChatMessage = {
    id: `temp-user-${Date.now()}`,
    content: message,
    role: 'user',
    created_at: new Date().toISOString(),
  };

  // Add optimistic user message to state immediately
  setState(prev => ({
    ...prev,
    optimisticMessages: {
      ...prev.optimisticMessages,
      [sessionId]: [...(prev.optimisticMessages[sessionId] || []), optimisticUserMessage]
    }
  }));

  setLoading('sending', true);
  setError(null);

  try {
    const response = await chatApi.sendMessage(sessionId, {
      content: message,
      role: 'user'
    });

    // Success: Add real messages to the main messages array and clear optimistic
    setState(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [sessionId]: [
          ...(prev.messages[sessionId] || []),
          // Map the backend response to our ChatMessage format
          {
            id: response.user_message.id,
            content: response.user_message.content,
            role: 'user' as const,
            created_at: response.user_message.created_at,
          },
          {
            id: response.ai_response.id,
            content: response.ai_response.content,
            role: 'assistant' as const,
            created_at: response.ai_response.created_at,
          }
        ]
      },
      optimisticMessages: {
        ...prev.optimisticMessages,
        [sessionId]: [] // Clear optimistic messages for this session
      },
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? { ...session, updated_at: new Date().toISOString() }
          : session
      )
    }));

    return true;
  } catch (error) {
    // Create error message as AI response
    const errorMessage: ChatMessage = {
      id: `temp-error-${Date.now()}`,
      content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
      role: 'assistant',
      created_at: new Date().toISOString(),
    };

    // Add error message to optimistic messages
    setState(prev => ({
      ...prev,
      optimisticMessages: {
        ...prev.optimisticMessages,
        [sessionId]: [...(prev.optimisticMessages[sessionId] || []), errorMessage]
      }
    }));

    return false;
  } finally {
    setLoading('sending', false);
  }
}, [chatApi, setLoading, setError]);


  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!isAuthenticated || !sessionId) return false;

    try {
      await chatApi.deleteSession(sessionId);
      
      setState(prev => {
        const newSessions = prev.sessions.filter(s => s.id !== sessionId);
        const newMessages = { ...prev.messages };
        delete newMessages[sessionId];
        
        return {
          ...prev,
          sessions: newSessions,
          messages: newMessages,
          currentSession: prev.currentSession === sessionId 
            ? newSessions[0]?.id || null 
            : prev.currentSession
        };
      });

      return true;
    } catch (error) {
      const chatError = handleApiError(error, 'delete session', () => deleteSession(sessionId));
      setError(chatError);
      return false;
    }
  }, [isAuthenticated, chatApi, setError, handleApiError]);

  // Switch to session
  const switchToSession = useCallback(async (sessionId: string) => {
    setState(prev => ({ ...prev, currentSession: sessionId }));
    
    // Load messages if not already loaded
    if (!state.messages[sessionId]) {
      await loadMessages(sessionId);
    }
  }, [state.messages, loadMessages]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Get current session messages
  const getCurrentMessages = useCallback(() => {
  if (!state.currentSession) return [];
  const realMessages = state.messages[state.currentSession] || [];
  const optimisticMessages = state.optimisticMessages[state.currentSession] || [];
  // Filter out any undefined messages
  return [...realMessages, ...optimisticMessages].filter(message => message != null);
}, [state.currentSession, state.messages, state.optimisticMessages]);

  // Get current session info
  const getCurrentSession = useCallback(() => {
    if (!state.currentSession) return null;
    return state.sessions.find(s => s.id === state.currentSession) || null;
  }, [state.currentSession, state.sessions]);

  return {
    // State
    sessions: state.sessions,
    currentSession: state.currentSession,
    loading: state.loading,
    error: state.error,

    // Actions
    loadSessions,
    loadMessages,
    createSession,
    sendMessage,
    deleteSession,
    switchToSession,
    clearError,

    // Computed
    getCurrentMessages,
    getCurrentSession,

    // Utils
    hasAnySessions: state.sessions.length > 0,
    isLoading: Object.values(state.loading).some(Boolean),
  };
};
````

## File: src/hooks/useTransactions.ts
````typescript
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
````

## File: src/hooks/useWalletData.ts
````typescript
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
````

## File: src/lib/chatApi.ts
````typescript
// src/lib/chatApi.ts

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  content: string;
  role: 'user';
}

export interface SendMessageResponse {
  user_message: ChatMessage;
  ai_response: ChatMessage;
  prepared_transaction?: {
    type: 'transfer' | 'swap';
    unsigned_transaction: string;
    from: string;
    to: string;
    amount: number;
    fromToken: string;
    toToken: string;
    toAmount?: number;
    price?: string;
    fees?: string;
    slippage?: string;
    required_signers: string[];
    recent_blockhash: string;
  };
}

export interface CreateSessionRequest {
  title?: string;
}

export class ChatApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
}

export class ChatApi {
  constructor(private apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>) {}

  async getSessions(): Promise<ChatSession[]> {
    try {
      const response = await this.apiCall('/api/v1/chat/sessions');
      
      if (!response.ok) {
        throw new ChatApiError(
          `Failed to fetch sessions: ${response.statusText}`,
          response.status
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError('Network error while fetching sessions', 0);
    }
  }

  async createSession(request: CreateSessionRequest): Promise<ChatSession> {
    try {
      const response = await this.apiCall('/api/v1/chat/sessions', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ChatApiError(
          errorData.message || `Failed to create session: ${response.statusText}`,
          response.status,
          errorData
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError('Network error while creating session', 0);
    }
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await this.apiCall(`/api/v1/chat/sessions/${sessionId}/messages`);
      
      if (!response.ok) {
        throw new ChatApiError(
          `Failed to fetch messages: ${response.statusText}`,
          response.status
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError('Network error while fetching messages', 0);
    }
  }

  async sendMessage(sessionId: string, request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await this.apiCall(`/api/v1/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ChatApiError(
          errorData.message || `Failed to send message: ${response.statusText}`,
          response.status,
          errorData
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError('Network error while sending message', 0);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const response = await this.apiCall(`/api/v1/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok && response.status !== 404) {
        throw new ChatApiError(
          `Failed to delete session: ${response.statusText}`,
          response.status
        );
      }
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError('Network error while deleting session', 0);
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await this.apiCall('/api/v1/chat/models');
      
      if (!response.ok) {
        throw new ChatApiError(
          `Failed to fetch models: ${response.statusText}`,
          response.status
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError('Network error while fetching models', 0);
    }
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.apiCall('/api/v1/chat/health');
      
      if (!response.ok) {
        throw new ChatApiError(
          `Health check failed: ${response.statusText}`,
          response.status
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError('Network error during health check', 0);
    }
  }
}
````

## File: src/lib/config.ts
````typescript
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
    // network: 'devnet' | 'testnet' | 'mainnet-beta';
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
    solana_gateway_url: process.env.NEXT_PUBLIC_SOLANA_API_URL || "http://127.0.0.1:8080",
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
export const getSolanaApiUrl = (): string => config.api.solana_gateway_url;
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
````

## File: src/lib/solanaApi.ts
````typescript
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
````

## File: src/types/bs58.d.ts
````typescript
declare module 'bs58' {
  export function encode(buffer: Uint8Array): string;
  export function decode(string: string): Uint8Array;
}
````

## File: src/types/globals.d.ts
````typescript
export {};

declare global {
  interface Window {
    // Add your global window types here
    plausible?: {
      (event: string, options?: { props?: Record<string, string> }): void;
      q?: Array<unknown>;
    };
  }
}
````

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Generated data
src/data/
public/sitemap.xml

# Runtime files
.last-publish
.publishing-paused
.skip-today
.queue-state.json
````

## File: eslint.config.mjs
````
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    }
  }
];

export default eslintConfig;
````

## File: i18n.ts
````typescript
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  locale = defaultLocale;

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    return {
      locale,
      messages
    };
  } catch (error) {
    console.error('Error loading messages:', error);
    return {
      locale: 'en',
      messages: {}
    };
  }
});
````

## File: next.config.ts
````typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      '192.168.*.*',
      '10.*.*.*',
      '172.16.*.*',
    ],
  },
  trailingSlash: false,
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  poweredByHeader: false,
  compress: true,
};

export default withNextIntl(nextConfig);
````

## File: package.json
````json
{
  "name": "sol-chat",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@solana/wallet-adapter-base": "^0.9.27",
    "@solana/wallet-adapter-react": "^0.15.39",
    "@solana/wallet-adapter-react-ui": "^0.9.39",
    "@solana/wallet-adapter-wallets": "^0.19.37",
    "@solana/web3.js": "^1.98.4",
    "@types/bs58": "^5.0.0",
    "@types/js-yaml": "^4.0.9",
    "bs58": "^6.0.0",
    "framer-motion": "^12.10.1",
    "gray-matter": "^4.0.3",
    "js-yaml": "^4.1.0",
    "marked": "^15.0.11",
    "next": "15.3.1",
    "next-intl": "^4.3.4",
    "next-themes": "^0.4.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.56.2",
    "react-icons": "^5.5.0",
    "reading-time": "^1.5.0",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1",
    "remark-prism": "^1.3.6",
    "slugify": "^1.6.6",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.3.1",
    "postcss": "^8.5.3",
    "tailwindcss": "3.4.1",
    "typescript": "^5"
  }
}
````

## File: postcss.config.mjs
````
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
````

## File: README.md
````markdown
# Solanize - AI-Powered Solana Wallet Chat Interface

A modern, responsive chat interface that provides natural language interaction with the Solana blockchain. Users can check balances, send transfers, perform swaps, and monitor transactions through conversational AI.

## Features

- 🤖 **AI Chat Interface**: Natural language commands for blockchain operations
- 💰 **Real-time Wallet Data**: Live balance updates, transaction history, and pending transactions
- 🔄 **Token Swaps**: Seamless token exchanges via Jupiter protocol integration
- 💸 **SOL Transfers**: Send SOL to any wallet address with natural language
- 📊 **Portfolio Tracking**: Real-time USD values and transaction monitoring
- 🌐 **Multi-language**: English and French localization
- 🌙 **Dark Mode**: Built-in theme switching
- 📱 **Responsive**: Mobile-first design
- ⚡ **Performance**: Next.js 15 with App Router
- 🔐 **Wallet Integration**: Phantom, Solflare wallet support
- 🎨 **Design System**: Complete CSS variables and Tailwind config
- 📊 **Real-time Updates**: Live transaction status and balance updates

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Wallet**: Solana Wallet Adapter
- **Styling**: Tailwind CSS with shadcn/ui design system
- **State Management**: React hooks with optimistic updates
- **API Integration**: RESTful Solana Gateway API
- **Internationalization**: next-intl
- **Theme**: next-themes with CSS variables
- **Icons**: React Icons (Feather)

## Architecture

### Components
- **ChatInterface**: Main conversational UI with wallet status bar
- **WalletButton**: Wallet connection and management
- **Transaction Cards**: Interactive transaction approval UI
- **Real-time Status**: Live balance and pending transaction monitoring

### Hooks
- **useAuth**: Wallet authentication and JWT management
- **useWalletData**: Real-time wallet balances, transactions, and prices
- **useTransactions**: Transaction preparation, signing, and submission
- **useChat**: Chat session management with transaction integration

### API Integration
- **SolanaApi**: Complete integration with Solana Gateway microservice
- **Transaction Parser**: Natural language transaction command parsing
- **Real-time Updates**: Automatic refresh of wallet data post-transaction

## Solana Features

### Implemented
- ✅ **Wallet Balance Checking**: Real-time SOL and SPL token balances
- ✅ **Transaction History**: Paginated transaction history with status
- ✅ **Pending Transactions**: Live monitoring of unconfirmed transactions
- ✅ **Token Prices**: Real-time USD pricing for all held tokens
- ✅ **Token Search**: Search and discover SPL tokens
- ✅ **SOL Transfers**: Prepare, sign, and submit SOL transfers
- ✅ **Token Swaps**: Jupiter protocol integration for token exchanges
- ✅ **Transaction Status**: Real-time confirmation and finalization tracking

### API Endpoints Used
- `POST /api/v1/balance` - Get SOL balance
- `POST /api/v1/wallet/tokens` - Get all SPL token balances
- `POST /api/v1/transactions/history` - Get transaction history
- `POST /api/v1/transactions/pending` - Get pending transactions
- `POST /api/v1/price` - Get token prices
- `POST /api/v1/tokens/search` - Search tokens
- `POST /api/v1/transaction/prepare` - Prepare SOL transfers
- `POST /api/v1/swap/prepare` - Prepare token swaps
- `POST /api/v1/transaction/submit` - Submit signed transactions

## Getting Started

### Prerequisites
- Node.js 18+ and Yarn
- Solana Gateway API running on port 8080
- Chat API running on port 5000

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.template .env.local
# Edit .env.local with your API endpoints

# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

### Configuration

Edit `config/site.yaml`:

```yaml
api:
  solana_gateway_url: "http://127.0.0.1:8080"  # Solana Gateway API
  chat_api_url: "http://127.0.0.1:5000"        # Chat API

solana:
  network: "devnet"                             # or mainnet-beta
  explorer_url: "https://solscan.io"

transactions:
  default_slippage: 1.0                         # 1%
  refresh_interval: 10000                       # ms
```

## Usage Examples

### Natural Language Commands

```
"Check my SOL balance"
→ Shows current SOL balance in chat + status bar

"Swap 1 SOL for USDC"
→ Prepares swap transaction with quote
→ Shows transaction card for approval
→ User signs and submits transaction

"Send 0.5 SOL to ABC123..."
→ Prepares transfer transaction
→ Shows transaction card with details
→ User approves and signs

"What tokens do I have?"
→ Lists all SPL tokens with balances and USD values

"Show my recent transactions"
→ Displays transaction history with Solscan links
```

### Wallet Status Bar
- **Real-time Balances**: Top 3 tokens with USD values
- **Pending Transactions**: Live count with status indicator
- **Recent Activity**: Quick access to latest transactions

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── [locale]/           # Internationalized routes
│   └── api/               # API routes for chat
├── components/
│   ├── chat/              # Chat interface components
│   ├── wallet/            # Wallet connection components
│   └── layout/            # Layout components
├── hooks/
│   ├── useAuth.ts         # Wallet auth and JWT management
│   ├── useWalletData.ts   # Real-time wallet data
│   ├── useTransactions.ts # Transaction management
│   └── useChat.ts         # Chat functionality
├── lib/
│   ├── solanaApi.ts       # Solana Gateway API client
│   ├── chatApi.ts         # Chat API client
│   └── transactionParser.ts # Natural language parsing
└── types/                 # TypeScript definitions
```

## Development Features

### Real-time Updates
- Automatic balance refresh after transactions
- Pending transaction polling every 10 seconds
- Optimistic UI updates for immediate feedback

### Error Handling
- Comprehensive API error handling with retry mechanisms
- User-friendly error messages in chat interface
- Graceful fallbacks for network issues

### Performance
- Efficient state management with minimal re-renders
- Optimistic updates for perceived performance
- Intelligent caching of wallet data and prices

## Deployment

### Environment Variables
```bash
NEXT_PUBLIC_SOLANA_API_URL=https://your-solana-gateway.com
NEXT_PUBLIC_CHAT_API_URL=https://your-chat-api.com
```

### Production Build
```bash
yarn build
yarn start
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
CMD ["yarn", "start"]
```

## Contributing

This codebase follows your preferences:
- ✅ **Rust-style Error Handling**: No unwrap(), clear error types
- ✅ **YAML Configuration**: All parameters in config/site.yaml
- ✅ **Trace Logging**: Comprehensive logging setup
- ✅ **Modern Design**: Developer-friendly with dark/light mode
- ✅ **Command Line Friendly**: Ready for CLI-based deployment

## Next Steps

1. **Enhanced AI**: Integrate with LLM for more sophisticated transaction parsing
2. **DeFi Integration**: Add support for lending, staking, and yield farming
3. **Portfolio Analytics**: Charts and performance tracking
4. **Mobile App**: React Native version with same API integration
5. **Multi-chain**: Extend to other blockchain networks

Built with modern Web3 best practices and production-ready architecture.
````

## File: site.yml
````yaml
# Site Configuration
site:
  name: "Solanize"
  domain: "solanize.com"
  description: "AI-powered Solana wallet interface with natural language transactions"
  locale: "en"
  
# API Configuration
api:
  solana_gateway_url: "http://127.0.0.1:8080"
  chat_api_url: "http://127.0.0.1:5000"
  
# Solana Configuration
solana:
  network: "devnet" # devnet, testnet, mainnet-beta
  explorer_url: "https://solscan.io"
  
# Logging preferences (following your Rust preference)
logging:
  level: "trace"
  format: "json"
  output: "console"

# Transaction Configuration
transactions:
  default_slippage: 1.0 # 1%
  max_slippage: 5.0 # 5%
  default_priority_fee: 0.000005 # SOL
  refresh_interval: 10000 # ms
````

## File: tailwind.config.ts
````typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary) / 0.8)',
              },
            },
            h1: {
              color: 'hsl(var(--foreground))',
            },
            h2: {
              color: 'hsl(var(--foreground))',
            },
            h3: {
              color: 'hsl(var(--foreground))',
            },
            h4: {
              color: 'hsl(var(--foreground))',
            },
            blockquote: {
              color: 'hsl(var(--muted-foreground))',
              borderLeftColor: 'hsl(var(--primary))',
            },
            code: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
              '&::before': {
                content: '""',
              },
              '&::after': {
                content: '""',
              },
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
            pre: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflowX: 'auto',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
}

export default config
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "typeRoots": [
      "./node_modules/@types",
      "./src/types"
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "src/types/**/*.d.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
````
