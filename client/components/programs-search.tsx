'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import type { ProgramsIndex } from '@io/content-api';

type ProgramsSearchProps = {
  programs: ProgramsIndex['programs'];
};

function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

function ProgramsSearch({ programs }: ProgramsSearchProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) {
      return programs;
    }

    return programs.filter((program) => normalize(program.name).includes(q));
  }, [programs, query]);

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">
          Szukaj kierunku po nazwie
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="np. informatyka, zarządzanie…"
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          autoComplete="off"
        />
      </label>

      <ul className="divide-y divide-border rounded-xl border bg-card shadow-sm">
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Brak wyników dla tego zapytania.
          </li>
        ) : (
          filtered.map((program) => (
            <li key={program.id}>
              <Link
                href={`/programs/${program.id}`}
                className="hover:bg-muted/50 block px-4 py-3 text-sm font-medium transition-colors">
                {program.name}
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  ID: {program.id}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export { ProgramsSearch };
