import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';
import Providers from './providers';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'IO - Integrated Recruitment System',
  description:
    'A recruitment system built with Next.js, GraphQL, and Apollo Client.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pl" className={cn('font-sans', geist.variable)}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
