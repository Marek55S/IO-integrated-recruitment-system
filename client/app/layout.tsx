import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';
import Providers from './providers';
import { ScrollToTopOnRoute } from '@/components/scroll-to-top-on-route';
import { SiteHeader } from '@/components/site-header';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'IO - Integrated Recruitment System',
  description: 'A recruitment system built with Next.js.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pl" className={cn('font-sans', geist.variable)}>
      <body>
        <Providers>
          <ScrollToTopOnRoute />
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
