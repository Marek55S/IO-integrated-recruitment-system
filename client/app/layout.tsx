import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';

import './globals.css';
import Providers from './providers';
import { PageBackground } from '@/components/page-background';
import { ScrollToTopOnRoute } from '@/components/scroll-to-top-on-route';
import { SiteHeader } from '@/components/site-header';
import { cn } from '@/lib/utils';

const sourceSans = Source_Sans_3({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rekrutacja — Wydział Informatyki AGH',
  description:
    'System rekrutacji na studia — styl zgodny z witryną Wydziału Informatyki AGH.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pl" className={cn('font-sans', sourceSans.variable)}>
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
