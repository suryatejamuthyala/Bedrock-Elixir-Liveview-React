// AG-UI Protocol implementation for streaming chat
// Based on https://docs.ag-ui.com/sdk/js/core/overview

export enum EventType {
  TEXT_MESSAGE_START = 'text_message_start',
  TEXT_MESSAGE_CONTENT = 'text_message_content',
  TEXT_MESSAGE_END = 'text_message_end',
  ERROR = 'error',
}

export interface TextMessageStartEvent {
  type: EventType.TEXT_MESSAGE_START;
  messageId: string;
  role: 'assistant';
}

export interface TextMessageContentEvent {
  type: EventType.TEXT_MESSAGE_CONTENT;
  messageId: string;
  delta: string;
}

export interface TextMessageEndEvent {
  type: EventType.TEXT_MESSAGE_END;
  messageId: string;
}

export interface ErrorEvent {
  type: EventType.ERROR;
  error: string;
}

export type AGUIEvent =
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | ErrorEvent;

export interface AGUIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

// Legacy event format for backward compatibility with backend
export interface AGUIStreamEvent {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  error?: string;
}

export class AGUIClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
  }

  // Stream with AG-UI protocol events
  async *streamChatAGUI(messages: AGUIMessage[]): AsyncGenerator<AGUIEvent> {
    const messageId = `msg_${Date.now()}`;
    let started = false;

    try {
      // Yield start event
      yield {
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: 'assistant',
      } as TextMessageStartEvent;

      started = true;

      const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const event = JSON.parse(data) as AGUIStreamEvent;

                if (event.type === 'chunk' && event.content) {
                  // Convert to AG-UI format
                  yield {
                    type: EventType.TEXT_MESSAGE_CONTENT,
                    messageId,
                    delta: event.content,
                  } as TextMessageContentEvent;
                } else if (event.type === 'error') {
                  yield {
                    type: EventType.ERROR,
                    error: event.error || 'Unknown error',
                  } as ErrorEvent;
                  return;
                } else if (event.type === 'done') {
                  // Will yield end event after loop
                  break;
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Yield end event
      yield {
        type: EventType.TEXT_MESSAGE_END,
        messageId,
      } as TextMessageEndEvent;
    } catch (error) {
      if (started) {
        yield {
          type: EventType.ERROR,
          error: error instanceof Error ? error.message : 'Unknown error',
        } as ErrorEvent;
      }
      throw error;
    }
  }

  // Legacy format for backward compatibility
  async *streamChat(messages: AGUIMessage[]): AsyncGenerator<AGUIStreamEvent> {
    const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const event = JSON.parse(data) as AGUIStreamEvent;
              yield event;

              if (event.type === 'done' || event.type === 'error') {
                return;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// WebSocket-based implementation (alternative)
export class AGUIWebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<(event: any) => void>> = new Map();

  constructor(private wsUrl: string = 'ws://localhost:4000/socket') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('close', {});
      };
    });
  }

  send(type: string, payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...payload }));
    } else {
      console.error('WebSocket is not open');
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.listeners.clear();
  }
}
