import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
//import { Book, Users, Calendar } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Achievement Negotiator
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-2">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <FaUser className="w-6 h-6 text-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-700 hidden md:inline">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Dashboard
              </button>
              <button
                onClick={signOut}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <FaSignOutAlt className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

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
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <span className="inline-block">{msg.text}</span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <span className="flex space-x-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </span>
              </div>
            </div>
          )}

          {isCompleted && generatedPlans && (
            <div className="flex justify-center my-4">
              <button
                onClick={() => navigate('/achievement-plans', { 
                  state: { plans: generatedPlans }
                })}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Your Achievement Plans
              </button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
              disabled={isCompleted}
            />
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim() || isCompleted}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegotiatorChat;