import React, { useEffect, useState } from 'react';
import { api } from '@/lib/auth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Dispatch } from '@reduxjs/toolkit'; 
import { fetchPostsStart, fetchPostsSuccess } from '@/lib/slices/postSlice';
import CommentModal from './CommentModals';

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

interface PostResponse {
    posts: Post[];
}

const PostPages: React.FC = () => { 
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [selectedPostId, setSelectedPostId] = useState<string>('');

    const dispatch = useDispatch();

    const user = useSelector((state: RootState) => state.auth.user);
    const currentUserId = user?.id; 

    const fetchPosts = async () => {

        dispatch(fetchPostsStart());

        try {
            const response = await api.get<PostResponse>('/posts/getPost');
            console.log("Fetched posts:", response.data.posts);  

            setPosts(
                response.data.posts.map(post => ({
                    ...post,
                    comments: post.comments || [],  
                    likes: post.likes || [],  
                }))
            );

            dispatch(fetchPostsSuccess(response.data.posts));

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

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleLike = async (postId: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            console.log("Access token:", accessToken);
            if (!accessToken) {
                setError('No access token found');
                return;
            }
            console.log("Liking post with ID:", postId);
    
            // Gửi yêu cầu POST đến backend
            const response = await api.post<PostResponse>(
                `/posts/like/${postId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            fetchPosts();

        } catch (err: any) {
            if (err.response) {
                // Log lỗi từ server
                console.error('Error response:', err.response);
                setError(`Error: ${err.response.data.message || err.message}`);
            } else {
                console.error('Unexpected error:', err);
                setError('Failed to like post');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleComment = async (postId: string, comment: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('No access token found');
                return;
            }

            const response = await api.post(
                `/posts/comment/${postId}`,
                { comment },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            fetchPosts();
        } catch (err: any) {
            if (err.response) {
                console.error('Error response:', err.response);
                setError(`Error: ${err.response.data.message || err.message}`);
            } else {
                console.error('Unexpected error:', err);
                setError('Failed to add comment');
            }
        }
    };
    
      const openCommentModal = (postId: string) => {
            setSelectedPostId(postId);
            setOpenModal(true);
        };

        const closeCommentModal = () => {
            setOpenModal(false);
            setSelectedPostId('');
        };

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

    if (posts.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#555' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>No Posts Available</h2>
                <p style={{ fontSize: '16px', color: '#888' }}>Be the first to create a post and share your thoughts!</p>
            </div>
        );
    }

    return (
        <div className="posts-container bg" style={{ maxWidth: '550px', margin: '0 auto', padding: '20px' }}>
            {posts.map((post) => (
                <div key={post._id} className="post " style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <div className="post-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <img src={post.createdBy.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#bbb', marginRight: '10px' }} alt="avatar" />
                        <div>
                            <strong>{post.createdBy.username}</strong>
                            <p style={{ fontSize: '12px', color: '#666' }}>{new Date(post.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <p>{post.content || 'No content available for this post.'}</p>
                    {post.image ? (
                        <img src={post.image} alt="Post Image" style={{ width: '100%', height: 'auto', maxHeight: "500px", objectFit: 'contain', borderRadius: '8px', marginBottom: '10px', display: "block" }} />
                    ) : null}
                    
                    <div className="post-actions" style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{post.likes.length} Likes</span>  
                            <span>{post.comments.length} Comments</span>
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
                                color: post.likes.includes(currentUserId || '') ? 'rgb(249 24 128)' : '#aaa',
                                transition: 'all 0.3s ease',
                            }}
                            >
                            {post.likes.includes(currentUserId || '') ? '❤️' : '🤍'} {post.likes.length}
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

                    <div className="comments-section" style={{ marginTop: '15px' }}>
                        {/* <h3>Comments:</h3> */}
                        {/* {post.comments.length > 0 && (
                            <ul style={{ paddingLeft: '20px' }}>
                                {post.comments.map((comment, index) => (
                                    <li key={index} style={{ marginBottom: '10px', fontSize: '14px' }}>
                                        {comment}
                                    </li>
                                ))}
                            </ul>
                        )} */}
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
