import { Server as SocketIOServer } from 'socket.io';
import { Request, Response } from 'express';
import { likePost, commentPost } from '~/controllers/post.controller'; 


const socketEvents = (socket: any, io: SocketIOServer) => {
  
  // Lắng nghe sự kiện "likePost" từ client
  socket.on('likePost', async (postId: string, userId: string) => {
    console.log(`Post ${postId} liked by user ${userId}`);

    // Tạo req và res giả lập
    const req = {
        params: {
          postId,
        },
        userId,
      } as unknown as Request;

    const res = {
      status: (statusCode: number) => ({
        json: (data: any) => {
          // Xử lý dữ liệu trả về từ API
          if (statusCode === 200) {
            io.emit('postLiked', {
              postId: data.post._id,
              userId: userId
            });
          } else {
            console.log('Error:', data);  
          }
        },
      }),
    } as Response;

    // Gọi hàm likePost với req và res giả lập
    await likePost(req, res);
  });

  // Lắng nghe sự kiện "commentPost" từ client
  socket.on('commentPost', async ({ postId, comment, userId }: { postId: string, comment: string, userId: string }) => {
    console.log(`Comment added to post ${postId}: ${comment}`);

    // Tạo req và res giả lập cho comment
    const req = {
      params: {
        postId,
      },
      body: {
        comment,
      },
      userId
    } as unknown as Request;

    const res = {
      status: (statusCode: number) => ({
        json: (data: any) => {
          // Xử lý dữ liệu trả về từ API
          if (statusCode === 200) {
            io.emit('postCommented', {
              postId: data.post._id,
              comment: data.comment,
              userId: req.userId
            });
            console.log(data);
          } else {
            console.log('Error:', data);  
          }
        },
      }),
    } as Response;

    // Gọi hàm commentPost với req và res giả lập
    await commentPost(req, res);
  });
  


  // Lắng nghe sự kiện "disconnect"
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
};

export default socketEvents;
