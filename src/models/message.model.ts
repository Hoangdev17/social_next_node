import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
