// src/hooks/useChat.ts
import { useState, useCallback, useMemo } from 'react';
import { ChatApi, ChatApiError, type ChatSession, type ChatMessage, type PreparedTransaction } from '@/lib/chatApi';
import { useAuth } from '@/contexts/AuthContext';

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
  pendingTransactions: Record<string, PreparedTransaction>;
  loading: {
    sessions: boolean;
    messages: boolean;
    sending: boolean;
    creating: boolean;
    signingTransaction: boolean;
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
    pendingTransactions: {},
    loading: {
      sessions: false,
      messages: false,
      sending: false,
      creating: false,
      signingTransaction: false,
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

  // Send message - handles regular messages and signed transaction submission
  const sendMessage = useCallback(async (sessionId: string, content: string, options?: {
    signed_transaction?: string;
    transaction_id?: string;
  }) => {
    if (!sessionId || !content.trim()) return false;

    const message = content.trim();

    // Create optimistic user message for regular messages (not tx submissions)
    if (!options?.signed_transaction) {
      const optimisticUserMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        content: message,
        role: 'user',
        created_at: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        optimisticMessages: {
          ...prev.optimisticMessages,
          [sessionId]: [...(prev.optimisticMessages[sessionId] || []), optimisticUserMessage]
        }
      }));
    }

    setLoading('sending', true);
    setError(null);

    try {
      const requestBody = {
        content: message,
        role: 'user' as const,
        ...(options?.signed_transaction && {
          signed_transaction: options.signed_transaction,
          transaction_id: options.transaction_id,
        }),
      };

      const response = await chatApi.sendMessage(sessionId, requestBody);

      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [sessionId]: [
            ...(prev.messages[sessionId] || []),
            {
              id: response.user_message.id,
              content: response.user_message.content,
              role: 'user' as const,
              created_at: response.user_message.created_at,
            },
            {
              id: response.ai_message.id,
              content: response.ai_message.content,
              role: 'assistant' as const,
              created_at: response.ai_message.created_at,
            }
          ]
        },
        optimisticMessages: {
          ...prev.optimisticMessages,
          [sessionId]: []
        },
        pendingTransactions: response.prepared_transaction
          ? { ...prev.pendingTransactions, [response.prepared_transaction.transaction_id]: response.prepared_transaction }
          : prev.pendingTransactions,
        sessions: prev.sessions.map(session =>
          session.id === sessionId
            ? { ...session, updated_at: new Date().toISOString() }
            : session
        )
      }));

      return true;
    } catch (error) {
      if (!options?.signed_transaction) {
        const errorMessage: ChatMessage = {
          id: `temp-error-${Date.now()}`,
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          role: 'assistant',
          created_at: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          optimisticMessages: {
            ...prev.optimisticMessages,
            [sessionId]: [...(prev.optimisticMessages[sessionId] || []), errorMessage]
          }
        }));
      }

      const chatError = handleApiError(error, 'send message');
      setError(chatError);
      return false;
    } finally {
      setLoading('sending', false);
    }
  }, [chatApi, setLoading, setError, handleApiError]);

  // Handle transaction signing
  const signTransaction = useCallback(async (sessionId: string, transactionId: string, signedTransaction: string) => {
    if (!sessionId || !transactionId || !signedTransaction) return false;

    setLoading('signingTransaction', true);
    setError(null);

    try {
      const success = await sendMessage(sessionId, "Transaction signed", {
        signed_transaction: signedTransaction,
        transaction_id: transactionId
      });

      if (success) {
        // Remove the signed transaction from pending
        setState(prev => {
          const newPendingTransactions = { ...prev.pendingTransactions };
          delete newPendingTransactions[transactionId];
          return { ...prev, pendingTransactions: newPendingTransactions };
        });
      }

      return success;
    } catch (error) {
      const chatError = handleApiError(error, 'sign transaction');
      setError(chatError);
      return false;
    } finally {
      setLoading('signingTransaction', false);
    }
  }, [sendMessage, setLoading, setError, handleApiError]);

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
    return [...realMessages, ...optimisticMessages].filter(message => message != null);
  }, [state.currentSession, state.messages, state.optimisticMessages]);

  // Get current session info
  const getCurrentSession = useCallback(() => {
    if (!state.currentSession) return null;
    return state.sessions.find(s => s.id === state.currentSession) || null;
  }, [state.currentSession, state.sessions]);

  const getCurrentPendingTransactions = useCallback(() => {
    if (!state.currentSession) return [];
    return Object.values(state.pendingTransactions);
  }, [state.currentSession, state.pendingTransactions]);

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

    // Transaction signing
    signTransaction,

    // Computed values
    getCurrentMessages,
    getCurrentSession,
    getCurrentPendingTransactions,

    // Utilities
    hasAnySessions: state.sessions.length > 0,
    isLoading: Object.values(state.loading).some(Boolean),
  };
};
