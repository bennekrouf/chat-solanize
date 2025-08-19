import { useState, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { ChatApi, ChatApiError, type ChatSession, type ChatMessage } from '@/lib/chatApi';

export interface ChatError {
  message: string;
  type: 'network' | 'auth' | 'validation' | 'unknown';
  retry?: () => void;
}

export interface UseChatState {
  sessions: ChatSession[];
  currentSession: string | null;
  messages: Record<string, ChatMessage[]>;
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

    setLoading('sending', true);
    setError(null);

    try {
      const response = await chatApi.sendMessage(sessionId, {
        content: content.trim(),
        role: 'user'
      });

      // Update messages with both user message and AI response
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [sessionId]: [
            ...(prev.messages[sessionId] || []),
            response.user_message,
            response.ai_response
          ]
        },
        // Update session's updated_at timestamp
        sessions: prev.sessions.map(session =>
          session.id === sessionId
            ? { ...session, updated_at: new Date().toISOString() }
            : session
        )
      }));

      return true;
    } catch (error) {
      const chatError = handleApiError(error, 'send message', () => sendMessage(sessionId, content));
      setError(chatError);
      return false;
    } finally {
      setLoading('sending', false);
    }
  }, [chatApi, setLoading, setError, handleApiError]);

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
    return state.messages[state.currentSession] || [];
  }, [state.currentSession, state.messages]);

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
    isAuthenticated,

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
