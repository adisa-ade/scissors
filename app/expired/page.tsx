'use client';
import { useRouter } from 'next/navigation';

export default function ExpiredPage() {
  const router = useRouter();
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '2rem', fontFamily: "'Syne', sans-serif" }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Link Expired</div>
      <div style={{ fontSize: '1rem', color: 'var(--text2)', marginBottom: '2rem' }}>This link has expired and is no longer available.</div>
      <button
        onClick={() => router.push('/')}
        style={{ padding: '12px 24px', borderRadius: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#000' }}
      >
        Create your own short link
      </button>
    </div>
  );
}