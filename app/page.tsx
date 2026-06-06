'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HomePage from '@/components/HomePage';
import { useRouter } from 'next/navigation';
// import DashboardPage from '@/components/DashboardPage';
import AnalyticsPage from '@/components/AnalyticsPage';
import QRModal from '@/components/QRModal';
import { Link, Click, loadStore, saveStore } from '@/lib/store';
import { useUser, useAuth, SignInButton } from '@clerk/nextjs'
import LockedPage from '@/components/LockedPage';

type Page = 'home' | 'dashboard' | 'analytics';

export default function App() {
  const { user } = useUser()
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  // const [page, setPage] = useState<Page>('home');
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  // const [analyticsLinkId, setAnalyticsLinkId] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const { links: l, clicks: c } = loadStore();
    setLinks(l);
    setClicks(c);
    setMounted(true);
  }, []);

  // const handleNavigate = useCallback((newPage: Page) => {
  //   if (!isSignedIn && (newPage === 'dashboard' || newPage === 'analytics')) {
  //     setPage('__locked__' as Page);
  //     return;
  //   }
  //   setPage(newPage);
  // }, [isSignedIn]);

  const handleLinkCreated = useCallback((link: Link) => {
    setLinks(prev => {
      const next = [link, ...prev];
      saveStore(next, clicks);
      return next;
    });
  }, [clicks]);

  // const handleDelete = useCallback((ids: string[]) => {
  //   setLinks(prev => {
  //     const next = prev.filter(l => !ids.includes(l.id));
  //     setClicks(prevClicks => {
  //       const nextClicks = prevClicks.filter(c => !ids.includes(c.linkId));
  //       saveStore(next, nextClicks);
  //       return nextClicks;
  //     });
  //     return next;
  //   });
  // }, []);

  // const handleGoAnalytics = useCallback((linkId: string) => {
  //   setAnalyticsLinkId(linkId);
  //   handleNavigate('analytics');
  // }, [handleNavigate]);

  if (!mounted) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: "'Syne', sans-serif" }}>
        Loading…
      </div>
    );
  }
  // const LockedPage = () => (
  //   <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--text3)' }}>
  //     <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
  //     <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text2)' }}>
  //       Sign in to continue
  //     </div>
  //     <div style={{ fontSize: '0.85rem', marginBottom: '2rem' }}>
  //       Dashboard and Analytics are only available to signed-in users.
  //     </div>
  //     <SignInButton mode="modal">
  //       <button style={{ padding: '12px 24px', borderRadius: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#000' }}>
  //         Sign in
  //       </button>
  //     </SignInButton>
  //   </div>
  // );

  return (
    <>
    <Navbar currentPage="home" onNavigate={(p) => router.push(`/${p === 'home' ? '' : p}`)} />
    <HomePage
      links={links}
      onLinkCreated={handleLinkCreated}
      onNavigate={(p) => router.push(`/${p === 'home' ? '' : p}`)}
      onOpenQR={setQrSlug}
      userId={user?.id ?? 'anon'}
    />
    {qrSlug && <QRModal slug={qrSlug} onClose={() => setQrSlug(null)} />}
  </>
);
}
