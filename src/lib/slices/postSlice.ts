import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PostState {
    posts: Post[];
    loading: boolean;
    error: string | null;
}

const initialState: PostState = {
    posts: [],
    loading: false,
    error: null,
};

interface Post {
    _id: string;
    title: string;
    content: string;
    image: string | null;
    likes: string[];
    comments: string[];
    createdBy: {
        _id: string;
        username: string;
        avatar: string;
    };
    createdAt: string;
    updatedAt: string;
}

const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers: {
        fetchPostsStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchPostsSuccess(state, action: PayloadAction<Post[]>) {
            state.loading = false;
            state.posts = action.payload;
        },
        fetchPostsFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        addPost(state, action: PayloadAction<Post>) {
            state.posts.push(action.payload);
        },
        deletePost(state, action: PayloadAction<string>) {
            state.posts = state.posts.filter(post => post._id !== action.payload);
        },
        updatePost(state, action: PayloadAction<Post>) {
            const index = state.posts.findIndex(post => post._id === action.payload._id);
            if (index !== -1) {
                state.posts[index] = action.payload;
            }
        },
    },
});

export const {
    fetchPostsStart,
    fetchPostsSuccess,
    fetchPostsFailure,
    addPost,
    deletePost,
    updatePost,
} = postSlice.actions;

export default postSlice.reducer;