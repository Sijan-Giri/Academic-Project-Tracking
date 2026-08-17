export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ConversationSummary {
  id: string;
  createdAt: string;
  lastMessageAt: string | null;
  otherUser: ChatUser | null;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
    isDeleted: boolean;
  } | null;
  unreadCount: number;
  lastReadAt: string | null;
}
