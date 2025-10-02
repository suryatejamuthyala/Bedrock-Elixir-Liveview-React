import { useState, useRef, useEffect } from 'react';
import { AGUIClient, AGUIMessage } from '../lib/agui';

export function ChatInterface() {
  const [messages, setMessages] = useState<AGUIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
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

    try {
      let fullResponse = '';

      for await (const event of client.current.streamChat([
        ...messages,
        userMessage,
      ])) {
        if (event.type === 'chunk' && event.content) {
          fullResponse += event.content;
          setCurrentResponse(fullResponse);
        } else if (event.type === 'done') {
          const assistantMessage: AGUIMessage = {
            role: 'assistant',
            content: fullResponse,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setCurrentResponse('');
          break;
        } else if (event.type === 'error') {
          console.error('Stream error:', event.error);
          setCurrentResponse('');
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
      <h1 className="text-3xl font-bold mb-6">AWS Bedrock Chat</h1>

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
              <p className="text-sm font-semibold mb-1 opacity-75">
                assistant
              </p>
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
    </div>
  );
}
