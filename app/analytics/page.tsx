'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AnalyticsPage from '@/components/AnalyticsPage';
import { Link, Click, loadStore } from '@/lib/store';

export default function Analytics() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkId = searchParams.get('linkId') ?? undefined;
  const [links, setLinks] = useState<Link[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const { links: l, clicks: c } = loadStore();
    setLinks(l);
    setClicks(c);
    setMounted(true);
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
      <Navbar currentPage="analytics" onNavigate={(p) => router.push(`/${p === 'home' ? '' : p}`)} />
      <AnalyticsPage links={links} clicks={clicks} initialLinkId={linkId} />
    </>
  );
}