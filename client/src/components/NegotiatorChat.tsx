import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaSignOutAlt, FaUser, FaHome } from 'react-icons/fa';
import {  Calendar, MessageCircle } from 'lucide-react';

interface Course {
  name: string;
  link: string;
  duration: string;
}

interface Connection {
  title: string;
  company: string;
  reason: string;
}

interface CommunityEvent {
  name: string;
  type: string;
  frequency: string;
}

interface PlanData {
  weekly_hours: number;
  courses: Course[];
  connections: Connection[];
  events: CommunityEvent[];
}

interface PlansResponse {
  plan_id: number;
  data: {
    achievable: PlanData;
    negotiated: PlanData;
    ambitious: PlanData;
  };
}

interface NegotiatorResponse {
  response: string;
  completed?: boolean;
  plans?: PlansResponse;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const NegotiatorChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<PlansResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isThankYouMessage = (message: Message) => {
    return message.sender === 'bot' && message.text.includes("Thank you for sharing your goals and preferences!");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!hasInitialized.current) {
      const initialMessages: Message[] = [
        {
          text: "Welcome to the Achievement Negotiator Plan! I'll help you create a personalized development roadmap tailored to your goals and availability.",
          sender: 'bot'
        },
        {
          text: "Let's start by understanding your aspirations. What specific skills would you like to develop? Please list them in order of priority.",
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
  }, []);

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
      
      const response = await axios.post<NegotiatorResponse>(
        `${import.meta.env.VITE_API_URL}/negotiator/chat`,
        { message },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );

      const botMessage: Message = {
        text: response.data.response,
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

      if (response.data.completed && response.data.plans) {
        setIsCompleted(true);
        setGeneratedPlans(response.data.plans);
        
        const plansData: PlansResponse = {
          plan_id: response.data.plans.plan_id,
          data: {
            achievable: response.data.plans.data.achievable,
            negotiated: response.data.plans.data.negotiated,
            ambitious: response.data.plans.data.ambitious
          }
        };

        setTimeout(() => {
          navigate('/achievement-plans', { 
            state: { 
              plans: plansData
            },
            replace: true
          });
        }, 2000);
      }

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

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
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
                onClick={signOut}
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
        <div className="flex-1 max-w-4xl w-full mx-auto">
        <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index}>
            <div
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`relative flex flex-col max-w-[85%] rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <span className="inline-block">{msg.text}</span>
              </div>
            </div>
            
            {/* Show achievement plans button when thank you message appears */}
            {isThankYouMessage(msg) && (
              <div className="flex flex-col items-center mt-6 mb-8 space-y-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 text-center">
                    Your Achievement Plans Are Ready!
                  </h3>
                  <div className="flex justify-center">
                    <button
                      onClick={() => navigate('/achievement-plans', { 
                        state: { plans: generatedPlans }
                      })}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <span>View Your Achievement Plans</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
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
        
        <div ref={messagesEndRef} />
      </div>
  
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 sticky bottom-0">
            <div className="max-w-4xl mx-auto flex space-x-4">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={1}
                disabled={isCompleted}
              />
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim() || isCompleted}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegotiatorChat;