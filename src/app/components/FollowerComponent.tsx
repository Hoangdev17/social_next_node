import React, { useEffect, useState } from 'react';
import { Avatar, Typography } from '@mui/material';
import { api } from '@/lib/auth';

interface Follower {
    _id: string;
    username: string;
    avatar: string;
}

interface IFollower {
    followers: Follower[];
}

const FollowerComponent: React.FC<{
    follower: Follower;
}> = ({ follower }) => {
    return (
        <div className="flex items-center gap-3 py-3">
            <Avatar src={follower.avatar} alt={follower.username} sx={{ width: 30, height: 30 }} />
            <Typography variant="subtitle1" fontWeight={500}>
                {follower.username}
            </Typography>
        </div>
    );
};

const FollowersList: React.FC = () => {
    const [followers, setFollowers] = useState<Follower[]>([]);

    const fetchFollowers = async () => {
        try {
            const res = await api.get<IFollower>('/users/me', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            setFollowers(res.data.followers);
        } catch (error) {
            console.error('Failed to fetch followers:', error);
        }
    };

    useEffect(() => {
        fetchFollowers();
    }, []);

    return (
        <div className="w-full max-w-md mx-auto mt-8">
            <Typography variant="h6" className="mb-1 font-semibold text-center">
                Followers
            </Typography>

            <hr className="my-6 border-gray-300" />

            {followers.length > 0 ? (
                followers.map((follower) => (
                    <FollowerComponent key={follower._id} follower={follower} />
                ))
            ) : (
                <Typography className="text-center text-gray-500">No followers yet.</Typography>
            )}

            

           
        </div>
    );
};

export default FollowersList;
