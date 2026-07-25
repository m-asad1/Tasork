import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Providers } from '@/components/providers';

import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://tasork.com'),
  title: {
    default: 'Tasork — Describe it. We\'ll solve it.',
    template: '%s | Tasork',
  },
  description:
    'Tasork connects you with a managed team of experts who scope, price, and deliver your digital project — no freelancer searching, no negotiating.',
  openGraph: {
    type: 'website',
    siteName: 'Tasork',
    title: 'Tasork — Describe it. We\'ll solve it.',
    description: 'Submit your project. Get a custom solution. We handle the rest.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
