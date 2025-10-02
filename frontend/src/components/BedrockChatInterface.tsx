import { useState, useRef, useEffect } from 'react';
import {
  BedrockAgent,
  BedrockMessage,
  createStreamSubscriber,
} from '../lib/bedrock-agent';

/**
 * Chat interface using @ag-ui/client HttpAgent
 * Based on https://docs.ag-ui.com/sdk/js/client/overview
 */
export function BedrockChatInterface() {
  const [messages, setMessages] = useState<BedrockMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentMessageId, setCurrentMessageId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<BedrockAgent | null>(null);

  // Initialize agent
  useEffect(() => {
    agentRef.current = new BedrockAgent({
      url: 'http://localhost:4000/api/chat/stream',
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isStreaming || !agentRef.current) return;

    const userMessage: BedrockMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setCurrentResponse('');

    // Create subscriber for streaming events
    const subscriber = createStreamSubscriber({
      onTextStart: (messageId) => {
        setCurrentMessageId(messageId);
        console.log('Message started:', messageId);
      },
      onTextDelta: (delta) => {
        setCurrentResponse((prev) => prev + delta);
      },
      onTextEnd: (messageId, fullText) => {
        console.log('Message ended:', messageId);
        const assistantMessage: BedrockMessage = {
          role: 'assistant',
          content: fullText,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentResponse('');
        setCurrentMessageId('');
      },
      onError: (error) => {
        console.error('Stream error:', error);
        setCurrentResponse('');
        setCurrentMessageId('');
        setIsStreaming(false);
      },
      onComplete: () => {
        console.log('Stream complete');
        setIsStreaming(false);
      },
    });

    try {
      // Run the agent with all messages
      await agentRef.current.runAgent([...messages, userMessage], subscriber);
    } catch (error) {
      console.error('Error running agent:', error);
      setIsStreaming(false);
    }
  };

  const handleAbort = () => {
    if (agentRef.current) {
      agentRef.current.abortRun();
      setIsStreaming(false);
      setCurrentResponse('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">AWS Bedrock Chat</h1>
        <p className="text-sm text-gray-600">
          Using{' '}
          <a
            href="https://docs.ag-ui.com/sdk/js/client/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            @ag-ui/client
          </a>{' '}
          HttpAgent
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white shadow-lg rounded-lg p-6 mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm font-semibold mb-1 opacity-75">
                {message.role}
              </p>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isStreaming && currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-[70%] px-4 py-2 rounded-lg bg-gray-200 text-gray-900">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold opacity-75">assistant</p>
                {currentMessageId && (
                  <p className="text-xs text-gray-500 font-mono">
                    ID: {currentMessageId.slice(0, 8)}...
                  </p>
                )}
              </div>
              <p className="whitespace-pre-wrap">
                {currentResponse}
                <span className="animate-pulse">▋</span>
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={handleAbort}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Abort
          </button>
        ) : (
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={!input.trim()}
          >
            Send
          </button>
        )}
      </form>

      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>
          SDK: HttpAgent → runAgent() → AgentSubscriber (onTextMessageStart,
          onTextMessageContent, onTextMessageEnd)
        </p>
      </div>
    </div>
  );
}
