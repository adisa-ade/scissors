'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/Navbar';
import AnalyticsPage from '@/components/AnalyticsPage';

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkId = searchParams.get('linkId') ?? undefined;
  const links = useQuery(api.links.getMyLinks) ?? [];
  const clicks = useQuery(api.links.getClicksByUser) ?? [];

  if (links === undefined || clicks === undefined) {
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

export default function Analytics() {
  return (
    <Suspense fallback={
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: "'Syne', sans-serif" }}>
        Loading…
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}