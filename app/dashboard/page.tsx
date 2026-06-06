'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DashboardPage from '@/components/DashboardPage';
import QRModal from '@/components/QRModal';
import { Link, Click, loadStore, saveStore } from '@/lib/store';

export default function Dashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const { links: l, clicks: c } = loadStore();
    setLinks(l);
    setClicks(c);
    setMounted(true);
  }, []);

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
    router.push(`/analytics?linkId=${linkId}`);
  }, [router]);

  if (!mounted) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: "'Syne', sans-serif" }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <Navbar currentPage="dashboard" onNavigate={(p) => router.push(`/${p === 'home' ? '' : p}`)} />
      <DashboardPage
        links={links}
        onDelete={handleDelete}
        onNavigate={(p) => router.push(`/${p === 'home' ? '' : p}`)}
        onOpenQR={setQrSlug}
        onGoAnalytics={handleGoAnalytics}
      />
      {qrSlug && <QRModal slug={qrSlug} onClose={() => setQrSlug(null)} />}
    </>
  );
}