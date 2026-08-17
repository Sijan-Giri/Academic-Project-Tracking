import { Role } from '@prisma/client';
import prisma from '../../config/database';
import { ForbiddenError, NotFoundError } from '../../shared/errors';

const ADMIN_ROLE: Role = 'ADMIN';

const CHAT_ROLES: Role[] = ['COORDINATOR', 'FACULTY', 'PANEL', 'STUDENT'];

const assertNotAdmin = (role: Role, message: string) => {
  if (role === ADMIN_ROLE) throw new ForbiddenError(message);
};

export const isParticipant = async (conversationId: string, userId: string): Promise<boolean> => {
  const row = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });
  return row !== null;
};

export const getChattableUsers = async (search?: string) => {
  const where: any = {
    role: { in: CHAT_ROLES },
    isActive: true,
  };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  return prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
    take: 30,
  });
};

export const getOrCreateConversation = async (callerId: string, otherUserId: string): Promise<string> => {
  const [caller, other] = await Promise.all([
    prisma.user.findUnique({ where: { id: callerId }, select: { role: true } }),
    prisma.user.findUnique({ where: { id: otherUserId }, select: { role: true } }),
  ]);

  if (!caller) throw new NotFoundError('Caller user not found');
  if (!other) throw new NotFoundError('Target user not found');

  assertNotAdmin(caller.role, 'Admin users cannot start conversations');
  assertNotAdmin(other.role, 'Admin users cannot be added to conversations');

  const existing = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: { userId: { in: [callerId, otherUserId] } },
      },
    },
    include: { participants: true },
  });

  if (existing && existing.participants.length === 2) {
    const participantIds = existing.participants.map((p) => p.userId).sort();
    const targetIds = [callerId, otherUserId].sort();
    if (participantIds[0] === targetIds[0] && participantIds[1] === targetIds[1]) {
      return existing.id;
    }
  }

  const conversation = await prisma.$transaction(async (tx) => {
    const conv = await tx.conversation.create({ data: {} });
    await tx.conversationParticipant.createMany({
      data: [
        { conversationId: conv.id, userId: callerId },
        { conversationId: conv.id, userId: otherUserId },
      ],
    });
    return conv;
  });

  return conversation.id;
};

export const getMyConversations = async (userId: string) => {
  const participantRows = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, email: true, role: true } },
            },
          },
          messages: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: 'desc' } },
  });

  return participantRows.map((row) => {
    const { conversation, lastReadAt } = row;
    const otherParticipant = conversation.participants.find((p) => p.userId !== userId);
    const lastMessage = conversation.messages[0] ?? null;
    const unreadCount =
      lastMessage && lastReadAt === null
        ? 1
        : lastMessage && lastReadAt && new Date(lastMessage.createdAt).getTime() > new Date(lastReadAt).getTime()
        ? 1
        : 0;

    return {
      id: conversation.id,
      createdAt: conversation.createdAt,
      lastMessageAt: conversation.lastMessageAt,
      otherUser: otherParticipant?.user ?? null,
      lastMessage: lastMessage
        ? {
            content: lastMessage.isDeleted ? 'This message was deleted' : lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
            isDeleted: lastMessage.isDeleted,
          }
        : null,
      unreadCount,
      lastReadAt,
    };
  });
};

export const getMessagesForConversation = async (
  conversationId: string,
  userId: string,
  cursor?: string,
  limit = 40
) => {
  const participant = await isParticipant(conversationId, userId);
  if (!participant) throw new ForbiddenError('You are not a participant in this conversation');

  let cursorDate: Date | undefined;
  if (cursor) {
    cursorDate = await getMessageDate(cursor);
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return messages.reverse();
};

const getMessageDate = async (messageId: string): Promise<Date> => {
  const msg = await prisma.message.findUnique({ where: { id: messageId }, select: { createdAt: true } });
  if (!msg) throw new NotFoundError('Cursor message not found');
  return msg.createdAt;
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  senderRole: Role
) => {
  assertNotAdmin(senderRole, 'Admin users cannot send messages');

  const participant = await isParticipant(conversationId, senderId);
  if (!participant) throw new ForbiddenError('You are not a participant in this conversation');

  return prisma.message.create({
    data: { conversationId, senderId, content },
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
  });
};

export const markConversationRead = async (conversationId: string, userId: string): Promise<void> => {
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
};

export const softDeleteMessage = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new NotFoundError('Message not found');
  if (message.senderId !== userId) throw new ForbiddenError('You can only delete your own messages');

  return prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true },
  });
};

export const getConversationParticipantUserIds = async (conversationId: string): Promise<string[]> => {
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  return participants.map((p) => p.userId);
};
