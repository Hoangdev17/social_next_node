import React, { useEffect, useState } from 'react';
import { Avatar, Typography, TextField, IconButton, Collapse } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '@/lib/auth';

interface Follower {
    _id: string;
    username: string;
    avatar: string;
}

interface IFollower {
    followers: Follower[];
}

const FollowerComponent: React.FC<{ follower: Follower }> = ({ follower }) => {
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
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showSearch, setShowSearch] = useState<boolean>(false);

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

    const filteredFollowers = followers.filter((follower) =>
        follower.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full max-w-md mx-auto mt-8 px-4">
            <div className="flex items-center justify-between mb-3">
                <Typography variant="h6" fontWeight={600}>
                    Followers
                </Typography>

                <IconButton onClick={() => setShowSearch(!showSearch)} size="small">
                    <SearchIcon />
                </IconButton>
            </div>

            <Collapse in={showSearch}>
                <TextField
                    variant="outlined"
                    fullWidth
                    size="small"
                    placeholder="Tìm kiếm theo tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ marginBottom: 2 }}
                />
            </Collapse>

            <hr className="my-4 border-gray-300" />

            {filteredFollowers.length > 0 ? (
                filteredFollowers.map((follower) => (
                    <FollowerComponent key={follower._id} follower={follower} />
                ))
            ) : (
                <Typography className="text-center text-gray-500">Không tìm thấy người theo dõi nào.</Typography>
            )}
        </div>
    );
};

export default FollowersList;
