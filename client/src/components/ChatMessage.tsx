import React from 'react';

interface FormattedQuestion {
  number: number;
  total: number;
  text: string;
  emoji: string;
}

interface WelcomeMessage {
  text: string;
  emoji: string;
  isWelcome: boolean;
  style: {
    gradient: boolean;
    iconSize: 'sm' | 'md' | 'lg';
  };
}

interface MessageContent {
  text: string;
  sender?: 'user' | 'bot';
  timestamp?: string;
  formatted?: boolean;
}

interface ChatMessageProps {
  message: MessageContent;
  isBot: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot }) => {
  // Try to parse message content if it appears to be JSON
  let formattedQuestion: FormattedQuestion | null = null;
  let welcomeMessage: WelcomeMessage | null = null;
  let messageContent = message.text;

  if (isBot && typeof message.text === 'string') {
    try {
      // Check if the message looks like JSON
      if (message.text.trim().startsWith('{')) {
        const parsed = JSON.parse(message.text);
        
        // Check if it's a formatted question
        if (parsed.number && parsed.total && parsed.text && parsed.emoji) {
          formattedQuestion = parsed;
          messageContent = parsed.text;
        }
        // Check if it's a welcome message
        else if (parsed.isWelcome && parsed.text && parsed.emoji) {
          welcomeMessage = parsed;
          messageContent = parsed.text;
        }
      }
    } catch (e) {
      // If parsing fails, use the original message text
      messageContent = message.text;
    }
  }

  const getEmojiSize = (size?: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'lg': return 'text-4xl';
      case 'md': return 'text-3xl';
      default: return 'text-2xl';
    }
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`relative flex flex-col max-w-[85%] rounded-lg px-4 py-2 ${
          isBot ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-600'
        }`}
      >
        {formattedQuestion ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{formattedQuestion.emoji}</span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Question {formattedQuestion.number} of {formattedQuestion.total}
              </span>
            </div>
            <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {formattedQuestion.text}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(formattedQuestion.number / formattedQuestion.total) * 100}%` }}
              />
            </div>
          </div>
        ) : welcomeMessage ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className={`${getEmojiSize(welcomeMessage.style.iconSize)} transition-transform hover:scale-110`}>
                {welcomeMessage.emoji}
              </span>
              <div className={`text-lg ${
                welcomeMessage.style.gradient 
                  ? 'font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {welcomeMessage.text}
              </div>
            </div>
          </div>
        ) : (
          <span className={`inline-block ${isBot ? 'text-gray-800 dark:text-gray-200' : 'text-white'}`}>
            {messageContent}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;