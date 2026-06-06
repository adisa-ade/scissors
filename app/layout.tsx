import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Scissor — URL Shortener',
  description: 'Short links. Big impact. URL shortener with real-time analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
    clockSkewInMs={60000 * 15} 
    >
    <html lang="en">
      <body>{children}</body>
    </html>
    </ClerkProvider>
  );
}
