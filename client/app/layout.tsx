import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google';

import './globals.css';
import { PageBackground } from '@/components/page-background';
import Providers from './providers';
import { ScrollToTopOnRoute } from '@/components/scroll-to-top-on-route';
import { SiteHeader } from '@/components/site-header';
import { cn } from '@/lib/utils';

const sourceSans = Source_Sans_3({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

/** Nagłówki i akapity na tle strony (poza białymi kartami) — tonacja AGH */
const displaySerif = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rekrutacja — IO',
  description: 'System rekrutacji na studia (projekt IO).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={cn('font-sans', sourceSans.variable, displaySerif.variable)}>
      <body>
        <PageBackground />
        <div className="relative z-[1]">
          <Providers>
            <ScrollToTopOnRoute />
            <SiteHeader />
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
