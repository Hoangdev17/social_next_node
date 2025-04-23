
import mongoose from 'mongoose';

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://chiur234:kg6D5a5cGQkES6tI@cluster0.pkxd4ki.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected...');
      } catch (err) {
        console.error('Error connecting to MongoDB:', err);
      }
};

export { connectDB };
