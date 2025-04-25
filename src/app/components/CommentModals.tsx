import React, { useEffect, useState } from 'react';
import { Modal, Button, Typography, Box, TextField, Avatar, Stack, CircularProgress } from '@mui/material';
import { api } from '@/lib/auth';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

interface CommentModalProps {
  open: boolean;
  handleClose: () => void;
  postId: string;
  onSubmit: (postId: string, comment: string) => Promise<void>;
}

interface IComment {
  _id: string;
  comment: string;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    avatar: string;
  };
}

interface IPost {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  image: string;
  createdBy: {
    _id: string;
    username: string;
    avatar: string;
  };
}

interface PostResponse {
  posts: IPost[];
}

interface DataComment {
  message: string;
  comments: IComment[];
}

const CommentModal: React.FC<CommentModalProps> = ({ open, handleClose, postId, onSubmit }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<IComment[]>([]);
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async (postId: string) => {
    try {
      const res = await api.get<PostResponse>(`/posts/getPost`);
      const foundPost = res.data.posts.find((p) => p._id === postId);
      if (foundPost) {
        setPost(foundPost);
      }
    } catch (error) {
      console.error('Lỗi khi lấy bài viết:', error);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const res = await api.get<DataComment>(`/posts/getComment/${postId}`);
      setComments(res.data.comments);
    } catch (error) {
      console.error('Lỗi khi lấy bình luận:', error);
    }
  };

  const handleSubmit = async () => {
    if (commentText.trim()) {
      await onSubmit(postId, commentText);
      setCommentText('');
      await fetchComments(postId);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchPost(postId);
      await fetchComments(postId);
      setLoading(false);
    };

    if (open) fetchData();
  }, [open, postId]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: 3,
          borderRadius: 2,
          boxShadow: 24,
          width: 700,
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid #e0e0e0',

          // Ẩn scrollbar
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {post && (
              <Box mb={3}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Avatar src={post.createdBy?.avatar} alt={post.createdBy?.username} sx={{ width: 35, height: 35 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {post.createdBy?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  {post.content}
                </Typography>

                {post.image && (
                  <Box
                    component="img"
                    src={post.image}
                    alt="Post image"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 2,
                      mb: 2,
                      maxHeight: 300,
                      objectFit: 'contain',
                    }}
                  />
                )}
              </Box>
            )}

            {/* Danh sách bình luận */}
            <Box
              mb={2}
              sx={{
                maxHeight: '40vh',
                overflowY: 'auto',
                pr: 1,

                // Ẩn scrollbar chỉ phần comment
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              {comments.map((item) => (
                <Box key={item._id} mb={2} sx={{ padding: 2, borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar src={item.userId.avatar} alt={item.userId.username} sx={{ width: 40, height: 40 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        {item.userId.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(item.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body1" mt={1}>
                        {item.comment}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>

            {/* Ô nhập bình luận */}
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Nhập bình luận của bạn..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fafafa',
                },
              }}
            />

            {/* Nút gửi và hủy */}
            <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
              <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: 2, px: 3 }}>
                Hủy
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  backgroundColor: '#3f51b5',
                  '&:hover': { backgroundColor: '#303f9f' },
                }}
              >
                Gửi
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default CommentModal;
