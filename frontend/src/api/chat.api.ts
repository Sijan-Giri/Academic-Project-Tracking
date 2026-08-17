import { api } from './client';
import type { ChatUser, ChatMessage, ConversationSummary } from '@/types';

export const getChattableUsers = async (search?: string): Promise<ChatUser[]> => {
  const res = await api.get('/chat/users', { params: search ? { search } : undefined });
  const data = res.data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

export const startConversation = async (otherUserId: string): Promise<string> => {
  const res = await api.post('/chat/conversations', { otherUserId });
  return res.data?.data?.conversationId ?? res.data?.conversationId;
};

export const getMyConversations = async (): Promise<ConversationSummary[]> => {
  const res = await api.get('/chat/conversations');
  const data = res.data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

export const getMessages = async (
  conversationId: string,
  cursor?: string,
  limit = 40
): Promise<ChatMessage[]> => {
  const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { cursor, limit },
  });
  const data = res.data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

export const sendChatMessage = async (
  conversationId: string,
  content: string
): Promise<ChatMessage> => {
  const res = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
  return res.data?.data ?? res.data;
};

export const markConversationRead = async (conversationId: string): Promise<void> => {
  await api.post(`/chat/conversations/${conversationId}/read`);
};

export const deleteChatMessage = async (messageId: string): Promise<void> => {
  await api.delete(`/chat/messages/${messageId}`);
};
