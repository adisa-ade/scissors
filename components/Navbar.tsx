'use client';
import React, { useState } from 'react';
import { UserButton, Show, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';

type Page = 'home' | 'dashboard' | 'analytics';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { isSignedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pages = ['home', ...(isSignedIn ? ['dashboard', 'analytics'] : [])] as Page[];

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,8,8,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.25rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div
          onClick={() => { onNavigate('home'); setMenuOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.03em', cursor: 'pointer' }}
        >
          <div style={{
            width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '1rem', flexShrink: 0,
          }}>✂</div>
          Scissor
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="desktop-nav">
          {pages.map(page => (
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
              <button style={{ padding: '7px 16px', borderRadius: 8, fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)' }}>
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} />
          </Show>
        </div>

        {/* Mobile right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="mobile-nav">
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} />
          </Show>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', padding: 4 }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
          background: 'rgba(8,8,8,0.98)', borderBottom: '1px solid var(--border)',
          padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 8,
        }} className="mobile-menu">
          {pages.map(page => (
            <button key={page} onClick={() => { onNavigate(page); setMenuOpen(false); }} style={{
              padding: '12px 16px', borderRadius: 8, fontFamily: "'Syne', sans-serif",
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer', border: '1px solid transparent',
              background: currentPage === page ? 'var(--accent-bg)' : 'transparent',
              color: currentPage === page ? 'var(--accent)' : 'var(--text2)',
              textTransform: 'capitalize', textAlign: 'left',
              borderColor: currentPage === page ? 'var(--accent-border)' : 'transparent',
            }}>
              {page}
            </button>
          ))}
          <Show when="signed-out">
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <SignInButton>
                <button style={{ flex: 1, padding: '12px', borderRadius: 8, fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#000' }}>
                  Login
                </button>
              </SignInButton>
              <SignUpButton>
                <button style={{ flex: 1, padding: '12px', borderRadius: 8, fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)' }}>
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      )}

      {/* CSS for showing/hiding desktop vs mobile */}
      <style>{`
        @media (min-width: 640px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
          .mobile-menu { display: none !important; }
        }
        @media (max-width: 639px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}