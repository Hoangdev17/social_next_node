import express from 'express';
import { getMessagesBetweenUsers } from '~/controllers/chat.controller';
import authenticateUser from '~/middlewares/authenticateUser';

const router = express.Router();

// GET /api/messages/history?userId1=xxx&userId2=yyy
router.get('/history/:userId', authenticateUser, getMessagesBetweenUsers);

export default router;
