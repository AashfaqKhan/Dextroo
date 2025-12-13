import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { Send, Bot, User as UserIcon, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming standard environment allows this, otherwise fallback to simple text

interface ChatBotProps {
  userId: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ userId }) => {
  const STORAGE_KEY = `academy_chat_history_${userId}`;
  
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // We need to revive the date string back to a Date object
        return JSON.parse(saved, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
      }
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
    // Default initial state if nothing found
    return [{ 
      id: '1', 
      role: 'model', 
      text: 'Hello! I am your AI academic assistant. How can I help you today?', 
      timestamp: new Date() 
    }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save history whenever messages change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, STORAGE_KEY]);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      const initialMsg: Message = { 
        id: Date.now().toString(), 
        role: 'model', 
        text: 'Hello! I am your AI academic assistant. How can I help you today?', 
        timestamp: new Date() 
      };
      setMessages([initialMsg]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
        let fullResponse = "";
        const botMsgId = (Date.now() + 1).toString();
        
        // Add placeholder for bot message
        setMessages(prev => [...prev, {
            id: botMsgId,
            role: 'model',
            text: '',
            timestamp: new Date()
        }]);

        await streamChatResponse('gemini-3-pro-preview', history, userMsg.text, (chunk) => {
             fullResponse += chunk;
             setMessages(prev => prev.map(m => 
                m.id === botMsgId ? { ...m, text: fullResponse } : m
             ));
        });

    } catch (error) {
       console.error(error);
       setMessages(prev => [...prev, {
         id: Date.now().toString(),
         role: 'model',
         text: "I'm sorry, I encountered an error. Please try again.",
         timestamp: new Date()
       }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Academic AI Assistant</h2>
        </div>
        <button 
          onClick={handleClearHistory}
          className="p-2 text-indigo-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Clear Chat History"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-l-2xl rounded-tr-2xl'
                  : 'bg-gray-100 text-gray-800 rounded-r-2xl rounded-tl-2xl'
              } p-4 shadow-sm`}
            >
              <div className="mr-2 mt-1">
                {msg.role === 'user' ? (
                   <div className="w-6 h-6 rounded-full bg-indigo-400 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                   </div>
                ) : (
                   <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-indigo-700" />
                   </div>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                 {/* Simple text rendering for robustness in this prompt context, or markdown if possible */}
                 <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
                 <div className="bg-gray-100 text-gray-800 rounded-r-2xl rounded-tl-2xl p-4 shadow-sm flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-indigo-600" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;