import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  followers: Follower[];
  following: Following[];
}

interface Follower {
  id: string;
  username: string;
  avatar: string;
}

interface Following {
  id: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: UserProfile; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoading = false;
    },
    updateUserProfile(state, action: PayloadAction<UserProfile>) {
      if (state.user) {
          state.user = { ...state.user, ...action.payload };
      }
    },
    updateAvatar(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
    updateUserFollowing(state, action: PayloadAction<{ userId: string; isFollowing: boolean }>) {
      const { userId, isFollowing } = action.payload;
      if (state.user) {
        if (isFollowing) {
          // Thêm người vào danh sách "following"
          state.user.following.push({ id: userId });
        } else {
          // Xóa người khỏi danh sách "following"
          state.user.following = state.user.following.filter(following => following.id !== userId);
        }
      }
    },
    updateUserFollowers(state, action: PayloadAction<{ userId: string; isFollowing: boolean }>) {
      const { userId, isFollowing } = action.payload;
      if (state.user) {
        if (isFollowing) {
          // Thêm người vào danh sách "followers"
          state.user.followers.push({
            id: userId,
            username: '', // Bạn có thể tùy chỉnh nếu muốn lấy thêm thông tin về người theo dõi
            avatar: '',
          });
        } else {
          // Xóa người khỏi danh sách "followers"
          state.user.followers = state.user.followers.filter(follower => follower.id !== userId);
        }
      }
    },
  },
});

export const { loginSuccess, logout, updateUserProfile, updateUserFollowers, updateUserFollowing, updateAvatar } = authSlice.actions;
export default authSlice.reducer;
