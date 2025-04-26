import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  CircularProgress,
  Avatar,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import { api } from '@/lib/auth';
import { addPost, setPost } from '@/lib/slices/postSlice';

const AddPostComponent: React.FC = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  // Sử dụng ref để ngăn chặn submit trùng lặp
  const isSubmitting = useRef(false);

  const dispatch = useDispatch();
  const avatar = useSelector((state: RootState) => state.auth.user?.avatar);
  const username = useSelector((state: RootState) => state.auth.user?.username);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {

    if (!content.trim()) {
      setError('Nội dung là bắt buộc.');
      return;
    }

    // Đặt flag để ngăn chặn submit trùng lặp
    setLoading(true);
    isSubmitting.current = true;
    setError(null);

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('posts', image);
      }

      console.log("Bắt đầu gửi request API...");
      const response = await api.post<any>('/posts/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log("API trả về kết quả:", response.data);
      
      dispatch(addPost(response.data.post));
      
      // Reset form
      setContent('');
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setImage(null);
      setPreview(null);
      setOpen(false);
    } catch (err) {
      console.error("Lỗi khi tạo bài đăng:", err);
      setError('Đã xảy ra lỗi khi tạo bài đăng.');
    } finally {
      setLoading(false);
      // Trì hoãn reset isSubmitting để đảm bảo không có submit trùng lặp
      setTimeout(() => {
        isSubmitting.current = false;
      }, 300);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setContent('');
      setError(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      setImage(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6" >
      {/* Avatar + input trigger */}
      <div className="flex items-center gap-3 mb-5">
        <Avatar src={avatar || undefined} alt={username} sx={{ width: 40, height: 40 }} />
        <input
          type="text"
          readOnly
          onClick={() => setOpen(true)}
          placeholder={username ? `${username}, bạn đang nghĩ gì?` : "Bạn đang nghĩ gì?"}
          className="flex-1 h-10 px-4 border border-gray-300 rounded-full text-sm text-gray-700 placeholder-gray-500 hover:cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Dialog to create post */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Tạo bài đăng mới</DialogTitle>
        <DialogContent>
          <div className="pt-2 space-y-4">
            {/* User Info */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={avatar || undefined} alt={username} />
              <Typography variant="subtitle1" fontWeight={600}>
                {username}
              </Typography>
            </Stack>

            <hr className="mb-4 border-t border-gray-300" />

            <TextField
              label="Nội dung"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: '30px',
                  padding: '12px 16px',
                },
              }}
            />

            <Box mt={2}>
              <Typography variant="subtitle2" mb={1}>
                Tải lên hình ảnh
              </Typography>
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center justify-center gap-2 p-4 bg-gray-100 text-gray-700 rounded-full border border-gray-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-200'} transition`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v9.75m-18 0h18m-18 0a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 16.5m-9-7.5l-3 4.5h6l-3-4.5z"
                  />
                </svg>
                <span className="text-sm">Chọn hình ảnh</span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>

              {preview && (
                <div className="relative mt-3">
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-lg max-h-60 object-contain border border-gray-300"
                  />
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => {
                        if (preview) {
                          URL.revokeObjectURL(preview);
                        }
                        setPreview(null);
                        setImage(null);
                      }}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </Box>

            {error && (
              <Typography variant="body2" color="error" mt={1}>
                {error}
              </Typography>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Hủy
          </Button>
          <Button
            type="button"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
          >
            {loading ? <CircularProgress size={20} /> : 'Đăng'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddPostComponent;