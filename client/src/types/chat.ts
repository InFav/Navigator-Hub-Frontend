export interface Message {
  text: string;
  sender: 'user' | 'bot';
  formatted?: boolean;
  timestamp?: string;
}