
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type: 'user' | 'bot' | 'agent';
  avatar?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  statusMessage?: string;
  lastMessage?: string;
  unreadCount: number;
  labels: string[];
}

export interface AIInsight {
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  suggestedReply: string;
}
