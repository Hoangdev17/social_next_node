'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/auth';
import { Avatar, Button, CircularProgress, Typography } from '@mui/material';
import { CameraAlt } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setPost } from '@/lib/slices/postSlice';
import EditProfileComponent from '../components/EditProfileComponent';


// Type definitions
interface User {
  _id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  posts?: Post[];
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

interface Post {
  _id: string;
  title: string;
  content: string;
  image: string | null;
  likes: string[];
  comments: Comment[];
  createdBy: {
    _id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  userId: string;
  comment: string;
  createdAt: string;

}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');

  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const posts = useSelector((state: RootState) => state.post.posts);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<User>('/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        setError('Failed to load user data.');
        console.error('Error fetching user:', err);
      }
    };

    const fetchPostByUser = async () => {
      if (userId) {
        try {
          const res = await api.get<{ posts: Post[] }>(`/posts/getPostByUser/${userId}`);
          dispatch(setPost(res.data.posts));
        } catch (err) {
          setError('Failed to load posts.');
          console.error('Error fetching posts:', err);
        }
      }
    };

    const loadData = async () => {
      setLoading(true);
      await fetchUser();
      await fetchPostByUser();
      setLoading(false);
    };

    loadData();
  }, [userId, dispatch]);

  // Update user state after profile edit
  const handleProfileUpdate = () => {
    // Refetch user data to update the UI
    const fetchUser = async () => {
      try {
        const res = await api.get<User>('/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching updated user:', err);
      }
    };
    
    fetchUser();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <CircularProgress />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16 px-4 mt-20">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <Avatar
            src={user?.avatar || '/default-avatar.png'}
            alt="User Avatar"
            className="w-24 h-24 border-2 border-gray-700 rounded-full"
          />
          <div className="flex-1">
            {/* Username and Buttons */}
            <div className="flex items-center gap-2 mb-4">
              <Typography variant="h6">{user?.email?.split('@')[0] || 'N/A'}</Typography>
              {/* Replace Edit profile button with EditProfileComponent */}
              {user && <EditProfileComponent initialProfile={user} onClose={handleProfileUpdate} />}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div>
                <span className="font-semibold">{posts.length}</span> posts
              </div>
              <div>
                <span className="font-semibold">{user?.followers?.length || 0}</span> followers
              </div>
              <div>
                <span className="font-semibold">{user?.following?.length || 0}</span> following
              </div>
            </div>

            {/* Name */}
            <Typography variant="body1" className="font-semibold">
              {user?.username || 'N/A'}
            </Typography>
          </div>
        </div>       

        {/* Tabs */}
        <div className="flex justify-center gap-12 border-t border-gray-700 pt-4">
          <button
            className={`uppercase text-sm font-semibold ${activeTab === 'posts' ? 'text-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`uppercase text-sm font-semibold ${activeTab === 'saved' ? 'text-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved
          </button>
          <button
            className={`uppercase text-sm font-semibold ${activeTab === 'tagged' ? 'text-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('tagged')}
          >
            Tagged
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="mt-6">
          {activeTab === 'posts' && (
            <div className="text-center">
              {posts.length ? (
                <div className="grid grid-cols-3 gap-1">
                  {posts.map((post) => (
                    <div key={post._id} className="aspect-square">
                      <img
                        src={post.image || '/default-post.jpg'}
                        alt={post.content || 'Post image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <CameraAlt className="text-6xl mb-4" />
                  <Typography variant="h6">Share Photos</Typography>
                  <Typography variant="body2" className="text-gray-400 mt-2">
                    When you share photos, they will appear on your profile.
                  </Typography>
                </div>
              )}
            </div>
          )}
          {activeTab === 'saved' && (
            <Typography variant="body1" className="text-center">
              No saved posts yet.
            </Typography>
          )}
          {activeTab === 'tagged' && (
            <Typography variant="body1" className="text-center">
              No tagged posts yet.
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;