import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Hàm upload ảnh lên Cloudinary từ Buffer
export const uploadImageToCloudinary = async (imageBuffer: Buffer): Promise<string> => {
  
  return new Promise((resolve, reject) => {
    // Tạo stream từ Buffer
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'posts',
        resource_type: 'auto', 
      },
      (error, result) => {
        if (error) {
          reject(new Error('Error uploading image to Cloudinary'));
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );

    // Đẩy Buffer vào stream
    stream.end(imageBuffer);
  });
};
