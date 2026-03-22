'use client';

import React, { PropsWithChildren, useMemo } from 'react';

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

function createGraphQLApolloClient() {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (!endpoint) {
    throw new Error(
      'NEXT_PUBLIC_GRAPHQL_URL environment variable is not defined',
    );
  }

  return new ApolloClient({
    link: new HttpLink({ uri: endpoint }),
    cache: new InMemoryCache(),
  });
}

export default function GraphQLApiProvider({ children }: PropsWithChildren) {
  const client = useMemo(() => createGraphQLApolloClient(), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
