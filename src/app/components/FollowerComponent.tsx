import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Typography, TextField, IconButton, Collapse, Box, Button, Modal, Fade, useMediaQuery, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '@/lib/auth';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import io, { Socket } from 'socket.io-client';

// ================= Interfaces =================
interface Follower {
  _id: string;
  username: string;
  avatar: string;
}

interface IFollowerResponse {
  followers: Follower[];
}

interface PrivateMessage {
  _id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// ================ Components ================

const FollowerItem: React.FC<{ follower: Follower; onSelect: (userId: string) => void }> = ({ follower, onSelect }) => (
  <div
    className="flex items-center gap-3 py-2 cursor-pointer"
    onClick={() => onSelect(follower._id)}
  >
    <Avatar src={follower.avatar} alt={follower.username} sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 } }} />
    <Typography variant="subtitle1" fontWeight={500} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
      {follower.username}
    </Typography>
  </div>
);

// ================ Main Component ================

const FollowersList: React.FC = () => {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Follower | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // For auto-scrolling
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Auto-scroll to the bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch followers
  const fetchFollowers = async () => {
    try {
      const res = await api.get<IFollowerResponse>('/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setFollowers(res.data.followers);
    } catch (error) {
      console.error('Failed to fetch followers:', error);
    }
  };

  // Initialize socket
  useEffect(() => {
    fetchFollowers();

    if (!userId) return;

    const socket = io('https://social-next-node.onrender.com', {
      auth: { userId },
    });

    socket.on('private_message', (data: PrivateMessage) => {
      if (data?.fromUserId && data?.message) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !message.trim() || !userId) return;

    const newMessage: PrivateMessage = {
      _id: Date.now().toString(), // Temporary ID for local state
      fromUserId: userId,
      toUserId: selectedUser._id,
      message,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    socketRef.current?.emit('private_message', {
      toUserId: selectedUser._id,
      fromUserId: userId,
      message,
    });

    setMessage('');
  };

  // Select user and fetch chat history
  const handleSelectUser = async (userId: string) => {
    const user = followers.find((follower) => follower._id === userId);
    if (user) {
      setSelectedUser(user);
      try {
        const res = await api.get<PrivateMessage[]>(`/messages/history/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        // Sort messages by timestamp to ensure chronological order
        const sortedMessages = res.data.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(sortedMessages);
      } catch (error) {
        console.error('Failed to fetch message history:', error);
        setMessages([]);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  const filteredFollowers = followers.filter((follower) =>
    follower.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '600px' }, mx: 'auto', px: { xs: 2, sm: 4 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          Followers
        </Typography>
        <IconButton onClick={() => setShowSearch((prev) => !prev)} size="small">
          <SearchIcon />
        </IconButton>
      </Box>

      {/* Search Box */}
      <Collapse in={showSearch}>
        <TextField
          variant="outlined"
          fullWidth
          size="small"
          placeholder="Tìm kiếm theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Collapse>

      <hr className="my-4 border-gray-300" />

      {/* Followers List */}
      {filteredFollowers.length > 0 ? (
        filteredFollowers.map((follower) => (
          <FollowerItem key={follower._id} follower={follower} onSelect={handleSelectUser} />
        ))
      ) : (
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Không tìm thấy người theo dõi nào.
        </Typography>
      )}

      {/* Chat Modal */}
      <Modal
        open={!!selectedUser}
        onClose={handleCloseModal}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: isMobile ? 'center' : 'flex-end',
          p: { xs: 1, sm: 2 },
        }}
      >
        <Fade in={!!selectedUser}>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              width: { xs: '100%', sm: '90%', md: '400px' },
              height: { xs: '100%', sm: '90%', md: '500px' },
              maxWidth: '600px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              outline: 'none',
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: { xs: '8px 12px', sm: '10px 15px' },
                borderBottom: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {selectedUser?.username}
              </Typography>
              <IconButton onClick={handleCloseModal} size="small">
                <CloseIcon sx={{ color: '#fff' }} />
              </IconButton>
            </Box>

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                p: { xs: '8px 12px', sm: '10px 15px' },
                overflowY: 'auto',
                backgroundColor: '#1a1a1a',
              }}
            >
              {messages.map((msg) => (
                <Box
                  key={msg._id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.fromUserId === userId ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: msg.fromUserId === userId ? '#0084ff' : '#333',
                      color: '#fff',
                      p: { xs: '6px 10px', sm: '8px 12px' },
                      borderRadius: '12px',
                      maxWidth: { xs: '80%', sm: '70%' },
                      wordBreak: 'break-word',
                      scrollbarWidth: 'thin',
                      '&::-webkit-scrollbar': {
                        height: '6px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#555',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: '#1a1a1a',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                      {msg.message}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box
              component="form"
              onSubmit={handleSendMessage}
              sx={{
                p: { xs: '8px 12px', sm: '10px 15px' },
                borderTop: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <TextField
                variant="outlined"
                fullWidth
                size="small"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                  backgroundColor: '#333',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': {
                      borderColor: '#444',
                    },
                    '&:hover fieldset': {
                      borderColor: '#666',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0084ff',
                    },
                  },
                  '& .MuiInputBase-input': {
                    p: { xs: '6px', sm: '8px' },
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#0084ff',
                  color: '#fff',
                  p: { xs: '6px 12px', sm: '8px 16px' },
                  borderRadius: '8px',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  '&:hover': {
                    backgroundColor: '#0073e6',
                  },
                }}
              >
                Gửi
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default FollowersList;