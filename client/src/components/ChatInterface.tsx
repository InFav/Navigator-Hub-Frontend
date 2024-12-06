import React, { useState, useEffect, useRef } from 'react';
import VoiceInput from './VoiceInput';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Message } from '../types/chat';
import { Calendar, TrendingUp, MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { FaHome } from 'react-icons/fa';

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

interface ChatHistory {
  messages: {
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
  }[];
}

interface ChatState {
  current_phase: number;
  current_question_index: number;
  completed: boolean;
  user_profile: Record<string, any>;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_userRole, setUserRole] = useState<UserRole>(null);
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const initializeChat = async () => {
    if (!user) return;
    
    try {
      const idToken = await user.getIdToken();
      
      // Fetch chat state first
      const stateResponse = await axios.get<ChatState>(
        `${import.meta.env.VITE_API_URL}/api/chat/state/${user.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );

      setCurrentPhase(stateResponse.data.current_phase);
      
      // Fetch chat history
      const historyResponse = await axios.get<ChatHistory>(
        `${import.meta.env.VITE_API_URL}/api/chat/history/${user.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );

      if (historyResponse.data.messages.length > 0) {
        setMessages(historyResponse.data.messages);
        hasInitialized.current = true;
        
        // Check if chat was completed
        if (stateResponse.data.completed) {
          setResponse({
            response: "Previous chat completed",
            completed: true,
            schedule: undefined // You'll need to fetch this if needed
          });
        }
      } else if (!stateResponse.data.completed && !hasInitialized.current) {
        // Only show initial messages for new users
        const initialMessages: Message[] = [
          {
            text: "Hi I am Aru, your personal branding assistant powered by Navigator Hub. I am here to save you time in execution of a growth strategy via LinkedIn engagement.",
            sender: 'bot'
          },
          {
            text: "What I need from you is data for strategizing and understanding your career story for the best execution possible.",
            sender: 'bot'
          },
          {
            text: "What's your First and Last Name?",
            sender: 'bot'
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
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  useEffect(() => {
    initializeChat();
  }, [user]);

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
      
      const apiResponse = await axios.post<ChatResponse>(
        `${import.meta.env.VITE_API_URL}/chat`, 
        { message },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );
      
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Navigator Hub
            </h1>
          </div>
  
          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaHome className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="ml-3">Dashboard</span>
            </button>
  
            <button 
              onClick={() => navigate('/chat')}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-700"
            >
              <MessageCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="ml-3">Chat with Aru</span>
            </button>
  
            <button 
              onClick={() => navigate('/schedule')}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="ml-3">Content Calendar</span>
            </button>
          </nav>
          <div className="p-4">
            <PhaseIndicator />
          </div>
  
          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <FaUser className="w-8 h-8 text-gray-400" />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.displayName || user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                title="Sign Out"
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
  
      {/* Main Content */}
      <div className="ml-64 flex-1"> {/* Offset by sidebar width */}
        {/* Chat Container */}
        <div className="max-w-4xl w-full mx-auto">
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
  
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <span className="flex space-x-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                  </span>
                </div>
              </div>
            )}
  
            {/* Navigation Buttons - Show only when chat is completed */}
            {messages.length > 0 && 
            messages[messages.length - 1].sender === 'bot' && 
            response?.completed && (
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
                  onClick={() => navigate('/negotiator')}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Achievement Negotiator Plan</span>
                </button>
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
        
        {/* Feedback Button */}
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
  );
};

export default ChatInterface;