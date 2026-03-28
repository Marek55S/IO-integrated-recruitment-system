'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import type { ProgramPage as ProgramPageData } from '@io/content-api';

import { BrandedPageLoader } from '@/components/branded-page-loader';
import { ProgramRecruitmentForm } from '@/components/program-recruitment-form';

export default function ProgramRecruitmentPage() {
  const params = useParams();
  const programId = typeof params.programId === 'string' ? params.programId : '';

  const [page, setPage] = useState<ProgramPageData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setNotFound(false);
    setError(null);
    setPage(null);

    fetch(`/api/programs/${encodeURIComponent(programId)}`)
      .then((response) => {
        if (response.status === 404) {
          return null;
        }

        if (!response.ok) {
          throw new Error('request failed');
        }

        return response.json() as Promise<ProgramPageData>;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (data === null) {
          setNotFound(true);
        } else {
          setPage(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Nie udało się wczytać strony kierunku.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [programId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
        <BrandedPageLoader label="Wczytywanie kierunku…" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
        <p className="text-center text-sm text-destructive">{error}</p>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-primary underline underline-offset-4">
            Wróć do wyszukiwarki kierunków
          </Link>
        </p>
      </main>
    );
  }

  if (notFound || !page) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 md:px-6 md:py-10">
        <p className="text-center text-sm text-muted-foreground">
          Nie znaleziono kierunku o podanym identyfikatorze.
        </p>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-primary underline underline-offset-4">
            Wróć do wyszukiwarki kierunków
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-4">
          <div className="border-primary/20 overflow-hidden rounded-xl border shadow-md">
            <img
              src={page.image_src}
              alt={page.title}
              className="block aspect-[12/5] w-full object-cover align-middle"
              width={960}
              height={400}
            />
          </div>

          {page.description ? (
            <p className="font-outside-card-body whitespace-pre-line text-base leading-relaxed">
              {page.description}
            </p>
          ) : null}
        </header>

        <ProgramRecruitmentForm
          config={page.form}
          programId={page.program_id}
          programName={page.title}
        />
      </article>
    </main>
  );
}
