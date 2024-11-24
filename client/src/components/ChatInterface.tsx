import React, { useState, useEffect, useRef } from 'react';
import VoiceInput from './VoiceInput';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Message } from '../types/chat';
import { Calendar, TrendingUp } from 'lucide-react';

type UserRole = 'mentor' | 'mentee' | null;



interface ChatResponse {
  response: string;
  role?: string;
  completed?: boolean;
  phase?: number;
  schedule?: {
    persona_id: number;
    generated_posts: {
      [key: string]: {
        Post_content: string;
        Post_date: string;
      };
    };
  };
}
const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'mentor' | 'mentee' | null>(null);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    const initialMessage: Message = {
      text: "Hi! I'm here to understand your professional journey. Could you tell me about your current role and experience?",
      sender: 'bot'
    };
    setMessages([initialMessage]);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      text: message,
      sender: 'user'
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const idToken = await user?.getIdToken();
      
      const apiResponse = await axios.post<ChatResponse>('http://localhost:8000/chat', 
        { message },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );
      
      // Store the response
      setResponse(apiResponse.data);
      
      if (apiResponse.data.role) {
        setUserRole(apiResponse.data.role as UserRole);
      }

      if (apiResponse.data.phase) {
        setCurrentPhase(apiResponse.data.phase);
      }

      const botMessage: Message = {
        text: apiResponse.data.response,
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        text: 'I apologize, but I encountered an error. Could you please try again?',
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    setInputMessage(text);
    sendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // Phase indicator component
  const PhaseIndicator = () => (
    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
      <span className="text-sm font-medium text-gray-600">
        Phase {currentPhase}
      </span>
      <span className="text-xs text-gray-500">
        {currentPhase === 1 ? 'Profile Analysis' : 'Content Strategy'}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Navigator Hub
              </h1>
            </div>
            
            {/* User Profile and Sign Out */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <FaUser className="w-6 h-6 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.displayName || user?.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Professional Journey Chat</h1>
          <div className="flex items-center space-x-4">
            <PhaseIndicator />
            {userRole && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto">
        <div className="h-[calc(100vh-180px)] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Navigation Buttons - Show only when chat is completed */}
          {messages.length > 0 && 
           messages[messages.length - 1].sender === 'bot' && 
           messages[messages.length - 1].text.includes("created your content schedule") && (
            <div className="flex flex-col items-center space-y-4 mt-6 p-4 bg-white rounded-lg shadow">
              <button
                onClick={() => navigate('/schedule', { 
                  state: {
                    personaId: response?.schedule?.persona_id,
                    generatedPosts: response?.schedule?.generated_posts
                  }
                })}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>View Content Schedule</span>
              </button>
              
              <button
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed"
                disabled
              >
                <TrendingUp className="w-5 h-5" />
                <span>Achievement Negotiator Plan</span>
              </button>
              
              <p className="text-sm text-gray-500 italic mt-2">
                Achievement Negotiator Plan - Coming Soon!
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800">
                <span className="flex space-x-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-transparent focus:outline-none"
                disabled={isLoading}
              />
              <VoiceInput onVoiceInput={handleVoiceInput} />
            </div>
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;