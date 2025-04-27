'use client';

import { api } from '@/lib/auth';
import { updateUserFollowing } from '@/lib/slices/authSlice';
import { RootState } from '@/lib/store';
import { Avatar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  followers: Follower[];
  following: Following[];
  createdAt: string;
  updatedAt: string;
}

interface Follower {
  id: string;
}

interface Following {
  id: string;
}

const FollowPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isAuthLoading = useSelector((state: RootState) => state.auth.isLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<User[]>('/users/getAll');
        const usersWithFollowersFollowing = response.data.map((user) => ({
          ...user,
          _id: String(user._id).trim(),
          followers: (user.followers ?? []).map((f) => ({ id: String(f.id).trim() })),
          following: (user.following ?? []).map((f) => ({ id: String(f.id).trim() })),
        }));
        setUsers(usersWithFollowersFollowing);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthLoading) {
      fetchUsers();
    }
  }, [isAuthLoading]);

  const handleFollow = async (userId: string) => {
    if (!currentUser || !currentUser.id) return;

    try {
      setFollowLoading(userId);
      const accessToken = localStorage.getItem('accessToken');
      const response = await api.post(
        `/users/${userId}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId
              ? { ...user, followers: [...user.followers, { id: String(currentUser.id).trim() }] }
              : user
          )
        );
        dispatch(updateUserFollowing({ userId, isFollowing: true }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!currentUser || !currentUser.id) return;

    try {
      setFollowLoading(userId);
      const accessToken = localStorage.getItem('accessToken');
      const response = await api.post(
        `/users/${userId}/unfollow`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId
              ? { ...user, followers: user.followers.filter((f) => f.id !== currentUser.id) }
              : user
          )
        );
        dispatch(updateUserFollowing({ userId, isFollowing: false }));
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading authentication...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  if (!currentUser || !currentUser.id) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Please log in to follow users.
      </div>
    );
  }

  const currentUserId = currentUser.id;
  const otherUsers = users.filter((user) => String(user._id).trim() !== currentUserId);

  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4 mt-24">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Suggested for you
        </h1>
        <ul className="space-y-3">
          {otherUsers.map((user) => {
            const isFollowing = currentUser.following.some((f) => f.id === user._id);
            const isRefollow = user.followers.some((f) => f.id === currentUserId);
            console.log(user)
            return (
              <li
                key={user._id}
                className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar}
                    alt={user.username}
                    sx={{ width: 44, height: 44 }}
                    className="rounded-full border border-gray-200"
                  />
                  <div>
                    <span className="font-medium text-gray-900">{user.username}</span>
                    <p className="text-sm text-gray-500">
                      {user.followers.length} followers
                    </p>
                  </div>
                </div>
                {isFollowing ? (
                  <button
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
                    onClick={() => handleUnfollow(user._id)}
                    disabled={followLoading === user._id}
                  >
                    {followLoading === user._id ? 'Unfollowing...' : 'Following'}
                  </button>
                ) : isRefollow ? (
                  <button
                    className="px-4 py-1.5 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                    onClick={() => handleFollow(user._id)}
                    disabled={followLoading === user._id}
                  >
                    {followLoading === user._id ? 'Following...' : 'Refollow'}
                  </button>
                ) : (
                  <button
                    className="px-4 py-1.5 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                    onClick={() => handleFollow(user._id)}
                    disabled={followLoading === user._id}
                  >
                    {followLoading === user._id ? 'Following...' : 'Follow'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default FollowPage;