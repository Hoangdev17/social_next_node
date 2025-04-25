'use client'

import { useState } from 'react'
import PostPages from './components/PostPages'
import FollowerComponent from './components/FollowerComponent'
import MiniProfile from './components/MiniProfile'
import AddPostComponent from './components/AddPostComponent'

export default function Home() {

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }} className='mt-24'>
      <div
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          padding: '1rem',
          position: 'sticky',
          top: '24px',
          height: 'calc(100vh - 24px)',
          overflowY: 'auto',
          scrollbarWidth: 'none', // Ẩn thanh cuộn trên Firefox
          msOverflowStyle: 'none', // Ẩn thanh cuộn trên IE và Edge
        }}
      >
        <MiniProfile />
      </div>
      <div
        style={{
          flex: 3,
          backgroundColor: '#ffffff',
          padding: '1rem',
          overflowY: 'auto',
          scrollbarWidth: 'none', // Ẩn thanh cuộn trên Firefox
          msOverflowStyle: 'none', // Ẩn thanh cuộn trên IE và Edge
        }}
      >
        <AddPostComponent />
        <hr style={{ maxWidth: '520px', margin: '0 auto'}}/>
        <PostPages />
      </div>
      <div
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          padding: '1rem',
          position: 'sticky',
          top: '24px',
          height: 'calc(100vh - 24px)',
          overflowY: 'auto',
          scrollbarWidth: 'none', // Ẩn thanh cuộn trên Firefox
          msOverflowStyle: 'none', // Ẩn thanh cuộn trên IE và Edge
        }}
      >
        <FollowerComponent />
      </div>
    </div>
  )
}
