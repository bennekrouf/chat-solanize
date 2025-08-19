'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMenu, FiX, FiMessageCircle, FiPlus, FiTrash2, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import WalletButton from '@/components/wallet/WalletButton';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

const ChatInterface: React.FC = () => {
  const [currentInput, setCurrentInput] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with a default session
  useEffect(() => {
    const defaultSession: ChatSession = {
      id: 'default',
      title: 'New Chat',
      messages: [],
      lastUpdated: new Date()
    };
    setChatSessions([defaultSession]);
    setCurrentSession('default');
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatSessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentMessages = (): Message[] => {
    const session = chatSessions.find(s => s.id === currentSession);
    return session?.messages || [];
  };

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date()
    };

    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSession) {
        const updatedMessages = [...session.messages, newMessage];
        return {
          ...session,
          messages: updatedMessages,
          lastUpdated: new Date(),
          title: session.messages.length === 0 ? content.slice(0, 30) + '...' : session.title
        };
      }
      return session;
    }));
  };

  const handleSend = () => {
    if (currentInput.trim()) {
      addMessage(currentInput, true);
      
      // Simulate AI response (replace with actual API call later)
      setTimeout(() => {
        addMessage(`This is a mock response to: "${currentInput}"`, false);
      }, 1000);
      
      setCurrentInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastUpdated: new Date()
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession.id);
    setIsHistoryOpen(false);
  };

  const switchToSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    setIsHistoryOpen(false);
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chatSessions.length > 1) {
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession === sessionId) {
        const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
        setCurrentSession(remainingSessions[0]?.id || '');
      }
    }
  };

  const currentMessages = getCurrentMessages();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <ChatHeader />
      
      {/* Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* History Sidebar */}
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
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FiPlus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => switchToSession(session.id)}
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
                    {session.messages.length} messages
                  </p>
                </div>
              </div>
              {chatSessions.length > 1 && (
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-all"
                >
                  <FiTrash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
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
              {chatSessions.find(s => s.id === currentSession)?.title || 'Chat'}
            </h1>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
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
                  Send a message to begin your chat.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-4 pb-32">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] md:max-w-[70%] ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  } rounded-2xl px-4 py-3`}>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 opacity-70 ${
                      message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent max-h-32 min-h-[3rem]"
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
                  disabled={!currentInput.trim()}
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
          <span className="font-bold text-lg text-foreground">MyApp</span>
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

export default ChatInterface;
