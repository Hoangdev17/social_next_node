'use client'

import { useState } from 'react'
import PostPages from './components/PostPages'

export default function Home() {

  return (
    <div style={{ display: 'flex', height: '100vh' }} className='mt-24'>
      <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '1rem' }}>
      Left
      </div>
      <div style={{ flex: 2, backgroundColor: '#ffffff', padding: '1rem' }}>
        <PostPages />
      </div>
      <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '1rem' }}>
      Right
      </div>
    </div>
    
  )
}
