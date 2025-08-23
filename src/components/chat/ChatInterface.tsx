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
                      // In your existing ChatInterface.tsx, you already have this pattern:
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
