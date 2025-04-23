import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    image: string;
    likes: mongoose.Types.ObjectId[];
    comments: { user: string; text: string }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Schema.Types.ObjectId;
}

const PostSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: String, required: false },
        likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        comments: [
            {
                user: { type: String, required: true },
                text: { type: String, required: true },
            },
        ],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true, 
    }
);

export default mongoose.model<IPost>('Post', PostSchema);