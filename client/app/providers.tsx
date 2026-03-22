'use client';

import { ReactNode } from 'react';

import GraphQLApiProvider from '@/src/api/GraphQLApiProvider';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return <GraphQLApiProvider>{children}</GraphQLApiProvider>;
}
