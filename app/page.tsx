'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HomePage from '@/components/HomePage';
import DashboardPage from '@/components/DashboardPage';
import AnalyticsPage from '@/components/AnalyticsPage';
import QRModal from '@/components/QRModal';
import { Link, Click, loadStore, saveStore } from '@/lib/store';

type Page = 'home' | 'dashboard' | 'analytics';

export default function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [page, setPage] = useState<Page>('home');
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const [analyticsLinkId, setAnalyticsLinkId] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const { links: l, clicks: c } = loadStore();
    setLinks(l);
    setClicks(c);
    setMounted(true);
  }, []);

  const handleLinkCreated = useCallback((link: Link) => {
    setLinks(prev => {
      const next = [link, ...prev];
      saveStore(next, clicks);
      return next;
    });
  }, [clicks]);

  const handleDelete = useCallback((ids: string[]) => {
    setLinks(prev => {
      const next = prev.filter(l => !ids.includes(l.id));
      setClicks(prevClicks => {
        const nextClicks = prevClicks.filter(c => !ids.includes(c.linkId));
        saveStore(next, nextClicks);
        return nextClicks;
      });
      return next;
    });
  }, []);

  const handleGoAnalytics = useCallback((linkId: string) => {
    setAnalyticsLinkId(linkId);
    setPage('analytics');
  }, []);

  if (!mounted) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: "'Syne', sans-serif" }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <Navbar currentPage={page} onNavigate={setPage} />
      {page === 'home' && (
        <HomePage links={links} onLinkCreated={handleLinkCreated} onNavigate={setPage} onOpenQR={setQrSlug} />
      )}
      {page === 'dashboard' && (
        <DashboardPage links={links} onDelete={handleDelete} onNavigate={setPage} onOpenQR={setQrSlug} onGoAnalytics={handleGoAnalytics} />
      )}
      {page === 'analytics' && (
        <AnalyticsPage links={links} clicks={clicks} initialLinkId={analyticsLinkId} />
      )}
      {qrSlug && <QRModal slug={qrSlug} onClose={() => setQrSlug(null)} />}
    </>
  );
}
