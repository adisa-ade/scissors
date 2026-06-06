'use client';
import React, { useState, useEffect } from 'react';
import { Doc } from '@/convex/_generated/dataModel';

interface DashboardPageProps {
  links: Doc<'links'>[];
  onDelete: (ids: string[]) => void;
  onNavigate: (page: 'home' | 'dashboard' | 'analytics') => void;
  onOpenQR: (slug: string) => void;
  onGoAnalytics: (linkId: string) => void;
}

export default function DashboardPage({ links, onDelete, onNavigate, onOpenQR, onGoAnalytics }: DashboardPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmState, setConfirmState] = useState<{ ids: string[]; title: string; sub: string } | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // add to filtered logic
  const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
  const toTs = dateTo ? new Date(dateTo).getTime() + 86400000 : null;

  useEffect(() => { setSelected(new Set()); }, [links]);

  const now = Date.now();
  const filtered = links.filter(l => {
    const matchSearch = !search || l.slug.includes(search.toLowerCase()) || l.originalUrl.toLowerCase().includes(search.toLowerCase());
    const expired = l.isExpired || (l.expiresAt !== null && l.expiresAt! < now);
    const matchFilter = filter === 'all' || (filter === 'active' && !expired) || (filter === 'expired' && expired);
    const matchDate = (!fromTs || l.createdAt >= fromTs) && (!toTs || l.createdAt <= toTs);
    return matchSearch && matchFilter && matchDate;
  });

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleDelete(ids: string[], title: string, sub: string) {
    setConfirmState({ ids, title, sub });
  }

  function confirmDelete() {
    if (!confirmState) return;
    onDelete(confirmState.ids);
    setConfirmState(null);
    setSelected(new Set());
  }

  const s: Record<string, React.CSSProperties> = {
    header: { padding: '2.5rem 2.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' },
    title: { fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' },
    subtitle: { fontSize: '0.85rem', color: 'var(--text2)', marginTop: 2 },
    toolbar: { display: 'flex', alignItems: 'center', gap: 10, padding: '1.2rem 2.5rem', borderBottom: '1px solid var(--border)' },
    searchWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 14px', height: 40 },
    searchInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '0.85rem' },
    table: { padding: '1rem 2.5rem' },
    row: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: 8, animation: 'fadeIn 0.2s ease' },
    check: { width: 18, height: 18, borderRadius: 5, border: '1.5px solid var(--border2)', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' },
    info: { flex: 1, minWidth: 0 },
    shortLink: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 500, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 },
    origLink: { fontSize: '0.78rem', color: 'var(--text3)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 340 },
    clicksBlock: { textAlign: 'right', flexShrink: 0 },
    clickNum: { fontWeight: 800, fontSize: '1rem' },
    clickLbl: { fontSize: '0.72rem', color: 'var(--text3)', marginTop: 1 },
    actions: { display: 'flex', gap: 4, flexShrink: 0 },
    iconBtn: { width: 34, height: 34, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
    emptyState: { textAlign: 'center', padding: '5rem 2rem', color: 'var(--text3)' },
    bulkBar: { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    btnSm: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 'var(--radius)', height: 36, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: 'none' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-xl)', padding: '2rem', width: 340, textAlign: 'center', animation: 'modalIn 0.2s ease' },
  };

  function FilterPill({ value, label }: { value: typeof filter; label: string }) {
    const isActive = filter === value;
    return (
      <button onClick={() => setFilter(value)} style={{
        padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
        cursor: 'pointer', border: '1px solid', fontFamily: "'Syne', sans-serif",
        background: isActive ? 'var(--accent)' : 'transparent',
        color: isActive ? '#000' : 'var(--text2)',
        borderColor: isActive ? 'var(--accent)' : 'var(--border)',
      }}>{label}</button>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div style={s.header}>
        <div>
          <div style={s.title}>My Links</div>
          <div style={s.subtitle}>{links.length} link{links.length !== 1 ? 's' : ''} total</div>
        </div>
        <button onClick={() => onNavigate('home')} style={{ ...s.btnSm, background: 'var(--accent)', color: '#000' }}>+ New link</button>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>🔍</span>
          <input style={s.searchInput} type="text" placeholder="Search links…" value={search} onChange={e => setSearch(e.target.value)} />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 12px', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 12px', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
          />
        </div>
        <FilterPill value="all" label="All" />
        <FilterPill value="active" label="Active" />
        <FilterPill value="expired" label="Expired" />
      </div>

      <div style={s.table}>
        {selected.size > 0 && (
          <div style={s.bulkBar}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text2)' }}>{selected.size} selected</span>
            <button onClick={() => handleDelete([...selected], `Delete ${selected.size} links?`, `${selected.size} links and their analytics will be removed.`)}
              style={{ ...s.btnSm, background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(255,77,77,0.3)' }}>
              🗑 Delete selected
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={s.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>✂</div>
            <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text2)' }}>No links here</div>
            <div style={{ fontSize: '0.85rem' }}>
              Try a different filter or{' '}
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onNavigate('home')}>create a link</span>.
            </div>
          </div>
        ) : (
          filtered.map(l => {
            const expired = l.isExpired || (l.expiresAt !== null && l.expiresAt! < now);
            const sel = selected.has(l._id); // ← _id
            const expiryStr = l.expiresAt ? `Expires ${new Date(l.expiresAt).toLocaleDateString()}` : '';
            return (
              <div key={l._id} style={{ ...s.row, ...(sel ? { borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' } : {}) }}> {/* ← _id */}
                <div onClick={() => toggleSelect(l._id)} style={{ ...s.check, ...(sel ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#000' } : {}) }}> {/* ← _id */}
                  {sel ? '✓' : ''}
                </div>
                <div style={s.info}>
                  <div style={s.shortLink}>
                    scsr.io/{l.slug}
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.04em',
                      background: expired ? 'var(--red-bg)' : 'rgba(77,255,154,0.12)',
                      color: expired ? 'var(--red)' : 'var(--green)',
                    }}>{expired ? 'EXPIRED' : 'ACTIVE'}</span>
                  </div>
                  <div style={s.origLink} title={l.originalUrl}>{l.originalUrl}</div>
                  {expiryStr && <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 2 }}>{expiryStr}</div>}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 2 }}>
                    Created {new Date(l.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={s.clicksBlock}>
                  <div style={s.clickNum}>{l.clicks.toLocaleString()}</div>
                  <div style={s.clickLbl}>clicks</div>
                </div>
                <div style={s.actions}>
                  <button style={s.iconBtn} onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/${l.slug}`)} title="Copy">📋</button>
                  <button style={s.iconBtn} onClick={() => onOpenQR(l.slug)} title="QR Code">◼</button>
                  <button style={s.iconBtn} onClick={() => onGoAnalytics(l._id)} title="Analytics">📊</button> {/* ← _id */}
                  <button style={s.iconBtn} onClick={() => handleDelete([l._id], 'Delete this link?', `scsr.io/${l.slug} will stop working.`)} title="Delete">🗑</button> {/* ← _id */}
                </div>
              </div>
            );
          })
        )}
      </div>

      {confirmState && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setConfirmState(null); }}>
          <div style={s.modal}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗑</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{confirmState.title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1.5rem' }}>{confirmState.sub}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmState(null)} style={{ ...s.btnSm, flex: 1, background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ ...s.btnSm, flex: 1, background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(255,77,77,0.3)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}