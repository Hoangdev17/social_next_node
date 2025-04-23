import express from 'express';
import multer from 'multer';
import { createPost, deletePost, likePost, unlikePost, updatePost } from '~/controllers/post.controller';
import authenticateUser from '~/middlewares/authenticateUser';

const router = express.Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post('/create', upload.single('posts'), authenticateUser, createPost);
router.post('/like/:postId', authenticateUser, likePost);
router.post('/unlike/:postId', authenticateUser, unlikePost); 

router.patch('/update/:postId', upload.single('posts'), authenticateUser, updatePost);

router.delete('/delete/:postId', authenticateUser, deletePost);

export default router;