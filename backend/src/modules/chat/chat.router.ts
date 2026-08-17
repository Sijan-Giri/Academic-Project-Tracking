import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import * as chatController from './chat.controller';
import { sendMessageSchema, startConversationSchema } from './chat.schema';

const router = Router();

router.use(authenticate);
router.use(requireRoles('COORDINATOR', 'FACULTY', 'PANEL', 'STUDENT'));

router.get('/users', chatController.getChattableUsers);
router.post('/conversations', validate(startConversationSchema), chatController.startConversation);
router.get('/conversations', chatController.getMyConversations);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', validate(sendMessageSchema), chatController.sendMessage);
router.post('/conversations/:conversationId/read', chatController.markRead);
router.delete('/messages/:messageId', chatController.deleteMessage);

export default router;
