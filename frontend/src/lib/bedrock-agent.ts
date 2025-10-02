// AWS Bedrock Agent implementation using @ag-ui/client
// Based on https://docs.ag-ui.com/sdk/js/client/overview

import { HttpAgent } from '@ag-ui/client';
import type {
  RunAgentParameters,
  AgentSubscriber,
  RunAgentResult
} from '@ag-ui/client';

export interface BedrockMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BedrockAgentConfig {
  url?: string;
  apiKey?: string;
  model?: string;
}

/**
 * BedrockAgent - Wrapper around HttpAgent for AWS Bedrock integration
 * Uses the AG-UI client SDK for standardized agent communication
 */
export class BedrockAgent {
  private httpAgent: HttpAgent;
  private config: Required<BedrockAgentConfig>;

  constructor(config: BedrockAgentConfig = {}) {
    this.config = {
      url: config.url || 'http://localhost:4000/api/chat/stream',
      apiKey: config.apiKey || '',
      model: config.model || 'anthropic.claude-3-sonnet-20240229-v1:0',
    };

    // Initialize HttpAgent
    this.httpAgent = new HttpAgent({
      url: this.config.url,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && {
          Authorization: `Bearer ${this.config.apiKey}`,
        }),
      },
    });
  }

  /**
   * Run the agent with messages and subscribe to events
   */
  async runAgent(
    messages: BedrockMessage[],
    subscriber: AgentSubscriber
  ): Promise<RunAgentResult> {
    const parameters: RunAgentParameters = {
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      model: this.config.model,
    };

    return this.httpAgent.runAgent(parameters, subscriber);
  }

  /**
   * Subscribe to agent events
   */
  subscribe(subscriber: AgentSubscriber): { unsubscribe: () => void } {
    return this.httpAgent.subscribe(subscriber);
  }

  /**
   * Abort the current agent run
   */
  abortRun(): void {
    this.httpAgent.abortRun();
  }
}

/**
 * Helper function to create a subscriber for streaming responses
 */
export function createStreamSubscriber(callbacks: {
  onTextStart?: (messageId: string) => void;
  onTextDelta?: (delta: string) => void;
  onTextEnd?: (messageId: string, fullText: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}): AgentSubscriber {
  let currentText = '';
  let currentMessageId = '';

  return {
    onTextMessageStart: (event) => {
      currentMessageId = event.messageId;
      currentText = '';
      callbacks.onTextStart?.(event.messageId);
    },
    onTextMessageContent: (event) => {
      currentText += event.delta;
      callbacks.onTextDelta?.(event.delta);
    },
    onTextMessageEnd: (event) => {
      callbacks.onTextEnd?.(event.messageId, currentText);
      currentText = '';
      currentMessageId = '';
    },
    onError: (event) => {
      const error = new Error(event.error || 'Unknown error');
      callbacks.onError?.(error);
    },
    onComplete: () => {
      callbacks.onComplete?.();
    },
  };
}
