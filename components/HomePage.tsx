'use client';
import React, { useState, useEffect, useRef } from 'react';
import { isSlugAvailable } from '@/lib/store';
import { Doc } from '@/convex/_generated/dataModel';
import { Id } from '@/convex/_generated/dataModel';
import { SignInButton, useAuth } from '@clerk/nextjs';

interface HomePageProps {
  links: Doc<"links">[];
  createLink: (args: { slug: string; originalUrl: string; expiresAt: number | null }) => Promise<Id<'links'>>;
  onNavigate: (page: 'home' | 'dashboard' | 'analytics') => void;
  onOpenQR: (slug: string) => void;
  userId: string;
}

function nanoid6(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r = '';
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

function animateNum(el: HTMLElement, target: number) {
  const start = parseInt(el.textContent || '0') || 0;
  const diff = target - start;
  if (diff === 0) return;
  let frames = 0;
  const tick = () => {
    frames++;
    const pct = Math.min(frames / 20, 1);
    el.textContent = String(Math.round(start + diff * pct));
    if (pct < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function HomePage({ links, createLink, onNavigate, onOpenQR, userId }: HomePageProps) {
  const { isSignedIn } = useAuth();
  const [urlValue, setUrlValue] = useState('');
  const [slugValue, setSlugValue] = useState('');
  const [expiryValue, setExpiryValue] = useState('');
  const [slugStatus, setSlugStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const [error, setError] = useState('');
  const [resultSlug, setResultSlug] = useState('');
  const [btnText, setBtnText] = useState('✂ Shorten');
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalRef = useRef<HTMLDivElement>(null);
  const clicksRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const total = links.length;
    const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
    const active = links.filter(l => !l.isExpired).length;
    if (totalRef.current) animateNum(totalRef.current, total);
    if (clicksRef.current) animateNum(clicksRef.current, totalClicks);
    if (activeRef.current) animateNum(activeRef.current, active);
  }, [links]);

  function handleSlugChange(val: string) {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlugValue(clean);
    setSlugStatus(null);
    if (slugTimer.current) clearTimeout(slugTimer.current);
    if (!clean || clean.length < 3) return;
    slugTimer.current = setTimeout(() => {
      const status = isSlugAvailable(links, clean);
      if (status === 'ok') setSlugStatus({ text: '✓ Available', ok: true });
      else if (status === 'reserved') setSlugStatus({ text: '✗ Reserved slug', ok: false });
      else if (status === 'taken') setSlugStatus({ text: '✗ Already taken', ok: false });
    }, 350);
  }

  function handleShorten() {
    setError('');
    if (!urlValue.trim()) { setError('Please enter a URL.'); return; }
    try { new URL(urlValue.trim()); } catch { setError('Invalid URL format. Make sure to include https://'); return; }
    const BLOCKED_DOMAINS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'phishing.com', 'malware.com', 'spam.com'];
    const domain = new URL(urlValue.trim()).hostname.replace('www.', '');
    if (BLOCKED_DOMAINS.some(b => domain.includes(b))) { setError('This URL is not allowed.'); return; }
    const slug = slugValue || nanoid6();
    if (slugValue) {
      const reserved = new Set(['api', 'admin', 'dashboard', 'login', 'signup', 'analytics', 'settings', 'expired', 'health']);
      if (reserved.has(slug)) { setError('This slug is reserved. Please choose another.'); return; }
      if (slug.length < 3 || slug.length > 50) { setError('Slug must be 3–50 characters.'); return; }
    }
    try {
      createLink({ slug, originalUrl: urlValue.trim(), expiresAt: expiryValue ? Date.now() + Number(expiryValue) * 86400000 : null });
      setResultSlug(slug);
      setUrlValue(''); setSlugValue(''); setExpiryValue(''); setSlugStatus(null);
      setBtnText('✓ Done!');
      setTimeout(() => setBtnText('✂ Shorten'), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Something went wrong. Please try again.');
    }
  }

  function copyResult() {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    navigator.clipboard.writeText(`${base}/${resultSlug}`).catch(() => {});
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>
      <style>{`
        .hero-section { padding: 4rem 1.25rem 2.5rem; }
        .hero-title { font-size: clamp(2.5rem, 8vw, 5.5rem); }
        .hero-sub br { display: none; }
        .shorten-card { padding: 1.25rem; margin: 0 1rem 2rem; }
        .input-row { flex-direction: column; }
        .shorten-btn { width: 100%; height: 48px; }
        .options-row { grid-template-columns: 1fr; }
        .result-actions { flex-wrap: wrap; }
        .stats-strip { margin: 0 1rem 4rem; }

        @media (min-width: 640px) {
          .hero-section { padding: 6rem 2rem 4rem; }
          .hero-sub br { display: inline; }
          .shorten-card { padding: 2rem; margin: 0 auto 3rem; }
          .input-row { flex-direction: row; }
          .shorten-btn { width: auto; height: 52px; }
          .options-row { grid-template-columns: 1fr 1fr; }
          .result-actions { flex-wrap: nowrap; }
          .stats-strip { margin: 0 auto 6rem; }
        }
      `}</style>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(232,255,71,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="hero-section" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            padding: '6px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--text2)', marginBottom: '2rem',
          }}>✂ URL shortener <span style={{ color: 'var(--accent)' }}>with real-time analytics</span></div>
          <h1 className="hero-title" style={{ fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '1.5rem' }}>
            Short links.<br /><em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>Big impact.</em>
          </h1>
          <p className="hero-sub" style={{ fontSize: '1.1rem', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '3rem' }}>
            Cut the clutter. Share cleaner links with click analytics,<br />custom slugs, QR codes, and expiry control.
          </p>
        </div>
      </div>

      {isSignedIn ? (
        <div className="shorten-card" style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-xl)', maxWidth: 680,
        }}>
          {/* URL input row */}
          <div className="input-row" style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '0 16px', height: 52,
            }}>
              <span style={{ color: 'var(--text3)', fontSize: '1rem', flexShrink: 0 }}>🔗</span>
              <input
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', minWidth: 0 }}
                type="url" placeholder="Paste your long URL here…"
                value={urlValue} onChange={e => { setUrlValue(e.target.value); setError(''); }}
              />
            </div>
            <button
              className="shorten-btn"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 20px', borderRadius: 'var(--radius)', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#000', whiteSpace: 'nowrap' }}
              onClick={handleShorten}
            >{btnText}</button>
          </div>

          {/* Options row */}
          <div className="options-row" style={{ display: 'grid', gap: 10, marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>CUSTOM SLUG</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', height: 44, overflow: 'hidden' }}>
                <span style={{ padding: '0 12px', color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center', background: 'var(--surface3)' }}>scsr.io/</span>
                <input style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0 12px', color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', minWidth: 0 }} type="text" placeholder="my-brand" value={slugValue} onChange={e => handleSlugChange(e.target.value)} maxLength={50} />
              </div>
              {slugStatus && <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 3, color: slugStatus.ok ? 'var(--green)' : 'var(--red)' }}>{slugStatus.text}</div>}
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>EXPIRY</label>
              <select style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', height: 44, padding: '0 12px', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer', width: '100%' }} value={expiryValue} onChange={e => setExpiryValue(e.target.value)}>
                <option value="">No expiry</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          {error && <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '0.85rem', color: 'var(--red)', marginTop: 8 }}>⚠ {error}</div>}

          {resultSlug && (
            <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginTop: '1rem', animation: 'slideIn 0.25s ease' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', marginBottom: 8 }}>YOUR SHORT LINK IS READY</div>
              <div className="mono" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 500, color: 'var(--accent)', wordBreak: 'break-all' }}>scsr.io/{resultSlug}</div>
              <div className="result-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 'var(--radius)', height: 36, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)', whiteSpace: 'nowrap' }} onClick={copyResult}>📋 Copy</button>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 'var(--radius)', height: 36, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)', whiteSpace: 'nowrap' }} onClick={() => onOpenQR(resultSlug)}>◼ QR</button>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 'var(--radius)', height: 36, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)', whiteSpace: 'nowrap' }} onClick={() => onNavigate('dashboard')}>→ Dashboard</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '0 1.25rem' }}>
          <SignInButton mode="modal">
            <button style={{ padding: '14px 32px', borderRadius: 'var(--radius)', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#000' }}>
              Sign in to shorten links
            </button>
          </SignInButton>
        </div>
      )}

      {isSignedIn && (
        <div className="stats-strip" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1,
          background: 'var(--border)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxWidth: 680,
        }}>
          {[
            { ref: totalRef, label: 'Links created' },
            { ref: clicksRef, label: 'Total clicks' },
            { ref: activeRef, label: 'Active links' },
          ].map(({ ref, label }) => (
            <div key={label} style={{ background: 'var(--surface)', padding: '1.5rem 1rem', textAlign: 'center' }}>
              <div ref={ref} style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--accent)' }}>0</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}