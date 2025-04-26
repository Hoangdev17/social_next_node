import { api } from '@/lib/auth';
import React, { useEffect, useState } from 'react';
import { Avatar, Typography, Box, Divider, CircularProgress } from '@mui/material';

interface UserProfile {
    avatar: string;
    username: string;
    email: string;
}

const MiniProfile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get<UserProfile>('/users/me');
                setProfile(res.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    p: 4,
                }}
            >
                <CircularProgress size={30} />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box
                sx={{
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                }}
            >
                <Typography variant="body1" color="text.secondary">
                    Unable to load profile
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: { xs: '100%', sm: 280 },
                p: 3,
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                },
            }}
        >
            {/* Profile Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                }}
            >
                <Avatar
                    alt={`${profile.username}'s avatar`}
                    src={profile.avatar}
                    sx={{
                        width: 60,
                        height: 60,
                        border: '2px solid #e0e0e0',
                        transition: 'border-color 0.2s ease-in-out',
                        '&:hover': {
                            borderColor: '#3f51b5',
                        },
                    }}
                />
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: '#1a1a1a',
                            lineHeight: 1.2,
                        }}
                    >
                        {profile.username}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#666',
                            mt: 0.5,
                            wordBreak: 'break-word',
                        }}
                    >
                        {profile.email}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />

            {/* Additional Info or Actions */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        color: '#888',
                        fontSize: '0.875rem',
                    }}
                >
                    Member since: {new Date().getFullYear()}
                </Typography>
                <Box
                    component="a"
                    href="/profile"
                    sx={{
                        textDecoration: 'none',
                        color: '#3f51b5',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        transition: 'color 0.2s ease-in-out',
                        '&:hover': {
                            color: '#303f9f',
                            textDecoration: 'underline',
                        },
                    }}
                >
                    View Full Profile
                </Box>
            </Box>
        </Box>
    );
};

export default MiniProfile;
