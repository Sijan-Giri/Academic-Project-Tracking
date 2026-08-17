import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import { sendSuccess } from '../../shared/utils';
import * as chatService from './chat.service';

export const getChattableUsers = async (req: AuthRequest, res: Response) => {
  const { search } = req.query as { search?: string };
  const data = await chatService.getChattableUsers(search);
  sendSuccess(res, data);
};

export const startConversation = async (req: AuthRequest, res: Response) => {
  const callerId = req.user!.userId;
  const { otherUserId } = req.body;
  const conversationId = await chatService.getOrCreateConversation(callerId, otherUserId);
  sendSuccess(res, { conversationId }, 'Conversation ready', 200);
};

export const getMyConversations = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const data = await chatService.getMyConversations(userId);
  sendSuccess(res, data);
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { conversationId } = req.params;
  const { cursor, limit } = req.query as { cursor?: string; limit?: string };
  const data = await chatService.getMessagesForConversation(
    conversationId,
    userId,
    cursor,
    limit ? parseInt(limit) : 40
  );
  sendSuccess(res, data);
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const senderId = req.user!.userId;
  const senderRole = req.user!.role;
  const { conversationId } = req.params;
  const { content } = req.body;
  const message = await chatService.sendMessage(conversationId, senderId, content, senderRole);

  const { getIO, emitToUser } = await import('../../config/socket');
  try {
    const io = getIO();
    io.to(`conversation:${conversationId}`).emit('chat:message', message);

    const participantIds = await chatService.getConversationParticipantUserIds(conversationId);
    participantIds.forEach((userId) => {
      if (userId !== senderId) {
        emitToUser(userId, 'chat:message', message);
        emitToUser(userId, 'chat:conversation_updated', { conversationId, message });
      }
    });
  } catch (_) {}

  sendSuccess(res, message, 'Message sent', 201);
};

export const markRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { conversationId } = req.params;
  await chatService.markConversationRead(conversationId, userId);
  sendSuccess(res, null, 'Marked as read');
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { messageId } = req.params;
  const data = await chatService.softDeleteMessage(messageId, userId);

  try {
    const { getIO } = await import('../../config/socket');
    const io = getIO();
    io.to(`conversation:${data.conversationId}`).emit('chat:message_deleted', { messageId, conversationId: data.conversationId });
  } catch (_) {}

  sendSuccess(res, data, 'Message deleted');
};
