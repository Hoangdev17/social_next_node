import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    image: string;
    likes: mongoose.Types.ObjectId[];
    comments: { userId: mongoose.Types.ObjectId; comment: string; createdAt: Date; _id: mongoose.Types.ObjectId }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Schema.Types.ObjectId;
}

const PostSchema: Schema = new Schema(
    {
        _id: { type: mongoose.Types.ObjectId, auto: true },
        title: { type: String },
        content: { type: String, required: true },
        image: { type: String, required: false },
        likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        comments: [
            {
                userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
                comment: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
                _id: { type: mongoose.Types.ObjectId, auto: true },
            },
        ],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IPost>('Post', PostSchema);