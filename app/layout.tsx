import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scissor — URL Shortener',
  description: 'Short links. Big impact. URL shortener with real-time analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
