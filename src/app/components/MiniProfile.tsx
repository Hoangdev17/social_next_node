import { api } from '@/lib/auth';
import React, { useEffect, useState } from 'react';
import { Avatar, Typography } from '@mui/material'; // Import Avatar and Typography from MUI

interface UserProfile {
    avatar: string;
    username: string;
    email: string;
}

const MiniProfile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get<UserProfile>(`/users/me`);
                setProfile(res.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, []);

    if (!profile) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-64 p-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
                <Avatar
                    alt={`${profile.username}'s avatar`}
                    src={profile.avatar}
                    sx={{ width: 50, height: 50 }}
                />
                <div>
                    <Typography variant="h6" className="font-semibold text-gray-800">
                        {profile.username}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                        {profile.email}
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default MiniProfile;
