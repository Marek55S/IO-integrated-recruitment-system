'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserRound } from 'lucide-react';

import type { ProgramsIndex } from '@io/content-api';

import { ProgramsSearch } from '@/components/programs-search';
import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  const [programs, setPrograms] = useState<ProgramsIndex['programs'] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/programs')
      .then((response) => {
        if (!response.ok) {
          throw new Error('request failed');
        }

        return response.json() as Promise<ProgramsIndex>;
      })
      .then((data) => {
        if (!cancelled) {
          setPrograms(data.programs);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Nie udało się wczytać listy kierunków.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex justify-end">
          <Link
            href="/profile"
            aria-label="Profil"
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <UserRound className="size-6" />
          </Link>
        </div>

        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Kierunki studiów
          </h1>
          <p className="text-sm text-muted-foreground">
            Wybierz kierunek z listy lub wyszukaj po nazwie. Link do strony
            rekrutacji zawiera identyfikator kierunku (np.{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              /programs/informatyka-st
            </code>
            ).
          </p>
        </header>

        {error ? (
          <p className="text-center text-sm text-destructive">{error}</p>
        ) : null}

        {programs ? <ProgramsSearch programs={programs} /> : null}

        {!error && !programs ? (
          <p className="text-center text-sm text-muted-foreground">
            Wczytywanie kierunków…
          </p>
        ) : null}
      </div>
    </main>
  );
}
