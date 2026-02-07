export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'received' | 'error';
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
}

export interface ChatHistoryResponse {
  success: boolean;
  data?: ChatMessage[];
  error?: string;
  statusCode: number;
}