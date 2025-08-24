// src/lib/chatApi.ts

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface ProposedAction {
  action_id: string;
  intent_description: string;
  confidence_score: number;
  endpoints_to_call: Array<{
    endpoint: string;
    method: string;
    description: string;
    params: Record<string, any>;
    risk_level: 'low' | 'medium' | 'high';
  }>;
  estimated_cost: number;
  warnings: string[];
}

export interface PreparedTransaction {
  transaction_id: string;
  transaction_type: string;
  unsigned_transaction: string; // base64
  from_address: string;
  to_address?: string;
  amount?: number;
  token?: string;
  fee_estimate: number;
}


export interface ActionResponse {
  content: string;
  action_response: {
    action_id: string;
    approved: boolean;
    modified_params?: Record<string, any>;
  };
}

export interface TransactionResponse {
  content: string;
  signed_transaction: string;
  transaction_id: string;
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
  ai_message: ChatMessage;
  proposed_actions: ProposedAction | null;
  prepared_transaction: PreparedTransaction | null;
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
  constructor(private apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>) { }

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
