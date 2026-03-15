"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useState } from "react";
import { createApolloClient } from "../GraphQL/apolloClient";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const [client] = useState(() => createApolloClient());

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
