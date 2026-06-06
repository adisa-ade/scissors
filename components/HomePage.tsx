'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Link, isSlugAvailable } from '@/lib/store';
import { SignInButton, useAuth } from '@clerk/nextjs';

interface HomePageProps {
  links: Link[];  
  createLink: (args: { slug: string; originalUrl: string; expiresAt: number | null }) => Promise<void>;
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
  
    const slug = slugValue || nanoid6();
  
    // slug validation
    if (slugValue) {
      const reserved = new Set(['api','admin','dashboard','login','signup','analytics','settings','expired','health']);
      if (reserved.has(slug)) { setError('This slug is reserved. Please choose another.'); return; }
      if (slug.length < 3 || slug.length > 50) { setError('Slug must be 3–50 characters.'); return; }
    }
  
    try {
       createLink({
        slug,
        originalUrl: urlValue.trim(),
        expiresAt: expiryValue ? Date.now() + Number(expiryValue) * 86400000 : null,
      });
      setResultSlug(slug);
      setUrlValue(''); setSlugValue(''); setExpiryValue(''); setSlugStatus(null);
      setBtnText('✓ Done!');
      setTimeout(() => setBtnText('✂ Shorten'), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // catches "Slug already taken" from Convex
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }
  const s: Record<string, React.CSSProperties> = {
    hero: { padding: '6rem 2rem 4rem', maxWidth: 720, margin: '0 auto', textAlign: 'center' },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'var(--surface2)', border: '1px solid var(--border2)',
      padding: '6px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
      color: 'var(--text2)', marginBottom: '2rem',
    },
    title: { fontSize: 'clamp(3rem,8vw,5.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '1.5rem' },
    sub: { fontSize: '1.1rem', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '3rem' },
    card: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: 680, margin: '0 auto 3rem' },
    inputRow: { display: 'flex', gap: 10, marginBottom: '1rem' },
    inputWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 16px', height: 52 },
    input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem' },
    btn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 20px', borderRadius: 'var(--radius)', height: 52, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#000', whiteSpace: 'nowrap' },
    optionsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' },
    fieldLabel: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', marginBottom: 6, display: 'block' },
    slugRow: { display: 'flex', alignItems: 'center', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', height: 44, overflow: 'hidden' },
    slugPrefix: { padding: '0 12px', color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center', background: 'var(--surface3)' },
    slugInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0 12px', color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' },
    select: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', height: 44, padding: '0 12px', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer', width: '100%' },
    errorMsg: { background: 'var(--red-bg)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '0.85rem', color: 'var(--red)', marginTop: 8 },
    resultCard: { background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginTop: '1rem', animation: 'slideIn 0.25s ease' },
    resultLabel: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', marginBottom: 8 },
    resultLink: { fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 500, color: 'var(--accent)' },
    resultActions: { display: 'flex', gap: 8, marginTop: 12 },
    btnSm: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 'var(--radius)', height: 36, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' },
    statsStrip: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxWidth: 680, margin: '0 auto 6rem' },
    statCell: { background: 'var(--surface)', padding: '1.5rem', textAlign: 'center' },
    statNum: { fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' },
    statLbl: { fontSize: '0.8rem', color: 'var(--text2)', marginTop: 4 },
  };

  // function copyResult() {
  //   navigator.clipboard.writeText('https://scsr.io/' + resultSlug).catch(() => { });
  // }
  function copyResult() {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    navigator.clipboard.writeText(`${base}/${resultSlug}`).catch(() => {});
  }
  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(232,255,71,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={s.hero}>
          <div style={s.badge}>✂ URL shortener <span style={{ color: 'var(--accent)' }}>with real-time analytics</span></div>
          <h1 style={s.title}>Short links.<br /><em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>Big impact.</em></h1>
          <p style={s.sub}>Cut the clutter. Share cleaner links with click analytics,<br />custom slugs, QR codes, and expiry control.</p>
        </div>
      </div>
      {isSignedIn ? (
        <div style={s.card}>
          <div style={s.inputRow}>
            <div style={s.inputWrap}>
              <span style={{ color: 'var(--text3)', fontSize: '1rem', flexShrink: 0 }}>🔗</span>
              <input style={s.input} type="url" placeholder="Paste your long URL here…" value={urlValue} onChange={e => { setUrlValue(e.target.value); setError(''); }} />
            </div>
            <button style={s.btn} onClick={handleShorten}>{btnText}</button>
          </div>

          <div style={s.optionsRow}>
            <div>
              <label style={s.fieldLabel}>CUSTOM SLUG</label>
              <div style={s.slugRow}>
                <span style={s.slugPrefix}>scsr.io/</span>
                <input style={s.slugInput} type="text" placeholder="my-brand" value={slugValue} onChange={e => handleSlugChange(e.target.value)} maxLength={50} />
              </div>
              {slugStatus && (
                <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 3, color: slugStatus.ok ? 'var(--green)' : 'var(--red)' }}>
                  {slugStatus.text}
                </div>
              )}
            </div>
            <div>
              <label style={s.fieldLabel}>EXPIRY</label>
              <select style={s.select} value={expiryValue} onChange={e => setExpiryValue(e.target.value)}>
                <option value="">No expiry</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          {error && <div style={s.errorMsg}>⚠ {error}</div>}

          {resultSlug && (
            <div style={s.resultCard}>
              <div style={s.resultLabel}>YOUR SHORT LINK IS READY</div>
              <div style={s.resultLink} className="mono">scsr.io/{resultSlug}</div>
              <div style={s.resultActions}>
                <button style={s.btnSm} onClick={copyResult}>📋 Copy link</button>
                <button style={s.btnSm} onClick={() => onOpenQR(resultSlug)}>◼ QR Code</button>
                <button style={s.btnSm} onClick={() => onNavigate('dashboard')}>→ Dashboard</button>
              </div>
            </div>
          )}
        </div>
      ) :
        (<div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SignInButton mode="modal">
            <button style={{
              padding: '14px 32px', borderRadius: 'var(--radius)', fontFamily: "'Syne', sans-serif",
              fontWeight: 700, fontSize: '1rem', cursor: 'pointer', border: 'none',
              background: 'var(--accent)', color: '#000',
            }}>
              Sign in to shorten links
            </button>
          </SignInButton>
        </div>
        )}
      {isSignedIn && (
        <div style={s.statsStrip}>
          {[
            { ref: totalRef, label: 'Links created' },
            { ref: clicksRef, label: 'Total clicks' },
            { ref: activeRef, label: 'Active links' },
          ].map(({ ref, label }) => (
            <div key={label} style={s.statCell}>
              <div ref={ref} style={s.statNum}>0</div>
              <div style={s.statLbl}>{label}</div>
            </div>
          ))}
        </div>)}
    </div>
  )
}
