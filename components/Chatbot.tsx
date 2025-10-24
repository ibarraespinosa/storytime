
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { PaperAirplaneIcon, UserCircleIcon, SparklesIcon } from './icons';

interface ChatbotProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export const Chatbot: React.FC<ChatbotProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 flex flex-col h-[32rem]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Creative Assistant</h2>
        <p className="text-sm text-gray-400">Ask for ideas, feedback, or help.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'model' && <SparklesIcon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />}
              <div className={`max-w-md rounded-lg px-4 py-2 ${message.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
              {message.role === 'user' && <UserCircleIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />}
            </div>
          ))}
          {isProcessing && (
             <div className="flex items-start gap-3">
                <SparklesIcon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div className="max-w-md rounded-lg px-4 py-2 bg-gray-700 text-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-gray-900/70 border border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
