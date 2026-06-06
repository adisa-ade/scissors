'use client';
import React, { useState, useEffect, useRef } from 'react';

interface QRModalProps {
  slug: string;
  onClose: () => void;
}

export default function QRModal({ slug, onClose }: QRModalProps) {
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [ecc, setEcc] = useState('M');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [QRCode, setQRCode] = useState<typeof import('qrcode') | null>(null);

  useEffect(() => {
    import('qrcode').then(m => setQRCode(m));
  }, []);

  useEffect(() => {
    if (!QRCode || !canvasRef.current || !slug) return;
    // QRCode.toCanvas(canvasRef.current, 'https://scsr.io/' + slug, {
      QRCode.toCanvas(canvasRef.current, `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/${slug}`, {
      width: 160,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: ecc as 'L' | 'M' | 'Q' | 'H',
    }).catch(console.error);
  }, [QRCode, slug, fg, bg, ecc]);

  function downloadQR(type: 'png' | 'svg') {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    if (type === 'png') {
      a.href = canvasRef.current.toDataURL('image/png');
      a.download = 'scissor-' + slug + '.png';
    } else {
      const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="${bg}"/><image href="${canvasRef.current.toDataURL()}" width="160" height="160"/></svg>`;
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      a.href = URL.createObjectURL(blob);
      a.download = 'scissor-' + slug + '.svg';
    }
    a.click();
  }

  const s: Record<string, React.CSSProperties> = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-xl)', padding: '2rem', width: 380, position: 'relative', animation: 'modalIn 0.2s ease' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
    title: { fontSize: '1.1rem', fontWeight: 800 },
    close: { width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' },
    preview: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', minHeight: 180, background: '#fff' },
    controls: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' },
    field: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: '0.72rem', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em' },
    colorWrap: { height: 40, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--surface2)' },
    colorInput: { width: '100%', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 },
    qrSelect: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '0.82rem', outline: 'none', cursor: 'pointer', height: 40, width: '100%' },
    actions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
    btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 14px', height: 36, borderRadius: 'var(--radius)', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' },
    btnAccent: { background: 'var(--accent)', color: '#000', border: 'none' },
  };

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={s.title}>QR Code — scsr.io/{slug}</div>
          <button style={s.close} onClick={onClose}>✕</button>
        </div>

        <div style={{ ...s.preview, background: bg }}>
          <canvas ref={canvasRef} style={{ borderRadius: 8 }} />
        </div>

        <div style={s.controls}>
          <div style={s.field}>
            <label style={s.label}>FOREGROUND</label>
            <div style={s.colorWrap}><input type="color" style={s.colorInput} value={fg} onChange={e => setFg(e.target.value)} /></div>
          </div>
          <div style={s.field}>
            <label style={s.label}>BACKGROUND</label>
            <div style={s.colorWrap}><input type="color" style={s.colorInput} value={bg} onChange={e => setBg(e.target.value)} /></div>
          </div>
          <div style={{ ...s.field, gridColumn: 'span 2' }}>
            <label style={s.label}>ERROR CORRECTION</label>
            <select style={s.qrSelect} value={ecc} onChange={e => setEcc(e.target.value)}>
              <option value="L">Low (7% recovery)</option>
              <option value="M">Medium (15% recovery)</option>
              <option value="Q">Quartile (25% recovery)</option>
              <option value="H">High (30% recovery)</option>
            </select>
          </div>
        </div>

        <div style={s.actions}>
          <button style={s.btn} onClick={() => downloadQR('svg')}>⬇ Download SVG</button>
          <button style={{ ...s.btn, ...s.btnAccent }} onClick={() => downloadQR('png')}>⬇ Download PNG</button>
        </div>
      </div>
    </div>
  );
}
