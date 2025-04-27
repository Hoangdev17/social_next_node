import { Request, Response } from 'express';
import { Message } from '~/models/message.model';

export const getMessagesBetweenUsers = async (req: Request, res: Response) => {
  const { userId } = req.params; 
  const myId = req.userId;
  const { skip , limit  } = req.query; 

  try {
    
    const messages = await Message.find({
      $or: [
        { fromUserId: myId, toUserId: userId },
        { fromUserId: userId, toUserId: myId },
      ],
    })
      .skip(Number(skip)) 
      .limit(Number(limit)) 
      .sort({ timestamp: 1 }); 

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch messages', error });
  }
};
