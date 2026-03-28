'use client';

import { useEffect, useState } from 'react';

import type { ProgramsIndex } from '@io/content-api';

import { BrandedPageLoader } from '@/components/branded-page-loader';
import { ProgramsSearch } from '@/components/programs-search';
import { StudyApplicationsCards } from '@/components/study-applications-cards';

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
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl space-y-10">
        {error ? (
          <p className="text-center text-sm text-destructive">{error}</p>
        ) : null}

        {programs ? <ProgramsSearch programs={programs} /> : null}

        {!error && !programs ? (
          <BrandedPageLoader label="Wczytywanie kierunków…" />
        ) : null}

        <StudyApplicationsCards />
      </div>
    </main>
  );
}
