import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  getMyConversations,
  getMessages,
  sendChatMessage,
  markConversationRead,
  startConversation,
  getChattableUsers,
  deleteChatMessage,
} from '@/api';
import type { ChatMessage, ConversationSummary } from '@/types';
import { getSocket } from '@/lib';

export const CONVERSATIONS_KEY = ['chat-conversations'] as const;
export const MESSAGES_KEY = (conversationId: string) => ['chat-messages', conversationId] as const;
export const CHATTABLE_USERS_KEY = (search?: string) => ['chat-users', search ?? ''] as const;

// ─── Conversations ────────────────────────────────────────────────────────────

export function useConversations(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const enabled = options?.enabled ?? true;

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: getMyConversations,
    staleTime: 30_000,          // 30 s — socket handles live updates
    gcTime: 5 * 60 * 1000,
    enabled,
  });

  const convList = conversations as ConversationSummary[];
  const unreadCount = convList.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const startMut = useMutation({
    mutationFn: (otherUserId: string) => startConversation(otherUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to start conversation'),
  });

  return {
    conversations: convList,
    unreadCount,
    isLoading,
    startConversation: startMut.mutateAsync,
    isStarting: startMut.isPending,
  };
}

export function useUnreadChatCount(options?: { enabled?: boolean }) {
  const { unreadCount, isLoading } = useConversations(options);
  return { unreadCount, isLoading };
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const joinedRef = useRef<string | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: MESSAGES_KEY(conversationId ?? ''),
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,   // 5 min — socket keeps messages fresh in real-time
    gcTime: 10 * 60 * 1000,
  });

  // ── Socket room management + event listeners ──────────────────────────────
  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    const joinRoom = () => {
      if (joinedRef.current && joinedRef.current !== conversationId) {
        socket.emit('leave:conversation', joinedRef.current);
      }
      socket.emit('join:conversation', conversationId);
      joinedRef.current = conversationId;
    };

    joinRoom();

    // Append new message directly into cache — zero extra network requests
    const handleMessage = (msg: ChatMessage) => {
      if (msg.conversationId !== conversationId) return;

      queryClient.setQueryData<ChatMessage[]>(
        MESSAGES_KEY(conversationId),
        (prev = []) => {
          if (prev.some((m) => m.id === msg.id)) return prev;   // deduplicate
          return [...prev, msg];
        }
      );

      // Update conversation list sidebar (unread count + last message preview)
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    };

    const handleConvoUpdated = (data: { conversationId: string; message?: ChatMessage }) => {
      if (data.conversationId === conversationId && data.message) {
        handleMessage(data.message);
      } else {
        queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      }
    };

    // Soft-delete a message directly in cache — zero extra network requests
    const handleDeleted = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData<ChatMessage[]>(
        MESSAGES_KEY(conversationId),
        (prev = []) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, isDeleted: true, content: 'This message was deleted' }
              : m
          )
      );
    };

    const handleError = (err: { code: string; message: string }) => {
      if (err.code === 'FORBIDDEN') {
        toast.error('You are not a participant in this conversation');
      }
    };

    socket.on('connect', joinRoom);
    socket.on('chat:message', handleMessage);
    socket.on('chat:conversation_updated', handleConvoUpdated);
    socket.on('chat:message_deleted', handleDeleted);
    socket.on('chat:error', handleError);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('chat:message', handleMessage);
      socket.off('chat:conversation_updated', handleConvoUpdated);
      socket.off('chat:message_deleted', handleDeleted);
      socket.off('chat:error', handleError);
    };
  }, [conversationId, queryClient]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversationId) {
      markConversationRead(conversationId).catch(() => {});
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    }
  }, [conversationId, queryClient]);

  // ── Send message mutation ─────────────────────────────────────────────────
  const sendMut = useMutation({
    mutationFn: (content: string) => sendChatMessage(conversationId!, content),
    onSuccess: (newMsg) => {
      if (newMsg) {
        // Optimistically add own sent message to cache immediately
        queryClient.setQueryData<ChatMessage[]>(
          MESSAGES_KEY(conversationId ?? ''),
          (prev = []) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          }
        );
      }
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to send message'),
  });

  // ── Delete message mutation ───────────────────────────────────────────────
  const deleteMut = useMutation({
    mutationFn: (messageId: string) => deleteChatMessage(messageId),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData<ChatMessage[]>(
        MESSAGES_KEY(conversationId ?? ''),
        (prev = []) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, isDeleted: true, content: 'This message was deleted' }
              : m
          )
      );
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete message'),
  });

  const send = useCallback(
    (content: string) => sendMut.mutateAsync(content),
    [sendMut]
  );

  return {
    messages: messages as ChatMessage[],
    isLoading,
    send,
    isSending: sendMut.isPending,
    deleteMessage: deleteMut.mutate,
  };
}

// ─── Chattable users search ───────────────────────────────────────────────────

export function useChattableUsers(search: string) {
  return useQuery({
    queryKey: CHATTABLE_USERS_KEY(search),
    queryFn: () => getChattableUsers(search || undefined),
    enabled: search.length >= 1,
    staleTime: 60_000,   // 1 min — user list is stable
    gcTime: 5 * 60 * 1000,
  });
}
