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
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: UserProfile; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
    setUsername(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.username = action.payload;
      } else {
        // Nếu user chưa có, tạo tạm user mới chỉ với username
        state.user = {
          id: '',
          username: action.payload,
          email: '',
          bio: '',
          avatar: '',
          followers: [],
          following: []
        };
      }
    },
  },
});

export const { loginSuccess, logout, setUsername } = authSlice.actions;
export default authSlice.reducer;
