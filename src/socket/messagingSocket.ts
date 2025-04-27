import { Server as SocketIOServer, Socket } from 'socket.io';
import { Message } from '~/models/message.model'; // <--- import model Message

const users: Record<string, string> = {};

interface PrivateMessagePayload {
  toUserId: string;
  fromUserId: string;
  message: string;
}

export const privateMessage = (socket: Socket, io: SocketIOServer) => {
  const userId = socket.handshake.auth.userId as string | undefined;

  if (userId) {
    users[userId] = socket.id;
    // console.log('User connected:', userId);
  }

  socket.on('private_message', async (payload: PrivateMessagePayload) => {
    const { toUserId, fromUserId, message } = payload;
    const toSocketId = users[toUserId];

    try {
      // --- Lưu tin nhắn vào database ---
      await Message.create({
        fromUserId,
        toUserId,
        message,
      });

      // console.log('Saved message from', fromUserId, 'to', toUserId);
    } catch (error) {
      console.error('Error saving message:', error);
    }

    // --- Gửi tin nhắn real-time ---
    if (toSocketId) {
      io.to(toSocketId).emit('private_message', { fromUserId, message });
    }
    socket.emit('private_message', { fromUserId, message });
  });

  socket.on('disconnect', () => {
    if (userId) {
      // console.log('User disconnected:', userId);
      delete users[userId];
    }
  });
};
