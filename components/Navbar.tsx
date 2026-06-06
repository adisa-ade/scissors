'use client';
import React from 'react';
import { UserButton, Show, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs'

type Page = 'home' | 'dashboard' | 'analytics';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { isSignedIn } = useAuth();
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,8,8,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div
        onClick={() => onNavigate('home')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.03em', cursor: 'pointer' }}
      >
        <div style={{
          width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '1rem',
        }}>✂</div>
        Scissor
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {(['home', ...(isSignedIn ? ['dashboard', 'analytics'] : [])] as Page[]).map(page => (
          <button key={page} onClick={() => onNavigate(page)} style={{
            padding: '7px 16px', borderRadius: 8, fontFamily: "'Syne', sans-serif",
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: '1px solid transparent',
            background: 'transparent',
            color: currentPage === page ? 'var(--accent)' : 'var(--text2)',
            textTransform: 'capitalize',
          }}>
            {page}
          </button>
        ))}
        <Show when="signed-out">
          <SignInButton>
            <button style={{ padding: '7px 16px', borderRadius: 8, fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#000' }}>
              Login
            </button>
          </SignInButton>
          <SignUpButton>
            <button style={{ padding: '7px 16px', borderRadius: 8, fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--accent2)', color: '#000' }}>
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton appearance={{
            baseTheme: undefined,
            elements: {
              avatarBox: { width: 32, height: 32 }
            }
          }} />
        </Show>
      </div>
    </nav>
  );
}
