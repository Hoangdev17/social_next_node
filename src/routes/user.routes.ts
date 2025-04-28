import express from 'express';
import multer from 'multer';
import { editProfile, followUser, getAllUsers, getMe, getUserById, unfollowUser } from '~/controllers/user.controller';
import authenticateUser from '~/middlewares/authenticateUser';
import { roleAuthenticate } from '~/middlewares/roleAuthenticate';

const router = express.Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.get('/me', authenticateUser, getMe);
router.get("/getAll", getAllUsers);
router.get('/:id', authenticateUser, roleAuthenticate(['admin']), getUserById);

router.patch("/editProfile", upload.single('posts'), authenticateUser, editProfile);
router.post('/:id/follow', authenticateUser, followUser);
router.post('/:id/unfollow', authenticateUser, unfollowUser);


export default router;