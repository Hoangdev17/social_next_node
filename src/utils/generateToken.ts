import jwt, { SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';

// Định nghĩa các tùy chọn cho access token và refresh token
const accessTokenOptions: SignOptions = {
  expiresIn: '15m',  
};

const refreshTokenOptions: SignOptions = {
  expiresIn: '7d',  
};

// Hàm tạo Access Token
export const generateAccessToken = (userId: mongoose.Types.ObjectId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, accessTokenOptions);
};

// Hàm tạo Refresh Token
export const generateRefreshToken = (userId: mongoose.Types.ObjectId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, refreshTokenOptions);
};
