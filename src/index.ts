
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http'; 
import { Server as SocketIOServer } from 'socket.io';
import socketEvents from './socket/socketEvents';

import { connectDB } from '~/config/db';
import authRoutes from '~/routes/auth.routes';
import userRoutes from '~/routes/user.routes';
import postRoutes from '~/routes/post.routes';
import { privateMessage } from './socket/messagingSocket';
import messagesRoutes from '~/routes/messages.routes'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Kết nối Database
connectDB();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (origin) {
      callback(null, origin);
    } else {
      callback(null, '*');
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messagesRoutes);

// -----------------------------
// 🧠 Tạo HTTP server từ Express
const server = http.createServer(app);

// 🧠 Gắn Socket.io vào server
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  socketEvents(socket, io);
  privateMessage(socket,io);
});

// 🧠 Lưu io vào app locals để dùng ở các routes khác nếu cần
app.set('io', io);

// -----------------------------
// Chạy server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
