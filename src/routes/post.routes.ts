import express from 'express';
import multer from 'multer';
import { commentPost, createPost, deleteComment, deletePost, editComment, getAllPosts, getComments, getPostsByUser, likePost, unlikePost, updatePost } from '~/controllers/post.controller';
import authenticateUser from '~/middlewares/authenticateUser';

const router = express.Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.get("/getPost", getAllPosts);
router.get("/getComment/:postId", getComments);
router.get("/getPostByUser/:userId", getPostsByUser);

router.post('/create', upload.single('posts'), authenticateUser, createPost);
router.post('/like/:postId', authenticateUser, likePost);
router.post('/unlike/:postId', authenticateUser, unlikePost); 
router.post('/comment/:postId', authenticateUser, commentPost);

router.patch('/update/:postId', upload.single('posts'), authenticateUser, updatePost);
router.patch('/:postId/comments/:commentId', authenticateUser, editComment);

router.delete('/delete/:postId', authenticateUser, deletePost);
router.delete('/:postId/comments/:commentId', authenticateUser, deleteComment);


export default router;