'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { FormConfig, SubmissionConfig } from '@io/content-api';

import { BrandedPageLoader } from '@/components/branded-page-loader';
import { FormEngine } from '@/components/form-engine';

type RecruitmentFormPayload = {
  form: FormConfig;
  submission: SubmissionConfig;
};

export default function FormPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<RecruitmentFormPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/recruitment-form')
      .then((response) => {
        if (!response.ok) {
          throw new Error('request failed');
        }

        return response.json() as Promise<RecruitmentFormPayload>;
      })
      .then((data) => {
        if (!cancelled) {
          setPayload(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Nie udało się wczytać formularza startowego.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-[calc(100vh-4.25rem)] bg-transparent px-4 py-8 md:px-6 md:py-10">
      {error ? (
        <p className="text-center text-sm text-destructive">{error}</p>
      ) : null}

      {!error && !payload ? (
        <BrandedPageLoader label="Wczytywanie formularza…" />
      ) : null}

      {payload ? (
        <FormEngine
          config={payload.form}
          submissionConfig={payload.submission}
          onSuccessfulSubmit={() => router.push('/')}
        />
      ) : null}
    </main>
  );
}
