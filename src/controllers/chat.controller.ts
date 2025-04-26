import { Request, Response } from 'express';
import { Message } from '~/models/message.model';


export const getMessagesBetweenUsers = async (req: Request, res: Response) => {
  const { userId } = req.params; // 👈 lấy userId từ URL params
  const myId = req.userId;

  try {
    const messages = await Message.find({
      $or: [
        { fromUserId: myId, toUserId: userId },
        { fromUserId: userId, toUserId: myId },
      ],
    }).sort({ timestamp: 1 }); // sắp xếp theo thời gian tăng dần

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error });
  }
};
