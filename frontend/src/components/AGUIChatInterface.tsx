import { useState, useRef, useEffect } from 'react';
import {
  AGUIClient,
  AGUIMessage,
  EventType,
  TextMessageContentEvent,
} from '../lib/agui';

/**
 * Chat interface using AG-UI Protocol
 * Based on https://docs.ag-ui.com/sdk/js/core/overview
 */
export function AGUIChatInterface() {
  const [messages, setMessages] = useState<AGUIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentMessageId, setCurrentMessageId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const client = useRef(new AGUIClient());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isStreaming) return;

    const userMessage: AGUIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setCurrentResponse('');
    setCurrentMessageId('');

    try {
      let fullResponse = '';
      let messageId = '';

      // Use AG-UI protocol events
      for await (const event of client.current.streamChatAGUI([
        ...messages,
        userMessage,
      ])) {
        switch (event.type) {
          case EventType.TEXT_MESSAGE_START:
            messageId = event.messageId;
            setCurrentMessageId(messageId);
            console.log('Message started:', messageId);
            break;

          case EventType.TEXT_MESSAGE_CONTENT:
            const contentEvent = event as TextMessageContentEvent;
            if (contentEvent.delta) {
              fullResponse += contentEvent.delta;
              setCurrentResponse(fullResponse);
            }
            break;

          case EventType.TEXT_MESSAGE_END:
            console.log('Message ended:', event.messageId);
            const assistantMessage: AGUIMessage = {
              role: 'assistant',
              content: fullResponse,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setCurrentResponse('');
            setCurrentMessageId('');
            break;

          case EventType.ERROR:
            console.error('Stream error:', event.error);
            setCurrentResponse('');
            setCurrentMessageId('');
            break;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">AWS Bedrock Chat</h1>
      <p className="text-sm text-gray-600 mb-6">
        Using AG-UI Protocol (
        <a
          href="https://docs.ag-ui.com/sdk/js/core/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          docs.ag-ui.com
        </a>
        )
      </p>

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
                    {currentMessageId}
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
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={isStreaming || !input.trim()}
        >
          {isStreaming ? 'Sending...' : 'Send'}
        </button>
      </form>

      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>
          Event sequence: TEXT_MESSAGE_START → TEXT_MESSAGE_CONTENT* →
          TEXT_MESSAGE_END
        </p>
      </div>
    </div>
  );
}
