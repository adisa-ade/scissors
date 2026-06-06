import React from 'react'
import { SignInButton } from '@clerk/nextjs'
function LockedPage() {
  return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--text3)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
      <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text2)' }}>
        Sign in to continue
      </div>
      <div style={{ fontSize: '0.85rem', marginBottom: '2rem' }}>
        Dashboard and Analytics are only available to signed-in users.
      </div>
      <SignInButton mode="modal">
        <button style={{ padding: '12px 24px', borderRadius: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#000' }}>
          Sign in
        </button>
      </SignInButton>
    </div>
  )
}

export default LockedPage