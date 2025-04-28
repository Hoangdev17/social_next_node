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
    comments: Comment[]; 
    createdBy: {
        _id: string;
        username: string;
        avatar: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface Comment {
    userId: string;
    comment: string;
    createdAt: string;
  
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
            state.posts.unshift(action.payload);
        },
        deletePost(state, action: PayloadAction<string>) {
            state.posts = state.posts.filter(post => post._id !== action.payload);
        },
        setPost(state, action: PayloadAction<Post[]>) {
            state.posts = action.payload;
        },
        updatePost(state, action: PayloadAction<Post>) {
            const index = state.posts.findIndex(post => post._id === action.payload._id);
            if (index !== -1) {
                state.posts[index] = action.payload;
            }
        },
        likePost: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
            const { postId, userId } = action.payload;
            const post = state.posts.find((p) => p._id === postId);
            if (post) {
                if (post.likes.includes(userId)) {
                    post.likes = post.likes.filter((id) => id !== userId);
                } else {
                    post.likes.push(userId);
                }
            }
        },
        
        commentPost: (state, action: PayloadAction<{ postId: string; comment: string; userId: string; }>) => {
            const { postId, comment, userId } = action.payload;
            const post = state.posts.find((p) => p._id === postId);
            if (post) {
                const newComment: Comment = {
                    userId,
                    comment,
                    createdAt: new Date().toISOString(),
                    
                };
                post.comments.push(newComment);  
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
    likePost,
    setPost,
    commentPost,  
} = postSlice.actions;

export default postSlice.reducer;
