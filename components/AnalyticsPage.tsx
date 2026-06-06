'use client';
import React, { useState, useEffect } from 'react';
import { Doc } from '@/convex/_generated/dataModel';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

interface AnalyticsPageProps {
  links: Doc<'links'>[];
  clicks: Doc<'clicks'>[];
  initialLinkId?: string;
}

const PIE_COLORS = ['#e8ff47', '#4dff9a', '#4da6ff', '#ff4d4d', '#ff9f4d'];
const CHART_COLOR = 'rgba(240,240,240,0.7)';
const CHART_GRID = 'rgba(255,255,255,0.05)';
const FONT = { family: "'Syne', sans-serif", size: 11 };

export default function AnalyticsPage({ links, clicks, initialLinkId }: AnalyticsPageProps) {
  const [selectedId, setSelectedId] = useState(initialLinkId || links[0]?._id || ''); // ← _id

  useEffect(() => {
    if (initialLinkId) setSelectedId(initialLinkId);
    else if (!selectedId && links[0]) setSelectedId(links[0]._id); // ← _id
  }, [initialLinkId, links]);

  const day = 86400000;
  const now = Date.now();
  const allLinkClicks = clicks.filter(c => c.linkId === selectedId);
  const last7 = allLinkClicks.filter(c => c.timestamp >= now - 7 * day);
  const prev7 = allLinkClicks.filter(c => c.timestamp >= now - 14 * day && c.timestamp < now - 7 * day);

  const delta = prev7.length > 0 ? Math.round(((last7.length - prev7.length) / prev7.length) * 100) : last7.length > 0 ? 100 : 0;

  const dailyLabels: string[] = [];
  const dailyData: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * day);
    dailyLabels.push(d.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
    const start = new Date(d).setHours(0, 0, 0, 0);
    const end = start + day;
    dailyData.push(last7.filter(c => c.timestamp >= start && c.timestamp < end).length);
  }

  const devMap: Record<string, number> = {};
  allLinkClicks.forEach(c => { const d = c.device || 'unknown'; devMap[d] = (devMap[d] || 0) + 1; });
  const devEntries = Object.entries(devMap);

  const refMap: Record<string, number> = {};
  allLinkClicks.forEach(c => { const r = c.referrer || 'Direct'; refMap[r] = (refMap[r] || 0) + 1; });
  const topRef = Object.entries(refMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxRef = topRef[0]?.[1] || 1;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Map = Array(7).fill(0);
  const prev7Map = Array(7).fill(0);
  last7.forEach(c => { last7Map[new Date(c.timestamp).getDay()]++; });
  prev7.forEach(c => { prev7Map[new Date(c.timestamp).getDay()]++; });

  const s: Record<string, React.CSSProperties> = {
    header: { padding: '2.5rem 2.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' },
    title: { fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' },
    subtitle: { fontSize: '0.85rem', color: 'var(--text2)', marginTop: 2 },
    selectBar: { padding: '1rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 },
    sel: { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '8px 14px', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.85rem', outline: 'none', cursor: 'pointer' },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', padding: '1.5rem 2.5rem' },
    kpiCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' },
    kpiLabel: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', marginBottom: 8 },
    kpiValue: { fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em' },
    chartsGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', padding: '0 2.5rem 1.5rem' },
    chartsGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 2.5rem 1.5rem' },
    chartCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' },
    chartTitle: { fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' },
    chartWrap: { position: 'relative', height: 200 },
    referrerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem' },
    refBarWrap: { height: 4, background: 'var(--surface3)', borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  };

  const lineData = {
    labels: dailyLabels,
    datasets: [{ data: dailyData, borderColor: '#e8ff47', backgroundColor: 'rgba(232,255,71,0.08)', pointBackgroundColor: '#e8ff47', pointRadius: 4, fill: true, tension: 0.4 }],
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: { parsed: { y: number } }) => ' ' + c.parsed.y + ' clicks' } } },
    scales: {
      x: { ticks: { color: CHART_COLOR, font: FONT }, grid: { color: CHART_GRID } },
      y: { ticks: { color: CHART_COLOR, font: FONT }, grid: { color: CHART_GRID }, beginAtZero: true },
    },
  };

  const pieData = {
    labels: devEntries.map(e => e[0]),
    datasets: [{ data: devEntries.map(e => e[1]), backgroundColor: PIE_COLORS, borderWidth: 0, hoverOffset: 4 }],
  };
  const pieOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: { label: string; parsed: number }) => ` ${c.label}: ${c.parsed}` } } },
    cutout: '65%',
  };

  const barData = {
    labels: daysOfWeek,
    datasets: [
      { label: 'Last 7d', data: last7Map, backgroundColor: 'rgba(232,255,71,0.7)', borderRadius: 4 },
      { label: 'Prev 7d', data: prev7Map, backgroundColor: 'rgba(232,255,71,0.2)', borderRadius: 4 },
    ],
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: CHART_COLOR, font: FONT, boxWidth: 10, boxHeight: 10 } },
      tooltip: { callbacks: { label: (c: { dataset: { label: string }; parsed: { y: number } }) => ` ${c.dataset.label}: ${c.parsed.y}` } },
    },
    scales: {
      x: { ticks: { color: CHART_COLOR, font: FONT }, grid: { display: false } },
      y: { ticks: { color: CHART_COLOR, font: FONT }, grid: { color: CHART_GRID }, beginAtZero: true },
    },
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div style={s.header}>
        <div>
          <div style={s.title}>Analytics</div>
          <div style={s.subtitle}>Real-time click data for your links</div>
        </div>
      </div>

      <div style={s.selectBar}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text2)' }}>Viewing:</span>
        <select style={s.sel} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          {links.map(l => <option key={l._id} value={l._id}>scsr.io/{l.slug}</option>)} {/* ← _id */}
        </select>
      </div>

      <div style={s.kpiGrid}>
        <div style={s.kpiCard}>
          <div style={s.kpiLabel}>TOTAL CLICKS</div>
          <div style={s.kpiValue}>{allLinkClicks.length.toLocaleString()}</div>
        </div>
        <div style={s.kpiCard}>
          <div style={s.kpiLabel}>LAST 7 DAYS</div>
          <div style={s.kpiValue}>{last7.length.toLocaleString()}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600, marginTop: 6, color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {delta >= 0 ? '↑ +' : '↓ '}{delta}% vs prev week
          </div>
        </div>
        <div style={s.kpiCard}>
          <div style={s.kpiLabel}>PREV 7 DAYS</div>
          <div style={s.kpiValue}>{prev7.length.toLocaleString()}</div>
        </div>
      </div>

      <div style={s.chartsGrid}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>Clicks — last 7 days</div>
          <div style={s.chartWrap}>
            <Line data={lineData} options={lineOptions as Parameters<typeof Line>[0]['options']} />
          </div>
        </div>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>Device breakdown</div>
          <div style={s.chartWrap}>
            {devEntries.length > 0
              ? <Doughnut data={pieData} options={pieOptions as Parameters<typeof Doughnut>[0]['options']} />
              : <div style={{ color: 'var(--text3)', fontSize: '0.85rem', paddingTop: 60, textAlign: 'center' }}>No data yet</div>
            }
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: '1rem' }}>
            {devEntries.map((e, i) => (
              <div key={e[0]} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                {e[0]} ({e[1]})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.chartsGrid2}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>Top referrers</div>
          {topRef.map(([name, count]) => (
            <div key={name}>
              <div style={s.referrerRow}><span>{name}</span><span style={{ fontWeight: 700 }}>{count}</span></div>
              <div style={s.refBarWrap}>
                <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, width: `${Math.round(count / maxRef * 100)}%`, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>Click activity — comparison</div>
          <div style={s.chartWrap}>
            <Bar data={barData} options={barOptions as Parameters<typeof Bar>[0]['options']} />
          </div>
        </div>
      </div>
    </div>
  );
}