'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { api } from '@/lib/auth';
import { RootState } from '@/lib/store';
import { Avatar } from '@mui/material';

interface Follower {
  _id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
}

interface Following {
  _id: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  followers: Follower[];
  following: Following[];
}

interface Message {
  _id?: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: number;
}

const ChatPage = () => {
  const [followingUsers, setFollowingUsers] = useState<Follower[]>([]);
  const [selectedUser, setSelectedUser] = useState<Follower | null>(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const fetchFollowingUsers = useCallback(async () => {
    try {
      const response = await api.get<UserProfile>('/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setFollowingUsers(response.data.followers || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
      setFollowingUsers([]);
    }
  }, []);

  const fetchChatHistory = useCallback(async (toUserId: string) => {
    try {
      const response = await api.get<Message[]>(`/messages/history/${toUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setChat(response.data || []);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      setChat([]);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetchFollowingUsers();

    socketRef.current = io('http://localhost:5000', {
      auth: { userId },
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('private_message', (data: Message) => {
      setChat((prev) => [...prev, { ...data, timestamp: Date.now() }]);
    });

    socketRef.current.on('user_status', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setFollowingUsers((prev) =>
        prev.map((user) => (user._id === userId ? { ...user, isOnline } : user))
      );
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId, fetchFollowingUsers]);

  useEffect(() => {
    scrollToBottom();
  }, [chat, selectedUser]);

  const handleSelectUser = useCallback((user: Follower) => {
    setSelectedUser(user);
    fetchChatHistory(user._id);
  }, [fetchChatHistory]);

  const handleSend = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser || !message.trim() || !userId) return;

    const newMessage: Message = {
      fromUserId: userId,
      toUserId: selectedUser._id,
      message: message.trim(),
      timestamp: Date.now(),
    };

    socketRef.current?.emit('private_message', newMessage);
    setMessage('');
  }, [message, selectedUser, userId]);

  return (
    <div className="flex h-[calc(100vh-64px)] mt-20 bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {followingUsers.length > 0 ? (
            followingUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedUser?._id === user._id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="relative">
                <Avatar
                  src={user.avatar || '/default-avatar.png'}
                  alt={`${user.username}'s avatar`}
                  sx={{ width: 48, height: 48 }}
                />
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1">
                  <span className="block font-medium text-gray-900">{user.username}</span>
                  <span className="text-sm text-gray-500 truncate">
                    {user.isOnline ? 'Đang hoạt động' : 'Đang hoạt động'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500">Chưa có cuộc trò chuyện nào.</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
              <Avatar
                src={selectedUser.avatar || '/default-avatar.png'}
                alt={`${selectedUser.username}'s avatar`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedUser.username}</h2>
                <span className="text-sm text-gray-500">
                  {selectedUser.isOnline ? 'Đang hoạt động' : 'Đang hoạt động'}
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="flex flex-col gap-4">
                {chat.map((msg) => (
                  <div
                    key={msg._id || `${msg.timestamp}`}
                    className={`flex ${msg.fromUserId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex flex-col max-w-[70%]">
                      <div
                        className={`p-3 rounded-2xl ${
                          msg.fromUserId === userId
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: vi })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-gray-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!selectedUser}
              />
              <button
                type="submit"
                className="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
                disabled={!message.trim() || !selectedUser}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
