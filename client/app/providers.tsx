"use client";

import GraphQLApiProvider from "@/src/api/GraphQLApiProvider";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return <GraphQLApiProvider>{children}</GraphQLApiProvider>;
}
