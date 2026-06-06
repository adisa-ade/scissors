export interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  clicks: number;
  isExpired: boolean;
  expiresAt: number | null;
  createdAt: number;
  userId: string;
}

export interface Click {
  id: string;
  linkId: string;
  slug: string;
  timestamp: number;
  referrer: string;
  country: string;
  device: string;
  browser: string;
}

const RESERVED = new Set(['api','admin','dashboard','login','signup','analytics','settings','expired','health']);

function nanoid6(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r = '';
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

function seedDemoData(): { links: Link[]; clicks: Click[] } {
  const now = Date.now();
  const day = 86400000;
  const links: Link[] = [
    { id: 'lnk_1', slug: 'portfolio', originalUrl: 'https://myportfolio.dev/works/john-adeyemi-2025', clicks: 0, isExpired: false, expiresAt: null, createdAt: now - 15 * day, userId: 'demo' },
    { id: 'lnk_2', slug: 'resume-pdf', originalUrl: 'https://drive.google.com/file/d/1abc123xyz/view?usp=sharing', clicks: 0, isExpired: false, expiresAt: now + 7 * day, createdAt: now - 10 * day, userId: 'demo' },
    { id: 'lnk_3', slug: 'xk2p9q', originalUrl: 'https://www.figma.com/file/Abc123def/Design-System-V3?node-id=0%3A1', clicks: 0, isExpired: false, expiresAt: null, createdAt: now - 7 * day, userId: 'demo' },
    { id: 'lnk_4', slug: 'bootcamp', originalUrl: 'https://altschoolafrica.com/schools/engineering', clicks: 0, isExpired: true, expiresAt: now - 2 * day, createdAt: now - 20 * day, userId: 'demo' },
    { id: 'lnk_5', slug: 'github', originalUrl: 'https://github.com/jadeyemi/scissor-project', clicks: 0, isExpired: false, expiresAt: null, createdAt: now - 3 * day, userId: 'demo' },
  ];
  const devices = ['mobile', 'desktop', 'tablet'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  const referrers = ['Twitter', 'Direct', 'LinkedIn', 'Google', 'WhatsApp'];
  const countries = ['NG', 'US', 'GB', 'GH', 'KE'];
  const clicks: Click[] = [];
  links.forEach(l => {
    const count = Math.floor(Math.random() * 180) + 10;
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.random() * 14;
      clicks.push({
        id: 'clk_' + Math.random().toString(36).slice(2),
        linkId: l.id, slug: l.slug,
        timestamp: now - daysAgo * day,
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
      });
    }
    l.clicks = clicks.filter(c => c.linkId === l.id).length;
  });
  return { links, clicks };
}

export function loadStore(): { links: Link[]; clicks: Click[] } {
  if (typeof window === 'undefined') return { links: [], clicks: [] };
  const storedLinks = localStorage.getItem('scissor_links');
  const storedClicks = localStorage.getItem('scissor_clicks');
  if (storedLinks && storedClicks) {
    return { links: JSON.parse(storedLinks), clicks: JSON.parse(storedClicks) };
  }
  const demo = seedDemoData();
  localStorage.setItem('scissor_links', JSON.stringify(demo.links));
  localStorage.setItem('scissor_clicks', JSON.stringify(demo.clicks));
  return demo;
}

export function saveStore(links: Link[], clicks: Click[]) {
  localStorage.setItem('scissor_links', JSON.stringify(links));
  localStorage.setItem('scissor_clicks', JSON.stringify(clicks));
}

export function createLink(links: Link[], rawUrl: string, customSlug: string, expiryDays: string, userId: string = 'anon'): { link?: Link; error?: string } {
  let slug = customSlug || nanoid6();
  slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (customSlug) {
    if (RESERVED.has(slug)) return { error: 'This slug is reserved. Please choose another.' };
    if (slug.length < 3 || slug.length > 50) return { error: 'Slug must be 3–50 characters.' };
    if (links.find(l => l.slug === slug)) return { error: 'This slug is already taken.' };
  }
  const oneDayAgo = Date.now() - 86400000;
  const recentAnon = links.filter(l => l.userId === 'anon' && l.createdAt > oneDayAgo);
  if (recentAnon.length >= 5) return { error: 'Anonymous limit: 5 links/day. Sign in for unlimited links.' };
  const expiresAt = expiryDays ? Date.now() + Number(expiryDays) * 86400000 : null;
  const link: Link = {
    id: 'lnk_' + nanoid6(), slug, originalUrl: rawUrl, clicks: 0,
    isExpired: false, expiresAt, createdAt: Date.now(), userId,
  };
  return { link };
}

export function isSlugAvailable(links: { slug: string }[], slug: string): 'ok' | 'reserved' | 'taken' | 'short' {
  if (slug.length < 3) return 'short';
  if (RESERVED.has(slug)) return 'reserved';
  if (links.find(l => l.slug === slug)) return 'taken';
  return 'ok';
}
