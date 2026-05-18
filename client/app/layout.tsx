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

// Anti-flash script: reads theme from localStorage BEFORE first paint
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pl" className={cn('dark font-sans', sourceSans.variable)}>
      <head>
        {/* Inline script to prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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
