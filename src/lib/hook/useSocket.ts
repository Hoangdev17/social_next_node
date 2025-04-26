// hooks/useSocket.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { fetchPostsSuccess,  likePost} from '../slices/postSlice';  // Import Redux action

const useSocket = (serverUrl: any) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Tạo kết nối với server Socket.io
    const socket = io(serverUrl);

    // Lắng nghe sự kiện 'postLiked' và dispatch action để cập nhật Redux state
    socket.on('postSuccess', (data) => {
      dispatch(fetchPostsSuccess(data));  
    });

    socket.on('postLiked', (data) => {
        dispatch(likePost(data));
    })

    return () => {
      socket.disconnect();
    };
  }, [dispatch, serverUrl]);

  return null;  // Không cần trả về gì
};

export default useSocket;
