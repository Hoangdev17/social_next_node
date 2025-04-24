import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB } from '~/config/db';
import authRoutes from '~/routes/auth.routes';
import userRoutes from '~/routes/user.routes';
import postRoutes from '~/routes/post.routes';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();

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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})
