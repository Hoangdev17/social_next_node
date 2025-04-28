'use client';

import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Input } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '@/lib/slices/authSlice';
import { api } from '@/lib/auth';
import { RootState } from '@/lib/store';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Updated UserProfile interface to align with User
interface UserProfile {
  _id?: string;
  username?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  followers?: Follower[];
  following?: Following[];
}

interface Follower {
  id: string;
  username: string;
  avatar: string;
}

interface Following {
  id: string;
}

interface EditProfileProps {
  initialProfile: UserProfile;
  onClose?: () => void;
}

const EditProfileComponent: React.FC<EditProfileProps> = ({ initialProfile, onClose }) => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    ...initialProfile,
    bio: initialProfile.bio || '',
    avatar: initialProfile.avatar || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const dispatch = useDispatch();
  const currentAvatar = useSelector((state: RootState) => state.auth.user?.avatar);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra xem ảnh có giống với avatar hiện tại không
      if (currentAvatar && file.name === currentAvatar.split('/').pop()) {
        toast.warn('Please select a different avatar image!', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
      setAvatarFile(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('username', profile.username || '');
      formData.append('bio', profile.bio || '');
      if (avatarFile) {
        formData.append('posts', avatarFile); // Sửa từ 'posts' thành 'avatar'
      }

      const response = await api.patch<UserProfile>('/users/editProfile', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const result = response.data.user;
        // Lọc dữ liệu để khớp với interface User
        const filteredUser: UserProfile = {
          _id: result._id,
          username: result.username,
          email: result.email,
          bio: result.bio || profile.bio,
          avatar: result.avatar,
          followers: result.followers,
          following: result.following,
        };
        dispatch(updateUserProfile(filteredUser));
        setOpen(false);
        if (onClose) onClose();
        toast.success('Profile updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setProfile({
      ...initialProfile,
      bio: initialProfile.bio || '',
      avatar: initialProfile.avatar || '',
    });
    setAvatarFile(null);
    if (onClose) onClose();
  };

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        className="text-white border-gray-600 hover:bg-gray-800 transition-colors duration-200"
        onClick={() => setOpen(true)}
      >
        Edit Profile
      </Button>

      <Dialog open={open} onClose={handleClose} className="backdrop-blur-sm">
        <DialogTitle className="text-2xl font-bold text-gray-800">Edit Profile</DialogTitle>
        <DialogContent className="space-y-4 p-6">
          <TextField
            label="Username"
            name="username"
            value={profile.username || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            className="rounded-lg"
            InputProps={{
              className: 'bg-gray-100',
            }}
          />
          <TextField
            label="Bio"
            name="bio"
            value={profile.bio || ''}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            variant="outlined"
            className="rounded-lg"
            InputProps={{
              className: 'bg-gray-100',
            }}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Profile Picture</label>
            <Input
              type="file"
              onChange={handleAvatarChange}
              inputProps={{ accept: 'image/*' }}
              className="p-2 border rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            />
            {avatarFile && (
              <p className="text-sm text-gray-600">Selected file: {avatarFile.name}</p>
            )}
            {profile.avatar && (
              <img
                src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar}
                alt="Preview"
                className="mt-2 h-24 w-24 rounded-full object-cover border-2 border-gray-300"
              />
            )}
          </div>
        </DialogContent>
        <DialogActions className="p-6">
          <Button
            onClick={handleClose}
            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!profile.username}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg disabled:bg-gray-400"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default EditProfileComponent;