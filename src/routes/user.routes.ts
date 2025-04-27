import express from 'express';
import { followUser, getAllUsers, getMe, getUserById, unfollowUser } from '~/controllers/user.controller';
import authenticateUser from '~/middlewares/authenticateUser';
import { roleAuthenticate } from '~/middlewares/roleAuthenticate';

const router = express.Router();

router.get('/me', authenticateUser, getMe);
router.get("/getAll", getAllUsers);
router.get('/:id', authenticateUser, roleAuthenticate(['admin']), getUserById);


router.post('/:id/follow', authenticateUser, followUser);
router.post('/:id/unfollow', authenticateUser, unfollowUser);

export default router;