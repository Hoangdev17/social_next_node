'use client'

import { useState } from 'react';
import { Box, Divider, useMediaQuery, useTheme } from '@mui/material';
import PostPages from './components/PostPages';
import FollowerComponent from './components/FollowerComponent';
import MiniProfile from './components/MiniProfile';
import AddPostComponent from './components/AddPostComponent';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Breakpoint for mobile/tablet (< 900px)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: '100vh',
        mt: { xs: 8, md: 12 },
        overflow: 'hidden',
        bgcolor: '#ffffff',
      }}
    >
      {/* Left Sidebar: MiniProfile */}
      <Box
        sx={{
          flex: { xs: 'none', md: 1 },
          width: { xs: '100%', md: 'auto' },
          p: { xs: 2, md: 3 },
          position: { xs: 'static', md: 'sticky' },
          top: { md: '24px' },
          height: { xs: 'auto', md: 'calc(100vh - 24px)' },
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          display: { xs: 'none', md: 'block' },
        }}
      >
        <MiniProfile />
      </Box>

      {/* Main Content: AddPostComponent + PostPages */}
      <Box
        sx={{
          flex: { xs: 'none', md: 3 },
          width: { xs: '100%', md: 'auto' },
          p: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: { xs: 'auto', md: 'calc(100vh - 24px)' }, // Match the height of sidebars
          overflowY: 'hidden', // Prevent the entire main content from scrolling
        }}
      >
        {/* AddPostComponent */}
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 520 }, // Consistent width with PostPages
            mb: 2, // Add some spacing below AddPostComponent
          }}
        >
          <AddPostComponent />
        </Box>

        <Divider sx={{ maxWidth: { xs: '100%', sm: 520 }, my: 2, width: '100%' }} />

        {/* PostPages with constrained height and internal scroll (scrollbar hidden) */}
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 520 }, // Consistent width with AddPostComponent
            flex: 1, // Take up remaining space
            overflowY: 'auto', // Enable scrolling for PostPages
            scrollbarWidth: 'none', // Hide scrollbar for Firefox
            msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
            '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for Chrome, Safari, Edge
          }}
        >
          <PostPages />
        </Box>
      </Box>

      {/* Right Sidebar: FollowerComponent */}
      <Box
        sx={{
          flex: { xs: 'none', md: 1 },
          width: { xs: '100%', md: 'auto' },
          p: { xs: 2, md: 3 },
          position: { xs: 'static', md: 'sticky' },
          top: { md: '24px' },
          height: { xs: 'auto', md: 'calc(100vh - 24px)' },
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          display: { xs: 'none', md: 'block' }, 
        }}
      >
        <FollowerComponent />
      </Box>
    </Box>
  );
}