'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const q = query.trim();
  const hasQuery = q.length > 0;

  const filtered = useMemo(() => {
    if (!hasQuery) {
      return [];
    }

    const nq = normalize(q);
    return programs.filter((program) => normalize(program.name).includes(nq));
  }, [programs, q, hasQuery]);

  useEffect(() => {
    const onDocPointerDown = (event: PointerEvent) => {
      const el = rootRef.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-xl">
      <label className="block space-y-2">
        <span className="font-outside-card-title text-base font-semibold">
          Szukaj kierunku
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (hasQuery) {
              setOpen(true);
            }
          }}
          placeholder="Zacznij wpisywać nazwę kierunku…"
          className="border-border bg-card placeholder:text-muted-foreground flex h-11 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:border-border focus-visible:ring-0 focus-visible:outline-none"
          autoComplete="off"
          role="combobox"
          aria-expanded={open && hasQuery}
          aria-controls="programs-search-results"
        />
      </label>

      {open && hasQuery ? (
        <div
          id="programs-search-results"
          className="border-primary/20 absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg"
          role="listbox">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Brak wyników.
            </p>
          ) : (
            <ul className="py-1">
              {filtered.map((program) => (
                <li key={program.id} role="option">
                  <Link
                    href={`/programs/${program.id}`}
                    className="hover:bg-primary/8 focus-visible:bg-primary/8 focus-visible:outline-none block px-3 py-2.5 text-sm transition-colors"
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                    }}>
                    <span className="font-medium">{program.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {program.id}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export { ProgramsSearch };
