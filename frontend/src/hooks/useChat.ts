import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export function useConversations(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const enabled = options?.enabled ?? true;

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: getMyConversations,
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

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const joinedRef = useRef<string | null>(null);

  const { data: historicMessages = [], isLoading } = useQuery({
    queryKey: MESSAGES_KEY(conversationId ?? ''),
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
  });

  useEffect(() => {
    setLiveMessages([]);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    const joinRoom = () => {
      if (conversationId) {
        socket.emit('join:conversation', conversationId);
        joinedRef.current = conversationId;
      }
    };

    if (joinedRef.current !== conversationId) {
      if (joinedRef.current) socket.emit('leave:conversation', joinedRef.current);
      joinRoom();
    } else {
      joinRoom();
    }

    const handleMessage = (msg: ChatMessage) => {
      if (msg.conversationId === conversationId) {
        setLiveMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        queryClient.invalidateQueries({ queryKey: MESSAGES_KEY(conversationId) });
      }
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    };

    const handleConvoUpdated = (data: { conversationId: string; message?: ChatMessage }) => {
      if (data.conversationId === conversationId) {
        if (data.message) {
          handleMessage(data.message);
        } else {
          queryClient.invalidateQueries({ queryKey: MESSAGES_KEY(conversationId) });
        }
      }
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    };

    const handleDeleted = ({ messageId }: { messageId: string }) => {
      setLiveMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m)
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

  useEffect(() => {
    if (conversationId) {
      markConversationRead(conversationId).catch(() => {});
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    }
  }, [conversationId, queryClient]);

  const allMessages = [
    ...historicMessages.filter(
      (h) => !liveMessages.some((l) => l.id === h.id)
    ),
    ...liveMessages,
  ];

  const sendMut = useMutation({
    mutationFn: (content: string) => sendChatMessage(conversationId!, content),
    onSuccess: (newMsg) => {
      if (newMsg) {
        setLiveMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: MESSAGES_KEY(conversationId ?? '') });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to send message'),
  });

  const deleteMut = useMutation({
    mutationFn: (messageId: string) => deleteChatMessage(messageId),
    onSuccess: (_, messageId) => {
      setLiveMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m)
      );
      queryClient.invalidateQueries({ queryKey: MESSAGES_KEY(conversationId ?? '') });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete message'),
  });

  const send = useCallback(
    (content: string) => sendMut.mutateAsync(content),
    [sendMut]
  );

  return {
    messages: allMessages,
    isLoading,
    send,
    isSending: sendMut.isPending,
    deleteMessage: deleteMut.mutate,
  };
}

export function useChattableUsers(search: string) {
  return useQuery({
    queryKey: CHATTABLE_USERS_KEY(search),
    queryFn: () => getChattableUsers(search || undefined),
    enabled: search.length >= 1,
  });
}
