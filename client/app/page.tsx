"use client";

import { useLazyQuery } from "@apollo/client/react";
import { FIRST_QUERY } from "../GraphQL/queries";

type FirstQueryData = {
  firstQuery: {
    text: string;
    id: string;
  };
};

export default function Home() {
  const [fetchFirstQuery, { data, loading, error }] =
    useLazyQuery<FirstQueryData>(FIRST_QUERY, {
      fetchPolicy: "network-only",
    });

  const prettyJson = data?.firstQuery
    ? JSON.stringify(data.firstQuery, null, 2)
    : "{}";

  return (
    <main className="page">
      <button
        className="fetchButton"
        onClick={() => fetchFirstQuery()}
        disabled={loading}
      >
        {loading ? "Pobieranie..." : "Pobierz query"}
      </button>

      {error ? <p className="errorText">Blad: {error.message}</p> : null}

      <pre className="jsonBox">{prettyJson}</pre>
    </main>
  );
}
