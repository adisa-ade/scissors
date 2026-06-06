import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const link = await convex.query(api.links.getBySlug, { slug });

    if (!link) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (link.isExpired || (link.expiresAt && link.expiresAt < Date.now())) {
      return NextResponse.redirect(new URL('/?expired=true', request.url));
    }

    const ua = request.headers.get('user-agent') ?? '';
    const device = /mobile/i.test(ua) ? 'mobile' : /tablet/i.test(ua) ? 'tablet' : 'desktop';
    const browser = /chrome/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : /firefox/i.test(ua) ? 'Firefox' : /edge/i.test(ua) ? 'Edge' : 'Other';
    const referrer = request.headers.get('referer') ?? 'Direct';

    await convex.mutation(api.links.recordClick, {
      linkId: link._id,
      slug: link.slug,
      referrer,
      device,
      browser,
    });

    return NextResponse.redirect(link.originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    return NextResponse.redirect(new URL('/', request.url));
  }
}