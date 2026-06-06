'use client';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Navbar from '@/components/Navbar';
import DashboardPage from '@/components/DashboardPage';
import QRModal from '@/components/QRModal';

export default function Dashboard() {
  const router = useRouter();
  const links = useQuery(api.links.getMyLinks) ?? [];
  const deleteLinks = useMutation(api.links.deleteLinks);
  const [qrSlug, setQrSlug] = useState<string | null>(null);

  const handleDelete = useCallback(async (ids: string[]) => {
    await deleteLinks({ ids: ids as Id<'links'>[] });
  }, [deleteLinks]);

  const handleGoAnalytics = useCallback((linkId: string) => {
    router.push(`/analytics?linkId=${linkId}`);
  }, [router]);

  if (links === undefined) {
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