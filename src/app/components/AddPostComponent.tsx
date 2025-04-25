import React, { useState } from 'react';
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
} from '@mui/material';
import { api } from '@/lib/auth';
import { addPost } from '@/lib/slices/postSlice';

const AddPostComponent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();

  const avatar = useSelector((state: RootState) => state.auth.user?.avatar);
  const username = useSelector((state: RootState) => state.auth.user?.username);
  const posts = useSelector((state: RootState) => state.post.posts);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) {
          formData.append('posts', image);
        }

        // Send the request to create the post
        const response = await api.post<any>('/posts/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const newPost = response.data;

        // Dispatch action to update Redux store with the new post
        dispatch(addPost(newPost));


        // Reset form and close the modal
        setTitle('');
        setContent('');
        setImage(null);
        setPreview(null);
        setOpen(false);

      } catch (err) {
        setError('An error occurred while creating the post.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Title and content are required.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6" style={{ maxWidth: '550px' }}>
      {/* Avatar + input to open modal */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={avatar || 'https://via.placeholder.com/40'}
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <input
          type="text"
          placeholder={username ? `${username}, what's on your mind?` : "What's on your mind?"}
          className="flex-1 h-10 px-4 border border-gray-300 rounded-full text-sm text-gray-700 placeholder-gray-500 hover:cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>

      {/* Create Post Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create a New Post</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className="pt-2">
            <div className="mb-5">
              <TextField
                label="Title"
                fullWidth
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* Upload Image */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
              <label
                htmlFor="image-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-200 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v9.75m-18 0h18m-18 0a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 16.5m-9-7.5l-3 4.5h6l-3-4.5z"
                  />
                </svg>
                <span>Choose Image</span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-3 rounded-lg max-h-60 object-contain border"
                />
              )}
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddPostComponent;
