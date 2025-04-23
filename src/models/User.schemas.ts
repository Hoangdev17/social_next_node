import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    password: string;
    refreshToken?: string;
    emailVerifyToken?: string;
    verify: boolean;
    role?: 'user' | 'admin' | 'staff';
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
    {
        _id: { type: mongoose.Types.ObjectId, auto: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        avatar: { type: String, required: false },
        bio: { type: String, required: false },
        password: { type: String, required: true },
        refreshToken: { type: String, required: false },
        emailVerifyToken: { type: String, required: false },
        verify: { type: Boolean, required: true, default: false },
        role: { type: String, required: false, default: 'user' },
        followers: { type: [mongoose.Types.ObjectId], ref: 'User', default: [] },
        following: { type: [mongoose.Types.ObjectId], ref: 'User', default: [] },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);