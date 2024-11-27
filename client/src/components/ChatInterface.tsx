import React, { useState, useEffect, useRef } from 'react';
import VoiceInput from './VoiceInput';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Message } from '../types/chat';
import { Calendar, TrendingUp } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const hasInitialized = useRef(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      const initialMessages: Message[] = [
        {
          text: "Hi I am Aru, your personal branding assistant powered by Navigator Hub. I am here to save you time in execution of a growth strategy via LinkedIn engagement.",
          sender: 'bot' as const
        },
        {
          text: "What I need from you is data for strategizing and understanding your career story for the best execution possible.",
          sender: 'bot' as const
        },
        {
          text: "What's your First and Last Name?",
          sender: 'bot' as const
        }
      ];

      const addMessagesSequentially = async () => {
        for (let i = 0; i < initialMessages.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setMessages(prev => [...prev, initialMessages[i]]);
        }
      };

      addMessagesSequentially();
      hasInitialized.current = true;
    }
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
      
      const apiResponse = await axios.post<ChatResponse>(`${import.meta.env.VITE_API_URL}/chat`, 
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
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Navigator Hub
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-2">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <FaUser className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-2 md:px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <FaSignOutAlt className="md:mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="fixed bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 z-40"
              >
                Help Us Improve
              </button>

              <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                userEmail={user?.email ?? undefined}
              />
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
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`relative flex flex-col max-w-[85%] rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                style={{
                  width: 'fit-content',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              >
                <span className="inline-block">{msg.text}</span>
              </div>
            </div>
          ))}

          {/* Navigation Buttons - Show only when chat is completed */}
          {messages.length > 0 && 
          messages[messages.length - 1].sender === 'bot' && 
          response?.completed && (  // Instead of checking for specific text
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
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200">
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
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 sticky bottom-0">
          <div className="max-w-4xl mx-auto flex space-x-2 md:space-x-4">
            <div className="flex-1 flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  autoResize();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputMessage);
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-hidden min-h-[40px] max-h-[200px]"
                disabled={isLoading}
                style={{ lineHeight: '1.5' }}
              />
              <VoiceInput onVoiceInput={handleVoiceInput} />
            </div>
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <span className="hidden md:inline">Send</span>
              <span className="inline md:hidden">➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;