import React, { useEffect, useState } from 'react';
import { api } from '@/lib/auth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { fetchPostsStart, fetchPostsSuccess, likePost, setPost, commentPost } from '@/lib/slices/postSlice';
import CommentModal from './CommentModals';
import io from 'socket.io-client';

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
    commentId: string;
    comment: string;
    createdAt: string;
}

interface PostResponse {
    posts: Post[];
}

const PostPages: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [selectedPostId, setSelectedPostId] = useState<string>('');
    const [socket, setSocket] = useState<any>(null);

    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const post = useSelector((state: RootState) => state.post.posts);

    const currentUserId = user?.id;

    // Fetch posts function
    const fetchPosts = async () => {
        dispatch(fetchPostsStart());

        try {
            const response = await api.get<PostResponse>('/posts/getPost');
            setPosts(response.data.posts.map(post => ({
                ...post,
                comments: post.comments || [],
                likes: post.likes || [],
            })));

            dispatch(setPost(response.data.posts));

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch posts');
            }
        } finally {
            setLoading(false);
        }
    };

    // Set up Socket connection
    useEffect(() => {
        const socketConnection = io('http://localhost:5000');
        setSocket(socketConnection);

        // Listen for 'postUpdate' or a custom event sent by the backend
        socketConnection.on('postLiked', ({ postId, userId }: { postId: string, userId: string }) => {
            dispatch(likePost({ postId, userId }));
        });

        socketConnection.on('postCommented', ({ postId, comment, userId }: { postId: string, comment: string, userId: string }) => {
            dispatch(commentPost({ postId, comment, userId }));
        });

        return () => {
            socketConnection.disconnect();
        };
    }, [dispatch]);

    // Fetch posts on component mount
    useEffect(() => {
        fetchPosts();
    }, [dispatch]);

    // Handle like
    const handleLike = async (postId: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            
            if (!accessToken) {
                setError('No access token found');
                return;
            }

            await api.post<PostResponse>(`/posts/like/${postId}`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            socket.emit('likePost', postId, user?.id);
        } catch (err: any) {
            console.error(err);
            setError('Failed to like post');
        }
    };

    // Handle comment
    const handleComment = async (postId: string, comment: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('No access token found');
                return;
            }
    
            // Gửi comment lên server
            const response = await api.post(`/posts/comment/${postId}`, { comment }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
    
            // Không dispatch comment vào Redux nếu nó đã có
            if (response.status === 200) {
    
                // Emit socket sau khi comment đã thành công
                socket.emit('commentPost', { postId, comment, userId: currentUserId || '' });
            }
    
        } catch (err: any) {
            console.error(err);
            setError('Failed to add comment');
        }
    };
    

    // Open comment modal
    const openCommentModal = (postId: string) => {
        setSelectedPostId(postId);
        setOpenModal(true);
    };

    // Close comment modal
    const closeCommentModal = () => {
        setOpenModal(false);
        setSelectedPostId('');
    };

    // If loading
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loading-spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        );
    }

    // No posts available
    if (post.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#555' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>No Posts Available</h2>
                <p style={{ fontSize: '16px', color: '#888' }}>Be the first to create a post and share your thoughts!</p>
            </div>
        );
    }

    // Render posts
    return (
        <div className="posts-container bg" style={{ maxWidth: '550px', margin: '0 auto', padding: '20px' }}>
            {post.map((post, index) => (
                <div key={`${post._id}-${index}`} className="post" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <div className="post-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <img src={post.createdBy?.avatar || 'https://www.w3schools.com/w3images/avatar2.png'} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#bbb', marginRight: '10px' }} alt="avatar" />
                        <div>
                            <strong>{post.createdBy?.username}</strong>
                            <p style={{ fontSize: '12px', color: '#666' }}>{new Date(post.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <p>{post.content || 'No content available for this post.'}</p>
                    {post.image ? (
                        <img src={post.image} alt="Post Image" style={{ width: '100%', height: 'auto', maxHeight: "500px", objectFit: 'contain', borderRadius: '8px', marginBottom: '10px', display: "block" }} />
                    ) : null}

                    <div className="post-actions" style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{post.likes?.length} Likes</span>  
                            <span>{post.comments?.length} Comments</span>
                        </div>

                        <hr style={{ margin: '8px 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                                onClick={() => handleLike(post._id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    color: post.likes?.includes(currentUserId || '') ? 'rgb(249 24 128)' : '#aaa',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                {post.likes?.includes(currentUserId || '') ? '❤️' : '🤍'} {post.likes?.length}
                            </button>
                            <button
                                onClick={() => openCommentModal(post._id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#007bff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                💬 Comment
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <CommentModal
                open={openModal}
                handleClose={closeCommentModal}
                postId={selectedPostId}
                onSubmit={handleComment}
            />
        </div>
    );
};

export default PostPages;
