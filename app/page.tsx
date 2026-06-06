'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/Navbar';
import HomePage from '@/components/HomePage';
import { useRouter } from 'next/navigation';
import QRModal from '@/components/QRModal';
import { useUser } from '@clerk/nextjs';

export default function App() {
  const { user } = useUser();
  const router = useRouter();
  const links = useQuery(api.links.getMyLinks) ?? [];
  const createLink = useMutation(api.links.createLink);
  const [qrSlug, setQrSlug] = useState<string | null>(null);

  if (links === undefined) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: "'Syne', sans-serif" }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <Navbar currentPage="home" onNavigate={(p) => router.push(`/${p === 'home' ? '' : p}`)} />
      <HomePage
        links={links}
        createLink={createLink}
        onNavigate={(p) => router.push(`/${p === 'home' ? '' : p}`)}
        onOpenQR={setQrSlug}
        userId={user?.id ?? 'anon'}
      />
      {qrSlug && <QRModal slug={qrSlug} onClose={() => setQrSlug(null)} />}
    </>
  );
}