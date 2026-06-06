import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Scissor — URL Shortener',
  description: 'Short links. Big impact. URL shortener with real-time analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <html lang="en">
        <body>{children}</body>
      </html>
    </Providers>
  )
}